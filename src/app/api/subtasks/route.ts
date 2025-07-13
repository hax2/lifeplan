import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { text, projectId } = await req.json();

    // Security check: ensure the project belongs to the user
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project || project.userId !== session.user.id) {
        return NextResponse.json({ error: "Project not found or access denied" }, { status: 404 });
    }

    const subtask = await prisma.subtask.create({
        data: { text, projectId },
    });
    return NextResponse.json(subtask, { status: 201 });
}