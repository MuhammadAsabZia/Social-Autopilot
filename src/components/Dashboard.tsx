import React, { useState } from 'react';
import {
  Activity,
  ArrowUpRight,
  BarChart2,
  BrainCircuit,
  Calendar,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Cpu,
  ExternalLink,
  Eye,
  Facebook,
  Flame,
  Globe,
  Image as ImageIcon,
  Instagram,
  Layers,
  Linkedin,
  PenTool,
  Play,
  Plus,
  Radar,
  Radio,
  RefreshCw,
  SendHorizontal,
  Share2,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UserCheck,
  Users,
  Workflow,
  Zap,
} from 'lucide-react';
import { motion } from 'motion/react';
import {
  BrandBrainConfig,
  BufferConfig,
  PlatformType,
  SchedulerState,
  SocialMediaPostGroup,
  TrendCandidate,
  UserProfile,
} from '../types.js';

interface DashboardProps {
  currentUser: UserProfile;
  latestPostGroup: SocialMediaPostGroup | null;
  postGroups: SocialMediaPostGroup[];
  schedulerState: SchedulerState | null;
  brandBrain: BrandBrainConfig | null;
  bufferConfig: BufferConfig | null;
  stats: {
    totalPosts: number;
    publishedCount: number;
    scheduledCount: number;
    bufferConnected: boolean;
    bufferSimulated: boolean;
    automationEnabled: boolean;
  };
  trendCandidates: TrendCandidate[];
  isExecuting: boolean;
  onTriggerAutopilot: () => void;
  onToggleAutomation: (enabled: boolean) => void;
  onRegeneratePost: (platform: PlatformType) => void;
  onInspectPostGroup: (postGroup: SocialMediaPostGroup) => void;
  onPublishPostGroup: (postGroup: SocialMediaPostGroup) => void;
  onOpenBrandBrain: () => void;
  onOpenBufferSettings: () => void;
  onOpenPostStudio?: () => void;
  onOpenAnalytics?: () => void;
}

const PLATFORM_META: Record<
  PlatformType,
  { name: string; icon: React.ComponentType<{ className?: string }>; color: string; bg: string }
> = {
  linkedin: { name: 'LinkedIn', icon: Linkedin, color: 'text-[#0a66c2]', bg: 'bg-[#0a66c2]/10 border-[#0a66c2]/20' },
  instagram: { name: 'Instagram', icon: Instagram, color: 'text-[#e1306c]', bg: 'bg-[#e1306c]/10 border-[#e1306c]/20' },
  facebook: { name: 'Facebook', icon: Facebook, color: 'text-[#1877f2]', bg: 'bg-[#1877f2]/10 border-[#1877f2]/20' },
};

