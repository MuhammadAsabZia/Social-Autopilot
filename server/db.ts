import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import {
  BrandBrainConfig,
  BufferConfig,
  SchedulerState,
  SocialMediaPostGroup,
  TrendCandidate,
  WeeklyStrategyInsight,
} from '../src/types.js';

const DATA_DIR = path.join(process.cwd(), '.data');
const DB_FILE = path.join(DATA_DIR, 'autopilot-db.json');

export interface DatabaseSchema {
  brandBrain: BrandBrainConfig;
  bufferConfig: BufferConfig;
  schedulerState: SchedulerState;
  postGroups: SocialMediaPostGroup[];
  trendHistory: TrendCandidate[];
  strategyInsights: WeeklyStrategyInsight[];
  logs: { timestamp: string; level: 'info' | 'warn' | 'error'; message: string; details?: any }[];
}

const DEFAULT_BRAND_BRAIN: BrandBrainConfig = {
  services: [
    'AI Automation',
    'AI Agents',
    'Business Process Automation',
    'Zapier Automation',
    'API Integrations',
    'SaaS Development',
    'Web Development',
  ],
  skills: [
    'Autonomous Multi-Agent Systems (LangChain, LangGraph, CrewAI)',
    'Enterprise Workflow Automation (Zapier, Make, n8n, Custom Webhooks)',
    'Full-Stack Next.js / React / TypeScript / Node.js Engineering',
    'PostgreSQL, Supabase & Vector Database Architectures',
    'API Integration & Microservices Middleware',
    'LLM Fine-tuning, Prompt Engineering & RAG Systems',
  ],
  targetAudience:
    'B2B Founders, CTOs, Agency Owners, Operations Directors & Scale-Up Leaders looking to eliminate manual bottlenecks, replace manual headcount with intelligent AI agents, and build proprietary SaaS systems.',
  portfolio: [
    {
      title: 'Autonomous Multi-Agent Lead Intelligence System',
      outcome: 'Reduced sales response latency from 4 hours to 45 seconds; boosted pipeline conversions by 310%.',
      techStack: 'LangGraph, FastAPI, Zapier Webhooks, HubSpot API, PostgreSQL',
    },
    {
      title: 'Enterprise Invoice & Operations Reconciliation SaaS',
      outcome: 'Automated 15,000+ monthly documents with 99.4% accuracy, saving 120+ operational hours/month.',
      techStack: 'Gemini Document AI, Next.js 15, Supabase, Stripe, Express',
    },
    {
      title: 'Real-Time Customer Success AI Co-Pilot',
      outcome: 'Resolved 74% of tier-1 support tickets autonomously with human-in-the-loop fallback.',
      techStack: 'React, Node.js, Slack API, Zendesk API, Vector Search',
    },
  ],
  industry: 'Artificial Intelligence, Software Engineering, SaaS & Enterprise Workflow Automation',
  brandPositioning:
    'The Pragmatic AI & Automation Engineer for High-Growth Companies. Building production-grade AI agents and custom automation systems that generate tangible ROI—not just novelty tech demos.',
  toneOfVoice:
    'Authoritative, practitioner-first, direct, analytical, zero-fluff, actionable, and commercially sharp. We speak with the depth of a veteran software architect who actually writes code and builds real systems.',
  contentPreferences: [
    'Break down real architectural blueprints and workflow teardowns',
    'Provide step-by-step Zapier/API/Agent walkthroughs with code and flowcharts',
    'Compare AI framework trade-offs (e.g. LangGraph vs CrewAI vs simple state machines)',
    'Share concrete business impact metrics and ROI calculations',
    'Highlight high-leverage automation opportunities that companies are sleeping on',
  ],
  topicsToAvoid: [
    'Generic crypto/NFT hype and speculative pump schemes',
    'Superficial "10 AI Tools to Make $10k/month" listicle slop',
    'Doomer AI existential panic or political controversies',
    'Promoting vaporware tools with zero production stability',
  ],
  contentMixRatio: {
    serviceExpertise: 70,
    industryTrends: 20,
    experimental: 10,
  },
  postingSchedule: {
    timeOfDay: '09:30',
    daysOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    timezone: 'America/Los_Angeles',
  },
  customInstructions:
    'Always ground technical posts in real-world feasibility. Avoid exaggerated claims. For LinkedIn, use clean spacing, punchy hook, and clear professional CTA. For Instagram, format as carousel slides or visual diagram breakdowns with engaging captions. For Facebook, frame as an open business discussion question for peer leaders.',
};

