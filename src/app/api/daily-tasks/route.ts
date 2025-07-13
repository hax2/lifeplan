import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

import { parseISO, addDays, startOfDay } from 'date-fns-tz';

// Gets templates and their completion status for a given day
export async function GET(req: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date'); // Expects YYYY-MM-DD format
    if (!date) {
        return NextResponse.json({ error: "Date parameter is required" }, { status: 400 });
    }

    const targetDate = startOfDay(parseISO(date), { timeZone: 'Europe/Stockholm' });
    const nextDate   = addDays(targetDate, 1);

    const templates = await prisma.dailyTaskTemplate.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'asc' },
    });

    const completions = await prisma.dailyTaskCompletion.findMany({
        where: {
            template: { userId: session.user.id },
            date: {
                gte: targetDate,
                lt: nextDate,
            },
        },
    });

    const completionMap = new Set(completions.map(c => c.templateId));

    const result = templates.map(t => ({
        ...t,
        isCompleted: completionMap.has(t.id),
    }));

    return NextResponse.json(result);
}

// Creates a new task template
export async function POST(req: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { title } = await req.json();
    const template = await prisma.dailyTaskTemplate.create({
        data: { title, userId: session.user.id },
    });
    return NextResponse.json({ ...template, isCompleted: false }, { status: 201 });
}