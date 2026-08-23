import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import {
  AccessRequest,
  BrandBrainConfig,
  BufferConfig,
  EmailLog,
  GmailIntegrationState,
  SchedulerState,
  SocialMediaPostGroup,
  TrendCandidate,
  UserAccount,
  WeeklyStrategyInsight,
  WorkspaceProfile,
} from '../src/types.js';

const DATA_DIR = path.join(process.cwd(), '.data');
const DB_FILE = path.join(DATA_DIR, 'autopilot-db.json');

export interface DatabaseSchema {
  workspaces?: WorkspaceProfile[];
  activeWorkspaceId?: string;
  brandBrain: BrandBrainConfig;
  bufferConfig: BufferConfig;
  schedulerState: SchedulerState;
  postGroups: SocialMediaPostGroup[];
  trendHistory: TrendCandidate[];
  strategyInsights: WeeklyStrategyInsight[];
  users: UserAccount[];
  accessRequests: AccessRequest[];
  gmailState: GmailIntegrationState;
  emailLogs: EmailLog[];
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

const INITIAL_USERS: UserAccount[] = [
  {
    id: 'usr_admin_asab',
    username: 'asab',
    name: 'Asab Siddiqui',
    email: 'Asabsiddx2000@gmail.com',
    password: 'password123',
    role: 'author',
    status: 'approved',
    workspaceId: 'ws_agency_default',
    avatarInitials: 'AS',
    avatarColor: 'from-blue-600 to-indigo-600',
    joinedDate: '2026-01-15',
    bio: 'Platform Author, AI Systems Architect & Founder. Full administrative authority.',
    plan: 'enterprise',
  },
  {
    id: 'usr_alex_reviewer',
    username: 'alex',
    name: 'Alex Rivera',
    email: 'alex@growthagency.ai',
    password: 'password123',
    role: 'reviewer',
    status: 'approved',
    workspaceId: 'ws_agency_default',
    avatarInitials: 'AR',
    avatarColor: 'from-emerald-600 to-teal-600',
    joinedDate: '2026-02-10',
    bio: 'Senior Growth Strategist. Content review and queue approval access.',
    plan: 'pro',
  },
  {
    id: 'usr_mara_viewer',
    username: 'mara',
    name: 'Mara Chen',
    email: 'mara.rivera@autopilot.studio',
    password: 'password123',
    role: 'client',
    status: 'approved',
    workspaceId: 'ws_agency_default',
    avatarInitials: 'MC',
    avatarColor: 'from-purple-600 to-pink-600',
    joinedDate: '2026-03-01',
    bio: 'Client Partner & Content Marketing Lead.',
    plan: 'pro',
  },
];

const INITIAL_ACCESS_REQUESTS: AccessRequest[] = [
  {
    id: 'req_demo_001',
    name: 'Marcus Vance',
    username: 'marcus_v',
    email: 'marcus.vance@techscale.co',
    password: 'password123',
    requestedRole: 'reviewer',
    requestedWorkspaceId: 'ws_agency_default',
    status: 'pending',
    createdAt: new Date(Date.now() - 3600 * 1000 * 4).toISOString(),
    notificationSentToAdmin: true,
    confirmationSentToUser: false,
    approvalToken: 'tok_demo_approve_001',
    notes: 'Content Strategist at TechScale requesting reviewer queue access.',
  },
];

const INITIAL_GMAIL_STATE: GmailIntegrationState = {
  isConnected: true,
  adminEmail: 'Asabsiddx2000@gmail.com',
  lastSyncTime: new Date().toISOString(),
  autoApproveDomains: ['@autopilot.studio'],
  autoApproveAll: false,
  sentEmailCount: 3,
};

const INITIAL_EMAIL_LOGS: EmailLog[] = [
  {
    id: 'email_log_001',
    to: 'Asabsiddx2000@gmail.com',
    from: 'Asabsiddx2000@gmail.com',
    subject: '[Access Request] New User Registration: Marcus Vance (marcus.vance@techscale.co)',
    type: 'admin_approval_request',
    sentAt: new Date(Date.now() - 3600 * 1000 * 4).toISOString(),
    status: 'sent',
    messagePreview: 'A new user has submitted a registration request on the Autopilot Command Center.',
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
    const defaultWorkspaces: WorkspaceProfile[] = [
      {
        id: 'ws_agency_default',
        name: 'Executive AI Agency',
        brandBrain: DEFAULT_BRAND_BRAIN,
        bufferConfig: DEFAULT_BUFFER_CONFIG,
        isDefault: true,
      },
      {
        id: 'ws_personal_asab',
        name: 'Founder Personal Brand',
        brandBrain: {
          ...DEFAULT_BRAND_BRAIN,
          brandPositioning: 'Pragmatic Founder & Micro-SaaS Builder automating real-world businesses.',
          toneOfVoice: 'Vulnerable, transparent, metric-driven founder lessons and technical teardowns.',
        },
        bufferConfig: {
          ...DEFAULT_BUFFER_CONFIG,
          channels: {
            linkedin: { channelId: 'buf_linkedin_personal', channelName: 'Personal LinkedIn Profile', enabled: true },
            instagram: { channelId: 'buf_instagram_personal', channelName: 'Personal Creator IG', enabled: true },
            facebook: { channelId: 'buf_fb_personal', channelName: 'Personal / Community Group', enabled: true },
          },
        },
      },
    ];

    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        return {
          workspaces: parsed.workspaces || defaultWorkspaces,
          activeWorkspaceId: parsed.activeWorkspaceId || 'ws_agency_default',
          brandBrain: { ...DEFAULT_BRAND_BRAIN, ...parsed.brandBrain },
          bufferConfig: { ...DEFAULT_BUFFER_CONFIG, ...parsed.bufferConfig },
          schedulerState: { ...DEFAULT_SCHEDULER_STATE, ...parsed.schedulerState },
          postGroups: parsed.postGroups || INITIAL_SEED_POST_GROUPS,
          trendHistory: parsed.trendHistory || [],
          strategyInsights: parsed.strategyInsights || INITIAL_STRATEGY_INSIGHTS,
          users: parsed.users && parsed.users.length > 0 ? parsed.users : INITIAL_USERS,
          accessRequests: parsed.accessRequests || INITIAL_ACCESS_REQUESTS,
          gmailState: parsed.gmailState || INITIAL_GMAIL_STATE,
          emailLogs: parsed.emailLogs || INITIAL_EMAIL_LOGS,
          logs: parsed.logs || [],
        };
      } catch (err) {
        console.error('Error parsing database file, initializing defaults:', err);
      }
    }

