import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { taskId } = await request.json();

  if (!taskId || typeof taskId !== 'string') {
    return NextResponse.json({ message: 'Task ID is required' }, { status: 400 });
  }

  try {
    // Verify the task belongs to the user
    const weeklyTask = await prisma.weeklyTask.findUnique({
      where: {
        id: taskId,
        userId: session.user.id,
      },
    });

    if (!weeklyTask) {
      return NextResponse.json({ message: 'Weekly task not found or does not belong to user' }, { status: 404 });
    }

    const newCompletion = await prisma.weeklyTaskCompletion.create({
      data: {
        weeklyTaskId: taskId,
        completedAt: new Date(),
      },
    });
    return NextResponse.json(newCompletion, { status: 201 });
  } catch (error) {
    console.error('Error recording weekly task completion:', error);
    return NextResponse.json({ message: 'Internal server error', error: error.message }, { status: 500 });
  }
}
