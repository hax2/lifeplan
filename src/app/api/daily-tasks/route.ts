/* ----------------------------------------------------------------
 * src/app/api/daily-tasks/route.ts
 * ---------------------------------------------------------------- */
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

import { parseISO, startOfDay, addDays } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

const TIME_ZONE = 'Europe/Stockholm';

// -----------------------------------------------------------------------------
// GET  /api/daily-tasks?date=YYYY-MM-DD
// -----------------------------------------------------------------------------
export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const dateParam = searchParams.get('date');          // e.g. '2025-07-14'
  const isArchivedParam = searchParams.get('isArchived'); // e.g. 'true' or 'false'

  if (!dateParam) {
    return NextResponse.json({ error: 'Date parameter is required' }, { status: 400 });
  }

  // 1. Convert YYYY-MM-DD string to a JS Date at midnight in Stockholm time
  const zoned = toZonedTime(parseISO(dateParam), TIME_ZONE);
  const targetDate = startOfDay(zoned);
  const nextDate   = addDays(targetDate, 1);

  // Determine isArchived filter
  const isArchived = isArchivedParam === 'true' ? true : isArchivedParam === 'false' ? false : undefined;

  // 2. Fetch templates (once) and completions for that day
  const templates = await prisma.dailyTaskTemplate.findMany({
    where: {
      userId: session.user.id,
      ...(isArchived !== undefined && { isArchived: isArchived }),
    },
    orderBy: { createdAt: 'asc' },
  });

  const completions = await prisma.dailyTaskCompletion.findMany({
    where: {
      template: { userId: session.user.id },
      date: { gte: targetDate, lt: nextDate },
    },
  });

  // 3. Merge
  const done = new Set(completions.map(c => c.templateId));
  const result = templates.map(t => ({ ...t, isCompleted: done.has(t.id) }));

  return NextResponse.json(result);
}

// -----------------------------------------------------------------------------
// POST  /api/daily-tasks   { title }
// -----------------------------------------------------------------------------
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { title } = await req.json();
  const template = await prisma.dailyTaskTemplate.create({
    data: { title, userId: session.user.id },
  });

  return NextResponse.json({ ...template, isCompleted: false }, { status: 201 });
}
