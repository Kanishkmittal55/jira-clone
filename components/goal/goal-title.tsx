"use client";
import React, { useRef, forwardRef, useImperativeHandle } from "react";
import { type Goal } from "@prisma/client";
import { useUpdateGoal } from "@/hooks/query-hooks/use-goals";
import { useIsAuthenticated } from "@/hooks/use-is-authed";
import clsx from "clsx";

const GoalTitle = forwardRef<
  HTMLInputElement,
  {
    goal: Goal;
    isEditing: boolean;
    setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
    className?: string;
  }
>(({ goal, isEditing, setIsEditing, className }, ref) => {
  const updateGoalMutation = useUpdateGoal();
  const [isAuthenticated, openAuthModal] = useIsAuthenticated();
  const inputRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(ref, () => inputRef.current!);

  const handleSave = (newTitle: string) => {
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }
    if (newTitle.trim() && newTitle !== goal.title) {
      updateGoalMutation.mutate({
        goalId: goal.id,
        title: newTitle.trim(),
      });
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSave(e.currentTarget.value);
    }
    if (e.key === "Escape") {
      setIsEditing(false);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    handleSave(e.target.value);
  };

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="text"
        defaultValue={goal.title}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        className={clsx(
          "w-full border-0 bg-transparent p-0 text-inherit focus:outline-none focus:ring-0",
          className
        )}
        autoFocus
      />
    );
  }

  return (
    <span className={clsx("cursor-pointer", className)}>
      {goal.title}
    </span>
  );
});

GoalTitle.displayName = "GoalTitle";

export { GoalTitle };
