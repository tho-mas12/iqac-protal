import { NextRequest, NextResponse } from 'next/server';
import { getSystemSettings, saveSystemSettings } from '@/lib/system-settings';
import { getCurrentUser } from '@/lib/auth';
import { logAction } from '@/lib/action-logger';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const settings = getSystemSettings();

    // If non-admin user requests settings, only return public fields (activeYear, developmentMode)
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({
        activeYear: settings.activeYear,
        developmentMode: settings.developmentMode,
      });
    }

    return NextResponse.json(settings);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to load system settings' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized: Admin privileges required to update system settings' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const current = getSystemSettings();

    let newYears = current.academicYears;

    if (body.action === 'add-year') {
      const year = String(body.year || '').trim();
      if (!year) {
        return NextResponse.json({ error: 'Year cannot be empty' }, { status: 400 });
      }
      if (newYears.includes(year)) {
        return NextResponse.json({ error: 'Academic year already exists' }, { status: 400 });
      }
      newYears = [...newYears, year].sort();
      const updated = saveSystemSettings({
        academicYears: newYears,
        updatedBy: user.username,
      });
      return NextResponse.json({ success: true, settings: updated, message: `Academic Year ${year} added successfully` });
    }

    if (body.action === 'delete-year') {
      const year = String(body.year || '').trim();
      if (!year) {
        return NextResponse.json({ error: 'Year cannot be empty' }, { status: 400 });
      }
      if (year === current.activeYear) {
        return NextResponse.json(
          { error: `Cannot delete the currently active academic year (${year}). Switch active year first.` },
          { status: 400 }
        );
      }
      newYears = newYears.filter((y) => y !== year);
      const updated = saveSystemSettings({
        academicYears: newYears,
        updatedBy: user.username,
      });
      return NextResponse.json({ success: true, settings: updated, message: `Academic Year ${year} deleted successfully` });
    }

    // Direct update of developmentMode or activeYear
    const updates: any = { updatedBy: user.username };

    if (typeof body.developmentMode === 'boolean') {
      updates.developmentMode = body.developmentMode;
    }

    if (body.activeYear && typeof body.activeYear === 'string') {
      const year = body.activeYear.trim();
      if (!newYears.includes(year)) {
        newYears = [...newYears, year].sort();
        updates.academicYears = newYears;
      }
      updates.activeYear = year;
    }

    const updated = saveSystemSettings(updates);

    await logAction({
      req,
      username: user.username,
      role: user.role,
      actorId: user.userId,
      action: 'UPDATE',
      module: 'SETTINGS',
      details: `Updated system settings: activeYear=${updated.activeYear}, developmentMode=${updated.developmentMode}.`,
    });

    return NextResponse.json({
      success: true,
      settings: updated,
      message: 'System settings saved successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update system settings' },
      { status: 500 }
    );
  }
}
