import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await req.json();

  if (!id) {
    return NextResponse.json({ message: 'Weekly task ID is required' }, { status: 400 });
  }

  try {
    await prisma.weeklyTask.delete({
      where: {
        id: id,
        userId: session.user.id,
      },
    });
    return NextResponse.json({ message: 'Weekly task permanently deleted' });
  } catch (error) {
    console.error('Error deleting weekly task:', error);
    return NextResponse.json({ message: 'Failed to delete weekly task' }, { status: 500 });
  }
}
