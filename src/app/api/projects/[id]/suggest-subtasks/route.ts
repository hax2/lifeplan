import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type Context = {
  params: { id: string };
};

// This is a mock function that simulates a call to a Large Language Model.
// FIX: Removed the unused '_description' parameter.
const generateSubtasksWithAI = async (title: string): Promise<string[]> => {
    console.log(`AI: Generating subtasks for project "${title}"...`);
    
    // To simulate the delay of a real AI call.
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Return a predefined, mock response based on keywords in the title.
    const mockResponses: { [key: string]: string[] } = {
        "default": [
            "Outline the main goals",
            "Research competitors",
            "Create a timeline",
            "Draft the initial plan"
        ],
        "website": [
            "Design the wireframes",
            "Choose a color palette",
            "Develop the homepage",
            "Set up the hosting environment"
        ],
         "marketing": [
            "Identify target audience",
            "Develop key messaging",
            "Choose marketing channels",
            "Set a budget and KPIs"
        ]
    };

    let key = "default";
    if (title.toLowerCase().includes("website")) key = "website";
    if (title.toLowerCase().includes("marketing")) key = "marketing";
    
    console.log(`AI: Mock response generated for key "${key}".`);
    return mockResponses[key];
};


export async function POST(req: Request, context: Context) {
    const { id } = context.params;
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const project = await prisma.project.findFirst({
            where: { id, userId: session.user.id },
        });

        if (!project) {
            return NextResponse.json({ error: "Project not found" }, { status: 404 });
        }

        // Call our (mock) AI function
        // FIX: Updated the function call to match the new signature.
        const suggestedTasks = await generateSubtasksWithAI(project.title);
        
        if (!suggestedTasks || suggestedTasks.length === 0) {
            return NextResponse.json({ error: "AI could not generate subtasks." }, { status: 500 });
        }
        
        // Format for Prisma's createMany
        const subtasksToCreate = suggestedTasks.map(text => ({
            text,
            projectId: id,
        }));
        
        await prisma.subtask.createMany({
            data: subtasksToCreate,
        });

        return NextResponse.json({ message: "AI-suggested subtasks added!", count: subtasksToCreate.length }, { status: 201 });
    } catch (error) {
        console.error("Error generating AI subtasks:", error);
        return NextResponse.json({ error: "An internal error occurred." }, { status: 500 });
    }
}