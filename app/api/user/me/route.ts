import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const USER_SELECT = {
  id: true, email: true, name: true, interests: true, preferredSubject: true,
  xp: true, level: true, streak: true, lastActive: true, lastLocalDate: true, createdAt: true,
} as const;

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll().map((cookie) => ({
              name: cookie.name,
              value: cookie.value,
            }));
          },
          setAll() {},
        },
      },
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error('[AUTH FAILURE]: Supabase could not find user from request cookies.', userError?.message ?? userError);
      return NextResponse.json({ error: 'Unauthorized session token missing' }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({ where: { id: user.id }, select: USER_SELECT });
    if (!dbUser) {
      console.warn('[USER DB]: Profile not found for', user.id, '— creating placeholder');
      try {
        const placeholder = await prisma.user.create({
          data: {
            id: user.id,
            email: user.email ?? `user-${user.id}@placeholder.waya`,
            name: (user.user_metadata?.full_name as string) ?? user.email?.split('@')[0] ?? 'Learner',
            interests: [],
            preferredSubject: 'Mathematics',
            xp: 0,
            level: 1,
            streak: 0,
          },
          select: USER_SELECT,
        });
        console.log('[USER DB]: Placeholder profile created for', user.id);
        return NextResponse.json({ user: placeholder }, { status: 200, headers: { 'Cache-Control': 'private, max-age=60' } });
      } catch (createErr: any) {
        console.error('[USER DB]: Failed to create placeholder:', createErr?.message);
        return NextResponse.json({ error: 'Profile creation failed' }, { status: 401 });
      }
    }

    return NextResponse.json({ user: dbUser }, { status: 200, headers: { 'Cache-Control': 'private, max-age=60' } });
  } catch (error: any) {
    console.error('[CRITICAL SYSTEM ERROR]:', error?.message ?? error);
    return NextResponse.json({ error: 'Internal execution error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll().map((cookie) => ({
              name: cookie.name,
              value: cookie.value,
            }));
          },
          setAll() {},
        },
      },
    );
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const updateData: Record<string, any> = {};
    if (typeof body.name === 'string' && body.name.trim()) updateData.name = body.name.trim();
    if (typeof body.interests === 'string') {
      try { updateData.interests = JSON.parse(body.interests); } catch { updateData.interests = [body.interests]; }
    }
    if (Object.keys(updateData).length === 0) return NextResponse.json({ error: 'No valid fields' }, { status: 400 });

    const updated = await prisma.user.update({ where: { id: user.id }, data: updateData, select: USER_SELECT });
    return NextResponse.json({ user: updated });
  } catch (error: any) {
    console.error('[user/me] PATCH CRASH:', error?.message ?? error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll().map((cookie) => ({
              name: cookie.name,
              value: cookie.value,
            }));
          },
          setAll() {},
        },
      },
    );
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await prisma.user.delete({ where: { id: user.id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[user/me] DELETE CRASH:', error?.message ?? error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
