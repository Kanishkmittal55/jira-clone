import React, { Fragment, useState } from "react";
import { type Goal } from "@prisma/client";
import { useUpdateGoal } from "@/hooks/query-hooks/use-goals";
import { useIsAuthenticated } from "@/hooks/use-is-authed";

const GoalDetailsInfoDescription: React.FC<{ goal: Goal }> = ({ goal }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [description, setDescription] = useState(goal.description || "");
  const updateGoalMutation = useUpdateGoal();
  const [isAuthenticated, openAuthModal] = useIsAuthenticated();

  function handleEdit() {
    setIsEditing(true);
  }

  function handleSave() {
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }
    updateGoalMutation.mutate({
      goalId: goal.id,
      description: description.trim() || undefined,
    });
    setIsEditing(false);
  }

  function handleCancel() {
    setDescription(goal.description || "");
    setIsEditing(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && e.ctrlKey) {
      handleSave();
    }
    if (e.key === "Escape") {
      handleCancel();
    }
  }

  return (
    <Fragment>
      <h2>Description</h2>
      <div>
        {isEditing ? (
          <div className="space-y-2">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter goal description..."
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={4}
              autoFocus
            />
            <div className="flex gap-x-2">
              <button
                onClick={handleSave}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Save
              </button>
              <button
                onClick={handleCancel}
                className="px-3 py-1 text-sm bg-gray-200 text-gray-900 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div 
            onClick={handleEdit}
            className="transition-all duration-200 hover:bg-gray-100 p-2 rounded cursor-pointer min-h-[100px]"
          >
            {goal.description ? (
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{goal.description}</p>
            ) : (
              <p className="text-sm text-gray-500 italic">Click to add description...</p>
            )}
          </div>
        )}
      </div>
    </Fragment>
  );
};

export { GoalDetailsInfoDescription };
