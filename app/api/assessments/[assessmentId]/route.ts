// API Route: /api/assessments/[assessmentId]
// GET: Get assessment details
// PUT: Update assessment (start/complete)
// DELETE: Reset assessment
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/server/db";
import { AssessmentService } from "@/server/services/assessment-service";
import { z } from "zod";
import { AssessmentStatus } from "@prisma/client";

const updateAssessmentSchema = z.object({
  action: z.enum(["start", "complete"]),
});

export async function GET(
  req: NextRequest,
  { params }: { params: { assessmentId: string } }
) {
  try {
    const { userId } = auth();
    const effectiveUserId = userId || "default-user";

    const assessment = await prisma.knowledgeAssessment.findUnique({
      where: { id: params.assessmentId },
      include: {
        goal: true,
        domainScores: true,
        responses: {
          include: {
            question: true,
          },
        },
        recommendations: {
          orderBy: {
            priority: "asc",
          },
        },
      },
    });

    if (!assessment) {
      return NextResponse.json(
        { error: "Assessment not found" },
        { status: 404 }
      );
    }

    // Check if user has access (skip for development)
    // if (assessment.userId !== effectiveUserId) {
    //   return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    // }

    // Check if expired
    const isExpired = await AssessmentService.isExpired(params.assessmentId);
    
    return NextResponse.json({
      ...assessment,
      isExpired,
    });
  } catch (error) {
    console.error("Error fetching assessment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { assessmentId: string } }
) {
  try {
    const { userId } = auth();
    const effectiveUserId = userId || "default-user";

    const body = await req.json();
    const validation = updateAssessmentSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: validation.error },
        { status: 400 }
      );
    }

    const { action } = validation.data;

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

    let result;
    
    if (action === "start") {
      if (assessment.status !== AssessmentStatus.NOT_STARTED) {
        return NextResponse.json(
          { error: "Assessment already started" },
          { status: 400 }
        );
      }
      result = await AssessmentService.startAssessment(params.assessmentId);
    } else if (action === "complete") {
      if (assessment.status !== AssessmentStatus.IN_PROGRESS) {
        return NextResponse.json(
          { error: "Assessment not in progress" },
          { status: 400 }
        );
      }
      result = await AssessmentService.completeAssessment(params.assessmentId);
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error updating assessment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    await AssessmentService.resetAssessment(params.assessmentId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error resetting assessment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
