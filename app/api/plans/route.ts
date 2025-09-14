// API Route: /api/plans
// POST: Generate a new plan based on assessment
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/server/db";
import { z } from "zod";

const generatePlanSchema = z.object({
  goalId: z.string().uuid(),
  assessmentId: z.string().uuid(),
  templateId: z.string().uuid(),
});

export async function POST(req: NextRequest) {
  try {
    const { userId } = auth();
    // For development, use a default user if not authenticated
    const effectiveUserId = userId || "default-user";
    console.log("🔐 Auth check - userId:", userId, "effectiveUserId:", effectiveUserId);

    const body = await req.json();
    console.log("📥 Plan generation request body:", body);
    
    const validation = generatePlanSchema.safeParse(body);
    
    if (!validation.success) {
      console.error("❌ Plan generation validation failed:", validation.error);
      return NextResponse.json(
        { error: "Invalid request data", details: validation.error },
        { status: 400 }
      );
    }
    
    console.log("✅ Plan generation validation passed:", validation.data);

    const { goalId, assessmentId, templateId } = validation.data;

    // For demo purposes, assume the assessment is valid since it was passed from the frontend
    console.log("✅ Using assessment data from request:", assessmentId);
    
    const mockAssessment = {
      id: assessmentId,
      goalId: goalId,
      userId: effectiveUserId,
      overallLevel: 'BEGINNER', // Default for demo
      status: 'COMPLETED',
      goal: {
        name: 'Trading Knowledge',
        timeboxDays: 30
      }
    };
    
    console.log("✅ Mock assessment validated for plan generation");

    // Generate a mock plan (since database models don't exist yet)
    console.log("🚀 Creating mock plan for demonstration");
    
    const mockPlan = {
      id: `plan-${Date.now()}`,
      assessmentId,
      templateId,
      goalId,
      name: `${mockAssessment.goal?.name || 'Learning'} Plan - ${mockAssessment.overallLevel}`,
      description: `A personalized learning plan for ${mockAssessment.overallLevel} level`,
      status: 'DRAFT',
      adjustedForUser: true,
      estimatedHours: mockAssessment.overallLevel === 'BEGINNER' ? 40 : 30,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + (mockAssessment.goal?.timeboxDays || 30) * 24 * 60 * 60 * 1000).toISOString(),
      riskFactors: {
        level: mockAssessment.overallLevel,
        timeConstraints: 'medium'
      },
      adaptations: {
        pacing: mockAssessment.overallLevel === 'BEGINNER' ? 'slower' : 'normal',
        support: 'high'
      },
      planItems: [
        {
          id: `item-1-${Date.now()}`,
          type: 'sprint',
          name: 'Foundation Sprint',
          description: 'Learn the basic concepts and fundamentals',
          phase: 1,
          order: 0,
          estimatedHours: 16,
          difficulty: mockAssessment.overallLevel,
          metadata: {
            type: 'learning_sprint',
            focus: 'fundamentals'
          }
        },
        {
          id: `item-2-${Date.now()}`,
          type: 'issue',
          name: 'Practice Exercises',
          description: 'Complete hands-on practice exercises',
          phase: 1,
          order: 1,
          estimatedHours: 8,
          difficulty: mockAssessment.overallLevel,
          metadata: {
            type: 'practice',
            focus: 'application'
          }
        },
        {
          id: `item-3-${Date.now()}`,
          type: 'issue',
          name: 'Real-World Project',
          description: 'Apply knowledge to a practical project',
          phase: 2,
          order: 0,
          estimatedHours: 16,
          difficulty: mockAssessment.overallLevel,
          metadata: {
            type: 'project',
            focus: 'application'
          }
        }
      ],
      assessment: {
        id: mockAssessment.id,
        overallLevel: mockAssessment.overallLevel,
        status: mockAssessment.status
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    console.log("✅ Mock plan created successfully:", mockPlan.id);
    return NextResponse.json(mockPlan);
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
    // For development, use a default user if not authenticated
    const effectiveUserId = userId || "default-user";

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

    // Return mock plans for now (since database models don't exist yet)
    console.log("📋 Fetching plans for user:", effectiveUserId, "goalId:", goalId);
    
    const mockPlans = [
      {
        id: `plan-example-${goalId}`,
        goalId: goalId,
        name: `Learning Plan - BEGINNER`,
        description: `A personalized learning plan for BEGINNER level`,
        status: 'DRAFT',
        estimatedHours: 40,
        createdAt: new Date().toISOString(),
        planItems: [
          {
            id: `item-1`,
            name: 'Foundation Sprint',
            description: 'Learn the basic concepts',
            phase: 1,
            estimatedHours: 16
          }
        ]
      }
    ];
    
    console.log("✅ Returning mock plans:", mockPlans.length);
    return NextResponse.json(mockPlans);
  } catch (error) {
    console.error("Error fetching plans:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
