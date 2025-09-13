"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusIcon, PersonIcon, DotsVerticalIcon } from "@radix-ui/react-icons";
import { type ProjectType } from "../index";

type ProjectMembersProps = {
  project: ProjectType;
};

// Mock team members data
const mockMembers = [
  {
    id: "1",
    name: "John Smith",
    email: "john.smith@example.com",
    role: "Project Lead",
    avatar: null,
    isActive: true,
  },
  {
    id: "2",
    name: "Sarah Johnson",
    email: "sarah.johnson@example.com",
    role: "Developer",
    avatar: null,
    isActive: true,
  },
  {
    id: "3",
    name: "Mike Chen",
    email: "mike.chen@example.com",
    role: "Designer",
    avatar: null,
    isActive: false,
  },
];

const ProjectMembers: React.FC<ProjectMembersProps> = ({ project }) => {
  const [members] = useState(mockMembers);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase();
  };

  const handleInvite = () => {
    if (inviteEmail.trim()) {
      // Mock invite functionality
      console.log("Inviting:", inviteEmail);
      setInviteEmail("");
      setShowInviteForm(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Team Members</h2>
        <Button
          size="sm"
          onClick={() => setShowInviteForm(!showInviteForm)}
          className="gap-2"
        >
          <PlusIcon className="h-4 w-4" />
          Invite Member
        </Button>
      </div>

      {showInviteForm && (
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <h3 className="text-sm font-medium text-gray-900">Invite team member</h3>
          <div className="flex gap-2">
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="Enter email address"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <Button size="sm" onClick={handleInvite}>
              Send Invite
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowInviteForm(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {members.map((member) => (
          <div
            key={member.id}
            className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {getInitials(member.name)}
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900">{member.name}</span>
                  {!member.isActive && (
                    <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                      Inactive
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>{member.email}</span>
                  <span>•</span>
                  <span>{member.role}</span>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="sm">
              <DotsVerticalIcon className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      <div className="text-center py-4">
        <p className="text-sm text-gray-500">
          {members.length} member{members.length !== 1 ? 's' : ''} in this project
        </p>
      </div>
    </div>
  );
};

export { ProjectMembers };
