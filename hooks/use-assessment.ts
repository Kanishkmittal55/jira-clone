// Hook for managing knowledge assessments
import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { 
  KnowledgeAssessment,
  AssessmentQuestion,
  AssessmentTemplate,
  AssessmentResponse,
  AssessmentRecommendation,
  DomainExpertise,
} from "@prisma/client";

interface AssessmentWithDetails extends KnowledgeAssessment {
  domainScores: DomainExpertise[];
  responses: AssessmentResponse[];
  recommendations: AssessmentRecommendation[];
}

interface CreateAssessmentPayload {
  goalId: string;
}

interface SubmitResponsePayload {
  assessmentId: string;
  questionId: string;
  answer: any;
  timeSpent?: number;
  confidence?: number;
}

interface AssessmentProgress {
  totalQuestions: number;
  answeredQuestions: number;
  percentComplete: number;
  estimatedTimeRemaining: number;
}

export function useAssessment(goalId?: string) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch assessment for a goal
  const {
    data: assessment,
    isLoading: isLoadingAssessment,
    error: assessmentError,
    refetch: refetchAssessment,
  } = useQuery<AssessmentWithDetails>({
    queryKey: ["assessment", goalId],
    queryFn: async () => {
      if (!goalId) throw new Error("Goal ID is required");
      
      console.log("🔍 Fetching assessment for goalId:", goalId);
      const response = await fetch(`/api/assessments?goalId=${goalId}`);
      
      console.log("🌐 Assessment API response:", {
        status: response.status,
        ok: response.ok,
        url: response.url
      });
      
      if (!response.ok) {
        const error = await response.json();
        console.error("❌ Assessment API error:", error);
        throw new Error(error.error || "Failed to fetch assessment");
      }
      
      const result = await response.json();
      console.log("✅ Assessment API success:", {
        id: result?.id,
        status: result?.status,
        hasTemplate: !!result?.template,
        hasResponses: !!(result?.responses && result.responses.length > 0)
      });
      return result;
    },
    enabled: !!goalId,
  });

  // Create or get assessment
  const createAssessmentMutation = useMutation({
    mutationFn: async (payload: CreateAssessmentPayload) => {
      const response = await fetch("/api/assessments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create assessment");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["assessment", goalId] });
      // Don't show success toast for create, as it's automatic
    },
    onError: (error: Error) => {
      console.error("Assessment error:", error);
      toast.error(error.message);
    },
  });

  // Start assessment
  const startAssessmentMutation = useMutation({
    mutationFn: async (assessmentId: string) => {
      console.log("🚀 Starting assessment mutation for ID:", assessmentId);
      const response = await fetch(`/api/assessments/${assessmentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "start" }),
      });
      
      console.log("🌐 Start assessment API response:", {
        status: response.status,
        ok: response.ok,
        url: response.url
      });
      
      if (!response.ok) {
        const error = await response.json();
        console.error("❌ Start assessment API error:", error);
        throw new Error(error.error || "Failed to start assessment");
      }
      
      const result = await response.json();
      console.log("✅ Start assessment API success:", result);
      return result;
    },
    onSuccess: () => {
      console.log("✅ Start assessment mutation success - invalidating queries");
      queryClient.invalidateQueries({ queryKey: ["assessment"] });
      toast.success("Assessment started");
    },
    onError: (error: Error) => {
      console.error("❌ Start assessment mutation error:", error);
      toast.error(error.message);
    },
  });

  // Submit response
  const submitResponseMutation = useMutation({
    mutationFn: async (payload: SubmitResponsePayload) => {
      const { assessmentId, ...responseData } = payload;
      const response = await fetch(`/api/assessments/${assessmentId}/responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(responseData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to submit response");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["assessment"] });
      queryClient.invalidateQueries({ queryKey: ["assessment-progress"] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Complete assessment
  const completeAssessmentMutation = useMutation({
    mutationFn: async (assessmentId: string) => {
      const response = await fetch(`/api/assessments/${assessmentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "complete" }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to complete assessment");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assessment"] });
      toast.success("Assessment completed successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Reset assessment
  const resetAssessmentMutation = useMutation({
    mutationFn: async (assessmentId: string) => {
      const response = await fetch(`/api/assessments/${assessmentId}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to reset assessment");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assessment"] });
      toast.success("Assessment reset successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Get assessment progress
  const {
    data: progress,
    isLoading: isLoadingProgress,
  } = useQuery<AssessmentProgress>({
    queryKey: ["assessment-progress", assessment?.id],
    queryFn: async () => {
      if (!assessment?.id) throw new Error("Assessment ID is required");
      
      const response = await fetch(`/api/assessments/${assessment.id}/progress`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch progress");
      }
      return response.json();
    },
    enabled: !!assessment?.id && assessment.status === "IN_PROGRESS",
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Helper function to submit response and handle errors
  const submitResponse = useCallback(async (
    questionId: string,
    answer: any,
    timeSpent?: number,
    confidence?: number
  ) => {
    if (!assessment?.id) {
      toast.error("No assessment found");
      return;
    }

    setIsSubmitting(true);
    try {
      await submitResponseMutation.mutateAsync({
        assessmentId: assessment.id,
        questionId,
        answer,
        timeSpent,
        confidence,
      });
      return true;
    } catch (error) {
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [assessment?.id, submitResponseMutation]);

  return {
    // Data
    assessment,
    progress,
    
    // Loading states
    isLoading: isLoadingAssessment,
    isLoadingProgress,
    isSubmitting,
    
    // Mutations
    createAssessment: createAssessmentMutation.mutate,
    startAssessment: startAssessmentMutation.mutate,
    submitResponse,
    completeAssessment: completeAssessmentMutation.mutate,
    resetAssessment: resetAssessmentMutation.mutate,
    
    // Mutation states
    isCreating: createAssessmentMutation.isPending,
    isStarting: startAssessmentMutation.isPending,
    isCompleting: completeAssessmentMutation.isPending,
    isResetting: resetAssessmentMutation.isPending,
    
    // Utilities
    refetch: refetchAssessment,
    
    // Computed values
    isAssessmentComplete: assessment?.status === "COMPLETED",
    isAssessmentInProgress: assessment?.status === "IN_PROGRESS",
    canStartAssessment: assessment?.status === "NOT_STARTED" || assessment?.status === "IN_PROGRESS",
  };
}

// Hook for getting assessment questions
export function useAssessmentQuestions(templateId?: string) {
  const {
    data: questions,
    isLoading,
    error,
  } = useQuery<AssessmentQuestion[]>({
    queryKey: ["assessment-questions", templateId],
    queryFn: async () => {
      if (!templateId) throw new Error("Template ID is required");
      
      const response = await fetch(`/api/assessment-templates/${templateId}/questions`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch questions");
      }
      return response.json();
    },
    enabled: !!templateId,
  });

  return {
    questions,
    isLoading,
    error,
  };
}

// Hook for getting available plan templates
export function useAvailablePlans(assessmentId?: string) {
  const {
    data: plans,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["available-plans", assessmentId],
    queryFn: async () => {
      if (!assessmentId) throw new Error("Assessment ID is required");
      
      const response = await fetch(`/api/assessments/${assessmentId}/plans`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch available plans");
      }
      return response.json();
    },
    enabled: !!assessmentId,
  });

  return {
    plans,
    isLoading,
    error,
  };
}
