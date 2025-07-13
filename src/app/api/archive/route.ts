import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

// GET all archived projects
export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const archivedProjects = await prisma.project.findMany({
    where: {
      userId: session.user.id,
      isArchived: true,
    },
    orderBy: {
      updatedAt: 'desc'
    }
  })

  return NextResponse.json(archivedProjects)
}

// Hard-delete a project from the archive
export async function DELETE(req: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await req.json();

    // The magic is in the schema: `onDelete: Cascade` on the relations
    // Deleting the project will automatically delete all its subtasks.
    await prisma.project.delete({
        where: {
            id: id,
            userId: session.user.id, // Security check
        },
    });

    return NextResponse.json({ message: "Project permanently deleted" }, { status: 200 });
}

// Restore a project from the archive
export async function POST(req: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await req.json();

    await prisma.project.update({
        where: {
            id: id,
            userId: session.user.id, // Security check
        },
        data: {
            isArchived: false,
        },
    });

    return NextResponse.json({ message: "Project restored" }, { status: 200 });
}