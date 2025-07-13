import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await req.json();

    // Thanks to `onDelete: Cascade` in schema, deleting the project
    // will automatically delete all its associated subtasks.
    await prisma.project.delete({
        where: { id, userId: session.user.id },
    });
    return NextResponse.json({ message: "Project permanently deleted" });
}