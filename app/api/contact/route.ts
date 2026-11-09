import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

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