    const initialDb: DatabaseSchema = {
      workspaces: defaultWorkspaces,
      activeWorkspaceId: 'ws_agency_default',
      brandBrain: DEFAULT_BRAND_BRAIN,
      bufferConfig: DEFAULT_BUFFER_CONFIG,
      schedulerState: DEFAULT_SCHEDULER_STATE,
      postGroups: INITIAL_SEED_POST_GROUPS,
      trendHistory: [],
      strategyInsights: INITIAL_STRATEGY_INSIGHTS,
      users: INITIAL_USERS,
      accessRequests: INITIAL_ACCESS_REQUESTS,
      gmailState: INITIAL_GMAIL_STATE,
      emailLogs: INITIAL_EMAIL_LOGS,
      logs: [{ timestamp: new Date().toISOString(), level: 'info', message: 'Social Media Autopilot DB initialized.' }],
    };
    this.saveData(initialDb);
    return initialDb;
  }

  private saveData(data: DatabaseSchema) {
    this.ensureDir();
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  }

  public getWorkspaces(): WorkspaceProfile[] {
    return this.data.workspaces || [];
  }

  public getActiveWorkspaceId(): string {
    return this.data.activeWorkspaceId || 'ws_agency_default';
  }

  public switchWorkspace(workspaceId: string): WorkspaceProfile | undefined {
    const ws = (this.data.workspaces || []).find(w => w.id === workspaceId);
    if (ws) {
      this.data.activeWorkspaceId = workspaceId;
      this.data.brandBrain = { ...ws.brandBrain };
      this.data.bufferConfig = { ...ws.bufferConfig };
      this.saveData(this.data);
      this.addLog('info', `Switched active workspace to: "${ws.name}"`);
      return ws;
    }
    return undefined;
  }

  public createWorkspace(name: string, brandBrain?: BrandBrainConfig, bufferConfig?: BufferConfig): WorkspaceProfile {
    const newWs: WorkspaceProfile = {
      id: `ws_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name: name.trim() || 'New Brand Workspace',
      brandBrain: brandBrain || { ...this.data.brandBrain },
      bufferConfig: bufferConfig || { ...this.data.bufferConfig },
    };
    if (!this.data.workspaces) this.data.workspaces = [];
    this.data.workspaces.push(newWs);
    this.data.activeWorkspaceId = newWs.id;
    this.data.brandBrain = { ...newWs.brandBrain };
    this.data.bufferConfig = { ...newWs.bufferConfig };
    this.saveData(this.data);
    this.addLog('info', `Created new workspace profile: "${newWs.name}"`);
    return newWs;
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

  // --- User Accounts & Access Control ---
  public getUsers(): UserAccount[] {
    return this.data.users || [];
  }

  public getUserByEmail(email: string): UserAccount | undefined {
    const clean = email.trim().toLowerCase();
    return (this.data.users || []).find((u) => u.email.toLowerCase() === clean);
  }

  public getUserByUsername(username: string): UserAccount | undefined {
    const clean = username.trim().toLowerCase();
    return (this.data.users || []).find((u) => u.username.toLowerCase() === clean);
  }

  public createUser(user: Partial<UserAccount> & { email: string; name: string }): UserAccount {
    const newUser: UserAccount = {
      id: user.id || `usr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      username: user.username || user.email.split('@')[0],
      name: user.name,
      email: user.email.trim().toLowerCase(),
      password: user.password || 'password123',
      role: user.role || 'reviewer',
      status: user.status || 'approved',
      workspaceId: user.workspaceId || this.getActiveWorkspaceId(),
      avatarInitials: user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) || 'US',
      avatarColor: user.avatarColor || 'from-indigo-600 to-purple-600',
      joinedDate: new Date().toISOString().split('T')[0],
      bio: user.bio || 'Active team member on the Autopilot Command Center.',
      plan: user.plan || 'pro',
    };

    if (!this.data.users) this.data.users = [];
    // Remove if exists with same email
    this.data.users = this.data.users.filter((u) => u.email.toLowerCase() !== newUser.email.toLowerCase());
    this.data.users.push(newUser);
    this.saveData(this.data);
    this.addLog('info', `Created / Updated user account: "${newUser.name}" (${newUser.email})`);
    return newUser;
  }

  public updateUser(id: string, updates: Partial<UserAccount>): UserAccount | undefined {
    const idx = (this.data.users || []).findIndex((u) => u.id === id);
    if (idx >= 0) {
      this.data.users[idx] = { ...this.data.users[idx], ...updates };
      this.saveData(this.data);
      return this.data.users[idx];
    }
    return undefined;
  }

  public deleteUser(id: string): boolean {
    const prev = (this.data.users || []).length;
    this.data.users = (this.data.users || []).filter((u) => u.id !== id);
    this.saveData(this.data);
    return this.data.users.length < prev;
  }

  // --- Access Requests & Admin Approvals ---
  public getAccessRequests(): AccessRequest[] {
    return this.data.accessRequests || [];
  }

  public getAccessRequestById(id: string): AccessRequest | undefined {
    return (this.data.accessRequests || []).find((r) => r.id === id);
  }

  public createAccessRequest(params: {
    name: string;
    username: string;
    email: string;
    password?: string;
    requestedRole?: 'reviewer' | 'client' | 'author' | 'viewer';
    requestedWorkspaceId?: string;
    notes?: string;
  }): { request: AccessRequest; autoApproved: boolean; user?: UserAccount } {
    const email = params.email.trim().toLowerCase();
    const token = `tok_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

    // Check if auto-approve applies
    const gmailState = this.getGmailState();
    const isDomainAutoApproved = gmailState.autoApproveDomains.some((d) => email.endsWith(d.toLowerCase()));
    const shouldAutoApprove = gmailState.autoApproveAll || isDomainAutoApproved;

    const request: AccessRequest = {
      id: `req_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name: params.name.trim(),
      username: params.username.trim().toLowerCase(),
      email,
      password: params.password || 'password123',
      requestedRole: params.requestedRole || 'reviewer',
      requestedWorkspaceId: params.requestedWorkspaceId || this.getActiveWorkspaceId(),
      status: shouldAutoApprove ? 'approved' : 'pending',
      createdAt: new Date().toISOString(),
      reviewedAt: shouldAutoApprove ? new Date().toISOString() : undefined,
      reviewedBy: shouldAutoApprove ? 'System (Auto-Rule)' : undefined,
      notes: params.notes || 'Submitted via public registration gateway.',
      notificationSentToAdmin: true,
      confirmationSentToUser: shouldAutoApprove,
      approvalToken: token,
    };

    if (!this.data.accessRequests) this.data.accessRequests = [];
    this.data.accessRequests.unshift(request);

    let user: UserAccount | undefined;
    if (shouldAutoApprove) {
      user = this.createUser({
        name: request.name,
        username: request.username,
        email: request.email,
        password: request.password,
        role: request.requestedRole,
        workspaceId: request.requestedWorkspaceId,
        status: 'approved',
      });
    }

    this.saveData(this.data);
    this.addLog(
      'info',
      `Access request registered for "${request.name}" (${request.email}) - Status: ${request.status}`
    );

    return { request, autoApproved: shouldAutoApprove, user };
  }

  public approveAccessRequest(id: string, reviewer: string = 'Author Admin (Asab Siddiqui)'): { success: boolean; user?: UserAccount; request?: AccessRequest } {
    const req = (this.data.accessRequests || []).find((r) => r.id === id);
    if (!req) return { success: false };

    req.status = 'approved';
    req.reviewedAt = new Date().toISOString();
    req.reviewedBy = reviewer;
    req.confirmationSentToUser = true;

    // Create or activate the user account
    const user = this.createUser({
      name: req.name,
      username: req.username,
      email: req.email,
      password: req.password,
      role: req.requestedRole,
      workspaceId: req.requestedWorkspaceId,
      status: 'approved',
    });

    this.saveData(this.data);
    this.addLog('info', `Admin approved access request for "${req.name}" (${req.email})`);
    return { success: true, user, request: req };
  }

  public rejectAccessRequest(id: string, reviewer: string = 'Author Admin (Asab Siddiqui)'): boolean {
    const req = (this.data.accessRequests || []).find((r) => r.id === id);
    if (!req) return false;

    req.status = 'rejected';
    req.reviewedAt = new Date().toISOString();
    req.reviewedBy = reviewer;

    this.saveData(this.data);
    this.addLog('warn', `Admin rejected access request for "${req.name}" (${req.email})`);
    return true;
  }

  // --- Gmail Integration State & Logs ---
  public getGmailState(): GmailIntegrationState {
    return (
      this.data.gmailState || {
        isConnected: true,
        adminEmail: 'Asabsiddx2000@gmail.com',
        autoApproveDomains: ['@autopilot.studio'],
        autoApproveAll: false,
        sentEmailCount: 0,
      }
    );
  }

  public updateGmailState(updates: Partial<GmailIntegrationState>): GmailIntegrationState {
    this.data.gmailState = { ...this.getGmailState(), ...updates };
    this.saveData(this.data);
    return this.data.gmailState;
  }

  public getEmailLogs(): EmailLog[] {
    return this.data.emailLogs || [];
  }

  public addEmailLog(log: Omit<EmailLog, 'id' | 'sentAt'> & { id?: string; sentAt?: string }): EmailLog {
    const newLog: EmailLog = {
      id: log.id || `email_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      to: log.to,
      from: log.from || 'Asabsiddx2000@gmail.com',
      subject: log.subject,
      type: log.type,
      sentAt: log.sentAt || new Date().toISOString(),
      status: log.status,
      messagePreview: log.messagePreview || '',
    };

    if (!this.data.emailLogs) this.data.emailLogs = [];
    this.data.emailLogs.unshift(newLog);
    if (this.data.emailLogs.length > 100) {
      this.data.emailLogs = this.data.emailLogs.slice(0, 100);
    }

    if (this.data.gmailState) {
      this.data.gmailState.sentEmailCount = (this.data.gmailState.sentEmailCount || 0) + 1;
      this.data.gmailState.lastSyncTime = new Date().toISOString();
    }

    this.saveData(this.data);
    return newLog;
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
