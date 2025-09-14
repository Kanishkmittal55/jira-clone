"use client";
import { api } from "@/utils/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

export const usePlans = (goalId?: string) => {
  const { data: plans, isLoading } = useQuery(
    ["plans", goalId],
    () => api.plans.getPlans(goalId),
    {
      enabled: !!goalId,
    }
  );

  return {
    plans: plans || [],
    isLoading,
  };
};

export const usePlan = (planId?: string) => {
  const { data: plan, isLoading } = useQuery(
    ["plan", planId],
    () => planId ? api.plans.getPlan(planId) : null,
    {
      enabled: !!planId,
    }
  );

  return {
    plan,
    isLoading,
  };
};

export const useGeneratePlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      goalId: string;
      assessmentId: string;
      templateId: string;
    }) => {
      console.log("🚀 Generating plan with payload:", payload);
      return api.plans.generatePlan(payload);
    },
    onSuccess: (data, variables) => {
      console.log("✅ Plan generated successfully:", data);
      // Invalidate and refetch plans for this goal
      queryClient.invalidateQueries(["plans", variables.goalId]);
      toast.success("Learning plan generated successfully!");
    },
    onError: (error: any) => {
      console.error("❌ Error generating plan:", error);
      const message = error?.response?.data?.error || error?.message || "Failed to generate plan";
      toast.error(message);
    },
  });
};

export const useUpdatePlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      planId: string;
      action: "approve" | "abandon" | "execute";
    }) => {
      console.log("🔄 Updating plan:", payload);
      return api.plans.updatePlan(payload.planId, payload.action);
    },
    onSuccess: (data, variables) => {
      console.log("✅ Plan updated successfully:", data);
      // Invalidate related queries
      queryClient.invalidateQueries(["plan", variables.planId]);
      queryClient.invalidateQueries(["plans"]);
      
      const actionMessages = {
        approve: "Plan approved successfully!",
        abandon: "Plan abandoned successfully!",
        execute: "Plan execution started!",
      };
      toast.success(actionMessages[variables.action]);
    },
    onError: (error: any) => {
      console.error("❌ Error updating plan:", error);
      const message = error?.response?.data?.error || error?.message || "Failed to update plan";
      toast.error(message);
    },
  });
};
