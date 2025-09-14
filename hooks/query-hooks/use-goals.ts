"use client";
import { api } from "@/utils/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useProject } from "./use-project";
import { type GoalChannel } from "@prisma/client";
import { toast } from "react-hot-toast";

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

export const useUpdateGoal = () => {
  const queryClient = useQueryClient();
  const { project } = useProject();

  return useMutation({
    mutationFn: async (data: { 
      goalId: string; 
      title?: string;
      description?: string;
      channel?: GoalChannel;
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
      const { goalId, ...updateData } = data;
      return api.goals.updateGoal(goalId, updateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["goals", project?.id]);
      toast.success("Goal updated successfully!");
    },
    onError: (error) => {
      console.error("Error updating goal:", error);
      toast.error("Failed to update goal. Please try again.");
    },
  });
};

export const useDeleteGoal = () => {
  const queryClient = useQueryClient();
  const { project } = useProject();

  return useMutation({
    mutationFn: async (goalId: string) => {
      return api.goals.deleteGoal(goalId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["goals", project?.id]);
      toast.success("Goal deleted successfully!");
    },
    onError: (error) => {
      console.error("Error deleting goal:", error);
      toast.error("Failed to delete goal. Please try again.");
    },
  });
};

export const useGoalDetails = (goalId: string | null) => {
  const { data: goal, isLoading } = useQuery(
    ["goal", goalId],
    () => goalId ? api.goals.getGoal(goalId) : null,
    {
      enabled: !!goalId,
    }
  );

  return {
    goal,
    isLoading,
  };
};
