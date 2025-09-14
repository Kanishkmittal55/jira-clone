// Seed data for Assessment Templates and Questions
import { 
  GoalChannel, 
  ExpertiseLevel, 
  QuestionType, 
  KnowledgeDomain 
} from "@prisma/client";

// ============= ASSESSMENT TEMPLATES =============

export const assessmentTemplates = [
  {
    id: "trading-assessment-v1",
    name: "Trading Knowledge Assessment",
    channel: GoalChannel.TRADING,
    description: "Comprehensive assessment to evaluate trading knowledge and experience",
    version: "1.0.0",
    isActive: true,
    minQuestions: 8,
    maxQuestions: 15,
    timeLimit: 30,
    passingScore: 60,
  },
  {
    id: "youtube-assessment-v1",
    name: "YouTube Creator Assessment",
    channel: GoalChannel.YOUTUBE,
    description: "Evaluate content creation skills and YouTube platform knowledge",
    version: "1.0.0",
    isActive: true,
    minQuestions: 7,
    maxQuestions: 12,
    timeLimit: 25,
    passingScore: 55,
  },
  {
    id: "newsletter-assessment-v1",
    name: "Newsletter Publisher Assessment",
    channel: GoalChannel.NEWSLETTER,
    description: "Assess writing skills and email marketing knowledge",
    version: "1.0.0",
    isActive: true,
    minQuestions: 6,
    maxQuestions: 10,
    timeLimit: 20,
    passingScore: 60,
  },
  {
    id: "microsaas-assessment-v1",
    name: "MicroSaaS Builder Assessment",
    channel: GoalChannel.MICROSaaS,
    description: "Evaluate technical and business skills for SaaS development",
    version: "1.0.0",
    isActive: true,
    minQuestions: 10,
    maxQuestions: 18,
    timeLimit: 35,
    passingScore: 65,
  },
];

// ============= ASSESSMENT QUESTIONS =============

export const tradingQuestions = [
  {
    id: "tq-1",
    templateId: "trading-assessment-v1",
    domain: KnowledgeDomain.MARKET_ANALYSIS,
    questionText: "How would you rate your understanding of financial markets and trading instruments?",
    questionType: QuestionType.SCALE,
    isRequired: true,
    order: 1,
    weight: 1.5,
    helpText: "Consider your knowledge of stocks, bonds, forex, commodities, and derivatives",
    options: null,
    validationRules: { min: 1, max: 10 },
  },
  {
    id: "tq-2",
    templateId: "trading-assessment-v1",
    domain: KnowledgeDomain.RISK_MANAGEMENT,
    questionText: "Which risk management techniques are you familiar with?",
    questionType: QuestionType.MULTIPLE_CHOICE,
    isRequired: true,
    order: 2,
    weight: 2.0,
    options: [
      "Stop-loss orders",
      "Position sizing",
      "Risk-reward ratios",
      "Portfolio diversification",
      "Hedging strategies",
      "Value at Risk (VaR)",
      "None of the above"
    ],
    helpText: "Select all that apply",
  },
  {
    id: "tq-3",
    templateId: "trading-assessment-v1",
    domain: KnowledgeDomain.TRADING_PSYCHOLOGY,
    questionText: "Have you experienced significant trading losses that affected your emotional state?",
    questionType: QuestionType.SINGLE_CHOICE,
    isRequired: true,
    order: 3,
    weight: 1.2,
    options: [
      "Yes, and I learned from them",
      "Yes, and I'm still recovering",
      "No, I've been consistently profitable",
      "No, I haven't started trading yet"
    ],
  },
  {
    id: "tq-4",
    templateId: "trading-assessment-v1",
    domain: KnowledgeDomain.TECHNICAL_ANALYSIS,
    questionText: "How many years of experience do you have with technical analysis?",
    questionType: QuestionType.NUMERIC,
    isRequired: true,
    order: 4,
    weight: 1.3,
    validationRules: { min: 0, max: 50 },
    helpText: "Enter 0 if you have no experience",
  },
  {
    id: "tq-5",
    templateId: "trading-assessment-v1",
    domain: KnowledgeDomain.PLATFORM_USAGE,
    questionText: "Which trading platforms have you used?",
    questionType: QuestionType.TEXT,
    isRequired: false,
    order: 5,
    weight: 0.8,
    helpText: "List the platforms separated by commas",
  },
];

