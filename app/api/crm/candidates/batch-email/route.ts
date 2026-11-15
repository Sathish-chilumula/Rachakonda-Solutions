import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { sendCareerApplicationConfirmationEmail } from '@/lib/email';
import { recordEmailLogTag, parseCandidateLead } from '@/lib/candidate-utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const batchSize = Math.min(Math.max(Number(body.batchSize) || 90, 1), 100);

    // 1. Fetch all candidate leads
    const { data: leads, error } = await supabaseAdmin
      .from('leads')
      .select('*')
      .eq('source', 'careers_portal')
      .order('created_at', { ascending: false });

    if (error || !leads) {
      return NextResponse.json({ error: error?.message || 'Failed to fetch candidate leads' }, { status: 500 });
    }

    const parsed = leads.map(parseCandidateLead);
    const unsentCandidates = parsed.filter((c) => c.emailStatus === 'unsent' && c.email && c.email.includes('@'));
    const totalUnsent = unsentCandidates.length;

    // 2. Slice batch size (e.g., 90 to leave headroom for new live applications)
    const candidatesToProcess = unsentCandidates.slice(0, batchSize);

    let sentCount = 0;
    let failedCount = 0;
    const errors: any[] = [];

    for (const c of candidatesToProcess) {
      try {
        const sendResult = await sendCareerApplicationConfirmationEmail({
          to: c.email,
          name: c.name,
          referenceId: c.refId,
          roles: c.rolesString || 'Staff Applicant',
          phone: c.phone,
          qualification: c.qualification,
          experience: c.experience,
          city: c.address,
        });

        if (sendResult.success) {
          sentCount++;
          // Update internal_notes in Supabase with audit tag
          const updatedNotes = recordEmailLogTag(c.internalNotes, 'confirmation');
          await supabaseAdmin
            .from('leads')
            .update({ internal_notes: updatedNotes })
            .eq('id', c.id);
        } else {
          failedCount++;
          errors.push({ id: c.id, name: c.name, email: c.email, error: sendResult.reason || sendResult.error });
        }

        // 250ms delay between emails to adhere to Resend's rate limits
        await new Promise((r) => setTimeout(r, 250));
      } catch (err: any) {
        failedCount++;
        errors.push({ id: c.id, name: c.name, email: c.email, error: err?.message });
      }
    }

    const remainingUnsent = totalUnsent - sentCount;

    if (sentCount === 0 && failedCount > 0) {
      const firstError = errors[0]?.error || 'Failed to dispatch emails';
      return NextResponse.json(
        {
          success: false,
          error: `Could not send emails: ${firstError}. Please ensure RESEND_API_KEY is configured in your hosting environment variables (Cloudflare Pages Settings -> Environment variables).`,
          errors,
          totalCandidates: parsed.length,
          remainingUnsent: totalUnsent,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      totalCandidates: parsed.length,
      alreadySentPreviously: parsed.length - totalUnsent,
      batchTarget: candidatesToProcess.length,
      sentInThisBatch: sentCount,
      failedInThisBatch: failedCount,
      remainingUnsent: remainingUnsent,
      message: `Successfully dispatched ${sentCount} confirmation email(s). ${remainingUnsent} remaining for subsequent batches.`,
      errors: errors.length > 0 ? errors.slice(0, 5) : undefined,
    });
  } catch (err: any) {
    console.error('Batch email error:', err);
    return NextResponse.json({ error: err?.message || 'Internal server error' }, { status: 500 });
  }
}
