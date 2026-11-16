import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import {
  sendContactConfirmationEmail,
  sendContactAdminNotificationEmail,
} from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, state, subject, message } = body;

    if (!name || !phone) {
      return NextResponse.json(
        { error: 'Name and Phone are required.' },
        { status: 400 }
      );
    }

    const remarks = `[COUNSELING INQUIRY] Subject: ${subject || 'General'} | Email: ${email || 'N/A'} | State: ${state || 'Telangana'} | Message: ${message || 'None'}`;

    const { data, error } = await supabaseAdmin
      .from('leads')
      .insert([
        {
          name: name.trim(),
          phone: phone.trim(),
          city: state || 'Telangana',
          address: state || 'Telangana',
          designation: `Inquiry: ${subject || 'Counseling'}`,
          remarks: remarks,
          status: 'new',
          priority: 'medium',
          source: 'contact_page',
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Supabase contact insert error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Automated dual-provider email notifications (Resend primary, Brevo fallback)
    try {
      const emailTasks: Promise<any>[] = [];

      // 1. Acknowledgment to visitor (if email provided)
      if (email && email.includes('@')) {
        emailTasks.push(
          sendContactConfirmationEmail({
            to: email.trim(),
            name: name.trim(),
            subject: subject || 'Education & Career Guidance',
            phone: phone.trim(),
          })
        );
      }

      // 2. Alert to internal management
      emailTasks.push(
        sendContactAdminNotificationEmail({
          name: name.trim(),
          phone: phone.trim(),
          email: email?.trim(),
          state: state || 'Telangana',
          subject: subject || 'General Counseling Inquiry',
          message: message || 'None',
        })
      );

      const results = await Promise.allSettled(emailTasks);
      const userAckSent = results[0]?.status === 'fulfilled' && (results[0] as any).value?.success;
      if (userAckSent && data?.id) {
        await supabaseAdmin
          .from('leads')
          .update({
            internal_notes: `[EMAIL: contact_ack | ${new Date().toISOString()}]`,
          })
          .eq('id', data.id);
      }
    } catch (emailErr) {
      console.warn('Non-blocking contact email dispatch error:', emailErr);
    }

    return NextResponse.json({
      success: true,
      id: data?.id,
    });
  } catch (err: any) {
    console.error('API contact error:', err);
    return NextResponse.json(
      { error: err?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
