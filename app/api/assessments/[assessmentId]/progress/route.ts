// API Route: /api/assessments/[assessmentId]/progress
// GET: Get assessment progress
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/server/db";
import { AssessmentService } from "@/server/services/assessment-service";

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

    const progress = await AssessmentService.getProgress(params.assessmentId);

    return NextResponse.json(progress);
  } catch (error) {
    console.error("Error fetching progress:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
