import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type Context = {
  params: { id: string };
};

/**
 * A heuristic-based function to generate subtasks based on action verbs in a project title.
 * This is faster, cheaper, and more predictable than an LLM.
 * @param title The title of the project.
 * @returns An array of suggested subtask strings.
 */
const generateSubtasksFromTitle = (title: string): string[] => {
    const lowerTitle = title.toLowerCase();
    let nounPhrase = title;
    let action = 'default';

    // A map of action verbs to their corresponding subtask templates.
    const actionTemplates: { [key: string]: string[] } = {
        'launch': [
            "Finalize launch strategy for {noun_phrase}",
            "Prepare marketing materials for {noun_phrase}",
            "Conduct final QA and testing",
            "Execute launch day plan",
            "Monitor post-launch performance"
        ],
        'create': [
            "Define requirements for {noun_phrase}",
            "Outline the structure of {noun_phrase}",
            "Develop the first draft/prototype",
            "Review and iterate on the draft",
            "Finalize and polish {noun_phrase}"
        ],
        'write': [
            "Research and gather information for {noun_phrase}",
            "Create a detailed outline",
            "Write the first draft of {noun_phrase}",
            "Edit for clarity, grammar, and style",
            "Get feedback and finalize the text"
        ],
        'design': [
            "Gather inspiration and create a mood board for {noun_phrase}",
            "Sketch initial concepts and wireframes",
            "Develop high-fidelity mockups for {noun_phrase}",
            "Select color palette and typography",
            "Prepare final assets and design specifications"
        ],
        'plan': [
            "Define the main objectives of {noun_phrase}",
            "Identify key milestones and deliverables",
            "Allocate resources and set a budget",
            "Create a detailed timeline",
            "Identify potential risks and mitigation strategies"
        ],
        'default': [
            "Break down the major goals",
            "Identify the first actionable step",
            "Set a deadline",
            "Gather necessary resources"
        ]
    };

    // Find which action verb, if any, is in the title.
    for (const verb of Object.keys(actionTemplates)) {
        if (lowerTitle.startsWith(verb)) {
            action = verb;
            // Extract the noun phrase after the verb.
            nounPhrase = title.substring(verb.length).trim();
            break;
        }
    }

    // Replace the placeholder with the actual noun phrase from the title.
    const subtasks = actionTemplates[action].map(template => 
        template.replace('{noun_phrase}', nounPhrase)
    );

    return subtasks;
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

        // Call our new heuristic function instead of the mock AI.
        const suggestedTasks = generateSubtasksFromTitle(project.title);
        
        const subtasksToCreate = suggestedTasks.map(text => ({
            text,
            projectId: id,
        }));
        
        await prisma.subtask.createMany({
            data: subtasksToCreate,
        });

        return NextResponse.json({ message: "Subtasks added!", count: subtasksToCreate.length }, { status: 201 });
    } catch (error) {
        console.error("Error generating subtasks:", error);
        return NextResponse.json({ error: "An internal error occurred." }, { status: 500 });
    }
}