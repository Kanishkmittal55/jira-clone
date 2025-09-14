// API Route: /api/assessments
// POST: Create or get assessment for a goal
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/server/db";
import { AssessmentService } from "@/server/services/assessment-service";
import { z } from "zod";

const createAssessmentSchema = z.object({
  goalId: z.string().uuid(),
});

export async function POST(req: NextRequest) {
  try {
    const { userId } = auth();
    // For development, use a default user if not authenticated
    const effectiveUserId = userId || "default-user";

    const body = await req.json();
    const validation = createAssessmentSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: validation.error },
        { status: 400 }
      );
    }

    const { goalId } = validation.data;

    // Get goal details
    const goal = await prisma.goal.findUnique({
      where: { id: goalId },
    });

    if (!goal) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    }

    // Check if user has access to this goal (skip for development)
    // if (goal.createdBy !== effectiveUserId) {
    //   return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    // }

    // Get or create assessment
    const assessment = await AssessmentService.getOrCreateAssessment(
      goalId,
      effectiveUserId,
      goal.channel
    );

    // Get template and questions
    const template = await AssessmentService.getTemplate(goal.channel);
    if (!template) {
      return NextResponse.json(
        { error: "No assessment template available for this channel" },
        { status: 404 }
      );
    }

    const questions = await AssessmentService.getQuestions(
      template.id,
      assessment.overallLevel
    );

    // Get existing responses if any
    const responses = await prisma.assessmentResponse.findMany({
      where: { assessmentId: assessment.id },
    });

    return NextResponse.json({
      assessment,
      template,
      questions,
      responses,
    });
  } catch (error) {
    console.error("Error creating assessment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = auth();
    // For development, use a default user if not authenticated
    const effectiveUserId = userId || "default-user";

    const { searchParams } = new URL(req.url);
    const goalId = searchParams.get("goalId");

    if (!goalId) {
      return NextResponse.json(
        { error: "Goal ID is required" },
        { status: 400 }
      );
    }

    // Get assessment for the goal
    const assessment = await prisma.knowledgeAssessment.findUnique({
      where: {
        goalId_userId: {
          goalId,
          userId: effectiveUserId,
        },
      },
      include: {
        domainScores: true,
        responses: true,
        recommendations: {
          orderBy: {
            priority: "asc",
          },
        },
      },
    });

    if (!assessment) {
      return NextResponse.json({ assessment: null });
    }

    // Get the template for this channel
    const template = await prisma.assessmentTemplate.findFirst({
      where: {
        channel: assessment.channel,
        isActive: true,
      },
      include: {
        questions: {
          orderBy: {
            order: "asc",
          },
        },
      },
    });

    // Return assessment with template
    return NextResponse.json({
      ...assessment,
      template,
    });
  } catch (error) {
    console.error("Error fetching assessment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
