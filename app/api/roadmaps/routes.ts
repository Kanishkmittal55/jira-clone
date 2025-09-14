import { type NextRequest, NextResponse } from "next/server";
import { prisma, ratelimit } from "@/server/db";
import { type Roadmap } from "@prisma/client";
import { z } from "zod";
import { getAuth } from "@clerk/nextjs/server";

const postRoadmapBodyValidator = z.object({
  goalId: z.string().min(1, "Goal ID is required"),
  name: z.string().min(1, "Roadmap name is required"),
  description: z.string().optional(),
  status: z.string().default("DRAFT"),
});

export type PostRoadmapBody = z.infer<typeof postRoadmapBodyValidator>;

const patchRoadmapBodyValidator = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  status: z.string().optional(),
});

export type PatchRoadmapBody = z.infer<typeof patchRoadmapBodyValidator>;

export type GetRoadmapsResponse = {
  roadmaps: (Roadmap & {
    goal: {
      id: string;
      title: string;
      channel: string;
    };
    sprints: Array<{
      id: string;
      name: string;
      status: string;
    }>;
  })[];
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
    const goalId = searchParams.get("goalId");

    const roadmaps = await prisma.roadmap.findMany({
      where: {
        ...(goalId && { goalId }),
        goal: {
          createdBy: userId, // Only show roadmaps for goals created by the user
        },
      },
      include: {
        goal: {
          select: {
            id: true,
            title: true,
            channel: true,
          },
        },
        sprints: {
          select: {
            id: true,
            name: true,
            status: true,
          },
          orderBy: {
            createdAt: "asc",
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return NextResponse.json<GetRoadmapsResponse>({ roadmaps });
  } catch (error) {
    console.error("Error fetching roadmaps:", error);
    return NextResponse.json(
      { error: "Failed to fetch roadmaps" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const { success } = await ratelimit.limit("create-roadmap");
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
    const validationResult = postRoadmapBodyValidator.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: validationResult.error },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Verify goal exists and user owns it
    const goal = await prisma.goal.findFirst({
      where: {
        id: data.goalId,
        createdBy: userId,
      },
    });

    if (!goal) {
      return NextResponse.json(
        { error: "Goal not found or access denied" },
        { status: 404 }
      );
    }

    // Check if roadmap already exists for this goal
    const existingRoadmap = await prisma.roadmap.findUnique({
      where: { goalId: data.goalId },
    });

    if (existingRoadmap) {
      return NextResponse.json(
        { error: "Roadmap already exists for this goal" },
        { status: 409 }
      );
    }

    // Create roadmap
    const roadmap = await prisma.roadmap.create({
      data: {
        goalId: data.goalId,
        name: data.name,
        description: data.description,
        status: data.status,
      },
      include: {
        goal: {
          select: {
            id: true,
            title: true,
            channel: true,
          },
        },
        sprints: true,
      },
    });

    return NextResponse.json({ roadmap }, { status: 201 });
  } catch (error) {
    console.error("Error creating roadmap:", error);
    return NextResponse.json(
      { error: "Failed to create roadmap" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Rate limiting
    const { success } = await ratelimit.limit("update-roadmap");
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
    const { roadmapId, ...updateData } = body;

    if (!roadmapId) {
      return NextResponse.json(
        { error: "Roadmap ID is required" },
        { status: 400 }
      );
    }

    const validationResult = patchRoadmapBodyValidator.safeParse(updateData);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: validationResult.error },
        { status: 400 }
      );
    }

    // Verify roadmap exists and user owns the associated goal
    const existingRoadmap = await prisma.roadmap.findFirst({
      where: {
        id: roadmapId,
        goal: {
          createdBy: userId,
        },
      },
    });

    if (!existingRoadmap) {
      return NextResponse.json(
        { error: "Roadmap not found or access denied" },
        { status: 404 }
      );
    }

    // Update roadmap
    const roadmap = await prisma.roadmap.update({
      where: { id: roadmapId },
      data: validationResult.data,
      include: {
        goal: {
          select: {
            id: true,
            title: true,
            channel: true,
          },
        },
        sprints: true,
      },
    });

    return NextResponse.json({ roadmap });
  } catch (error) {
    console.error("Error updating roadmap:", error);
    return NextResponse.json(
      { error: "Failed to update roadmap" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Rate limiting
    const { success } = await ratelimit.limit("delete-roadmap");
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
    const roadmapId = searchParams.get("roadmapId");

    if (!roadmapId) {
      return NextResponse.json(
        { error: "Roadmap ID is required" },
        { status: 400 }
      );
    }

    // Verify roadmap exists and user owns the associated goal
    const existingRoadmap = await prisma.roadmap.findFirst({
      where: {
        id: roadmapId,
        goal: {
          createdBy: userId,
        },
      },
    });

    if (!existingRoadmap) {
      return NextResponse.json(
        { error: "Roadmap not found or access denied" },
        { status: 404 }
      );
    }

    // Delete roadmap (this will cascade delete related sprints and issues)
    await prisma.roadmap.delete({
      where: { id: roadmapId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting roadmap:", error);
    return NextResponse.json(
      { error: "Failed to delete roadmap" },
      { status: 500 }
    );
  }
}