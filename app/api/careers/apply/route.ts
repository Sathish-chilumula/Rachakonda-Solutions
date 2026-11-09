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

    const cleanPhone = (mobileNo || '').replace(/\D/g, '').slice(-10);
    const cleanEmail = (mailId || '').trim().toLowerCase();

    // ─── 1. Duplicate check by Mobile Number or Email ────────────────────────
    if (cleanPhone.length >= 10 || cleanEmail) {
      const { data: existingLeads } = await supabaseAdmin
        .from('leads')
        .select('id, name, phone, remarks, designation, created_at')
        .eq('source', 'careers_portal');

      if (existingLeads && existingLeads.length > 0) {
        const duplicate = existingLeads.find((lead) => {
          const leadPhone = (lead.phone || '').replace(/\D/g, '').slice(-10);
          const phoneMatches = cleanPhone.length >= 10 && leadPhone === cleanPhone;

          let emailMatches = false;
          if (cleanEmail) {
            const emailInRemarks = lead.remarks?.toLowerCase().includes(`email: ${cleanEmail}`);
            emailMatches = Boolean(emailInRemarks);
          }

          return phoneMatches || emailMatches;
        });

        if (duplicate) {
          const refMatch = duplicate.remarks?.match(/Ref:\s*([^|]+)/i);
          const existingRef = refMatch ? refMatch[1].trim() : 'on record';
          const appliedDate = duplicate.created_at
            ? new Date(duplicate.created_at).toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })
            : '';

          return NextResponse.json(
            {
              error: `An application has already been submitted using this ${
                (duplicate.phone || '').replace(/\D/g, '').slice(-10) === cleanPhone
                  ? `Mobile Number (${mobileNo})`
                  : `Email ID (${mailId})`
              }. Candidate "${duplicate.name}" registered on ${appliedDate} with Reference ID: ${existingRef}. Multiple applications with the same number/email are restricted.`,
              alreadyApplied: true,
              existingRefId: existingRef,
              existingName: duplicate.name,
            },
            { status: 409 }
          );
        }
      }
    }

    // ─── 2. Prepare candidate record ─────────────────────────────────────────
    const refId = `RS-2026-JOB-${Math.floor(1000 + Math.random() * 9000)}`;
    const rolesArray = Array.isArray(jobRoles) ? jobRoles : [jobRoles].filter(Boolean);
    const rolesString = rolesArray.join(', ');

    // Accurately capture experience details if selected Yes
    const expSummary =
      hasExperience === 'Yes'
        ? experienceDetails && experienceDetails.trim().length > 0
          ? experienceDetails.trim()
          : 'Experienced (Prior Experience)'
        : 'Fresher';

    const remarks = `[CAREERS 95 STAFF] Roles: ${rolesString} | Father: ${fatherName || 'N/A'} | Qual: ${qualification || 'N/A'} | Gender: ${gender || 'N/A'} | Marital: ${maritalStatus || 'N/A'} | Exp: ${expSummary} | Email: ${mailId || 'N/A'} | Ref: ${refId}${additionalNotes ? ` | Notes: ${additionalNotes}` : ''}`;

    const { data, error } = await supabaseAdmin
      .from('leads')
      .insert([
        {
          name: fullName.trim(),
          phone: mobileNo.trim(),
          city: address || 'Telangana',
          address: address || null,
          designation: rolesString || 'Staff Applicant',
          employment_type: expSummary,
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
