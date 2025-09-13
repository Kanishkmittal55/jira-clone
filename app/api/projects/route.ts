import { type NextRequest, NextResponse } from "next/server";
import { prisma, ratelimit } from "@/server/db";
import { type Project } from "@prisma/client";
import { z } from "zod";
import { getAuth } from "@clerk/nextjs/server";

const postProjectBodyValidator = z.object({
  name: z.string().min(1, "Project name is required"),
  key: z.string().min(1, "Project key is required"),
  description: z.string().optional(),
  defaultAssignee: z.string().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
});

export type PostProjectBody = z.infer<typeof postProjectBodyValidator>;

export type GetProjectsResponse = {
  projects: Project[];
};

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      where: {
        deletedAt: null,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return NextResponse.json<GetProjectsResponse>({ projects });
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const { success } = await ratelimit.limit("create-project");
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
    const validationResult = postProjectBodyValidator.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: validationResult.error },
        { status: 400 }
      );
    }

    const { name, key, description, defaultAssignee, imageUrl } = validationResult.data;

    // Check if project key already exists
    const existingProject = await prisma.project.findUnique({
      where: { key },
    });

    if (existingProject) {
      return NextResponse.json(
        { error: "Project key already exists" },
        { status: 409 }
      );
    }

    // Create project
    const project = await prisma.project.create({
      data: {
        name,
        key: key.toUpperCase(),
        defaultAssignee,
        imageUrl,
        // Add description if provided - note: you might need to add this field to schema
        ...(description && { description }),
      },
    });

    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}
