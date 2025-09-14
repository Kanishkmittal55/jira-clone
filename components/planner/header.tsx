"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { BiGitBranch, BiPlus } from "react-icons/bi";
import { useCreateGoal } from "@/hooks/query-hooks/use-goals";
import { GoalChannel } from "@prisma/client";
import { toast } from "react-hot-toast";
import { useUser } from "@clerk/nextjs";

const PlannerHeader: React.FC<{ projectKey: string | null }> = ({ projectKey }) => {
  const createGoalMutation = useCreateGoal();
  const { user, isSignedIn } = useUser();
  
  const [newGoal, setNewGoal] = useState({ title: "", description: "" });
  const [isAddingGoal, setIsAddingGoal] = useState(false);

  const handleAddGoal = async () => {
    if (!isSignedIn) {
      toast.error("Please sign in to create goals");
      return;
    }
    
    if (newGoal.title.trim()) {
      try {
        await createGoalMutation.mutateAsync({
          title: newGoal.title,
          description: newGoal.description,
          channel: GoalChannel.TRADING,
          timeboxDays: 30,
          budgetUsd: 0,
          successMetric: "$50 net",
          constraints: [],
          revenue: [],
          deliverables: [],
        });
        
        setNewGoal({ title: "", description: "" });
        setIsAddingGoal(false);
        toast.success("Goal created successfully!");
      } catch (error) {
        console.error("Error creating goal:", error);
        toast.error("Failed to create goal. Please try again.");
      }
    }
  };

  return (
    <div className="flex h-fit flex-col">
      <div className="text-sm text-gray-500">Projects / {projectKey}</div>
      <h1>Project Planner</h1>
      
      {/* Add Goal Form */}
      {isAddingGoal && (
        <div className="my-3 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Goal Title
              </label>
              <input
                type="text"
                value={newGoal.title}
                onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                placeholder="e.g., Build a trading bot"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={newGoal.description}
                onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                placeholder="Describe your goal in detail..."
                rows={3}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>
            <div className="flex gap-x-2">
              <Button 
                onClick={handleAddGoal} 
                disabled={createGoalMutation.isLoading}
                className="bg-blue-600 text-gray-900 hover:bg-blue-700 disabled:opacity-50"
              >
                {createGoalMutation.isLoading ? "Creating..." : "Add Goal"}
              </Button>
              <Button onClick={() => setIsAddingGoal(false)} className="bg-gray-200 text-gray-900 hover:bg-gray-300">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="my-3 flex items-center justify-between">
        <div className="flex items-center gap-x-5">
          <div className="text-sm text-gray-600">
            AI-powered project planning and ticket generation
          </div>
        </div>
        <div className="flex items-center gap-x-2">
          <Button 
            onClick={() => setIsAddingGoal(true)}
            className="flex items-center gap-x-2"
          >
            <BiPlus className="text-gray-900" />
            <span className="text-sm text-gray-900">Add Goal</span>
          </Button>
          <Button className="flex items-center gap-x-2">
            <BiGitBranch className="text-gray-900" />
            <span className="text-sm text-gray-900">Connect Repository</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export { PlannerHeader };