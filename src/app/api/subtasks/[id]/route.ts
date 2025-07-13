import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// Replicating the unusual context type from the working `projects` route
// This is the key to satisfying the strict build environment.
type Context = {
    params: Promise<{ id: string }>;
};

// Update (toggle) a subtask
export async function PUT(req: Request, context: Context) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { isCompleted } = await req.json();
    const { id } = await context.params; // We must now use 'await' here

    // Security: We can add a check here to ensure the subtask belongs to a project owned by the user
    const updatedSubtask = await prisma.subtask.update({
        where: { id: id },
        data: { isCompleted },
    });
    return NextResponse.json(updatedSubtask);
}

// Delete a subtask
export async function DELETE(req: Request, context: Context) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await context.params; // And also use 'await' here

    // Security: Add check here too
    await prisma.subtask.delete({ where: { id: id } });
    return NextResponse.json({ message: "Subtask deleted" }, { status: 200 });
}