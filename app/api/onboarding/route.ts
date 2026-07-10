import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('[ONBOARDING DISPATCH]:', JSON.stringify(body));

    if (!body.userId || typeof body.userId !== 'string') {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    const safeName = body.name && typeof body.name === 'string' ? body.name.trim() : 'Learner';
    const safeInterests = Array.isArray(body.interests) ? body.interests : [];

    const updatedUser = await prisma.user.upsert({
      where: { id: body.userId },
      create: {
        id: body.userId,
        email: body.email && typeof body.email === 'string' ? body.email : `user-${body.userId}@placeholder.waya`,
        name: safeName,
        interests: safeInterests,
        preferredSubject: body.preferredSubject ?? null,
        xp: 0,
        level: 1,
        streak: 0,
      },
      update: {
        name: safeName,
        interests: safeInterests,
        preferredSubject: body.preferredSubject ?? null,
      },
    });

    console.log('[ONBOARDING SUCCESS]: User updated for', body.userId);
    return NextResponse.json({ success: true, user: updatedUser }, { status: 200 });
  } catch (error: any) {
    console.error('[ONBOARDING RUNTIME CRASH]:', error?.message ?? error);
    // Log Prisma-specific details
    if (error?.meta) console.error('[ONBOARDING SCHEMA DETAIL]:', JSON.stringify(error.meta));
    return NextResponse.json({ error: error?.message ?? 'Internal error' }, { status: 500 });
  }
}
