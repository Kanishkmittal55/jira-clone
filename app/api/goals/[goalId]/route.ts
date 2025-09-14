import { type NextRequest, NextResponse } from "next/server";
import { prisma, ratelimit } from "@/server/db";
import { type Goal, GoalChannel } from "@prisma/client";
import { z } from "zod";
import { getAuth } from "@clerk/nextjs/server";

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
  activePlanId: z.string().optional(),
});

export type PatchGoalBody = z.infer<typeof patchGoalBodyValidator>;

export type GetGoalResponse = {
  goal: Goal & {
    project: any;
    template: any;
    activePlan: any;
    contextSnapshots: any[];
    promptRuns: any[];
    planVersions: any[];
  };
};

export async function GET(
  request: NextRequest,
  { params }: { params: { goalId: string } }
) {
  try {
    const { userId } = getAuth(request);
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const goal = await prisma.goal.findFirst({
      where: {
        id: params.goalId,
        createdBy: userId,
      },
      include: {
        project: true,
        template: true,
        activePlan: true,
        contextSnapshots: {
          orderBy: { createdAt: "desc" },
          include: {
            researchSources: {
              orderBy: { relevance: "desc" },
            },
          },
        },
        promptRuns: {
          orderBy: { createdAt: "desc" },
        },
        planVersions: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!goal) {
      return NextResponse.json(
        { error: "Goal not found" },
        { status: 404 }
      );
    }

    return NextResponse.json<GetGoalResponse>({ goal });
  } catch (error) {
    console.error("Error fetching goal:", error);
    return NextResponse.json(
      { error: "Failed to fetch goal" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { goalId: string } }
) {
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
    const validationResult = patchGoalBodyValidator.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: validationResult.error },
        { status: 400 }
      );
    }

    // Verify goal exists and user owns it
    const existingGoal = await prisma.goal.findFirst({
      where: {
        id: params.goalId,
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
      where: { id: params.goalId },
      data: validationResult.data,
      include: {
        project: true,
        template: true,
        activePlan: true,
        contextSnapshots: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { goalId: string } }
) {
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

    // Verify goal exists and user owns it
    const existingGoal = await prisma.goal.findFirst({
      where: {
        id: params.goalId,
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
      where: { id: params.goalId },
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