export const youtubeQuestions = [
  {
    id: "yq-1",
    templateId: "youtube-assessment-v1",
    domain: KnowledgeDomain.CONTENT_CREATION,
    questionText: "How many videos have you created and published (on any platform)?",
    questionType: QuestionType.SINGLE_CHOICE,
    isRequired: true,
    order: 1,
    weight: 1.5,
    options: [
      "None",
      "1-5 videos",
      "6-20 videos",
      "21-50 videos",
      "50+ videos"
    ],
  },
  {
    id: "yq-2",
    templateId: "youtube-assessment-v1",
    domain: KnowledgeDomain.VIDEO_EDITING,
    questionText: "What is your video editing skill level?",
    questionType: QuestionType.SCALE,
    isRequired: true,
    order: 2,
    weight: 1.3,
    helpText: "1 = No experience, 10 = Professional level",
    validationRules: { min: 1, max: 10 },
  },
  {
    id: "yq-3",
    templateId: "youtube-assessment-v1",
    domain: KnowledgeDomain.AUDIENCE_BUILDING,
    questionText: "Do you have experience growing an audience on social media?",
    questionType: QuestionType.BOOLEAN,
    isRequired: true,
    order: 3,
    weight: 1.2,
  },
  {
    id: "yq-4",
    templateId: "youtube-assessment-v1",
    domain: KnowledgeDomain.SEO_OPTIMIZATION,
    questionText: "Which YouTube SEO techniques are you familiar with?",
    questionType: QuestionType.MULTIPLE_CHOICE,
    isRequired: true,
    order: 4,
    weight: 1.4,
    options: [
      "Keyword research",
      "Thumbnail optimization",
      "Title optimization",
      "Description writing",
      "Tags usage",
      "Closed captions",
      "End screens and cards",
      "None of the above"
    ],
  },
];

export const newsletterQuestions = [
  {
    id: "nq-1",
    templateId: "newsletter-assessment-v1",
    domain: KnowledgeDomain.WRITING,
    questionText: "How would you describe your writing experience?",
    questionType: QuestionType.SINGLE_CHOICE,
    isRequired: true,
    order: 1,
    weight: 2.0,
    options: [
      "No formal writing experience",
      "Personal blog or journal",
      "Academic writing",
      "Professional content writing",
      "Published author"
    ],
  },
  {
    id: "nq-2",
    templateId: "newsletter-assessment-v1",
    domain: KnowledgeDomain.EMAIL_MARKETING,
    questionText: "Have you used any email marketing platforms?",
    questionType: QuestionType.MULTIPLE_CHOICE,
    isRequired: true,
    order: 2,
    weight: 1.3,
    options: [
      "Mailchimp",
      "ConvertKit",
      "Substack",
      "Ghost",
      "MailerLite",
      "ActiveCampaign",
      "Other",
      "None"
    ],
  },
  {
    id: "nq-3",
    templateId: "newsletter-assessment-v1",
    domain: KnowledgeDomain.SUBSCRIBER_GROWTH,
    questionText: "What's the largest email list you've managed?",
    questionType: QuestionType.SINGLE_CHOICE,
    isRequired: true,
    order: 3,
    weight: 1.1,
    options: [
      "Never managed an email list",
      "1-100 subscribers",
      "101-500 subscribers",
      "501-1000 subscribers",
      "1000+ subscribers"
    ],
  },
];

