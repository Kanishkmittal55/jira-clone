"use client";
import React from "react";
import { type Goal, GoalChannel } from "@prisma/client";
import { useUpdateGoal } from "@/hooks/query-hooks/use-goals";
import { useIsAuthenticated } from "@/hooks/use-is-authed";

const GoalChannelSelect: React.FC<{ goal: Goal }> = ({ goal }) => {
  const updateGoalMutation = useUpdateGoal();
  const [isAuthenticated, openAuthModal] = useIsAuthenticated();

  const handleChannelChange = (channel: GoalChannel) => {
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }
    updateGoalMutation.mutate({
      goalId: goal.id,
      channel,
    });
  };

  return (
    <select
      value={goal.channel}
      onChange={(e) => handleChannelChange(e.target.value as GoalChannel)}
      className="w-full text-sm border-0 bg-transparent focus:outline-none focus:ring-0"
    >
      {Object.values(GoalChannel).map((channel) => (
        <option key={channel} value={channel}>
          {channel}
        </option>
      ))}
    </select>
  );
};

export { GoalChannelSelect };