const hasBufferEnvKey = Boolean(process.env.BUFFER_API_KEY || process.env.BUFFER_ACCESS_TOKEN);

const DEFAULT_BUFFER_CONFIG: BufferConfig = {
  hasEnvKey: hasBufferEnvKey,
  isConnected: hasBufferEnvKey,
  isSimulatedMode: !hasBufferEnvKey,
  channels: {
    linkedin: { channelId: 'buf_linkedin_main', channelName: 'LinkedIn Profile / Company Page', enabled: true, profileId: 'buf_linkedin_main', profileName: 'LinkedIn Profile' },
    instagram: { channelId: 'buf_instagram_biz', channelName: 'Instagram Business (@ai.automation)', enabled: true, profileId: 'buf_instagram_biz', profileName: 'Instagram Business' },
    facebook: { channelId: 'buf_facebook_page', channelName: 'Facebook Business Page', enabled: true, profileId: 'buf_facebook_page', profileName: 'Facebook Page' },
  },
  autoPublish: true,
};

const DEFAULT_SCHEDULER_STATE: SchedulerState = {
  enabled: true,
  lastRunAt: null,
  nextRunAt: new Date(Date.now() + 3600 * 1000).toISOString(),
  status: 'idle',
  currentStepMessage: 'Scheduler active and monitoring for next trigger window.',
  progressPercentage: 0,
  lastExecutionSummary: 'System ready for autonomous daily cycle.',
  cronFrequency: 'daily',
};

