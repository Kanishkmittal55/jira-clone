"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { BiPlay, BiDownload, BiRefresh } from "react-icons/bi";
import clsx from "clsx";

interface GeneratedEpic {
  id: string;
  title: string;
  description: string;
  estimatedHours: number;
  tickets: GeneratedTicket[];
}

interface GeneratedTicket {
  id: string;
  title: string;
  description: string;
  type: "STORY" | "TASK" | "BUG";
  estimatedHours: number;
  priority: "HIGH" | "MEDIUM" | "LOW";
}

const PlannerResults: React.FC<{ className?: string }> = ({ className }) => {
  const [selectedGoal, setSelectedGoal] = useState<string | null>("1");
  const [generatedEpics, setGeneratedEpics] = useState<GeneratedEpic[]>([
    {
      id: "epic-1",
      title: "Trading Foundation Setup",
      description: "Establish basic trading infrastructure and knowledge",
      estimatedHours: 20,
      tickets: [
        {
          id: "ticket-1",
          title: "Setup paper trading account",
          description: "Create a paper trading account to practice without real money",
          type: "STORY",
          estimatedHours: 2,
          priority: "HIGH"
        },
        {
          id: "ticket-2", 
          title: "Learn basic technical analysis",
          description: "Study candlestick patterns and support/resistance levels",
          type: "STORY",
          estimatedHours: 8,
          priority: "HIGH"
        }
      ]
    },
    {
      id: "epic-2",
      title: "Strategy Development",
      description: "Develop and test trading strategies",
      estimatedHours: 30,
      tickets: [
        {
          id: "ticket-3",
          title: "Research trading strategies",
          description: "Study momentum, mean reversion, and breakout strategies",
          type: "STORY", 
          estimatedHours: 12,
          priority: "MEDIUM"
        }
      ]
    }
  ]);

  const handleCreateEpics = () => {
    // TODO: Create epics in the system
    console.log("Creating epics:", generatedEpics);
  };

  const getTypeColor = (type: GeneratedTicket["type"]) => {
    switch (type) {
      case "STORY": return "bg-blue-100 text-blue-600";
      case "TASK": return "bg-green-100 text-green-600";
      case "BUG": return "bg-red-100 text-red-600";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  const getPriorityColor = (priority: GeneratedTicket["priority"]) => {
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
        <h2 className="text-lg font-semibold text-gray-900">Generated Plan</h2>
        <div className="flex gap-x-2">
          <Button className="flex items-center gap-x-2">
            <BiRefresh className="text-gray-900" />
            <span className="text-sm text-gray-900">Regenerate</span>
          </Button>
          <Button 
            onClick={handleCreateEpics}
            className="flex items-center gap-x-2 bg-green-600 text-white hover:bg-green-700"
          >
            <BiPlay className="text-white" />
            <span className="text-sm text-white">Create Epics</span>
          </Button>
        </div>
      </div>

      {/* Plan Summary */}
      <div className="mb-4 p-4 bg-gray-50 rounded-lg">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600">{generatedEpics.length}</div>
            <div className="text-sm text-gray-600">Epics</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">
              {generatedEpics.reduce((sum, epic) => sum + epic.tickets.length, 0)}
            </div>
            <div className="text-sm text-gray-600">Tickets</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">
              {generatedEpics.reduce((sum, epic) => sum + epic.estimatedHours, 0)}h
            </div>
            <div className="text-sm text-gray-600">Estimated</div>
          </div>
        </div>
      </div>

      {/* Epics List */}
      <div className="flex-1 overflow-y-auto space-y-4">
        {generatedEpics.map((epic) => (
          <div key={epic.id} className="border border-gray-200 rounded-lg bg-white">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">{epic.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">{epic.description}</p>
                  <div className="flex items-center gap-x-4 text-sm text-gray-500">
                    <span>{epic.tickets.length} tickets</span>
                    <span>{epic.estimatedHours}h estimated</span>
                  </div>
                </div>
                <div className="ml-4">
                  <span className="px-2 py-1 text-xs bg-purple-100 text-purple-600 rounded-full">
                    EPIC
                  </span>
                </div>
              </div>
            </div>
            
            <div className="p-4">
              <div className="space-y-3">
                {epic.tickets.map((ticket) => (
                  <div key={ticket.id} className="p-3 border border-gray-100 rounded-md bg-gray-50">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 text-sm mb-1">{ticket.title}</h4>
                        <p className="text-xs text-gray-600">{ticket.description}</p>
                      </div>
                      <div className="flex gap-x-2 ml-3">
                        <span className={clsx("px-2 py-1 text-xs rounded-full", getTypeColor(ticket.type))}>
                          {ticket.type}
                        </span>
                        <span className={clsx("px-2 py-1 text-xs rounded-full", getPriorityColor(ticket.priority))}>
                          {ticket.priority}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Ticket #{ticket.id}</span>
                      <span className="text-xs font-medium text-gray-700">{ticket.estimatedHours}h</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="mt-4 flex gap-x-2">
        <Button className="flex-1 bg-blue-600 text-white hover:bg-blue-700">
          <BiDownload className="mr-2" />
          Export Plan
        </Button>
        <Button className="flex-1 bg-green-600 text-white hover:bg-green-700">
          <BiPlay className="mr-2" />
          Create All Issues
        </Button>
      </div>
    </div>
  );
};

export { PlannerResults };