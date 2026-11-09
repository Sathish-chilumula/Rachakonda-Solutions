import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      fullName,
      fatherName,
      address,
      maritalStatus,
      gender,
      qualification,
      mobileNo,
      mailId,
      hasExperience,
      experienceDetails,
      jobRoles,
      additionalNotes,
    } = body;

    if (!fullName || !mobileNo) {
      return NextResponse.json(
        { error: 'Full Name and Mobile Number are required.' },
        { status: 400 }
      );
    }

    const refId = `RS-2026-JOB-${Math.floor(1000 + Math.random() * 9000)}`;
    const rolesArray = Array.isArray(jobRoles) ? jobRoles : [jobRoles].filter(Boolean);
    const rolesString = rolesArray.join(', ');

    const remarks = `[CAREERS 95 STAFF] Roles: ${rolesString} | Father: ${fatherName || 'N/A'} | Qual: ${qualification || 'N/A'} | Gender: ${gender || 'N/A'} | Marital: ${maritalStatus || 'N/A'} | Exp: ${hasExperience === 'Yes' ? experienceDetails || 'Yes' : 'Fresher'} | Email: ${mailId || 'N/A'} | Ref: ${refId}${additionalNotes ? ` | Notes: ${additionalNotes}` : ''}`;

    const { data, error } = await supabaseAdmin
      .from('leads')
      .insert([
        {
          name: fullName.trim(),
          phone: mobileNo.trim(),
          city: address || 'Telangana',
          address: address || null,
          designation: rolesString || 'Staff Applicant',
          remarks: remarks,
          status: 'new',
          priority: 'hot',
          source: 'careers_portal',
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Supabase admin insert error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      referenceId: refId,
      id: data?.id,
      candidate: data,
    });
  } catch (err: any) {
    console.error('API apply route error:', err);
    return NextResponse.json(
      { error: err?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
