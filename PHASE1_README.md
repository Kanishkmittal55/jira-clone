# Phase 1: Knowledge Assessment & Plan Generation - Implementation Guide

## Overview
Phase 1 establishes the foundation for intelligent ticket generation by implementing a comprehensive knowledge assessment system and adaptive plan generation engine.

## 🏗️ Database Schema Extensions

### New Models Added:
1. **KnowledgeAssessment** - Stores user expertise levels per goal
2. **AssessmentQuestion** - Template questions for different goal types  
3. **AssessmentResponse** - User responses to assessment questions
4. **AssessmentTemplate** - Channel-specific assessment configurations
5. **DomainExpertise** - Domain-specific expertise scores
6. **AssessmentRecommendation** - Personalized learning recommendations
7. **PlanTemplate** - Templates for different goal/channel combinations
8. **PlanActivity** - Specific activities within plan templates
9. **GeneratedPlan** - Tracked generated plans with their sprints/issues
10. **GeneratedPlanItem** - Individual sprints and issues in generated plans
11. **PlanMetric** - Tracking metrics for plan execution

### New Enums:
- `ExpertiseLevel`: BEGINNER, NOVICE, INTERMEDIATE, ADVANCED, EXPERT
- `QuestionType`: SINGLE_CHOICE, MULTIPLE_CHOICE, SCALE, TEXT, BOOLEAN, NUMERIC
- `AssessmentStatus`: NOT_STARTED, IN_PROGRESS, COMPLETED, EXPIRED
- `KnowledgeDomain`: 20+ domains across different channels
- `PlanStatus`: DRAFT, REVIEWED, APPROVED, EXECUTING, COMPLETED, ABANDONED

## 📁 File Structure

```
jira_clone-main/
├── prisma/
│   ├── schema.prisma                    # Extended with new models
│   ├── seed-assessment-data.ts          # Seed data for templates
│   └── seed-assessments.ts              # Seed script
├── server/
│   └── services/
│       ├── assessment-service.ts        # Assessment business logic
│       └── plan-generation-service.ts   # Plan generation logic
├── app/
│   └── api/
│       ├── assessments/
│       │   ├── route.ts                 # Create/get assessments
│       │   └── [assessmentId]/
│       │       ├── route.ts             # Manage assessment
│       │       ├── responses/
│       │       │   └── route.ts        # Submit responses
│       │       └── progress/
│       │           └── route.ts        # Get progress
│       └── plans/
│           ├── route.ts                 # Generate plans
│           └── [planId]/
│               └── route.ts             # Manage plans
├── utils/
│   └── assessment-types.ts              # TypeScript types & utilities
└── hooks/
    └── use-assessment.ts                # React hooks for assessments
```

## 🚀 Setup Instructions

### 1. Install Dependencies
```bash
npm install sonner
```

### 2. Run Database Migrations
```bash
# Push schema changes to database
npm run db:push

# Or create a migration
npm run db:migrate
```

### 3. Seed Assessment Data
```bash
# Seed assessment templates and questions
npm run db:seed:assessments
```

## 🔌 API Endpoints

### Assessment Endpoints

#### Create/Get Assessment
```typescript
POST /api/assessments
Body: { goalId: string }
Response: { assessment, template, questions, responses }
```

#### Start Assessment
```typescript
PUT /api/assessments/[assessmentId]
Body: { action: "start" }
```

#### Submit Response
```typescript
POST /api/assessments/[assessmentId]/responses
Body: { 
  questionId: string,
  answer: any,
  timeSpent?: number,
  confidence?: number
}
```

#### Complete Assessment
```typescript
PUT /api/assessments/[assessmentId]
Body: { action: "complete" }
```

#### Get Progress
```typescript
GET /api/assessments/[assessmentId]/progress
Response: { 
  totalQuestions: number,
  answeredQuestions: number,
  percentComplete: number,
  estimatedTimeRemaining: number
}
```

### Plan Generation Endpoints

#### Generate Plan
```typescript
POST /api/plans
Body: { 
  goalId: string,
  assessmentId: string,
  templateId: string
}
```

#### Approve Plan
```typescript
PUT /api/plans/[planId]
Body: { action: "approve" }
```

#### Execute Plan
```typescript
PUT /api/plans/[planId]
Body: { action: "execute" }
Response: { sprints: string[], issues: string[] }
```

