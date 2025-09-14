import axios from "axios";
import { getBaseUrl, getHeaders } from "../helpers";

const baseUrl = getBaseUrl();

export const plansRoutes = {
  // Get plans for a goal
  getPlans: async (goalId?: string) => {
    const params = new URLSearchParams();
    if (goalId) {
      params.append("goalId", goalId);
    }
    
    const { data } = await axios.get(
      `${baseUrl}/api/plans${params.toString() ? `?${params.toString()}` : ""}`,
      { headers: getHeaders() }
    );
    return data || [];
  },

  // Get specific plan
  getPlan: async (planId: string) => {
    const { data } = await axios.get(
      `${baseUrl}/api/plans/${planId}`,
      { headers: getHeaders() }
    );
    return data;
  },

  // Generate new plan
  generatePlan: async (payload: {
    goalId: string;
    assessmentId: string;
    templateId: string;
  }) => {
    const { data } = await axios.post(
      `${baseUrl}/api/plans`,
      payload,
      { headers: getHeaders() }
    );
    return data;
  },

  // Update plan (approve/abandon/execute)
  updatePlan: async (planId: string, action: "approve" | "abandon" | "execute") => {
    const { data } = await axios.put(
      `${baseUrl}/api/plans/${planId}`,
      { action },
      { headers: getHeaders() }
    );
    return data;
  },
};
