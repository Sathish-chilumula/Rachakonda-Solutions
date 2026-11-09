import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ids } = body;

    const idsToDelete = ids && Array.isArray(ids) ? ids : id ? [id] : [];

    if (idsToDelete.length === 0) {
      return NextResponse.json(
        { error: 'No candidate ID(s) provided for deletion.' },
        { status: 400 }
      );
    }

    // Delete from leads table using supabaseAdmin
    const { data, error } = await supabaseAdmin
      .from('leads')
      .delete()
      .in('id', idsToDelete)
      .select('id, name');

    if (error) {
      console.error('Error deleting candidate(s):', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Log deletion to audit_logs
    try {
      await supabaseAdmin.from('audit_logs').insert(
        idsToDelete.map((delId: string) => ({
          action: `Deleted candidate application (${delId})`,
          entity_type: 'lead',
          entity_id: delId,
          details: { deleted_at: new Date().toISOString() },
        }))
      );
    } catch (auditErr) {
      console.warn('Audit log write error:', auditErr);
    }

    return NextResponse.json({
      success: true,
      deletedCount: data?.length || idsToDelete.length,
      deleted: data,
    });
  } catch (err: any) {
    console.error('API delete candidate exception:', err);
    return NextResponse.json(
      { error: err?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
