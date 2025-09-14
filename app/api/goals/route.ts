import { type NextRequest, NextResponse } from "next/server";
import { prisma, ratelimit } from "@/server/db";
import { type Goal, GoalChannel } from "@prisma/client";
import { z } from "zod";
import { getAuth } from "@clerk/nextjs/server";

const postGoalBodyValidator = z.object({
  projectId: z.string().min(1, "Project ID is required"),
  title: z.string().min(1, "Goal title is required"),
  niche: z.string().optional(),
  channel: z.nativeEnum(GoalChannel),
  description: z.string().optional(),
  timeboxDays: z.number().int().min(1).default(30),
  budgetUsd: z.number().int().min(0).default(0),
  successMetric: z.string().default("$50 net"),
  constraints: z.array(z.string()).default([]),
  revenue: z.array(z.string()).default([]),
  deliverables: z.array(z.string()).default([]),
  audienceJson: z.record(z.any()).optional(),
  profileJson: z.record(z.any()).optional(),
  templateId: z.string().optional(),
});

export type PostGoalBody = z.infer<typeof postGoalBodyValidator>;

const patchGoalBodyValidator = z.object({
  title: z.string().min(1).optional(),
  niche: z.string().optional(),
  channel: z.nativeEnum(GoalChannel).optional(),
  description: z.string().optional(),
  timeboxDays: z.number().int().min(1).optional(),
  budgetUsd: z.number().int().min(0).optional(),
  successMetric: z.string().optional(),
  constraints: z.array(z.string()).optional(),
  revenue: z.array(z.string()).optional(),
  deliverables: z.array(z.string()).optional(),
  audienceJson: z.record(z.any()).optional(),
  profileJson: z.record(z.any()).optional(),
  templateId: z.string().optional(),
});

export type PatchGoalBody = z.infer<typeof patchGoalBodyValidator>;

export type GetGoalsResponse = {
  goals: Goal[];
};

export async function GET(request: NextRequest) {
  try {
    const { userId } = getAuth(request);
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");

    const goals = await prisma.goal.findMany({
      where: {
        createdBy: userId,
        ...(projectId && { projectId }),
      },
      include: {
        project: true,
        template: true,
        contextSnapshots: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return NextResponse.json<GetGoalsResponse>({ goals });
  } catch (error) {
    console.error("Error fetching goals:", error);
    return NextResponse.json(
      { error: "Failed to fetch goals" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const { success } = await ratelimit.limit("create-goal");
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
    const validationResult = postGoalBodyValidator.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: validationResult.error },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Verify project exists (simplified check like issues API)
    const project = await prisma.project.findFirst({
      where: {
        id: data.projectId,
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    // Create goal
    const goal = await prisma.goal.create({
      data: {
        ...data,
        createdBy: userId,
      },
      include: {
        project: true,
        template: true,
      },
    });

    return NextResponse.json({ goal }, { status: 201 });
  } catch (error) {
    console.error("Error creating goal:", error);
    return NextResponse.json(
      { error: "Failed to create goal" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Rate limiting
    const { success } = await ratelimit.limit("update-goal");
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
    const { goalId, ...updateData } = body;

    if (!goalId) {
      return NextResponse.json(
        { error: "Goal ID is required" },
        { status: 400 }
      );
    }

    const validationResult = patchGoalBodyValidator.safeParse(updateData);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: validationResult.error },
        { status: 400 }
      );
    }

    // Verify goal exists and user owns it
    const existingGoal = await prisma.goal.findFirst({
      where: {
        id: goalId,
        createdBy: userId,
      },
    });

    if (!existingGoal) {
      return NextResponse.json(
        { error: "Goal not found or access denied" },
        { status: 404 }
      );
    }

    // Update goal
    const goal = await prisma.goal.update({
      where: { id: goalId },
      data: validationResult.data,
      include: {
        project: true,
        template: true,
      },
    });

    return NextResponse.json({ goal });
  } catch (error) {
    console.error("Error updating goal:", error);
    return NextResponse.json(
      { error: "Failed to update goal" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Rate limiting
    const { success } = await ratelimit.limit("delete-goal");
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
    const goalId = searchParams.get("goalId");

    if (!goalId) {
      return NextResponse.json(
        { error: "Goal ID is required" },
        { status: 400 }
      );
    }

    // Verify goal exists and user owns it
    const existingGoal = await prisma.goal.findFirst({
      where: {
        id: goalId,
        createdBy: userId,
      },
    });

    if (!existingGoal) {
      return NextResponse.json(
        { error: "Goal not found or access denied" },
        { status: 404 }
      );
    }

    // Delete goal (this will cascade delete related records)
    await prisma.goal.delete({
      where: { id: goalId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting goal:", error);
    return NextResponse.json(
      { error: "Failed to delete goal" },
      { status: 500 }
    );
  }
}