const INITIAL_SEED_POST_GROUPS: SocialMediaPostGroup[] = [
  {
    id: 'post_seed_001',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    scheduledFor: new Date(Date.now() - 86400000 * 2).toISOString(),
    coreTopic: 'Building Deterministic AI Agents with State Machines vs Unconstrained LLM Loops',
    coreIdea: 'Why 90% of autonomous agent demos fail in production: lack of deterministic guardrails, structured schema validation, and state machine checkpoints.',
    mixType: 'service_expertise',
    trendSource: {
      title: 'Production Agent Engineering: State-Driven Workflows',
      url: 'https://github.com/langchain-ai/langgraph',
      date: '2026-08-17',
    },
    opportunityScore: 94,
    overallStatus: 'published',
    posts: {
      linkedin: {
        platform: 'linkedin',
        hook: 'Most AI agent pilots fail in week 3. Here is the exact architectural shift that takes them from a shaky demo to a 99.8% reliable production system:',
        body: `When founders tell me their AI agents "hallucinate or loop endlessly," it's almost never an LLM model problem.\n\nIt's an architecture problem.\n\nHere is how we engineer enterprise-grade agents for our clients:\n\n1. State-Driven Graphs over Freeform Loops: Never let an LLM decide the next 10 steps unconstrained. Model the workflow as a finite state machine (LangGraph/Custom FSM).\n\n2. Strict Structured Schema Intermediaries: Every tool output and agent transition must validate against a strict Pydantic/Zod schema before reaching downstream systems.\n\n3. Human-in-the-Loop Interrupt Hooks: If confidence drops below 92% or financial thresholds are exceeded, the agent pauses state and pings a Slack/Zendesk approval queue.\n\n4. Idempotent Zapier & Webhook Handlers: Ensure every automated trigger can be safely retried without double-charging or duplicate database writes.\n\nBuilding reliable automation isn't about prompting harder. It's about software engineering fundamentals applied to probabilistic models.`,
        callToAction: 'Are you currently deploying autonomous agents in your business? Drop a comment or DM me "AGENTS" to review your workflow architecture.',
        hashtags: ['#AIAgents', '#SoftwareArchitecture', '#AIAutomation', '#EnterpriseAI', '#ZapierAutomation'],
        fullFormattedText: `Most AI agent pilots fail in week 3. Here is the exact architectural shift that takes them from a shaky demo to a 99.8% reliable production system:\n\nWhen founders tell me their AI agents "hallucinate or loop endlessly," it's almost never an LLM model problem.\n\nIt's an architecture problem.\n\nHere is how we engineer enterprise-grade agents for our clients:\n\n1. State-Driven Graphs over Freeform Loops: Never let an LLM decide the next 10 steps unconstrained. Model the workflow as a finite state machine (LangGraph/Custom FSM).\n\n2. Strict Structured Schema Intermediaries: Every tool output and agent transition must validate against a strict Pydantic/Zod schema before reaching downstream systems.\n\n3. Human-in-the-Loop Interrupt Hooks: If confidence drops below 92% or financial thresholds are exceeded, the agent pauses state and pings a Slack/Zendesk approval queue.\n\n4. Idempotent Zapier & Webhook Handlers: Ensure every automated trigger can be safely retried without double-charging or duplicate database writes.\n\nBuilding reliable automation isn't about prompting harder. It's about software engineering fundamentals applied to probabilistic models.\n\nAre you currently deploying autonomous agents in your business? Drop a comment or DM me "AGENTS" to review your workflow architecture.\n\n#AIAgents #SoftwareArchitecture #AIAutomation #EnterpriseAI #ZapierAutomation`,
        formatType: 'thought_leadership',
        visualType: 'workflow_diagram',
        visualPrompt: 'Clean minimalist dark mode architectural diagram of a state-machine AI agent with schema validation and human-in-the-loop review nodes.',
        bufferStatus: 'published',
        bufferPostId: 'buf_li_9921',
      },
      instagram: {
        platform: 'instagram',
        hook: 'Why your AI Agents keep breaking in production (and the 4-step fix) ⚡️',
        body: `Swipe through to see the exact blueprint we use to build 99.8% reliable AI automation systems for high-growth companies. 💡\n\n📌 Save this post for your next tech stack review!\n\nWhat’s your biggest bottleneck with AI workflows right now? Comment below! 👇`,
        callToAction: 'Save this post and tap the link in bio to explore our custom AI agent & Zapier automation systems!',
        hashtags: ['#aiautomation', '#aiagents', '#saasdevelopment', '#automationengineer', '#techtips', '#softwareengineering', '#zapier', '#buildinpublic'],
        fullFormattedText: `Why your AI Agents keep breaking in production (and the 4-step fix) ⚡️\n\nSwipe through to see the exact blueprint we use to build 99.8% reliable AI automation systems for high-growth companies. 💡\n\nSlide 1: The Trap: Freeform LLM Loops\nSlide 2: The Solution: State Machine Orchestration\nSlide 3: Schema Validation at Every Step\nSlide 4: Human-in-the-Loop Safety Fallbacks\n\n📌 Save this post for your next tech stack review!\n\nWhat’s your biggest bottleneck with AI workflows right now? Comment below! 👇\n\n#aiautomation #aiagents #saasdevelopment #automationengineer #techtips #softwareengineering #zapier #buildinpublic`,
        formatType: 'carousel_slides',
        carouselSlides: [
          { slideNumber: 1, title: 'Why AI Agents Break', content: 'Freeform prompt loops create unpredictable hallucination cascades.' },
          { slideNumber: 2, title: 'Finite State Graphs', content: 'Constrain transitions so the agent only moves through verified nodes.' },
          { slideNumber: 3, title: 'Zod/Pydantic Guardrails', content: 'Reject and retry any malformed tool payload before it hits APIs.' },
          { slideNumber: 4, title: 'Human Fallback Node', content: 'Route low-confidence operations to Slack/Zendesk for 1-click approval.' },
        ],
        visualType: 'branded_graphic',
        visualPrompt: 'Modern high-contrast carousel cover graphic with title "Why AI Agents Break in Production" with sleek neon cyan and violet accents.',
        bufferStatus: 'published',
        bufferPostId: 'buf_ig_9922',
      },
      facebook: {
        platform: 'facebook',
        hook: 'Question for founders and ops leaders: Are you using AI agents internally yet, or are you still relying on manual handoffs?',
        body: `We recently audited an operations team spending 25+ hours a week manually copying lead data, verifying invoices, and routing customer tickets.\n\nBy replacing those disconnected spreadsheets with a structured multi-agent Zapier + API pipeline, we reduced their turnaround time from 4 hours to under 45 seconds—with zero data entry errors.\n\nThe real leverage in 2026 isn’t just chatting with an AI. It’s connecting your tools (CRM, billing, support, databases) into autonomous, self-healing workflows that run 24/7.\n\nWhat is the single most repetitive task in your business right now that you wish ran completely on autopilot? Let’s brainstorm solutions in the comments!`,
        callToAction: 'Leave a comment with your workflow challenge, or send a message to see how we can automate it for your team.',
        hashtags: ['#BusinessAutomation', '#AIAgents', '#Productivity', '#SmallBusinessTech'],
        fullFormattedText: `Question for founders and ops leaders: Are you using AI agents internally yet, or are you still relying on manual handoffs?\n\nWe recently audited an operations team spending 25+ hours a week manually copying lead data, verifying invoices, and routing customer tickets.\n\nBy replacing those disconnected spreadsheets with a structured multi-agent Zapier + API pipeline, we reduced their turnaround time from 4 hours to under 45 seconds—with zero data entry errors.\n\nThe real leverage in 2026 isn’t just chatting with an AI. It’s connecting your tools (CRM, billing, support, databases) into autonomous, self-healing workflows that run 24/7.\n\nWhat is the single most repetitive task in your business right now that you wish ran completely on autopilot? Let’s brainstorm solutions in the comments!\n\nLeave a comment with your workflow challenge, or send a message to see how we can automate it for your team.\n\n#BusinessAutomation #AIAgents #Productivity #SmallBusinessTech`,
        formatType: 'discussion_starter',
        visualType: 'branded_graphic',
        visualPrompt: 'Clean high-contrast Facebook graphic showing a comparison between manual 4-hour workflows and autonomous 45-second AI pipelines.',
        bufferStatus: 'published',
        bufferPostId: 'buf_fb_9923',
      },
    },
    qualityControl: {
      passed: true,
      score: 96,
      criteriaChecks: {
        serviceRelevance: { passed: true, comment: 'Directly aligns with AI Automation & Agent services.' },
        originality: { passed: true, comment: 'Presents concrete architectural blueprints instead of surface-level hype.' },
        technicalAccuracy: { passed: true, comment: 'Accurately describes LangGraph state machines and schema validation.' },
        brandConsistency: { passed: true, comment: 'Tone is practitioner-led, authoritative, and data-driven.' },
        noDuplicateContent: { passed: true, comment: 'Unique content angles across all 3 platforms.' },
        noFakeStats: { passed: true, comment: 'Metrics are realistic and substantiated by portfolio examples.' },
        noExcessivePromotion: { passed: true, comment: 'Delivers 90% technical educational value with soft CTA.' },
        brandSafety: { passed: true, comment: '100% brand safe and professional.' },
      },
      suggestions: [],
      iterationCount: 1,
    },
    metrics: {
      impressions: 4820,
      likes: 312,
      comments: 48,
      shares: 29,
      clicks: 86,
      topPerformingPlatform: 'linkedin',
    },
  },
];