export const microSaaSQuestions = [
  {
    id: "sq-1",
    templateId: "microsaas-assessment-v1",
    domain: KnowledgeDomain.PROGRAMMING,
    questionText: "Which programming languages are you proficient in?",
    questionType: QuestionType.MULTIPLE_CHOICE,
    isRequired: true,
    order: 1,
    weight: 2.0,
    options: [
      "JavaScript/TypeScript",
      "Python",
      "Java",
      "C#",
      "Ruby",
      "Go",
      "PHP",
      "None - I'm not a programmer"
    ],
  },
  {
    id: "sq-2",
    templateId: "microsaas-assessment-v1",
    domain: KnowledgeDomain.SYSTEM_DESIGN,
    questionText: "Rate your understanding of software architecture and system design",
    questionType: QuestionType.SCALE,
    isRequired: true,
    order: 2,
    weight: 1.5,
    helpText: "1 = Beginner, 10 = Expert architect",
    validationRules: { min: 1, max: 10 },
  },
  {
    id: "sq-3",
    templateId: "microsaas-assessment-v1",
    domain: KnowledgeDomain.DEPLOYMENT,
    questionText: "Have you deployed a web application to production?",
    questionType: QuestionType.BOOLEAN,
    isRequired: true,
    order: 3,
    weight: 1.3,
  },
  {
    id: "sq-4",
    templateId: "microsaas-assessment-v1",
    domain: KnowledgeDomain.MARKETING,
    questionText: "What's your experience with product marketing?",
    questionType: QuestionType.TEXT,
    isRequired: false,
    order: 4,
    weight: 1.0,
    helpText: "Briefly describe your marketing experience",
  },
];

// ============= QUESTION SCORING RULES =============

export const scoringRules = [
  // Trading scoring rules
  {
    questionId: "tq-1",
    condition: { type: "scale", value: { min: 1, max: 3 } },
    score: 30,
    feedback: "You're at the beginning of your trading journey. Focus on fundamentals.",
  },
  {
    questionId: "tq-1",
    condition: { type: "scale", value: { min: 4, max: 6 } },
    score: 60,
    feedback: "You have moderate understanding. Time to deepen your knowledge.",
  },
  {
    questionId: "tq-1",
    condition: { type: "scale", value: { min: 7, max: 10 } },
    score: 90,
    feedback: "Strong foundation in markets. Ready for advanced strategies.",
  },
  // YouTube scoring rules
  {
    questionId: "yq-1",
    condition: { type: "choice", value: "None" },
    score: 0,
    feedback: "No experience yet - we'll start from the basics.",
  },
  {
    questionId: "yq-1",
    condition: { type: "choice", value: "50+ videos" },
    score: 100,
    feedback: "Experienced creator - let's focus on optimization and growth.",
  },
  // Add more scoring rules...
];

// ============= PLAN TEMPLATES =============

export const planTemplates = [
  {
    id: "trading-beginner-plan",
    name: "Trading Beginner's Journey",
    channel: GoalChannel.TRADING,
    templateId: "trading-assessment-v1",
    description: "Complete roadmap for trading beginners to reach profitability",
    minExpertise: ExpertiseLevel.BEGINNER,
    maxExpertise: ExpertiseLevel.NOVICE,
    typicalDuration: 30,
    sprintCount: 4,
    successRate: 0.65,
    version: "1.0.0",
    isActive: true,
    structure: {
      phases: [
        {
          name: "Foundation",
          duration: 7,
          focus: "Learn market basics and terminology",
        },
        {
          name: "Practice",
          duration: 7,
          focus: "Paper trading and strategy development",
        },
        {
          name: "Implementation",
          duration: 10,
          focus: "Start with small real trades",
        },
        {
          name: "Optimization",
          duration: 6,
          focus: "Refine strategy and scale",
        },
      ],
    },
    prerequisites: {
      minCapital: 500,
      timeCommitment: "2-3 hours daily",
      tools: ["Trading platform account", "Charting software"],
    },
    deliverables: {
      primary: "Profitable trading system",
      secondary: [
        "Trading journal",
        "Risk management rules",
        "Personal trading plan",
      ],
    },
    milestones: [
      { day: 7, checkpoint: "Complete market fundamentals" },
      { day: 14, checkpoint: "First paper trades executed" },
      { day: 21, checkpoint: "Trading strategy defined" },
      { day: 30, checkpoint: "First profitable week" },
    ],
  },
  {
    id: "youtube-beginner-plan",
    name: "YouTube Channel Launch",
    channel: GoalChannel.YOUTUBE,
    templateId: "youtube-assessment-v1",
    description: "Launch and grow a YouTube channel from zero",
    minExpertise: ExpertiseLevel.BEGINNER,
    maxExpertise: ExpertiseLevel.INTERMEDIATE,
    typicalDuration: 30,
    sprintCount: 4,
    successRate: 0.70,
    version: "1.0.0",
    isActive: true,
    structure: {
      phases: [
        {
          name: "Setup & Planning",
          duration: 5,
          focus: "Channel setup and content strategy",
        },
        {
          name: "Content Creation",
          duration: 10,
          focus: "Create first 5 videos",
        },
        {
          name: "Optimization",
          duration: 8,
          focus: "SEO and thumbnail optimization",
        },
        {
          name: "Growth",
          duration: 7,
          focus: "Audience building and engagement",
        },
      ],
    },
    prerequisites: {
      equipment: ["Camera or smartphone", "Basic microphone"],
      software: ["Video editing software"],
      timeCommitment: "10-15 hours weekly",
    },
    deliverables: {
      primary: "Active YouTube channel with 10+ videos",
      secondary: [
        "Content calendar",
        "Channel branding",
        "100+ subscribers",
      ],
    },
    milestones: [
      { day: 5, checkpoint: "Channel created and branded" },
      { day: 15, checkpoint: "First 5 videos published" },
      { day: 23, checkpoint: "50+ subscribers" },
      { day: 30, checkpoint: "Monetization eligible" },
    ],
  },
];

