import { type NextRequest, NextResponse } from "next/server";
import { prisma, ratelimit } from "@/server/db";
import { type Roadmap } from "@prisma/client";
import { z } from "zod";
import { getAuth } from "@clerk/nextjs/server";

const patchRoadmapBodyValidator = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  status: z.string().optional(),
});

export type PatchRoadmapBody = z.infer<typeof patchRoadmapBodyValidator>;

export type GetRoadmapResponse = {
  roadmap: Roadmap & {
    goal: {
      id: string;
      title: string;
      channel: string;
      description: string | null;
    };
    sprints: Array<{
      id: string;
      name: string;
      description: string;
      status: string;
      startDate: Date | null;
      endDate: Date | null;
      issues: Array<{
        id: string;
        key: string;
        name: string;
        type: string;
        status: string;
      }>;
    }>;
  };
};

export async function GET(
  request: NextRequest,
  { params }: { params: { roadmapId: string } }
) {
  try {
    const { userId } = getAuth(request);
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const roadmap = await prisma.roadmap.findFirst({
      where: {
        id: params.roadmapId,
        goal: {
          createdBy: userId,
        },
      },
      include: {
        goal: {
          select: {
            id: true,
            title: true,
            channel: true,
            description: true,
          },
        },
        sprints: {
          include: {
            issues: {
              select: {
                id: true,
                key: true,
                name: true,
                type: true,
                status: true,
              },
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    if (!roadmap) {
      return NextResponse.json(
        { error: "Roadmap not found" },
        { status: 404 }
      );
    }

    return NextResponse.json<GetRoadmapResponse>({ roadmap });
  } catch (error) {
    console.error("Error fetching roadmap:", error);
    return NextResponse.json(
      { error: "Failed to fetch roadmap" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { roadmapId: string } }
) {
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
    const validationResult = patchRoadmapBodyValidator.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: validationResult.error },
        { status: 400 }
      );
    }

    // Verify roadmap exists and user owns the associated goal
    const existingRoadmap = await prisma.roadmap.findFirst({
      where: {
        id: params.roadmapId,
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
      where: { id: params.roadmapId },
      data: validationResult.data,
      include: {
        goal: {
          select: {
            id: true,
            title: true,
            channel: true,
            description: true,
          },
        },
        sprints: {
          include: {
            issues: {
              select: {
                id: true,
                key: true,
                name: true,
                type: true,
                status: true,
              },
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        },
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { roadmapId: string } }
) {
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

    // Verify roadmap exists and user owns the associated goal
    const existingRoadmap = await prisma.roadmap.findFirst({
      where: {
        id: params.roadmapId,
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
      where: { id: params.roadmapId },
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