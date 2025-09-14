import axios from "axios";
import { getBaseUrl, getHeaders } from "../helpers";
import {
  type PostProjectBody,
  type GetProjectsResponse,
} from "@/app/api/projects/route";

const baseUrl = getBaseUrl();

export const projectsRoutes = {
  getProjects: async ({ signal }: { signal?: AbortSignal }) => {
    const { data } = await axios.get<GetProjectsResponse>(
      `${baseUrl}/api/projects?key=JIRA-CLONE`,
      { signal }
    );
    return data?.projects || [];
  },
  
  createProject: async (body: PostProjectBody) => {
    const { data } = await axios.post<{ project: any }>(
      `${baseUrl}/api/projects`,
      body,
      { headers: getHeaders() }
    );
    return data?.project;
  },
};
