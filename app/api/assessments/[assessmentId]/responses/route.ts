// API Route: /api/assessments/[assessmentId]/responses
// POST: Submit a response to an assessment question
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/server/db";
import { AssessmentService } from "@/server/services/assessment-service";
import { z } from "zod";
import { AssessmentStatus } from "@prisma/client";

const submitResponseSchema = z.object({
  questionId: z.string().uuid(),
  answer: z.any(),
  timeSpent: z.number().optional(),
  confidence: z.number().min(0).max(1).optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { assessmentId: string } }
) {
  try {
    const { userId } = auth();
    const effectiveUserId = userId || "default-user";

    const body = await req.json();
    const validation = submitResponseSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: validation.error },
        { status: 400 }
      );
    }

    const { questionId, answer, timeSpent, confidence } = validation.data;

    // Verify ownership and status
    const assessment = await prisma.knowledgeAssessment.findUnique({
      where: { id: params.assessmentId },
    });

    if (!assessment) {
      return NextResponse.json(
        { error: "Assessment not found" },
        { status: 404 }
      );
    }

    if (assessment.userId !== effectiveUserId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (assessment.status !== AssessmentStatus.IN_PROGRESS) {
      return NextResponse.json(
        { error: "Assessment not in progress" },
        { status: 400 }
      );
    }

    // Check if expired
    const isExpired = await AssessmentService.isExpired(params.assessmentId);
    if (isExpired) {
      return NextResponse.json(
        { error: "Assessment has expired" },
        { status: 400 }
      );
    }

    // Submit response
    await AssessmentService.submitResponse(
      params.assessmentId,
      questionId,
      answer,
      timeSpent,
      confidence
    );

    // Get progress
    const progress = await AssessmentService.getProgress(params.assessmentId);

    return NextResponse.json({
      success: true,
      progress,
    });
  } catch (error) {
    console.error("Error submitting response:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { assessmentId: string } }
) {
  try {
    const { userId } = auth();
    const effectiveUserId = userId || "default-user";

    // Verify ownership
    const assessment = await prisma.knowledgeAssessment.findUnique({
      where: { id: params.assessmentId },
    });

    if (!assessment) {
      return NextResponse.json(
        { error: "Assessment not found" },
        { status: 404 }
      );
    }

    if (assessment.userId !== effectiveUserId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get all responses
    const responses = await prisma.assessmentResponse.findMany({
      where: { assessmentId: params.assessmentId },
      include: {
        question: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return NextResponse.json(responses);
  } catch (error) {
    console.error("Error fetching responses:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
