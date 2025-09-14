import { type NextRequest, NextResponse } from "next/server";
import { prisma, ratelimit } from "@/server/db";
import { type GoalTemplate } from "@prisma/client";
import { z } from "zod";
import { getAuth } from "@clerk/nextjs/server";

const postGoalTemplateBodyValidator = z.object({
  name: z.string().min(1, "Template name is required"),
  promptText: z.string().min(1, "Prompt text is required"),
  outputSchema: z.record(z.any()),
  systemMsg: z.string().optional(),
});

export type PostGoalTemplateBody = z.infer<typeof postGoalTemplateBodyValidator>;

const patchGoalTemplateBodyValidator = z.object({
  name: z.string().min(1).optional(),
  promptText: z.string().min(1).optional(),
  outputSchema: z.record(z.any()).optional(),
  systemMsg: z.string().optional(),
});

export type PatchGoalTemplateBody = z.infer<typeof patchGoalTemplateBodyValidator>;

export type GetGoalTemplatesResponse = {
  templates: GoalTemplate[];
};

export async function GET() {
  try {
    const templates = await prisma.goalTemplate.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json<GetGoalTemplatesResponse>({ templates });
  } catch (error) {
    console.error("Error fetching goal templates:", error);
    return NextResponse.json(
      { error: "Failed to fetch goal templates" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const { success } = await ratelimit.limit("create-goal-template");
    if (!success) {
      return NextResponse.json(
        { error: "Rate limit exceeded" },
        { status: 429 }
      );
    }

    // Authentication
    const { userId } = getAuth(request);
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Validate request body
    const body = await request.json();
    const validationResult = postGoalTemplateBodyValidator.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: validationResult.error },
        { status: 400 }
      );
    }

    // Create goal template
    const template = await prisma.goalTemplate.create({
      data: validationResult.data,
    });

    return NextResponse.json({ template }, { status: 201 });
  } catch (error) {
    console.error("Error creating goal template:", error);
    return NextResponse.json(
      { error: "Failed to create goal template" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Rate limiting
    const { success } = await ratelimit.limit("update-goal-template");
    if (!success) {
      return NextResponse.json(
        { error: "Rate limit exceeded" },
        { status: 429 }
      );
    }

    // Authentication
    const { userId } = getAuth(request);
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Validate request body
    const body = await request.json();
    const { templateId, ...updateData } = body;

    if (!templateId) {
      return NextResponse.json(
        { error: "Template ID is required" },
        { status: 400 }
      );
    }

    const validationResult = patchGoalTemplateBodyValidator.safeParse(updateData);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: validationResult.error },
        { status: 400 }
      );
    }

    // Update goal template
    const template = await prisma.goalTemplate.update({
      where: { id: templateId },
      data: validationResult.data,
    });

    return NextResponse.json({ template });
  } catch (error) {
    console.error("Error updating goal template:", error);
    return NextResponse.json(
      { error: "Failed to update goal template" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Rate limiting
    const { success } = await ratelimit.limit("delete-goal-template");
    if (!success) {
      return NextResponse.json(
        { error: "Rate limit exceeded" },
        { status: 429 }
      );
    }

    // Authentication
    const { userId } = getAuth(request);
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const templateId = searchParams.get("templateId");

    if (!templateId) {
      return NextResponse.json(
        { error: "Template ID is required" },
        { status: 400 }
      );
    }

    // Check if template is being used by any goals
    const goalsUsingTemplate = await prisma.goal.count({
      where: { templateId },
    });

    if (goalsUsingTemplate > 0) {
      return NextResponse.json(
        { error: "Cannot delete template that is being used by goals" },
        { status: 409 }
      );
    }

    // Delete goal template
    await prisma.goalTemplate.delete({
      where: { id: templateId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting goal template:", error);
    return NextResponse.json(
      { error: "Failed to delete goal template" },
      { status: 500 }
    );
  }
}
