import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const APPRAISAL_FILE = path.join(process.cwd(), 'data', 'appraisal_questions.json');

function getAppraisalData() {
  try {
    if (fs.existsSync(APPRAISAL_FILE)) {
      return JSON.parse(fs.readFileSync(APPRAISAL_FILE, 'utf8'));
    }
  } catch (e) {
    console.error('Error reading appraisal questions:', e);
  }
  return { questions: [] };
}

function saveAppraisalData(data: any) {
  try {
    fs.writeFileSync(
      APPRAISAL_FILE,
      JSON.stringify({ ...data, updatedAt: new Date().toISOString() }, null, 2),
      'utf8'
    );
    return true;
  } catch (e) {
    console.error('Error saving appraisal questions:', e);
    return false;
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const activeOnly = searchParams.get('activeOnly') === 'true';

    const data = getAppraisalData();
    let questions = data.questions || [];

    if (activeOnly) {
      questions = questions.filter((q: any) => q.enabled);
    }

    const categories = Array.from(new Set(questions.map((q: any) => q.category))).filter(Boolean);

    return NextResponse.json({
      success: true,
      questions,
      total: questions.length,
      categories,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch questions' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    const body = await req.json();
    const { action } = body;
    const data = getAppraisalData();
    let questions = data.questions || [];

    if (action === 'toggle_question') {
      const { id, enabled } = body;
      questions = questions.map((q: any) => (q.id === id ? { ...q, enabled } : q));
      saveAppraisalData({ questions });
      return NextResponse.json({ success: true, message: 'Question visibility updated' });
    }

    if (action === 'toggle_all') {
      const { enabled, category } = body;
      questions = questions.map((q: any) => {
        if (!category || category === 'ALL' || q.category === category) {
          return { ...q, enabled };
        }
        return q;
      });
      saveAppraisalData({ questions });
      return NextResponse.json({ success: true, message: 'Questions updated successfully' });
    }

    if (action === 'add_question') {
      const { category, title, marks, fieldType, options, fields } = body;
      if (!title?.trim()) {
        return NextResponse.json({ error: 'Question title is required' }, { status: 400 });
      }

      const parsedOptions = Array.isArray(options)
        ? options.map((o: any) => String(o).trim()).filter(Boolean)
        : typeof options === 'string'
        ? options.split(',').map((o) => o.trim()).filter(Boolean)
        : [];

      const newQ = {
        id: `appraisal_custom_${Date.now()}`,
        category: category?.trim() || 'General Faculty Contributions',
        title: title.trim(),
        marks: Number(marks) || 10,
        fieldType: fieldType || 'short_answer', // 'short_answer' | 'big_answer' | 'dropdown' | 'calendar' | 'number'
        options: parsedOptions,
        fields: Array.isArray(fields) && fields.length > 0 ? fields : ['Details / Description', 'Supporting Document / Evidence Link'],
        enabled: true,
      };

      questions.push(newQ);
      saveAppraisalData({ questions });
      return NextResponse.json({ success: true, question: newQ, message: 'Question added successfully' });
    }

    if (action === 'edit_question') {
      const { id, category, title, marks, fieldType, options, fields, enabled } = body;
      if (!id) {
        return NextResponse.json({ error: 'Question id is required' }, { status: 400 });
      }

      const parsedOptions = Array.isArray(options)
        ? options.map((o: any) => String(o).trim()).filter(Boolean)
        : typeof options === 'string'
        ? options.split(',').map((o) => o.trim()).filter(Boolean)
        : [];

      let found = false;
      questions = questions.map((q: any) => {
        if (q.id === id) {
          found = true;
          return {
            ...q,
            title: title !== undefined ? title.trim() : q.title,
            category: category !== undefined ? category.trim() : q.category,
            marks: marks !== undefined ? Number(marks) : q.marks,
            fieldType: fieldType !== undefined ? fieldType : (q.fieldType || 'short_answer'),
            options: options !== undefined ? parsedOptions : (q.options || []),
            fields: Array.isArray(fields) && fields.length > 0 ? fields : q.fields,
            enabled: enabled !== undefined ? enabled : q.enabled,
          };
        }
        return q;
      });

      if (!found) {
        return NextResponse.json({ error: 'Question not found' }, { status: 404 });
      }

      saveAppraisalData({ questions });
      return NextResponse.json({ success: true, message: 'Question updated successfully' });
    }

    if (action === 'delete_question') {
      const { id } = body;
      if (!id) {
        return NextResponse.json({ error: 'Question id is required' }, { status: 400 });
      }

      questions = questions.filter((q: any) => q.id !== id);
      saveAppraisalData({ questions });
      return NextResponse.json({ success: true, message: 'Question deleted successfully' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Operation failed' }, { status: 500 });
  }
}
