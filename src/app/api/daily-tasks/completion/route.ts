import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// Mark a task as complete for a given day
export async function POST(req: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { templateId, date } = await req.json(); // date in YYYY-MM-DD

    // Security check
    const template = await prisma.dailyTaskTemplate.findFirst({
        where: { id: templateId, userId: session.user.id }
    });
    if (!template) {
        return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    await prisma.dailyTaskCompletion.create({
        data: {
            templateId,
            date: new Date(date),
        },
    });

    return NextResponse.json({ message: "Task completed" }, { status: 201 });
}

// Mark a task as incomplete (delete completion record)
export async function DELETE(req: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { searchParams } = new URL(req.url);
    const templateId = searchParams.get('templateId');
    const date = searchParams.get('date'); // YYYY-MM-DD

    if (!templateId || !date) {
        return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }
    
    const targetDate = new Date(date);
    
    // This is more complex because we need the completion record's ID to delete it.
    // A unique constraint is `date` + `templateId`, so we can find it this way.
    const completion = await prisma.dailyTaskCompletion.findFirst({
        where: { 
            templateId,
            date: targetDate,
            template: { userId: session.user.id } // Security check
        }
    });

    if (completion) {
        await prisma.dailyTaskCompletion.delete({ where: { id: completion.id } });
    }
    
    return NextResponse.json({ message: "Task completion removed" });
}