## 💡 Usage Example

```typescript
import { useAssessment } from "@/hooks/use-assessment";

function GoalAssessment({ goalId }) {
  const {
    assessment,
    progress,
    isLoading,
    createAssessment,
    startAssessment,
    submitResponse,
    completeAssessment,
    isAssessmentComplete,
  } = useAssessment(goalId);

  // Create or get assessment
  const handleStart = async () => {
    if (!assessment) {
      await createAssessment({ goalId });
    } else if (assessment.status === "NOT_STARTED") {
      await startAssessment(assessment.id);
    }
  };

  // Submit a response
  const handleAnswer = async (questionId, answer) => {
    await submitResponse(questionId, answer, timeSpent, confidence);
  };

  // Complete assessment
  const handleComplete = async () => {
    await completeAssessment(assessment.id);
  };

  return (
    // Your UI here
  );
}
```

## 🎯 Goal Channel Templates

### Supported Channels:
1. **TRADING** - Stock market goals
   - Domains: Market Analysis, Risk Management, Technical Analysis
   - Questions: 5 core questions
   - Plan: 4-phase journey from basics to profitability

2. **YOUTUBE** - Content creation goals
   - Domains: Content Creation, Video Editing, Audience Building
   - Questions: 4 core questions
   - Plan: Setup → Create → Optimize → Grow

3. **NEWSLETTER** - Email publication goals
   - Domains: Writing, Email Marketing, Subscriber Growth
   - Questions: 3 core questions
   - Plan: Foundation → Content → Growth

4. **MICROSaaS** - Software product goals
   - Domains: Programming, System Design, Deployment, Marketing
   - Questions: 4 core questions
   - Plan: Technical → Build → Launch → Scale

## 🔧 Key Features

### Adaptive Questioning
- Questions adapt based on user's expertise level
- Conditional questions based on previous answers
- Weighted scoring for accurate assessment

### Intelligent Plan Generation
- Plans automatically adjust to user's expertise level
- Time-boxed to goal duration
- Risk factors identified and mitigated
- Success probability calculated

### Plan Adaptations
- Beginner: +50% time, additional learning resources
- Expert: -20% time, advanced challenges
- Weak domains: Extra support activities
- Compressed timeline: Core activities prioritized

## 📊 Assessment Scoring

### Score Ranges by Expertise:
- **Beginner**: 0-20
- **Novice**: 21-40
- **Intermediate**: 41-60
- **Advanced**: 61-80
- **Expert**: 81-100

### Domain Scoring:
- Each domain scored independently
- Weighted average for overall score
- Confidence factor included

## 🚦 Next Steps (Phase 2)

1. **Build Assessment UI Components**
   - Assessment wizard
   - Question cards
   - Progress indicator

2. **Plan Preview & Editing**
   - Visual plan timeline
   - Sprint breakdown view
   - Issue dependency graph

3. **Integration with Goals UI**
   - Update goals.tsx component
   - Add assessment buttons
   - Show assessment status

## 🐛 Testing

### Test Assessment Creation:
```bash
curl -X POST http://localhost:3000/api/assessments \
  -H "Content-Type: application/json" \
  -d '{"goalId": "your-goal-id"}'
```

### Test Response Submission:
```bash
curl -X POST http://localhost:3000/api/assessments/[id]/responses \
  -H "Content-Type: application/json" \
  -d '{"questionId": "q-1", "answer": 5, "confidence": 0.8}'
```

## 📝 Notes

1. **Authentication**: All endpoints require Clerk authentication
2. **Validation**: Zod schemas validate all inputs
3. **Error Handling**: Comprehensive error messages
4. **Type Safety**: Full TypeScript coverage
5. **Extensibility**: Easy to add new channels and domains

## 🔒 Security Considerations

- User can only access their own assessments
- Assessment expiration after 90 days
- Input validation on all endpoints
- SQL injection protection via Prisma

## 📈 Performance Optimizations

- Indexed database queries
- Cached assessment templates
- Batch response submissions
- Progressive question loading

## 🎉 Phase 1 Complete!

The foundation is now in place for intelligent ticket generation. The system can:
- Assess user knowledge across multiple domains
- Generate personalized plans based on expertise
- Adapt plans to time constraints and skill gaps
- Convert plans to actual sprints and issues

Run `npm run dev` and test the assessment flow!
