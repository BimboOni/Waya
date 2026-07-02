import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient(request);
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = request.nextUrl.searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    const dbUser = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
    return NextResponse.json({ exists: !!dbUser });
  } catch (err) {
    console.error('[USER_EXISTS_ERROR]:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
