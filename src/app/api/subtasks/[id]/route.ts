import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// Define a clear type for the route's context object
type RouteContext = {
    params: {
        id: string;
    }
}

// Update (toggle) a subtask
export async function PUT(req: Request, context: RouteContext) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { isCompleted } = await req.json();
    const { id } = context.params; // Destructure id from the context object

    // TODO: Add a security check to ensure the user owns the project this subtask belongs to.
    const updatedSubtask = await prisma.subtask.update({
        where: { id: id },
        data: { isCompleted },
    });
    return NextResponse.json(updatedSubtask);
}

// Delete a subtask
export async function DELETE(req: Request, context: RouteContext) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = context.params; // Destructure id from the context object

    // TODO: Add a security check here as well.
    await prisma.subtask.delete({ where: { id: id } });
    return NextResponse.json({ message: "Subtask deleted" }, { status: 200 });
}