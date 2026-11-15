import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import {
  sendCareerApplicationConfirmationEmail,
  sendInterviewInvitationEmail,
  sendCandidateRejectionEmail,
} from '@/lib/email';
import { recordEmailLogTag, parseCandidateLead } from '@/lib/candidate-utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { candidateId, emailType, interviewDate, customNotes } = body;

    if (!candidateId || !emailType) {
      return NextResponse.json({ error: 'candidateId and emailType are required' }, { status: 400 });
    }

    const { data: lead, error } = await supabaseAdmin
      .from('leads')
      .select('*')
      .eq('id', candidateId)
      .single();

    if (error || !lead) {
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });
    }

    const c = parseCandidateLead(lead);

    if (!c.email || !c.email.includes('@')) {
      return NextResponse.json({ error: `Candidate "${c.name}" does not have a valid email on file.` }, { status: 400 });
    }

    let sendResult: any;

    if (emailType === 'interview') {
      sendResult = await sendInterviewInvitationEmail({
        to: c.email,
        name: c.name,
        referenceId: c.refId,
        roles: c.rolesString || 'Staff Position',
        interviewDate: interviewDate || undefined,
        customNotes: customNotes || undefined,
      });
    } else if (emailType === 'rejected') {
      sendResult = await sendCandidateRejectionEmail({
        to: c.email,
        name: c.name,
        referenceId: c.refId,
        roles: c.rolesString || 'Staff Position',
      });
    } else {
      // default: confirmation
      sendResult = await sendCareerApplicationConfirmationEmail({
        to: c.email,
        name: c.name,
        referenceId: c.refId,
        roles: c.rolesString || 'Staff Applicant',
        phone: c.phone,
        qualification: c.qualification,
        experience: c.experience,
        city: c.address,
      });
    }

    if (!sendResult.success) {
      return NextResponse.json(
        { error: sendResult.error || sendResult.reason || 'Failed to dispatch email' },
        { status: 500 }
      );
    }

    // Record the email log tag in internal_notes so CRM reflects it immediately
    const updatedNotes = recordEmailLogTag(lead.internal_notes, emailType);
    await supabaseAdmin
      .from('leads')
      .update({ internal_notes: updatedNotes, updated_at: new Date().toISOString() })
      .eq('id', candidateId);

    return NextResponse.json({
      success: true,
      messageId: sendResult.messageId,
      emailType,
      recipient: c.email,
      updatedNotes,
    });
  } catch (err: any) {
    console.error('Send individual email error:', err);
    return NextResponse.json({ error: err?.message || 'Internal server error' }, { status: 500 });
  }
}
