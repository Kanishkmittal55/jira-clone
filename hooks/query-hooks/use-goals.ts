"use client";
import { api } from "@/utils/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useProject } from "./use-project";
import { GoalChannel } from "@prisma/client";

export const useGoals = () => {
  const { project } = useProject();
  
  const { data: goals, isLoading } = useQuery(
    ["goals", project?.id],
    () => api.goals.getGoals({ projectId: project?.id }),
    {
      enabled: !!project?.id,
    }
  );

  return {
    goals: goals || [],
    isLoading,
  };
};

export const useCreateGoal = () => {
  const queryClient = useQueryClient();
  const { project } = useProject();

  return useMutation({
    mutationFn: async (goalData: {
      title: string;
      description?: string;
      channel: GoalChannel;
      niche?: string;
      timeboxDays?: number;
      budgetUsd?: number;
      successMetric?: string;
      constraints?: string[];
      revenue?: string[];
      deliverables?: string[];
      audienceJson?: Record<string, any>;
      profileJson?: Record<string, any>;
      templateId?: string;
    }) => {
      if (!project?.id) {
        throw new Error("Project ID is required");
      }

      return api.goals.createGoal({
        projectId: project.id,
        title: goalData.title,
        description: goalData.description,
        channel: goalData.channel,
        niche: goalData.niche,
        timeboxDays: goalData.timeboxDays || 30,
        budgetUsd: goalData.budgetUsd || 0,
        successMetric: goalData.successMetric || "$50 net",
        constraints: goalData.constraints || [],
        revenue: goalData.revenue || [],
        deliverables: goalData.deliverables || [],
        audienceJson: goalData.audienceJson,
        profileJson: goalData.profileJson,
        templateId: goalData.templateId,
      });
    },
    onSuccess: () => {
      // Invalidate and refetch goals
      queryClient.invalidateQueries(["goals", project?.id]);
    },
  });
};
