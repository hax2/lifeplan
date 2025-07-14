import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type Context = {
    params: Promise<{ id: string }>;
};

// PATCH: Archive a daily task (soft delete)
export async function PATCH(req: Request, { params }: Context) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;
    const { isArchived } = await req.json(); // Expecting { isArchived: true }

    if (isArchived === undefined) {
        return NextResponse.json({ error: "Missing 'isArchived' in payload" }, { status: 400 });
    }

    const updatedTask = await prisma.dailyTaskTemplate.update({
        where: {
            id: id,
            userId: session.user.id, // Security check
        },
        data: {
            isArchived: isArchived,
        },
    });

    return NextResponse.json(updatedTask);
}