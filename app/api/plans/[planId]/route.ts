// API Route: /api/plans/[planId]
// GET: Get plan details
// PUT: Update plan status (approve/abandon)
// POST: Execute plan (convert to sprints/issues)
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/server/db";
import { PlanGenerationService } from "@/server/services/plan-generation-service";
import { z } from "zod";

const updatePlanSchema = z.object({
  action: z.enum(["approve", "abandon", "execute"]),
});

export async function GET(
  req: NextRequest,
  { params }: { params: { planId: string } }
) {
  try {
    const { userId } = auth();
    // For development, use a default user if not authenticated
    const effectiveUserId = userId || "default-user";

    const plan = await prisma.generatedPlan.findUnique({
      where: { id: params.planId },
      include: {
        template: true,
        assessment: {
          include: {
            goal: true,
            domainScores: true,
            recommendations: true,
          },
        },
        planItems: {
          orderBy: [
            { phase: "asc" },
            { type: "desc" }, // Sprints first, then issues
            { order: "asc" },
          ],
        },
        metrics: {
          orderBy: {
            timestamp: "desc",
          },
        },
      },
    });

    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    // Verify ownership
    if (plan.assessment.userId !== effectiveUserId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(plan);
  } catch (error) {
    console.error("Error fetching plan:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { planId: string } }
) {
  try {
    const { userId } = await auth();
    // For development, use a default user if not authenticated
    const effectiveUserId = userId || "default-user";

    const body = await req.json();
    const validation = updatePlanSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: validation.error },
        { status: 400 }
      );
    }

    const { action } = validation.data;

    // Verify ownership
    const plan = await prisma.generatedPlan.findUnique({
      where: { id: params.planId },
      include: {
        assessment: true,
      },
    });

    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    if (plan.assessment.userId !== effectiveUserId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    let result;

    switch (action) {
      case "approve":
        if (plan.status !== "DRAFT") {
          return NextResponse.json(
            { error: "Plan must be in draft status to approve" },
            { status: 400 }
          );
        }
        result = await PlanGenerationService.approvePlan(params.planId, effectiveUserId);
        break;

      case "abandon":
        result = await prisma.generatedPlan.update({
          where: { id: params.planId },
          data: {
            status: "ABANDONED",
            completedAt: new Date(),
          },
        });
        break;

      case "execute":
        if (plan.status !== "APPROVED") {
          return NextResponse.json(
            { error: "Plan must be approved before execution" },
            { status: 400 }
          );
        }
        result = await PlanGenerationService.executePlan(params.planId, effectiveUserId);
        break;

      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error updating plan:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { planId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify ownership
    const plan = await prisma.generatedPlan.findUnique({
      where: { id: params.planId },
      include: {
        assessment: true,
      },
    });

    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    if (plan.assessment.userId !== effectiveUserId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (plan.status === "EXECUTING" || plan.status === "COMPLETED") {
      return NextResponse.json(
        { error: "Cannot delete plan that has been executed" },
        { status: 400 }
      );
    }

    // Delete plan items first
    await prisma.generatedPlanItem.deleteMany({
      where: { planId: params.planId },
    });

    // Delete metrics
    await prisma.planMetric.deleteMany({
      where: { planId: params.planId },
    });

    // Delete the plan
    await prisma.generatedPlan.delete({
      where: { id: params.planId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting plan:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
