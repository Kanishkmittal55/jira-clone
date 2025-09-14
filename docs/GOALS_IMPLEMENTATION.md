# Goals System Implementation

This document describes the implementation of the goals system in the Jira clone application.

## Database Schema

The goals system includes the following models:

### Core Models

1. **Goal** - Main goal entity with all parameters needed for prompt generation
2. **GoalTemplate** - Reusable templates for different goal types
3. **GoalContextSnapshot** - Contextual information for goals
4. **ResearchSource** - Sources used for context snapshots
5. **PromptRun** - Logs of AI prompt executions
6. **PlanVersion** - Generated plans from goals

### Enums

- **GoalChannel**: TRADING, YOUTUBE, NEWSLETTER, NOTION_TEMPLATE, CLI, EXTENSION, SEO, MICROSaaS
- **RevenueKind**: AFFILIATE, SPONSOR, DONATION, PREORDER, SALE, CONSULTING

## API Endpoints

### Goals API (`/api/goals`)

- **GET** - Retrieve all goals for a user (optionally filtered by projectId)
- **POST** - Create a new goal
- **PATCH** - Update an existing goal
- **DELETE** - Delete a goal

### Individual Goal API (`/api/goals/[goalId]`)

- **GET** - Retrieve a specific goal with all related data
- **PATCH** - Update a specific goal
- **DELETE** - Delete a specific goal

### Goal Templates API (`/api/goal-templates`)

- **GET** - Retrieve all goal templates
- **POST** - Create a new goal template
- **PATCH** - Update an existing goal template
- **DELETE** - Delete a goal template

## Usage Examples

### Creating a Goal

```typescript
const goal = await fetch('/api/goals', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    projectId: 'project-id',
    title: 'Earn $50 trading stocks in 30 days',
    niche: 'US equities momentum',
    channel: 'TRADING',
    description: 'Learn momentum trading strategies',
    timeboxDays: 30,
    budgetUsd: 0,
    successMetric: '$50 net profit',
    constraints: ['$0 tools', 'solo build'],
    revenue: ['donation'],
    deliverables: ['10 trading days journal'],
    profileJson: {
      capital: 500,
      riskTolerance: 'LOW',
      markets: ['US_STOCKS'],
      paperTradeOnly: true
    }
  })
});
```

### Creating a Goal Template

```typescript
const template = await fetch('/api/goal-templates', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Trading Goal Template',
    promptText: 'You are a trading expert...',
    outputSchema: {
      type: 'object',
      properties: {
        strategy: { type: 'string' },
        milestones: { type: 'array' }
      }
    },
    systemMsg: 'Focus on risk management...'
  })
});
```

## Channel-Specific Profile JSON

Each goal channel has specific profile parameters:

### TRADING
```json
{
  "capital": 500,
  "riskTolerance": "LOW",
  "markets": ["US_STOCKS"],
  "paperTradeOnly": true
}
```

### YOUTUBE
```json
{
  "videoCount": 10,
  "length": "60-120s",
  "style": "talking-head + b-roll",
  "publishingCadence": "daily"
}
```

### NEWSLETTER
```json
{
  "frequency": "weekly",
  "tool": "beehiiv/free",
  "leadMagnet": "one-pager checklist"
}
```

## Prompt Assembly

Goals are designed to be easily converted into well-structured prompts for AI models. The system includes:

1. **Goal Parameters** - All the user-defined parameters
2. **Channel Profile** - Channel-specific configuration
3. **Context Snapshot** - Recent research and context
4. **Template** - Prompt template with output schema
5. **Research Sources** - Cited sources for context

## Database Migration

To apply the schema changes:

1. Start the database: `docker-compose up -d db`
2. Run migration: `npx prisma db push`
3. Generate client: `npx prisma generate`

## Testing

Use the `test-goals-api.ts` file for testing the API endpoints. It includes:
- Example goal templates
- Example goals for different channels
- API usage examples

## Next Steps

1. **Database Setup** - Start Docker and run migrations
2. **Frontend Integration** - Create UI components for goals
3. **AI Integration** - Implement prompt generation and execution
4. **Plan Generation** - Connect goals to epic/ticket creation
5. **Analytics** - Track goal progress and success metrics
