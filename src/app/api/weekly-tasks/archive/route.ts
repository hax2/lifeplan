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
    return NextResponse.json({ message: 'Weekly task ID is required' }, { status: 400 });
  }

  try {
    const weeklyTask = await prisma.weeklyTask.update({
      where: {
        id: id,
        userId: session.user.id,
      },
      data: {
        isArchived: true,
      },
    });
    return NextResponse.json(weeklyTask);
  } catch (error) {
    console.error('Error archiving weekly task:', error);
    return NextResponse.json({ message: 'Failed to archive weekly task' }, { status: 500 });
  }
}
