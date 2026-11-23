import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getCurrentUser } from '@/lib/auth';

const ANNOUNCEMENTS_FILE = path.join(process.cwd(), 'data', 'announcements.json');

export interface AnnouncementItem {
  id: string;
  title: string;
  content: string;
  type: 'URGENT' | 'NOTICE' | 'QUALITY' | 'INFO' | 'GENERAL';
  target: string;
  date: string;
  isActive: boolean;
  author?: string;
  createdAt?: string;
}

const DEFAULT_ANNOUNCEMENTS: AnnouncementItem[] = [
  {
    id: 'ann-1',
    title: 'Annual Academic Audit (AAA) 2026–2027 Submission Cycle',
    content: 'All designated MQC Members and Heads of Departments are requested to verify Part-A Profile and complete Attributes 1 to 10 sheets on or before the institutional deadline.',
    type: 'URGENT',
    target: 'All Faculty & MQC Members',
    date: '2026-11-21',
    isActive: true,
    author: 'IQAC Directorate',
  },
  {
    id: 'ann-2',
    title: 'Course Plan Submission & Lesson Unit Scheduling',
    content: 'Faculty members are advised to upload Even Semester Course Plans with course outcomes, unit distribution, and weekly lesson schedules for Department HOD sign-off.',
    type: 'NOTICE',
    target: 'All Teaching Faculty',
    date: '2026-11-19',
    isActive: true,
    author: 'Dean of Academics',
  },
  {
    id: 'ann-3',
    title: 'Event Invitations Standard Protocols & Advance Upload',
    content: 'Kindly submit all event invitations and circulars at least 3-5 working days prior to the event date. Verify that official College Crest and IQAC logo follow the approved format.',
    type: 'INFO',
    target: 'All Departments & Staff',
    date: '2026-11-16',
    isActive: true,
    author: 'IQAC Directorate',
  },
];

function readAnnouncements(): AnnouncementItem[] {
  try {
    if (!fs.existsSync(ANNOUNCEMENTS_FILE)) {
      const dir = path.dirname(ANNOUNCEMENTS_FILE);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(ANNOUNCEMENTS_FILE, JSON.stringify(DEFAULT_ANNOUNCEMENTS, null, 2), 'utf8');
      return DEFAULT_ANNOUNCEMENTS;
    }
    const raw = fs.readFileSync(ANNOUNCEMENTS_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : DEFAULT_ANNOUNCEMENTS;
  } catch (e) {
    console.error('Error reading announcements:', e);
    return DEFAULT_ANNOUNCEMENTS;
  }
}

function writeAnnouncements(data: AnnouncementItem[]) {
  try {
    const dir = path.dirname(ANNOUNCEMENTS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(ANNOUNCEMENTS_FILE, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (e) {
    console.error('Error writing announcements:', e);
    return false;
  }
}

// GET: Return all announcements (filtered for regular users, all for admin)
export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    const { searchParams } = new URL(req.url);
    const all = searchParams.get('all') === 'true';

    const list = readAnnouncements();

    if (session?.role === 'ADMIN' && all) {
      return NextResponse.json({ success: true, announcements: list });
    }

    // Default: active announcements only
    const activeList = list.filter((a) => a.isActive !== false);
    return NextResponse.json({ success: true, announcements: activeList });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch announcements' }, { status: 500 });
  }
}

// POST: Create Announcement (Admin only)
export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin only' }, { status: 403 });
    }

    const body = await req.json();
    const { title, content, type = 'NOTICE', target = 'All Staff', isActive = true } = body;

    if (!title || !title.trim() || !content || !content.trim()) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    const list = readAnnouncements();
    const newAnnouncement: AnnouncementItem = {
      id: `ann-${Date.now()}`,
      title: title.trim(),
      content: content.trim(),
      type: ['URGENT', 'NOTICE', 'QUALITY', 'INFO', 'GENERAL'].includes(type) ? type : 'GENERAL',
      target: target ? target.trim() : 'All Staff',
      date: new Date().toISOString().split('T')[0],
      isActive: Boolean(isActive),
      author: session.name || 'IQAC Administration',
      createdAt: new Date().toISOString(),
    };

    list.unshift(newAnnouncement);
    writeAnnouncements(list);

    return NextResponse.json({
      success: true,
      message: 'Announcement published successfully',
      announcement: newAnnouncement,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to save announcement' }, { status: 500 });
  }
}

// PUT: Update Announcement (Admin only)
export async function PUT(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin only' }, { status: 403 });
    }

    const body = await req.json();
    const { id, title, content, type, target, isActive } = body;

    if (!id) {
      return NextResponse.json({ error: 'Announcement ID is required' }, { status: 400 });
    }

    const list = readAnnouncements();
    const index = list.findIndex((a) => a.id === id);

    if (index === -1) {
      return NextResponse.json({ error: 'Announcement not found' }, { status: 404 });
    }

    list[index] = {
      ...list[index],
      ...(title !== undefined ? { title: title.trim() } : {}),
      ...(content !== undefined ? { content: content.trim() } : {}),
      ...(type !== undefined ? { type } : {}),
      ...(target !== undefined ? { target: target.trim() } : {}),
      ...(isActive !== undefined ? { isActive: Boolean(isActive) } : {}),
    };

    writeAnnouncements(list);

    return NextResponse.json({
      success: true,
      message: 'Announcement updated successfully',
      announcement: list[index],
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update announcement' }, { status: 500 });
  }
}

// DELETE: Remove Announcement (Admin only)
export async function DELETE(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin only' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Announcement ID is required' }, { status: 400 });
    }

    let list = readAnnouncements();
    const initialLen = list.length;
    list = list.filter((a) => a.id !== id);

    if (list.length === initialLen) {
      return NextResponse.json({ error: 'Announcement not found' }, { status: 404 });
    }

    writeAnnouncements(list);

    return NextResponse.json({ success: true, message: 'Announcement deleted successfully' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to delete announcement' }, { status: 500 });
  }
}
