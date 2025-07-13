import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const weeklyTasks = await prisma.weeklyTask.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'asc' },
      include: {
        completions: {
          orderBy: { completedAt: 'desc' },
          take: 1,
        },
      },
    });

    const formattedTasks = weeklyTasks.map(task => ({
      id: task.id,
      title: task.title,
      createdAt: task.createdAt.toISOString(),
      lastCompletedAt: task.completions.length > 0
        ? task.completions[0].completedAt.toISOString()
        : null,
    }));

    return NextResponse.json(formattedTasks);
  } catch (error) {
    console.error('Error fetching weekly tasks:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { title } = await request.json();

  if (!title || typeof title !== 'string') {
    return NextResponse.json({ message: 'Title is required' }, { status: 400 });
  }

  try {
    const newWeeklyTask = await prisma.weeklyTask.create({
      data: {
        title,
        userId: session.user.id,
      },
    });
    return NextResponse.json(newWeeklyTask, { status: 201 });
  } catch (error) {
    console.error('Error creating weekly task:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}