const INITIAL_STRATEGY_INSIGHTS: WeeklyStrategyInsight[] = [
  {
    id: 'strat_week_01',
    weekStarting: '2026-08-18',
    analysisSummary:
      'Technical architecture teardowns and concrete workflow benchmarks generate 3.4x higher engagement and qualified inbound leads than general industry news.',
    bestTopics: [
      'Deterministic AI Agent architectures & state machines',
      'Zapier + Custom API webhook automation recipes',
      'Replacing repetitive enterprise operations with custom SaaS tools',
    ],
    bestHooks: [
      'Contrarian diagnostic hooks ("Most AI agent pilots fail in week 3 because...")',
      'ROI before/after numbers ("Reduced response time from 4 hours to 45 seconds...")',
    ],
    bestFormats: [
      { platform: 'linkedin', format: 'Technical Teardown + Step-by-Step Architecture', reason: 'High save rate and executive reposts' },
      { platform: 'instagram', format: '4-Slide Visual Flowchart Carousel', reason: 'Highest swipe-through rate (84%)' },
      { platform: 'facebook', format: 'Relatable Business Problem Question', reason: 'Encourages organic comment threads from founders' },
    ],
    bestPostingTimes: ['09:30 AM PST (Tue/Thu)', '08:00 AM PST (Wed)'],
    bestContentCategories: ['AI Agents (45%)', 'API & Zapier Integrations (30%)', 'SaaS Architecture (25%)'],
    actionableRecommendations: [
      'Double down on concrete code/diagram snippets showing how custom webhooks connect to LLMs.',
      'Maintain the 70% service expertise / 20% trends / 10% experimental mix ratio.',
      'Incorporate more real client migration case studies with specific percentage improvements.',
    ],
    contentMixAdherence: {
      servicePercentage: 72,
      trendPercentage: 18,
      experimentalPercentage: 10,
    },
  },
];

