export type PlatformType = 'linkedin' | 'instagram' | 'facebook';

export type ContentMixType = 'service_expertise' | 'industry_trends' | 'experimental_opinion';

export type PostStatus = 'draft' | 'scheduled' | 'publishing' | 'published' | 'failed';

export interface TrendCandidate {
  id: string;
  title: string;
  summary: string;
  sourceUrl?: string;
  sourceName?: string;
  category: string;
  discoveryDate: string;
  scores: {
    serviceRelevance: number; // 0-100
    audienceInterest: number; // 0-100
    freshness: number; // 0-100
    engagementPotential: number; // 0-100
    businessOpportunity: number; // 0-100
    brandSafety: number; // 0-100
    previousUsagePenalty: number; // 0-50
    finalScore: number; // 0-100
  };
  mixType: ContentMixType;
  rationale: string;
  suggestedAngle: string;
}

export interface PlatformPostContent {
  platform: PlatformType;
  hook: string;
  body: string;
  callToAction: string;
  hashtags: string[];
  fullFormattedText: string;
  formatType: 'thought_leadership' | 'carousel_slides' | 'infographic_caption' | 'discussion_starter' | 'case_study';
  carouselSlides?: { slideNumber: number; title: string; content: string; slideImageUrl?: string }[];
  visualPrompt: string;
  visualImageUrl?: string;
  visualType: 'branded_graphic' | 'ai_generated' | 'code_snippet' | 'workflow_diagram';
  bufferStatus?: 'pending' | 'queued' | 'published' | 'simulated';
  bufferPostId?: string;
}

export type PlatformPost = PlatformPostContent;

export interface BufferGraphQLChannel {
  id: string;
  name: string;
  service: string;
  organizationId?: string;
  organizationName?: string;
}

export interface BufferPublishResult {
  success: boolean;
  simulated?: boolean;
  batchId?: string;
  platformResults: {
    platform: PlatformType;
    status: 'queued' | 'published' | 'failed' | 'simulated';
    bufferUpdateId?: string;
    queuedAt?: string;
    error?: string;
  }[];
}

export interface QualityControlAudit {
  passed: boolean;
  score: number; // 0-100
  criteriaChecks: {
    serviceRelevance: { passed: boolean; comment: string };
    originality: { passed: boolean; comment: string };
    technicalAccuracy: { passed: boolean; comment: string };
    brandConsistency: { passed: boolean; comment: string };
    noDuplicateContent: { passed: boolean; comment: string };
    noFakeStats: { passed: boolean; comment: string };
    noExcessivePromotion: { passed: boolean; comment: string };
    brandSafety: { passed: boolean; comment: string };
  };
  suggestions: string[];
  iterationCount: number;
}

export interface SocialMediaPostGroup {
  id: string;
  createdAt: string;
  scheduledFor: string;
  coreTopic: string;
  coreIdea: string;
  mixType: ContentMixType;
  trendSource?: {
    title: string;
    url?: string;
    date?: string;
  };
  opportunityScore: number;
  overallStatus: PostStatus;
  posts: {
    linkedin: PlatformPostContent;
    instagram: PlatformPostContent;
    facebook: PlatformPostContent;
  };
  qualityControl: QualityControlAudit;
  metrics?: {
    impressions?: number;
    likes?: number;
    comments?: number;
    shares?: number;
    clicks?: number;
    topPerformingPlatform?: PlatformType;
  };
}

export interface BrandBrainConfig {
  services: string[];
  skills: string[];
  targetAudience: string;
  portfolio: {
    title: string;
    outcome: string;
    techStack: string;
  }[];
  industry: string;
  brandPositioning: string;
  toneOfVoice: string;
  contentPreferences: string[];
  topicsToAvoid: string[];
  contentMixRatio: {
    serviceExpertise: number; // e.g. 70
    industryTrends: number; // e.g. 20
    experimental: number; // e.g. 10
  };
  postingSchedule: {
    timeOfDay: string; // e.g. "09:00"
    daysOfWeek: string[]; // ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
    timezone: string;
  };
  customInstructions: string;
}

export interface BufferChannelConfig {
  channelId: string;
  channelName: string;
  service?: string;
  enabled: boolean;
  // legacy alias support
  profileId?: string;
  profileName?: string;
}

export interface BufferConfig {
  apiKeyMasked?: string;
  hasEnvKey?: boolean;
  isConnected: boolean;
  isSimulatedMode: boolean;
  organizationId?: string;
  organizationName?: string;
  channels: {
    linkedin: BufferChannelConfig;
    instagram: BufferChannelConfig;
    facebook: BufferChannelConfig;
  };
  autoPublish: boolean;
  // Deprecated field maintained for compatibility
  accessToken?: string;
}

export interface SchedulerState {
  enabled: boolean;
  lastRunAt: string | null;
  nextRunAt: string | null;
  status: 'idle' | 'running' | 'paused' | 'error';
  currentStepMessage?: string;
  progressPercentage?: number;
  lastExecutionSummary?: string;
  cronFrequency: 'daily' | 'twice_daily' | 'hourly_test';
}

export interface WeeklyStrategyInsight {
  id: string;
  weekStarting: string;
  analysisSummary: string;
  bestTopics: string[];
  bestHooks: string[];
  bestFormats: { platform: PlatformType; format: string; reason: string }[];
  bestPostingTimes: string[];
  bestContentCategories: string[];
  actionableRecommendations: string[];
  contentMixAdherence: {
    servicePercentage: number;
    trendPercentage: number;
    experimentalPercentage: number;
  };
}

export interface AutopilotRunProgress {
  step: 'idle' | 'researching' | 'scoring' | 'selecting' | 'synthesizing' | 'adapting' | 'visualizing' | 'auditing' | 'publishing' | 'completed' | 'error';
  message: string;
  percentage: number;
  trendCandidates?: TrendCandidate[];
  selectedTrend?: TrendCandidate;
  generatedGroup?: SocialMediaPostGroup;
  error?: string;
}
