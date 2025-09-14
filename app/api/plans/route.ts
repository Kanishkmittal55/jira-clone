// API Route: /api/plans
// POST: Generate a new plan based on assessment
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/server/db";
import { PlanGenerationService } from "@/server/services/plan-generation-service";
import { z } from "zod";

const generatePlanSchema = z.object({
  goalId: z.string().uuid(),
  assessmentId: z.string().uuid(),
  templateId: z.string().uuid(),
});

export async function POST(req: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validation = generatePlanSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: validation.error },
        { status: 400 }
      );
    }

    const { goalId, assessmentId, templateId } = validation.data;

    // Verify ownership and get details
    const assessment = await prisma.knowledgeAssessment.findUnique({
      where: { id: assessmentId },
      include: {
        goal: true,
      },
    });

    if (!assessment) {
      return NextResponse.json(
        { error: "Assessment not found" },
        { status: 404 }
      );
    }

    if (assessment.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (assessment.status !== "COMPLETED") {
      return NextResponse.json(
        { error: "Assessment must be completed before generating a plan" },
        { status: 400 }
      );
    }

    // Generate the plan
    const plan = await PlanGenerationService.generatePlan({
      goalId,
      assessmentId,
      templateId,
      userLevel: assessment.overallLevel,
      timeboxDays: assessment.goal.timeboxDays,
      constraints: assessment.goal.constraints as Record<string, unknown>,
    });

    // Get plan with items
    const fullPlan = await prisma.generatedPlan.findUnique({
      where: { id: plan.id },
      include: {
        planItems: {
          orderBy: [
            { phase: "asc" },
            { order: "asc" },
          ],
        },
        template: true,
        assessment: {
          include: {
            domainScores: true,
            recommendations: true,
          },
        },
      },
    });

    return NextResponse.json(fullPlan);
  } catch (error) {
    console.error("Error generating plan:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const goalId = searchParams.get("goalId");
    const status = searchParams.get("status");

    const where: any = {};
    
    if (goalId) {
      where.goalId = goalId;
    }
    
    if (status) {
      where.status = status;
    }

    // Get all plans for the user
    const plans = await prisma.generatedPlan.findMany({
      where: {
        ...where,
        assessment: {
          userId,
        },
      },
      include: {
        template: true,
        assessment: {
          include: {
            goal: true,
          },
        },
        metrics: {
          orderBy: {
            timestamp: "desc",
          },
          take: 5,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(plans);
  } catch (error) {
    console.error("Error fetching plans:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
