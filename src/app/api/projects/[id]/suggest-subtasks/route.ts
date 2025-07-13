import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

/**
 * Create quick subtasks based on simple verbs in the project title –
 * no LLM calls, just a deterministic template lookup.
 */
const generateSubtasksFromTitle = (title: string): string[] => {
  const lower = title.toLowerCase();
  let action: keyof typeof templates | "default" = "default";
  let noun = title;

  const templates = {
    launch: [
      "Finalize launch strategy for {noun}",
      "Prepare marketing materials for {noun}",
      "Conduct final QA and testing",
      "Execute launch‑day plan",
      "Monitor post‑launch performance",
    ],
    create: [
      "Gather requirements for {noun}",
      "Outline the structure of {noun}",
      "Build first draft / prototype",
      "Review and iterate the draft",
      "Polish and publish {noun}",
    ],
    write: [
      "Research background for {noun}",
      "Draft detailed outline",
      "Write first draft of {noun}",
      "Edit for clarity and style",
      "Get feedback and finalise",
    ],
    design: [
      "Collect inspiration / moodboard for {noun}",
      "Sketch initial concepts",
      "Create high‑fidelity mock‑ups",
      "Select colours & typography",
      "Export final assets for {noun}",
    ],
    plan: [
      "Define objectives for {noun}",
      "Identify milestones & deliverables",
      "Allocate resources / budget",
      "Draft detailed timeline",
      "List risks & mitigations",
    ],
    default: [
      "Break the goal into chunks",
      "Pick the first actionable step",
      "Assign a deadline",
      "Gather any required resources",
    ],
  } as const;

  for (const verb of Object.keys(templates)) {
    if (lower.startsWith(verb)) {
      action = verb as keyof typeof templates;
      noun = title.slice(verb.length).trim();
      break;
    }
  }

  return templates[action].map((t) => t.replace("{noun}", noun));
};

export async function POST(
  _req: Request,
  context: { params: { id: string } }
) {
  const { id } = context.params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const project = await prisma.project.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const subtasks = generateSubtasksFromTitle(project.title).map((text) => ({
    text,
    projectId: id,
  }));

  await prisma.subtask.createMany({ data: subtasks });

  return NextResponse.json(
    { message: "Subtasks added!", count: subtasks.length },
    { status: 201 }
  );
}
