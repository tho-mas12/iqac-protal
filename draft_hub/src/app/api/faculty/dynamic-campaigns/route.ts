import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Role filtering:
    // If targetRole == 'ALL_FACULTY' -> everyone gets it
    // If targetRole == 'HEAD_ONLY' -> only if isHead == true
    // If targetRole == 'MQC_ONLY' -> only if isMqc == true
    const campaigns = await prisma.dynamicCampaign.findMany({
      where: {
        isActive: true,
      },
      include: {
        fields: {
          orderBy: { orderIndex: 'asc' },
        },
        submissions: {
          where: { userId: session.userId }
        }
      },
      orderBy: { deadline: 'asc' }
    });

    const filtered = campaigns.filter(c => {
      if (c.targetRole === 'ALL_FACULTY') return true;
      if (c.targetRole === 'HEAD_ONLY' && session.isHead) return true;
      if (c.targetRole === 'MQC_ONLY' && session.isMqc) return true;
      if (session.role === 'ADMIN') return true;
      return false;
    });

    const now = new Date();
    const enriched = filtered.map(c => {
      const deadlineDate = new Date(c.deadline);
      const diffMs = deadlineDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      const isExpired = diffMs < 0;
      const mySubmission = c.submissions.length > 0 ? c.submissions[0] : null;

      return {
        ...c,
        isExpired,
        daysRemaining: diffDays,
        isSubmitted: Boolean(mySubmission),
        mySubmissionData: mySubmission ? JSON.parse(mySubmission.dataJson || '{}') : null,
        submittedAt: mySubmission ? mySubmission.submittedAt : null,
      };
    });

    return NextResponse.json({ success: true, campaigns: enriched });
  } catch (error: any) {
    console.error('Error fetching faculty campaigns:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { campaignId, responses } = await req.json();

    if (!campaignId || !responses) {
      return NextResponse.json({ error: 'Campaign ID and response data required' }, { status: 400 });
    }

    const campaign = await prisma.dynamicCampaign.findUnique({
      where: { id: campaignId },
      include: { fields: true }
    });

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    // Check if expired
    if (new Date() > new Date(campaign.deadline)) {
      return NextResponse.json({ error: 'Submission deadline has passed for this data request.' }, { status: 400 });
    }

    // Validate required fields
    for (const field of campaign.fields) {
      if (field.isRequired && (!responses[field.fieldName] || responses[field.fieldName].toString().trim() === '')) {
        return NextResponse.json({ error: `Field "${field.fieldLabel}" is required.` }, { status: 400 });
      }
    }

    const submission = await prisma.dynamicSubmission.upsert({
      where: {
        campaignId_userId: {
          campaignId,
          userId: session.userId,
        }
      },
      create: {
        campaignId,
        userId: session.userId,
        dataJson: JSON.stringify(responses),
      },
      update: {
        dataJson: JSON.stringify(responses),
        updatedAt: new Date(),
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Dynamic data submitted successfully! Your submission is now reflected in your Annual Performance Appraisal.',
      submission
    });
  } catch (error: any) {
    console.error('Error saving dynamic response:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
