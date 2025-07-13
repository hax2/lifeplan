// src/app/api/projects/route.ts
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const doneParam = url.searchParams.get("done"); // ?done=true or ?done=false

  const where: { userId: string; isArchived: boolean; isDone?: boolean } = {
    userId: session.user.id,
    isArchived: false,        // always exclude archived here
  };
  if (doneParam === "true") {
    where.isDone = true;
  } else if (doneParam === "false") {
    where.isDone = false;
  }

  const projects = await prisma.project.findMany({
    where,
    include: {
      subtasks: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return NextResponse.json(projects);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, description } = await req.json();

  const project = await prisma.project.create({
    data: {
      title,
      description,
      userId: session.user.id,
    },
  });

  return NextResponse.json(project, { status: 201 });
}