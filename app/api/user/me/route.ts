import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';

const CACHE_TTL = 60;

const USER_SELECT = {
  id: true, email: true, name: true, interests: true, preferredSubject: true,
  xp: true, level: true, streak: true, lastActive: true, lastLocalDate: true, createdAt: true,
} as const;

export async function GET(request: NextRequest) {
  try {
    // Log the cookies available in the request for debugging
    const allCookies = request.cookies.getAll();
    console.error('[user/me] Request cookies count:', allCookies.length, 'Names:', allCookies.map((c) => c.name).join(', '));

    const supabase = createServerSupabaseClient(request);

    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      console.error('[user/me] getSession failed. Error:', sessionError?.message, 'Has session:', !!session);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error('[user/me] getUser failed. Error:', userError?.message, 'User ID:', user?.id);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let dbUser;
    try {
      dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: USER_SELECT,
      });
    } catch (dbErr) {
      console.error('[user/me] Database query failed:', dbErr);
      return NextResponse.json(
        { error: 'Service unavailable', detail: 'Database query failed' },
        { status: 503 },
      );
    }

    if (!dbUser) {
      console.error('[user/me] Profile not found in DB for user:', user.id, 'Email:', user.email);
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 401 },
      );
    }

    return NextResponse.json(
      { user: dbUser },
      {
        status: 200,
        headers: {
          'Cache-Control': `private, max-age=${CACHE_TTL}`,
        },
      },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[user/me] Unhandled error:', message);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient(request);
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const updateData: Record<string, any> = {};

    if (typeof body.name === 'string' && body.name.trim()) updateData.name = body.name.trim();
    if (typeof body.interests === 'string') {
      try { updateData.interests = JSON.parse(body.interests); } catch { updateData.interests = [body.interests]; }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
      select: USER_SELECT,
    });

    return NextResponse.json({ user: updated });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[user/me] PATCH error:', message);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient(request);
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await prisma.user.delete({ where: { id: user.id } });

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[user/me] DELETE error:', message);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
