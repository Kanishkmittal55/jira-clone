import { Planner } from "@/components/planner";
import { type Metadata } from "next";
import { getQueryClient } from "@/utils/get-query-client";
import { dehydrate } from "@tanstack/query-core";
import { Hydrate } from "@/utils/hydrate";
import { currentUser } from "@clerk/nextjs/server";
import {
  getInitialProjectFromServer,
} from "@/server/functions";

export const metadata: Metadata = {
  title: "Project Planner",
};

const PlannerPage = async () => {
  const user = await currentUser();
  const queryClient = getQueryClient();

  await Promise.all([
    await queryClient.prefetchQuery(["project"], getInitialProjectFromServer),
  ]);

  const dehydratedState = dehydrate(queryClient);

  return (
    <Hydrate state={dehydratedState}>
      <Planner />
    </Hydrate>
  );
};

export default PlannerPage;