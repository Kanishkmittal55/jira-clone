import axios from "axios";
import { getBaseUrl, getHeaders } from "../helpers";
import {
  type PostGoalBody,
  type GetGoalsResponse,
  type PatchGoalBody,
} from "@/app/api/goals/route";

const baseUrl = getBaseUrl();

export const goalsRoutes = {
  getGoals: async (params?: { projectId?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.projectId) {
      queryParams.append("projectId", params.projectId);
    }
    
    const { data } = await axios.get<GetGoalsResponse>(
      `${baseUrl}/api/goals${queryParams.toString() ? `?${queryParams.toString()}` : ""}`,
      { headers: getHeaders() }
    );
    return data?.goals || [];
  },

  getGoal: async (goalId: string) => {
    const { data } = await axios.get(
      `${baseUrl}/api/goals/${goalId}`,
      { headers: getHeaders() }
    );
    return data?.goal;
  },

  createGoal: async (body: PostGoalBody) => {
    const { data } = await axios.post(
      `${baseUrl}/api/goals`,
      body,
      { headers: getHeaders() }
    );
    return data?.goal;
  },

  updateGoal: async (goalId: string, body: PatchGoalBody) => {
    const { data } = await axios.patch(
      `${baseUrl}/api/goals`,
      { goalId, ...body },
      { headers: getHeaders() }
    );
    return data?.goal;
  },

  deleteGoal: async (goalId: string) => {
    const { data } = await axios.delete(
      `${baseUrl}/api/goals?goalId=${goalId}`,
      { headers: getHeaders() }
    );
    return data;
  },
};
