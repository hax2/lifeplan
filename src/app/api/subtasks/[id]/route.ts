import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// Update (toggle) a subtask
export async function PUT(req: Request, { params }: { params: { id: string } }) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { isCompleted } = await req.json();

    // Security: We can add a check here to ensure the subtask belongs to a project owned by the user
    const updatedSubtask = await prisma.subtask.update({
        where: { id: params.id },
        data: { isCompleted },
    });
    return NextResponse.json(updatedSubtask);
}

// Delete a subtask
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Security: Add check here too
    await prisma.subtask.delete({ where: { id: params.id } });
    return NextResponse.json({ message: "Subtask deleted" }, { status: 200 });
}