"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { BiPlus, BiGitBranch, BiBullseye } from "react-icons/bi";
import clsx from "clsx";

interface Goal {
  id: string;
  title: string;
  description: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  status: "DRAFT" | "ANALYZING" | "READY" | "GENERATED";
}

const PlannerGoals: React.FC<{ className?: string }> = ({ className }) => {
  const [goals, setGoals] = useState<Goal[]>([
    {
      id: "1",
      title: "Make $50 trading stocks",
      description: "Generate profit through stock market trading strategies",
      priority: "HIGH",
      status: "READY"
    }
  ]);
  
  const [newGoal, setNewGoal] = useState({ title: "", description: "" });
  const [isAddingGoal, setIsAddingGoal] = useState(false);

  const handleAddGoal = () => {
    if (newGoal.title.trim()) {
      const goal: Goal = {
        id: Date.now().toString(),
        title: newGoal.title,
        description: newGoal.description,
        priority: "MEDIUM",
        status: "DRAFT"
      };
      setGoals([...goals, goal]);
      setNewGoal({ title: "", description: "" });
      setIsAddingGoal(false);
    }
  };

  const handleGeneratePlan = (goalId: string) => {
    setGoals(goals.map(goal => 
      goal.id === goalId ? { ...goal, status: "ANALYZING" } : goal
    ));
    // TODO: Call AI generation API
  };

  const getStatusColor = (status: Goal["status"]) => {
    switch (status) {
      case "DRAFT": return "bg-gray-100 text-gray-600";
      case "ANALYZING": return "bg-blue-100 text-blue-600";
      case "READY": return "bg-green-100 text-green-600";
      case "GENERATED": return "bg-purple-100 text-purple-600";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  const getPriorityColor = (priority: Goal["priority"]) => {
    switch (priority) {
      case "HIGH": return "bg-red-100 text-red-600";
      case "MEDIUM": return "bg-yellow-100 text-yellow-600";
      case "LOW": return "bg-green-100 text-green-600";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className={clsx("flex flex-col h-full", className)}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Project Goals</h2>
        <Button 
          onClick={() => setIsAddingGoal(true)}
          className="flex items-center gap-x-2"
        >
          <BiPlus className="text-gray-900" />
          <span className="text-sm text-gray-900">Add Goal</span>
        </Button>
      </div>

      {/* Add Goal Form */}
      {isAddingGoal && (
        <div className="mb-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
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
              <Button onClick={handleAddGoal} className="bg-blue-600 text-white hover:bg-blue-700">
                Add Goal
              </Button>
              <Button onClick={() => setIsAddingGoal(false)} className="bg-gray-200 text-gray-600 hover:bg-gray-300">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Goals List */}
      <div className="flex-1 overflow-y-auto space-y-3">
        {goals.map((goal) => (
          <div key={goal.id} className="p-4 border border-gray-200 rounded-lg bg-white hover:shadow-sm transition-shadow">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 mb-1">{goal.title}</h3>
                <p className="text-sm text-gray-600 mb-3">{goal.description}</p>
              </div>
              <div className="flex gap-x-2 ml-4">
                <span className={clsx("px-2 py-1 text-xs rounded-full", getPriorityColor(goal.priority))}>
                  {goal.priority}
                </span>
                <span className={clsx("px-2 py-1 text-xs rounded-full", getStatusColor(goal.status))}>
                  {goal.status}
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-x-2 text-sm text-gray-500">
                <BiBullseye className="h-4 w-4" />
                <span>Goal #{goal.id}</span>
              </div>
              
              <div className="flex gap-x-2">
                {goal.status === "READY" && (
                  <Button 
                    onClick={() => handleGeneratePlan(goal.id)}
                    className="bg-blue-600 text-white hover:bg-blue-700 text-sm"
                  >
                    Generate Plan
                  </Button>
                )}
                {goal.status === "ANALYZING" && (
                  <Button disabled className="bg-gray-200 text-gray-400 text-sm">
                    Analyzing...
                  </Button>
                )}
                {goal.status === "GENERATED" && (
                  <Button className="bg-green-600 text-white hover:bg-green-700 text-sm">
                    View Plan
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Repository Connection */}
      <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-blue-50">
        <div className="flex items-center gap-x-3">
          <BiGitBranch className="h-5 w-5 text-blue-600" />
          <div className="flex-1">
            <h4 className="font-medium text-blue-900">Connect GitHub Repository</h4>
            <p className="text-sm text-blue-700">Link a repository to provide context for AI analysis</p>
          </div>
          <Button className="bg-blue-600 text-white hover:bg-blue-700">
            Connect Repo
          </Button>
        </div>
      </div>
    </div>
  );
};

export { PlannerGoals };