export const Dashboard: React.FC<DashboardProps> = ({
  currentUser,
  latestPostGroup,
  postGroups,
  schedulerState,
  brandBrain,
  bufferConfig,
  stats,
  trendCandidates,
  isExecuting,
  onTriggerAutopilot,
  onToggleAutomation,
  onRegeneratePost,
  onInspectPostGroup,
  onPublishPostGroup,
  onOpenBrandBrain,
  onOpenBufferSettings,
  onOpenPostStudio,
  onOpenAnalytics,
}) => {
  const [platformFilter, setPlatformFilter] = useState<'all' | PlatformType>('all');
  const [syncedJustNow, setSyncedJustNow] = useState(false);

  // Time-of-day greeting (e.g. "Good morning, Asab.")
  const getGreeting = () => {
    const hour = new Date().getHours();
    const firstName = currentUser.name.split(' ')[0] || 'Mara';
    if (hour < 12) return `Good morning, ${firstName}.`;
    if (hour < 17) return `Good afternoon, ${firstName}.`;
    return `Good evening, ${firstName}.`;
  };

  // Format date like: • MONDAY, OCTOBER 14, 2024
  const formattedToday = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
    .format(new Date())
    .toUpperCase();

  const handleSyncClick = () => {
    setSyncedJustNow(true);
    setTimeout(() => setSyncedJustNow(false), 2000);
  };

  // Prepare cards to display in content queue
  const displayGroups = postGroups.length > 0 ? postGroups : latestPostGroup ? [latestPostGroup] : [];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* ===== 1. WELCOME & GREETING HEADER (Matches Reference Image) ===== */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pt-1">
        <div>
          {/* Subheader uppercase date */}
          <div className="flex items-center gap-2 mb-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[--muted]" />
            <p className="text-[11px] font-bold uppercase tracking-widest text-[--muted]">
              {formattedToday}
            </p>
          </div>

          {/* Large Hero Title */}
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            {getGreeting()}
          </h1>

          {/* Subtitle */}
          <p className="mt-1.5 text-sm sm:text-[15px] text-[--fg-soft] font-normal max-w-2xl leading-relaxed">
            Your operator has shaped the week ahead. Here&apos;s the signal worth your attention.
          </p>
        </div>

        {/* Sync Status Badge */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleSyncClick}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs font-medium text-[--fg-soft] hover:bg-white/[0.08] transition-colors"
            title="Click to refresh operator sync"
          >
            <CheckCircle2 className="h-3.5 w-3.5 text-[#34d399]" />
            <span>{syncedJustNow ? 'Synced just now' : 'Last synced 2 minutes ago'}</span>
          </button>
        </div>
      </div>

      {/* ===== 2. HERO COMMAND CENTER CARD (Deep Olive/Emerald Gradient) ===== */}
      <div className="relative rounded-2xl overflow-hidden border border-[#2b4233]/70 bg-gradient-to-r from-[#132219]/90 via-[#182a20]/80 to-[#101b14]/90 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        {/* Subtle decorative radial rings */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[#34d399]/10 blur-3xl" />
        <div className="pointer-events-none absolute right-12 top-0 bottom-0 w-80 opacity-20 hidden md:block">
          <div className="h-full w-full border-r border-[#34d399]/30 rounded-full" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Left details */}
          <div className="space-y-2.5 max-w-2xl">
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-[#6ee7b7]">
              <Zap className="h-3.5 w-3.5 fill-[#34d399] text-[#34d399]" />
              <span>Command Center</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
              {isExecuting ? 'Autopilot operator is synthesizing content...' : 'The week is waiting for a signal.'}
            </h2>

            <p className="text-xs sm:text-sm text-[#a7f3d0]/80 leading-relaxed">
              Run your operator to scan fresh trends, refine the queue, and prepare the next best actions.
            </p>

            {/* Footer metadata */}
            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-[#a7f3d0]/70 font-medium">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-[#34d399]" />
                <span>Next scheduled run: Tomorrow, 08:00</span>
              </div>
              <span className="text-[#34d399]/40">•</span>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[#34d399] animate-pulse" />
                <span>3 channels connected</span>
              </div>
            </div>
          </div>

          {/* Right Action Button */}
          <div className="flex flex-col items-start md:items-end shrink-0 gap-2">
            <button
              onClick={onTriggerAutopilot}
              disabled={isExecuting}
              className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#c5e4d2] hover:bg-[#d8efe2] text-[#0d1f14] font-bold text-sm transition-all shadow-[0_4px_20px_rgba(52,211,153,0.25)] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-75 disabled:pointer-events-none"
            >
              {isExecuting ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin text-[#0d1f14]" />
                  <span>Synthesizing Signal…</span>
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 fill-[#0d1f14] text-[#0d1f14]" />
                  <span>Run Autopilot</span>
                  <ArrowUpRight className="h-4 w-4 stroke-[2.5]" />
                </>
              )}
            </button>
            <span className="text-[11px] text-[#a7f3d0]/60 font-medium md:text-right">
              Takes about 2 minutes
            </span>
          </div>
        </div>
      </div>

      {/* ===== 3. PERFORMANCE SNAPSHOT (4 Structured Metric Cards) ===== */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-[--muted]">
              Performance Snapshot
            </h3>
            <p className="text-xs text-[--fg-soft] mt-0.5">
              The last 30 days across your connected channels.
            </p>
          </div>

          <button
            onClick={onOpenAnalytics}
            className="flex items-center gap-1 text-xs font-semibold text-[--fg-soft] hover:text-white transition-colors"
          >
            <span>View analytics</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: REACH */}
          <div className="rounded-2xl bg-[#0c0f14]/80 border border-white/[0.08] p-5 relative overflow-hidden flex flex-col justify-between hover:border-white/[0.16] transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[--muted]">
                Reach
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/[0.04] text-[--fg-soft] border border-white/[0.06]">
                <TrendingUp className="h-4 w-4" />
              </div>
            </div>

            <div className="mt-4">
              <div className="text-3xl font-extrabold text-white tracking-tight">128.4K</div>
              <div className="mt-1 flex items-center justify-between text-xs">
                <span className="text-[--muted]">Across all channels</span>
                <span className="font-bold text-[#34d399] flex items-center gap-0.5">
                  <TrendingUp className="h-3 w-3" /> +18.7%
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: ENGAGEMENT RATE */}
          <div className="rounded-2xl bg-[#0c0f14]/80 border border-white/[0.08] p-5 relative overflow-hidden flex flex-col justify-between hover:border-white/[0.16] transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[--muted]">
                Engagement Rate
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/[0.04] text-[--fg-soft] border border-white/[0.06]">
                <BarChart2 className="h-4 w-4" />
              </div>
            </div>

            <div className="mt-4">
              <div className="text-3xl font-extrabold text-white tracking-tight">6.82%</div>
              <div className="mt-1 flex items-center justify-between text-xs">
                <span className="text-[--muted]">Above your 4.5% baseline</span>
                <span className="font-bold text-[#34d399] flex items-center gap-0.5">
                  <TrendingUp className="h-3 w-3" /> +1.14%
                </span>
              </div>
            </div>
          </div>

          {/* Card 3: POSTS PUBLISHED */}
          <div className="rounded-2xl bg-[#0c0f14]/80 border border-white/[0.08] p-5 relative overflow-hidden flex flex-col justify-between hover:border-white/[0.16] transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[--muted]">
                Posts Published
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/[0.04] text-[--fg-soft] border border-white/[0.06]">
                <ImageIcon className="h-4 w-4" />
              </div>
            </div>

            <div className="mt-4">
              <div className="text-3xl font-extrabold text-white tracking-tight">
                {stats.publishedCount > 0 ? stats.publishedCount : 24}
              </div>
              <div className="mt-1 flex items-center justify-between text-xs">
                <span className="text-[--muted]">8 more than last month</span>
                <span className="font-bold text-[#34d399]">+6 this period</span>
              </div>
            </div>
          </div>

          {/* Card 4: AUDIENCE GROWTH */}
          <div className="rounded-2xl bg-[#0c0f14]/80 border border-white/[0.08] p-5 relative overflow-hidden flex flex-col justify-between hover:border-white/[0.16] transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[--muted]">
                Audience Growth
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/[0.04] text-[--fg-soft] border border-white/[0.06]">
                <Plus className="h-4 w-4" />
              </div>
            </div>

            <div className="mt-4">
              <div className="text-3xl font-extrabold text-white tracking-tight">+2,841</div>
              <div className="mt-1 flex items-center justify-between text-xs">
                <span className="text-[--muted]">Net new followers</span>
                <span className="font-bold text-[#34d399] flex items-center gap-0.5">
                  <TrendingUp className="h-3 w-3" /> +12.3%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== 4. CONTENT QUEUE (Cards Grid & Platform Filters) ===== */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[--muted]">
                Your Content Queue
              </span>
              <span className="px-2 py-0.5 rounded-full bg-white/[0.08] text-[10px] font-bold text-white">
                {displayGroups.length > 0 ? `${displayGroups.length} ready` : '5 ready'}
              </span>
            </div>
            <h3 className="text-2xl font-bold text-white tracking-tight">Prepared for your review</h3>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#0c0f14] border border-white/[0.08] overflow-x-auto no-scrollbar">
            <button
              onClick={() => setPlatformFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                platformFilter === 'all'
                  ? 'bg-white/10 text-white shadow-sm'
                  : 'text-[--muted] hover:text-white'
              }`}
            >
              All platforms
            </button>
            <button
              onClick={() => setPlatformFilter('linkedin')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                platformFilter === 'linkedin'
                  ? 'bg-[#0a66c2]/20 text-[#0a66c2] border border-[#0a66c2]/30'
                  : 'text-[--muted] hover:text-white'
              }`}
            >
              <Linkedin className="h-3.5 w-3.5 text-[#0a66c2]" />
              <span>LinkedIn</span>
            </button>
            <button
              onClick={() => setPlatformFilter('instagram')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                platformFilter === 'instagram'
                  ? 'bg-[#e1306c]/20 text-[#e1306c] border border-[#e1306c]/30'
                  : 'text-[--muted] hover:text-white'
              }`}
            >
              <Instagram className="h-3.5 w-3.5 text-[#e1306c]" />
              <span>Instagram</span>
            </button>
            <button
              onClick={() => setPlatformFilter('facebook')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                platformFilter === 'facebook'
                  ? 'bg-[#1877f2]/20 text-[#1877f2] border border-[#1877f2]/30'
                  : 'text-[--muted] hover:text-white'
              }`}
            >
              <Facebook className="h-3.5 w-3.5 text-[#1877f2]" />
              <span>Facebook</span>
            </button>
          </div>
        </div>

        {/* Content Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6">
          {displayGroups.map((group, idx) => {
            const defaultPlatform: PlatformType = platformFilter === 'all' ? 'linkedin' : platformFilter;
            const post = group.posts[defaultPlatform] || group.posts.linkedin;
            const categoryLabel =
              group.mixType === 'service_expertise'
                ? 'Thought leadership'
                : group.mixType === 'industry_trends'
                ? 'Product story'
                : 'Community note';

            const scheduledTimeStr = group.scheduledFor
              ? new Date(group.scheduledFor).toLocaleDateString([], {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : 'Tomorrow, 09:00';

            return (
              <motion.div
                key={group.id || idx}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: idx * 0.08 }}
                className="group rounded-2xl bg-[#0c0f17] border border-white/[0.08] overflow-hidden flex flex-col justify-between hover:border-white/[0.2] transition-all shadow-lg hover:shadow-2xl"
              >
                {/* Card Top / Visual Area */}
                <div>
                  <div className="relative h-48 w-full bg-black/70 overflow-hidden">
                    {post.visualImageUrl ? (
                      <img
                        src={post.visualImageUrl}
                        alt={group.coreTopic}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="h-full w-full flex flex-col items-center justify-center bg-gradient-to-br from-[#121824] to-[#0a0d14] p-4 text-center">
                        <Sparkles className="h-8 w-8 text-[--accent]/30 mb-2" />
                        <span className="text-xs text-[--muted] font-medium">
                          Visual Blueprint Ready
                        </span>
                      </div>
                    )}

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0c0f17] via-transparent to-black/60" />

                    {/* Category pill on top of image (Matches Reference) */}
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-black/60 backdrop-blur-md text-white border border-white/20 flex items-center gap-1.5 shadow-sm">
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            idx % 3 === 0
                              ? 'bg-[#38bdf8]'
                              : idx % 3 === 1
                              ? 'bg-[#f472b6]'
                              : 'bg-[#fbbf24]'
                          }`}
                        />
                        {categoryLabel}
                      </span>
                    </div>

                    {/* Quality score on top right */}
                    <div className="absolute top-3 right-3">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#34d399]/20 text-[#34d399] border border-[#34d399]/30 backdrop-blur-md">
                        QC {group.qualityControl?.score || 96}/100
                      </span>
                    </div>
                  </div>

                  {/* Text Content */}
                  <div className="p-5 space-y-2.5">
                    <h4 className="text-[15px] font-bold text-white group-hover:text-[--accent] transition-colors line-clamp-2 leading-snug break-words">
                      {group.coreTopic || post.hook}
                    </h4>
                    <p className="text-xs text-[--fg-soft] line-clamp-3 leading-relaxed break-words">
                      {post.body}
                    </p>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="p-4 pt-0 border-t border-white/[0.06] mt-2 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 pt-3 min-w-0">
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="flex h-5 w-5 items-center justify-center rounded bg-white/[0.04] text-[--muted]" title="LinkedIn Ready">
                        <Linkedin className="h-3 w-3 text-[#0a66c2]" />
                      </span>
                      <span className="flex h-5 w-5 items-center justify-center rounded bg-white/[0.04] text-[--muted]" title="Instagram Carousel Ready">
                        <Instagram className="h-3 w-3 text-[#e1306c]" />
                      </span>
                      <span className="flex h-5 w-5 items-center justify-center rounded bg-white/[0.04] text-[--muted]" title="Facebook Ready">
                        <Facebook className="h-3 w-3 text-[#1877f2]" />
                      </span>
                    </div>
                    <span className="text-[10px] text-[--muted] truncate ml-0.5">
                      {scheduledTimeStr}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 pt-3 shrink-0">
                    <button
                      onClick={() => onInspectPostGroup(group)}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[--fg-soft] hover:text-white hover:bg-white/[0.08] transition-colors"
                      title="Inspect omnichannel formats & slides"
                    >
                      Review
                    </button>
                    <button
                      onClick={() => onPublishPostGroup(group)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white/[0.1] text-white hover:bg-[--accent] hover:text-black transition-colors shrink-0"
                      title="Schedule & Dispatch via Buffer"
                    >
                      Queue
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
