import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await req.json();

  if (!id) {
    return NextResponse.json({ message: 'Daily task ID is required' }, { status: 400 });
  }

  try {
    const dailyTask = await prisma.dailyTaskTemplate.update({
      where: {
        id: id,
        userId: session.user.id,
      },
      data: {
        isArchived: true,
      },
    });
    return NextResponse.json(dailyTask);
  } catch (error) {
    console.error('Error archiving daily task:', error);
    return NextResponse.json({ message: 'Failed to archive daily task' }, { status: 500 });
  }
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const archivedTasks = await prisma.dailyTaskTemplate.findMany({
    where: {
      userId: session.user.id,
      isArchived: true,
    },
    orderBy: { createdAt: 'asc' },
  });

  return NextResponse.json(archivedTasks);
}
