import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, phone, email, course, category, state } = body;

    if (!name || !phone || !course) {
      return NextResponse.json(
        { error: 'Name, Phone, and Course are required.' },
        { status: 400 }
      );
    }

    // 1. Insert into enrollments
    const { error: enrollError } = await supabaseAdmin
      .from('enrollments')
      .insert([
        {
          name: name.trim(),
          phone: phone.trim(),
          email: email || null,
          course_name: course,
          category: category || 'Education',
          status: 'new',
          source: 'education_website',
          remarks: state ? `State: ${state}` : null,
        },
      ]);

    if (enrollError) {
      console.warn('Enrollment table insert warning:', enrollError);
    }

    // 2. Also insert into leads table so admin sees it in all leads
    const { data: leadData, error: leadError } = await supabaseAdmin
      .from('leads')
      .insert([
        {
          name: name.trim(),
          phone: phone.trim(),
          city: state || 'Telangana',
          address: state || 'Telangana',
          designation: `Student: ${course}`,
          remarks: `[STUDENT ENROLLMENT] Course: ${course} | Category: ${category || 'General'} | Email: ${email || 'N/A'}${state ? ` | State: ${state}` : ''}`,
          status: 'new',
          priority: 'hot',
          source: 'education_website',
        },
      ])
      .select()
      .single();

    return NextResponse.json({
      success: true,
      leadId: leadData?.id,
    });
  } catch (err: any) {
    console.error('API enroll error:', err);
    return NextResponse.json(
      { error: err?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
