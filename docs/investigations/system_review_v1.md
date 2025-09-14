## Phase 1: Analysis & Planning (Easy)

### Ticket #1: Schema Analysis & Documentation
Priority: High | Complexity: Easy | Time: 2-3 hours

Merge schema.prisma and schema-extension.prisma into single file - Will this change also break the api ? The second file was found to be entirely redundant.
Document current model relationships and identify redundancies
Create migration plan document
No code changes, just analysis and documentation

Export current database schema - The data was generated doesnot really matter the core this is that this will break the api routes file handlers of next js which will break the UI
Create data backup scripts - Not Needed, the data is all fake and I think we have seed file scripts for the data which dont need to be touched.
Document current data volumes per table - Not needed 
Test backup/restore procedures - Not needed we just need to migrate toward better ones at human pace, so that the reviewer understand everything

## Phase 2: Db Design Issue Refactoring

### Ticket #2: Triple Planning System Redundancy
Priority: High | Complexity: Medium | Time: Unknown

We have three competing planning approaches:
- Legacy System:
PlanVersion → tracks plan versions per goal X
PromptRun → tracks AI-generated planning sessions X

- Assessment-Generated System:
GeneratedPlan → AI-generated plans from assessments
GeneratedPlanItem → individual plan tasks X

- Execution System:
Roadmap → high-level planning (1:1 with Goal)
Sprint → time-boxed work periods
Issue → actual tasks

Problem: These systems don't talk to each other. A plan generated from assessment doesn't automatically become sprints/issues.
First figure out the the implications of removing any two of the three, we can obviously see the Assessment Generated System and Legacy System might not even be required.
We I think will want to use the execution system...!

Solution: 
We want to keep the existing Roadmap-> Sprint -> Issue hierarchy and have a model called "GeneratedPlan" create/populate that structure.
So the flow would be Assessment → GeneratedPlan → Creates Roadmap → Contains Sprints → Contains Issues

```
model GeneratedPlan {
  // ... existing fields
  roadmapId String?
  roadmap   Roadmap? @relation(fields: [roadmapId], references: [id])
}

model Roadmap {
  // ... existing fields  
  generatedPlans GeneratedPlan[] // Plans that created this roadmap
  sprints        Sprint[]
}

model Sprint {
  // ... existing Sprint model unchanged
  roadmapId String?
  roadmap   Roadmap? @relation(fields: [roadmapId], references: [id])
  issues    Issue[]
}

model Issue {
  // ... existing Issue model unchanged
  sprintId String?
  sprint   Sprint? @relation(fields: [sprintId], references: [id])
}
```

Simple model of the relationships

Implications of removing PlanVersion, promptRun - 
Was easy to remove the planVersion and PromptRun no major implications the app still works.
GeneratedPlanItem




### Ticket #3: Template System Confusion & Orphaned Research System
Priority: High | Complexity: Medium | Time: 4-5 hours

Template System Confusion

GoalTemplate → for goal creation prompts
AssessmentTemplate → for assessment questions
PlanTemplate → for plan generation

Problem: Assessment and Plan templates are tightly coupled but separate, creating sync issues.
goal->(user+goal)Assessment->Plan->execution
Design clear Plan → Roadmap → Sprint → Issue hierarchy
Remove duplicate planning models
GoalContextSnapshot + ResearchSource exist but aren't connected to assessments or plans
First figure out the the implications of removing code.

### Further Human Analysis - 
Human Action Steps:

First: Delete schema-extension.prisma file completely - Done 

Document: List all API endpoints that use PlanVersion/PromptRun (they'll break)

Identify: Which components use the old planning system vs new
Plan: Migration path from old plan system to new assessment-driven system

## Phase 3: Implementation (Hard)
### Ticket #6: Create New Schema File
Priority: High | Complexity: Medium | Time: 3-4 hours

Implement consolidated schema design
Add proper indexes and constraints
Generate new Prisma client
Test schema generation (no database changes yet)

### Ticket #7: Assessment API Migration
Priority: High | Complexity: Hard | Time: 6-8 hours

Update /api/assessments/* endpoints for new schema
Modify AssessmentService for simplified models
Update assessment-related hooks and components
Test assessment flow end-to-end

### Ticket #8: Plan Generation API Migration
Priority: High | Complexity: Hard | Time: 6-8 hours

Update plan-related APIs for unified system
Remove legacy plan endpoints
Update plan generation logic
Test plan creation and execution flow

### Ticket #9: Frontend Component Updates
Priority: High | Complexity: Hard | Time: 8-10 hours

Update AssessmentWizard for new data structures
Fix GoalDetails component for simplified models
Update all TypeScript types and interfaces
Test UI components with new data flow

### Ticket #10: Data Migration & Deployment
Priority: High | Complexity: Hard | Time: 4-6 hours

Write data migration scripts
Deploy new schema to database
Migrate existing data to new structure
Verify data integrity and API functionality

Estimated Timeline: 40-55 hours total
Additional tickets likely needed:

### Ticket #11: Seed data updates for new schema
### Ticket #12: Integration testing across all features
### Ticket #13: Performance optimization and cleanup