import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('[ONBOARDING PAYLOAD]:', body);

    const safeEmail = body.email && typeof body.email === 'string' && body.email.length > 0
      ? body.email : `user-${body.userId}@placeholder.waya`;
    const safeName = body.name && typeof body.name === 'string' && body.name.length > 0
      ? body.name : 'Learner';
    const safeInterests = Array.isArray(body.interests) ? body.interests : [];

    try {
      const newUser = await prisma.user.create({
        data: {
          id: body.userId,
          email: safeEmail,
          name: safeName,
          interests: safeInterests,
          preferredSubject: body.preferredSubject ?? null,
          xp: 0,
          level: 1,
          streak: 0,
        },
      });
      console.log('[ONBOARDING SUCCESS]: User profile created for', body.userId);
      return NextResponse.json({ user: newUser }, { status: 201 });
    } catch (createErr: any) {
      console.error('[ONBOARDING CREATE FAILED]:', createErr?.message);
      // If unique constraint fails, the profile already exists — still a success
      if (createErr?.message?.includes('Unique constraint')) {
        console.log('[ONBOARDING]: Profile already exists, fetching...');
        const existing = await prisma.user.findUnique({ where: { id: body.userId } });
        if (existing) return NextResponse.json({ user: existing }, { status: 200 });
      }
      return NextResponse.json({ error: createErr?.message ?? 'Database error' }, { status: 500 });
    }
  } catch (err: any) {
    console.error('[ONBOARDING CRASH]:', err?.message ?? err);
    return NextResponse.json({ error: err?.message ?? 'Internal error' }, { status: 500 });
  }
}
