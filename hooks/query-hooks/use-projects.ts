"use client";
import { toast } from "@/components/toast";
import { api } from "@/utils/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type AxiosError } from "axios";

const TOO_MANY_REQUESTS = {
  message: "Too many requests",
  description: "Please wait a moment before trying again.",
};

export const useProjects = () => {
  const { data: projects, isLoading } = useQuery(
    ["projects"],
    ({ signal }) => api.projects.getProjects({ signal }),
    {
      refetchOnWindowFocus: false,
      retry: 2,
    }
  );

  return { projects, isLoading };
};

export const useCreateProject = () => {
  const queryClient = useQueryClient();

  const { mutate: createProject, isLoading: isCreating } = useMutation(
    api.projects.createProject,
    {
      onSuccess: (newProject) => {
        toast.success({
          message: `Project "${newProject.name}" created successfully!`,
          description: "You can now start managing your project.",
        });
      },
      onError: (err: AxiosError, projectData) => {
        if (err?.response?.data == "Too many requests") {
          toast.error(TOO_MANY_REQUESTS);
          return;
        }
        if (err?.response?.status === 409) {
          toast.error({
            message: "Project key already exists",
            description: "Please choose a different project key.",
          });
          return;
        }
        toast.error({
          message: `Failed to create project "${projectData.name}"`,
          description: "Please try again later.",
        });
      },
      onSettled: () => {
        // Always refetch after error or success
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        queryClient.invalidateQueries(["projects"]);
      },
    }
  );

  return { createProject, isCreating };
};
