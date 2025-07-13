import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await req.json();
    await prisma.project.update({
        where: { id, userId: session.user.id },
        data: { isArchived: false, isDone: false },
    });
    return NextResponse.json({ message: "Project restored" });
}