// ============= PLAN ACTIVITIES =============

export const planActivities = [
  // Trading Plan Activities
  {
    templateId: "trading-beginner-plan",
    name: "Learn Market Basics",
    description: "Understand how financial markets work, types of assets, and trading mechanisms",
    type: "learning",
    phase: 1,
    order: 1,
    estimatedHours: 8,
    difficulty: ExpertiseLevel.BEGINNER,
    dependencies: [],
    resources: {
      courses: ["Investopedia Trading Course"],
      tools: ["TradingView free account"],
    },
    successCriteria: {
      quiz: "Pass market basics quiz with 80%",
      practical: "Identify 5 different asset classes",
    },
  },
  {
    templateId: "trading-beginner-plan",
    name: "Set Up Trading Platform",
    description: "Open brokerage account and familiarize with platform interface",
    type: "setup",
    phase: 1,
    order: 2,
    estimatedHours: 3,
    difficulty: ExpertiseLevel.BEGINNER,
    dependencies: [],
    resources: {
      platforms: ["TD Ameritrade", "Interactive Brokers", "Robinhood"],
      guides: ["Platform setup guide"],
    },
    successCriteria: {
      account: "Verified trading account",
      demo: "Execute 5 practice trades",
    },
  },
  {
    templateId: "trading-beginner-plan",
    name: "Develop Trading Strategy",
    description: "Create and document your first trading strategy with clear rules",
    type: "execution",
    phase: 2,
    order: 1,
    estimatedHours: 10,
    difficulty: ExpertiseLevel.NOVICE,
    dependencies: ["Learn Market Basics"],
    resources: {
      templates: ["Trading strategy template"],
      examples: ["Sample strategies"],
    },
    successCriteria: {
      document: "Written trading plan",
      backtest: "Strategy tested on historical data",
    },
  },
  // YouTube Plan Activities
  {
    templateId: "youtube-beginner-plan",
    name: "Channel Setup",
    description: "Create YouTube channel, design banner, and write channel description",
    type: "setup",
    phase: 1,
    order: 1,
    estimatedHours: 4,
    difficulty: ExpertiseLevel.BEGINNER,
    dependencies: [],
    resources: {
      tools: ["Canva for banner design"],
      guides: ["YouTube channel setup guide"],
    },
    successCriteria: {
      channel: "Channel created with branding",
      about: "Channel description written",
    },
  },
  {
    templateId: "youtube-beginner-plan",
    name: "Create First Video",
    description: "Plan, record, edit, and publish your first YouTube video",
    type: "execution",
    phase: 2,
    order: 1,
    estimatedHours: 8,
    difficulty: ExpertiseLevel.NOVICE,
    dependencies: ["Channel Setup"],
    resources: {
      software: ["DaVinci Resolve", "OBS Studio"],
      tutorials: ["Basic video editing course"],
    },
    successCriteria: {
      video: "First video published",
      quality: "HD quality with clear audio",
    },
  },
];
