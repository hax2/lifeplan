// src/app/api/projects/[id]/route.ts
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type Context = {
  params: Promise<{ id: string }>;
};

// GET one project + its subtasks
export async function GET(req: Request, context: Context) {
  const { id } = await context.params;            // ← await here
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const project = await prisma.project.findUnique({
    where: { id, userId: session.user.id },
    include: { subtasks: true },
  });
  if (!project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(project);
}

// PATCH: edit title/description or toggle done
export async function PATCH(req: Request, context: Context) {
  const { id } = await context.params;            // ← await here
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const payload = await req.json();

  const dataToUpdate: { isDone?: boolean; isArchived?: boolean; title?: string; description?: string } = {};

  if (payload.isDone !== undefined) {
    dataToUpdate.isDone = payload.isDone;
  }
  if (payload.isArchived !== undefined) {
    dataToUpdate.isArchived = payload.isArchived;
  }
  if (payload.title !== undefined) {
    dataToUpdate.title = payload.title;
  }
  if (payload.description !== undefined) {
    dataToUpdate.description = payload.description;
  }

  const updated = await prisma.project.update({
    where: { id, userId: session.user.id },
    data: dataToUpdate,
  });
  return NextResponse.json(updated);
}

// DELETE: archive
export async function DELETE(req: Request, context: Context) {
  const { id } = await context.params;            // ← await here
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const updated = await prisma.project.update({
    where: { id, userId: session.user.id },
    data: { isArchived: true },
  });
  return NextResponse.json(updated);
}
