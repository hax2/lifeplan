import { auth } from './auth';
import { NextResponse } from 'next/server';

export type Handler<C = unknown> =
  (userId: string, req: Request, ctx: C) => Promise<Response>;

export const withAuth =
  <C = unknown>(handler: Handler<C>) =>
  async (req: Request, ctx: C) => {
    const session = await auth();
    if (!session?.user?.id)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    return handler(session.user.id, req, ctx);
  }; 