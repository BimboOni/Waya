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
    const supabase = createServerSupabaseClient(request);

    const { data: claimsResponse, error: claimsError } = await supabase.auth.getClaims();
    if (claimsError || !claimsResponse?.claims?.sub) {
      console.warn('[user/me] JWT validation failed:', claimsError?.message ?? 'no sub claim');
      return NextResponse.json(
        { error: 'Unauthorized', detail: 'Invalid or expired token' },
        { status: 401 },
      );
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.warn('[user/me] getUser() failed after getClaims() passed:', userError?.message);
      return NextResponse.json(
        { error: 'Unauthorized', detail: 'Session invalid' },
        { status: 401 },
      );
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
      const metadataName = user.user_metadata?.full_name as string | undefined;
      const metadataInterests = user.user_metadata?.interests as string | undefined;
      const metadataSubject = user.user_metadata?.preferred_subject as string | undefined;

      console.warn('[user/me] Profile not found for', user.id, '— attempting upsert');
      try {
        const safeEmail = user.email && user.email.length > 0 ? user.email : `${user.id}@placeholder.waya`;
        dbUser = await prisma.user.upsert({
          where: { email: safeEmail },
          create: {
            id: user.id,
            email: safeEmail,
            name: metadataName ?? user.email?.split('@')[0] ?? 'Learner',
            interests: metadataInterests ? (() => { try { return JSON.parse(metadataInterests); } catch { return [metadataInterests]; } })() : [],
            preferredSubject: metadataSubject ?? null,
            xp: 0,
            level: 1,
            streak: 0,
          },
          update: {
            id: user.id,
            name: metadataName ?? user.email?.split('@')[0] ?? 'Learner',
            interests: metadataInterests ? (() => { try { return JSON.parse(metadataInterests); } catch { return [metadataInterests]; } })() : [],
            preferredSubject: metadataSubject ?? null,
          },
          select: USER_SELECT,
        });
        console.log('[user/me] Upserted user profile for', user.id);
      } catch (createErr) {
        const msg = createErr instanceof Error ? createErr.message : String(createErr);
        console.error('[user/me] Upsert failed:', msg);
        return NextResponse.json(
          { error: 'Profile not found', detail: 'User profile does not exist in database' },
          { status: 404 },
        );
      }
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
    const stack = err instanceof Error ? err.stack : '';
    console.error('[user/me] Unhandled error:', message);
    console.error('[user/me] Stack:', stack);
    return NextResponse.json(
      { error: 'Internal server error', detail: message },
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