class DatabaseService {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadData();
  }

  private ensureDir() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private loadData(): DatabaseSchema {
    this.ensureDir();
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        return {
          brandBrain: { ...DEFAULT_BRAND_BRAIN, ...parsed.brandBrain },
          bufferConfig: { ...DEFAULT_BUFFER_CONFIG, ...parsed.bufferConfig },
          schedulerState: { ...DEFAULT_SCHEDULER_STATE, ...parsed.schedulerState },
          postGroups: parsed.postGroups || INITIAL_SEED_POST_GROUPS,
          trendHistory: parsed.trendHistory || [],
          strategyInsights: parsed.strategyInsights || INITIAL_STRATEGY_INSIGHTS,
          logs: parsed.logs || [],
        };
      } catch (err) {
        console.error('Error parsing database file, initializing defaults:', err);
      }
    }

    const initialDb: DatabaseSchema = {
      brandBrain: DEFAULT_BRAND_BRAIN,
      bufferConfig: DEFAULT_BUFFER_CONFIG,
      schedulerState: DEFAULT_SCHEDULER_STATE,
      postGroups: INITIAL_SEED_POST_GROUPS,
      trendHistory: [],
      strategyInsights: INITIAL_STRATEGY_INSIGHTS,
      logs: [{ timestamp: new Date().toISOString(), level: 'info', message: 'Social Media Autopilot DB initialized.' }],
    };
    this.saveData(initialDb);
    return initialDb;
  }

  private saveData(data: DatabaseSchema) {
    this.ensureDir();
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  }

  public getBrandBrain(): BrandBrainConfig {
    return this.data.brandBrain;
  }

  public updateBrandBrain(updated: Partial<BrandBrainConfig>): BrandBrainConfig {
    this.data.brandBrain = { ...this.data.brandBrain, ...updated };
    this.saveData(this.data);
    this.addLog('info', 'Brand brain updated');
    return this.data.brandBrain;
  }

  public getBufferConfig(): BufferConfig {
    const hasKey = Boolean(process.env.BUFFER_API_KEY || process.env.BUFFER_ACCESS_TOKEN || this.data.bufferConfig.accessToken);
    return {
      ...this.data.bufferConfig,
      hasEnvKey: Boolean(process.env.BUFFER_API_KEY || process.env.BUFFER_ACCESS_TOKEN),
      isConnected: hasKey,
      isSimulatedMode: this.data.bufferConfig.isSimulatedMode ?? !hasKey,
    };
  }

  public updateBufferConfig(updated: Partial<BufferConfig>): BufferConfig {
    this.data.bufferConfig = { ...this.data.bufferConfig, ...updated };
    this.saveData(this.data);
    this.addLog('info', 'Buffer configuration updated');
    return this.getBufferConfig();
  }

  public getSchedulerState(): SchedulerState {
    return this.data.schedulerState;
  }

  public updateSchedulerState(updated: Partial<SchedulerState>): SchedulerState {
    this.data.schedulerState = { ...this.data.schedulerState, ...updated };
    this.saveData(this.data);
    return this.data.schedulerState;
  }

  public getPostGroups(): SocialMediaPostGroup[] {
    return this.data.postGroups;
  }

  public getPostGroupById(id: string): SocialMediaPostGroup | undefined {
    return this.data.postGroups.find((p) => p.id === id);
  }

  public savePostGroup(postGroup: SocialMediaPostGroup): SocialMediaPostGroup {
    const idx = this.data.postGroups.findIndex((p) => p.id === postGroup.id);
    if (idx >= 0) {
      this.data.postGroups[idx] = postGroup;
    } else {
      this.data.postGroups.unshift(postGroup);
    }
    this.saveData(this.data);
    this.addLog('info', `Post group saved: "${postGroup.coreTopic}"`, { id: postGroup.id });
    return postGroup;
  }

  public deletePostGroup(id: string): boolean {
    const prevLen = this.data.postGroups.length;
    this.data.postGroups = this.data.postGroups.filter((p) => p.id !== id);
    this.saveData(this.data);
    return this.data.postGroups.length < prevLen;
  }

  public getTrendHistory(): TrendCandidate[] {
    return this.data.trendHistory;
  }

  public recordTrendCandidates(trends: TrendCandidate[]) {
    this.data.trendHistory = [...trends, ...this.data.trendHistory].slice(0, 100);
    this.saveData(this.data);
  }

  public getStrategyInsights(): WeeklyStrategyInsight[] {
    return this.data.strategyInsights;
  }

  public saveStrategyInsight(insight: WeeklyStrategyInsight) {
    this.data.strategyInsights.unshift(insight);
    this.data.strategyInsights = this.data.strategyInsights.slice(0, 20);
    this.saveData(this.data);
  }

  public getLogs() {
    return this.data.logs.slice(-100);
  }

  // Transient/persistent media asset map
  private mediaCache = new Map<string, { mimeType: string; buffer: Buffer; dataUri: string }>();

  public storeMedia(id: string, dataUri: string): string {
    try {
      const match = dataUri.match(/^data:([^;]+);base64,(.+)$/);
      if (match) {
        const mimeType = match[1];
        const buffer = Buffer.from(match[2], 'base64');
        this.mediaCache.set(id, { mimeType, buffer, dataUri });
      } else {
        // Plain text SVG or raw URI
        this.mediaCache.set(id, {
          mimeType: 'image/svg+xml',
          buffer: Buffer.from(dataUri),
          dataUri,
        });
      }
    } catch (e) {
      console.warn('Failed to parse media buffer for id:', id, e);
    }
    return `/api/media/${id}`;
  }

  public getMedia(id: string): { mimeType: string; buffer: Buffer; dataUri: string } | undefined {
    return this.mediaCache.get(id);
  }

  public addLog(level: 'info' | 'warn' | 'error', message: string, details?: any) {
    this.data.logs.push({
      timestamp: new Date().toISOString(),
      level,
      message,
      details,
    });
    if (this.data.logs.length > 200) {
      this.data.logs = this.data.logs.slice(-200);
    }
    this.saveData(this.data);
  }
}

export const db = new DatabaseService();
