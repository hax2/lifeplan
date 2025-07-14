import { NextRequest, NextResponse } from 'next/server';
import getServerSession from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: NextRequest) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const session = await getServerSession(authOptions) as any;
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
        isArchived: false,
      },
    });
    return NextResponse.json(dailyTask);
  } catch (error) {
    console.error('Error restoring daily task:', error);
    return NextResponse.json({ message: 'Failed to restore daily task' }, { status: 500 });
  }
}
