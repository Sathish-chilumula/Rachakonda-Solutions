import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return null;
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

// CREATE user
export async function POST(req: Request) {
  try {
    const { email, password, role } = await req.json();
    const supabaseAdmin = getAdminClient();
    
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Server configuration missing: SUPABASE_SERVICE_ROLE_KEY is not defined.' }, { status: 500 });
    }

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({ role })
      .eq('id', data.user.id);

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 400 });
    }

    return NextResponse.json({ user: data.user });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// UPDATE user (password reset by admin, or update name/role)
export async function PATCH(req: Request) {
  try {
    const { userId, newPassword, name, role } = await req.json();
    const supabaseAdmin = getAdminClient();

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Server configuration missing' }, { status: 500 });
    }

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    // Password reset
    if (newPassword) {
      if (newPassword.length < 6) {
        return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
      }

      const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        password: newPassword,
      });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
    }

    // Profile updates (name, role)
    const profileUpdates: Record<string, string> = {};
    if (name !== undefined) profileUpdates.name = name;
    if (role !== undefined) profileUpdates.role = role;

    if (Object.keys(profileUpdates).length > 0) {
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .update(profileUpdates)
        .eq('id', userId);

      if (profileError) {
        return NextResponse.json({ error: profileError.message }, { status: 400 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE user
export async function DELETE(req: Request) {
  try {
    const { userId } = await req.json();
    const supabaseAdmin = getAdminClient();

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Server configuration missing' }, { status: 500 });
    }

    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
