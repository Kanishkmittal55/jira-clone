import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const goalTemplates = [
  {
    name: "Generic $50 Goal",
    promptText: `You are an expert planner. Using the parameters and context below, output ONLY JSON matching the provided schema. No comments.

PARAMETERS:
- Title: {{goal.title}}
- Channel: {{goal.channel}} | Niche: {{goal.niche}}
- Timebox: {{goal.timeboxDays}} days | Budget: ${{goal.budgetUsd}}
- Revenue modes: {{goal.revenue}}
- Constraints: {{goal.constraints}}
- Deliverables: {{goal.deliverables}}
- Channel profile (typed): {{goal.profileJson}}

CONTEXT (summarized):
{{snapshot.summary}}

CITED SOURCES (top {{sources.length}}):
{{#each sources}}- {{this.title}} ({{this.url}})
{{/each}}

OUTPUT_SCHEMA (JSON):
{{template.outputSchema}}

Return strictly valid JSON.`,
    outputSchema: {
      type: "object",
      properties: {
        epics: {
          type: "array",
          items: {
            type: "object",
            properties: {
              title: { type: "string" },
              tickets: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    description: { type: "string" },
                    useful_context: { type: "string" },
                    conditions_of_acceptance: { type: "string" },
                    eta_hours: { type: "number" },
                    depends_on: { type: "array", items: { type: "string" } }
                  },
                  required: ["title", "description", "useful_context", "conditions_of_acceptance"]
                }
              }
            },
            required: ["title", "tickets"]
          }
        },
        risks: { type: "array", items: { type: "string" } }
      },
      required: ["epics"]
    },
    systemMsg: "You are a professional project planner. Focus on actionable, specific tasks with clear acceptance criteria. Prioritize tasks by dependencies and effort."
  },
  {
    name: "Trading Goal Template",
    promptText: `You are a trading strategy expert. Create a detailed plan for achieving the specified trading goal.

GOAL DETAILS:
- Title: {{goal.title}}
- Capital: ${{goal.profileJson.capital}}
- Risk Tolerance: {{goal.profileJson.riskTolerance}}
- Markets: {{goal.profileJson.markets}}
- Paper Trading Only: {{goal.profileJson.paperTradeOnly}}
- Timebox: {{goal.timeboxDays}} days
- Success Metric: {{goal.successMetric}}

CONTEXT:
{{snapshot.summary}}

Return a structured plan with specific trading strategies, risk management rules, and daily/weekly milestones.`,
    outputSchema: {
      type: "object",
      properties: {
        strategy: { type: "string" },
        riskRules: { type: "array", items: { type: "string" } },
        milestones: {
          type: "array",
          items: {
            type: "object",
            properties: {
              week: { type: "number" },
              goal: { type: "string" },
              actions: { type: "array", items: { type: "string" } }
            }
          }
        },
        dailyRoutine: { type: "array", items: { type: "string" } }
      },
      required: ["strategy", "riskRules", "milestones"]
    },
    systemMsg: "Focus on risk management and realistic expectations. Emphasize paper trading for beginners."
  },
  {
    name: "YouTube Content Goal Template",
    promptText: `You are a YouTube content strategy expert. Create a plan for achieving the specified content goal.

GOAL DETAILS:
- Title: {{goal.title}}
- Video Count: {{goal.profileJson.videoCount}}
- Length: {{goal.profileJson.length}}
- Style: {{goal.profileJson.style}}
- Publishing Cadence: {{goal.profileJson.publishingCadence}}
- Timebox: {{goal.timeboxDays}} days
- Success Metric: {{goal.successMetric}}

CONTEXT:
{{snapshot.summary}}

Create a content calendar with specific video topics, production schedule, and optimization strategies.`,
    outputSchema: {
      type: "object",
      properties: {
        contentStrategy: { type: "string" },
        videoTopics: {
          type: "array",
          items: {
            type: "object",
            properties: {
              title: { type: "string" },
              description: { type: "string" },
              publishDate: { type: "string" },
              keywords: { type: "array", items: { type: "string" } }
            }
          }
        },
        productionSchedule: { type: "array", items: { type: "string" } },
        optimizationTips: { type: "array", items: { type: "string" } }
      },
      required: ["contentStrategy", "videoTopics", "productionSchedule"]
    },
    systemMsg: "Focus on consistent publishing schedule and SEO optimization. Consider audience engagement and retention."
  }
];

async function seedGoalTemplates() {
  console.log('Seeding goal templates...');
  
  for (const template of goalTemplates) {
    await prisma.goalTemplate.upsert({
      where: { name: template.name },
      update: template,
      create: template,
    });
  }
  
  console.log('Goal templates seeded successfully!');
}

async function main() {
  try {
    await seedGoalTemplates();
  } catch (error) {
    console.error('Error seeding goal templates:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
