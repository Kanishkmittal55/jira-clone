"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Cross1Icon, CheckIcon, RocketIcon } from "@radix-ui/react-icons";

type CreateProjectProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreateProject: (projectData: ProjectFormData) => void;
};

type ProjectFormData = {
  name: string;
  key: string;
  description: string;
  template: string;
  isPublic: boolean;
};

const projectTemplates = [
  {
    id: "kanban",
    name: "Kanban",
    description: "Visualize and advance work through a process",
    icon: "📋",
    isRecommended: true,
  },
  {
    id: "scrum",
    name: "Scrum",
    description: "Sprint-based development with ceremonies",
    icon: "🏃",
    isRecommended: true,
  },
  {
    id: "bug-tracking",
    name: "Bug Tracking",
    description: "Track and fix issues in your software",
    icon: "🐛",
    isRecommended: false,
  },
  {
    id: "basic",
    name: "Basic",
    description: "Simple project for basic task management",
    icon: "📝",
    isRecommended: false,
  },
];

const CreateProject: React.FC<CreateProjectProps> = ({
  isOpen,
  onClose,
  onCreateProject,
}) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<ProjectFormData>({
    name: "",
    key: "",
    description: "",
    template: "kanban",
    isPublic: true,
  });

  const generateProjectKey = (name: string) => {
    return name
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .substring(0, 10);
  };

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      key: generateProjectKey(name),
    }));
  };

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleCreate = () => {
    onCreateProject(formData);
    onClose();
    // Reset form
    setFormData({
      name: "",
      key: "",
      description: "",
      template: "kanban",
      isPublic: true,
    });
    setStep(1);
  };

  const isStepValid = () => {
    switch (step) {
      case 1:
        return formData.template !== "";
      case 2:
        return formData.name.trim() !== "" && formData.key.trim() !== "";
      case 3:
        return true;
      default:
        return false;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-2">
            <RocketIcon className="h-5 w-5 text-blue-600" />
            <h2 className="text-xl font-semibold">Create Project</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <Cross1Icon className="h-4 w-4" />
          </Button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step >= stepNumber
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {stepNumber}
                </div>
                <span className="ml-2 text-sm font-medium text-gray-700">
                  {stepNumber === 1 && "Template"}
                  {stepNumber === 2 && "Details"}
                  {stepNumber === 3 && "Settings"}
                </span>
                {stepNumber < 3 && (
                  <div className="w-16 h-0.5 bg-gray-200 mx-4" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Choose a template</h3>
                <p className="text-sm text-gray-600">
                  Templates help you get started quickly with a pre-configured workflow.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projectTemplates.map((template) => (
                  <div
                    key={template.id}
                    className={`relative p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      formData.template === template.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => setFormData(prev => ({ ...prev, template: template.id }))}
                  >
                    {template.isRecommended && (
                      <span className="absolute top-2 right-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                        Recommended
                      </span>
                    )}
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{template.icon}</span>
                      <div>
                        <h4 className="font-medium text-gray-900">{template.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Project details</h3>
                <p className="text-sm text-gray-600">
                  Choose a name and key for your project.
                </p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Project name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="Enter project name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Project key *
                  </label>
                  <input
                    type="text"
                    value={formData.key}
                    onChange={(e) => setFormData(prev => ({ ...prev, key: e.target.value.toUpperCase() }))}
                    placeholder="AUTO-GENERATED"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This key will be used as a prefix for your issues (e.g., {formData.key || "KEY"}-1)
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe your project..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Project settings</h3>
                <p className="text-sm text-gray-600">
                  Configure access and permissions for your project.
                </p>
              </div>
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Access</h4>
                  <div className="space-y-3">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="access"
                        checked={formData.isPublic}
                        onChange={() => setFormData(prev => ({ ...prev, isPublic: true }))}
                        className="mt-0.5"
                      />
                      <div>
                        <div className="font-medium text-sm">Open</div>
                        <div className="text-xs text-gray-600">
                          Anyone in your organization can view this project
                        </div>
                      </div>
                    </label>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="access"
                        checked={!formData.isPublic}
                        onChange={() => setFormData(prev => ({ ...prev, isPublic: false }))}
                        className="mt-0.5"
                      />
                      <div>
                        <div className="font-medium text-sm">Private</div>
                        <div className="text-xs text-gray-600">
                          Only invited users can view and access this project
                        </div>
                      </div>
                    </label>
                  </div>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Summary</h4>
                  <div className="text-sm space-y-1">
                    <p><span className="font-medium">Name:</span> {formData.name || "Untitled Project"}</p>
                    <p><span className="font-medium">Key:</span> {formData.key || "KEY"}</p>
                    <p><span className="font-medium">Template:</span> {projectTemplates.find(t => t.id === formData.template)?.name}</p>
                    <p><span className="font-medium">Access:</span> {formData.isPublic ? "Open" : "Private"}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <Button
            variant="ghost"
            onClick={step === 1 ? onClose : handleBack}
          >
            {step === 1 ? "Cancel" : "Back"}
          </Button>
          <Button
            onClick={step === 3 ? handleCreate : handleNext}
            disabled={!isStepValid()}
            className="gap-2"
          >
            {step === 3 ? (
              <>
                <CheckIcon className="h-4 w-4" />
                Create Project
              </>
            ) : (
              "Next"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export { CreateProject };
export type { ProjectFormData };
