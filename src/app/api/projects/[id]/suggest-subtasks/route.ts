/* src/app/api/projects/[id]/suggest-subtasks/route.ts */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/* ---------- simple heuristic to create subtasks ---------- */
const templates: Record<string, string[]> = {
  launch: [
    "Finalize launch strategy for {noun}",
    "Prepare marketing materials for {noun}",
    "Conduct final QA and testing",
    "Execute launch-day plan",
    "Monitor post-launch performance"
  ],
  create: [
    "Define requirements for {noun}",
    "Outline the structure of {noun}",
    "Develop the first draft / prototype",
    "Review and iterate on the draft",
    "Finalize and polish {noun}"
  ],
  write: [
    "Research and gather information for {noun}",
    "Create a detailed outline",
    "Write the first draft of {noun}",
    "Edit for clarity, grammar, and style",
    "Get feedback and finalize the text"
  ],
  design: [
    "Gather inspiration and create a mood board for {noun}",
    "Sketch initial concepts and wireframes",
    "Develop high-fidelity mock-ups for {noun}",
    "Select color palette and typography",
    "Prepare final assets and design specs"
  ],
  plan: [
    "Define the main objectives of {noun}",
    "Identify key milestones and deliverables",
    "Allocate resources and set a budget",
    "Create a detailed timeline",
    "Identify potential risks and mitigations"
  ],
  default: [
    "Break down the major goals",
    "Identify the first actionable step",
    "Set a deadline",
    "Gather necessary resources"
  ]
};

function generate(title: string): string[] {
  const lower = title.toLowerCase();
  let verb: string = "default";
  let noun = title;

  for (const v of Object.keys(templates)) {
    if (lower.startsWith(v)) {
      verb = v;
      noun = title.slice(v.length).trim();
      break;
    }
  }

  return templates[verb].map(t => t.replace("{noun}", noun));
}

/* ---------- POST handler ---------- */
export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const project = await prisma.project.findFirst({
    where: { id, userId: session.user.id }
  });
  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const subtasks = generate(project.title);
  await prisma.subtask.createMany({
    data: subtasks.map(text => ({ text, projectId: id }))
  });

  return NextResponse.json(
    { message: "Subtasks added!", count: subtasks.length },
    { status: 201 }
  );
}