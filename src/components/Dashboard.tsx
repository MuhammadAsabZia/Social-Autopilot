import React, { useState } from 'react';
import {
  ArrowUpRight, Brain, Calendar, CheckCircle2, Clock, ExternalLink, Facebook,
  Instagram, Linkedin, Play, Radio, RefreshCw, Send, ShieldCheck, Sparkles, TrendingUp,
} from 'lucide-react';
import { motion } from 'motion/react';
import { BrandBrainConfig, BufferConfig, PlatformType, SchedulerState, SocialMediaPostGroup, TrendCandidate } from '../types.js';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } }
};

interface DashboardProps {
  latestPostGroup: SocialMediaPostGroup | null;
  schedulerState: SchedulerState | null;
  brandBrain: BrandBrainConfig | null;
  bufferConfig: BufferConfig | null;
  stats: { totalPosts: number; publishedCount: number; scheduledCount: number; bufferConnected: boolean; bufferSimulated: boolean; automationEnabled: boolean; };
  trendCandidates: TrendCandidate[];
  isExecuting: boolean;
  onTriggerAutopilot: () => void;
  onToggleAutomation: (enabled: boolean) => void;
  onRegeneratePost: (platform: PlatformType) => void;
  onInspectPostGroup: (postGroup: SocialMediaPostGroup) => void;
  onPublishPostGroup: (id: string) => void;
  onOpenBrandBrain: () => void;
  onOpenBufferSettings: () => void;
}

const PLATFORM_META: Record<PlatformType, { name: string; icon: React.ComponentType<{ className?: string }>; color: string }> = {
  linkedin: { name: 'LinkedIn', icon: Linkedin, color: 'text-blue-400' },
  instagram: { name: 'Instagram', icon: Instagram, color: 'text-pink-400' },
  facebook: { name: 'Facebook', icon: Facebook, color: 'text-blue-400' },
};

function formatNextRun(schedulerState: SchedulerState | null): string {
  if (!schedulerState?.nextRunAt) return '08:00 AM';
  const d = new Date(schedulerState.nextRunAt);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export const Dashboard: React.FC<DashboardProps> = ({
  latestPostGroup, schedulerState, brandBrain, bufferConfig, stats,
  trendCandidates, isExecuting, onTriggerAutopilot, onToggleAutomation, onRegeneratePost,
  onInspectPostGroup, onPublishPostGroup, onOpenBrandBrain, onOpenBufferSettings,
}) => {
  const [tab, setTab] = useState<PlatformType>('linkedin');
  const currentPost = latestPostGroup?.posts[tab];
  const bufferLive = stats.bufferConnected && !stats.bufferSimulated;

  const stats_Cards = [
    { label: 'Total Posts', value: stats.totalPosts, icon: TrendingUp },
    { label: 'Published', value: stats.publishedCount, icon: CheckCircle2 },
    { label: 'Queued', value: stats.scheduledCount, icon: Calendar },
    { label: bufferLive ? 'Linked to Buffer' : 'Simulation Mode', value: bufferLive ? 'Live' : 'Demo', icon: Radio, live: bufferLive },
  ];

  const recentActivity = (trendCandidates.length > 0 ? trendCandidates : []).slice(0, 5);

  const channels = (['linkedin', 'instagram', 'facebook'] as PlatformType[]).map((key) => {
    const meta = PLATFORM_META[key];
    const cfg = bufferConfig?.channels?.[key];
    const active = cfg?.enabled ?? true;
    return { key, meta, name: cfg?.channelName || meta.name, active, id: cfg?.channelId };
  });

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      {/* Page header */}
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="h-px w-8 bg-[--accent]/40" />
            <p className="eyebrow flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5" /> Command Center</p>
          </div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">Overview</h2>
          <p className="mt-1 text-[14px] text-[--muted] font-medium">Autonomous content pipeline active & monitored</p>
        </div>
        <button onClick={onTriggerAutopilot} disabled={isExecuting} className="btn-primary self-start group">
          {isExecuting ? <><RefreshCw className="h-4.5 w-4.5 animate-spin" /><span>Synchronizing…</span></> : <><Play className="h-4.5 w-4.5 fill-current" /><span>Execute Autopilot</span></>}
        </button>
      </motion.div>

      {/* Stat cards */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {stats_Cards.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="panel p-5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                <Icon className="h-12 w-12" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <span className="stat-label">{s.label}</span>
                  {s.live && <span className="flex h-1.5 w-1.5 rounded-full bg-[--success] animate-pulse" />}
                </div>
                <div className="flex items-end justify-between">
                  <p className="stat-value text-3xl">{s.value}</p>
                  <Icon className={`h-5 w-5 ${s.live ? 'text-[--success]' : 'text-[--accent]'}`} />
                </div>
                <div className="mt-4 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '65%' }}
                    className="h-full bg-gradient-to-r from-[--accent] to-transparent opacity-40"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </motion.div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left (2 cols) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Latest content */}
          <motion.section variants={item} className="panel p-6 sm:p-8">
            <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/10">
                  <Send className="h-5 w-5 text-[--accent]" />
                </div>
                <div>
                  <h3 className="section-title text-[16px]">Latest Pipeline Output</h3>
                  {latestPostGroup && (
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="badge-accent text-[9px]">Quality Score: {latestPostGroup.qualityControl.score}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {latestPostGroup && (
                  <button onClick={() => onInspectPostGroup(latestPostGroup)} className="btn-ghost text-[12px]">
                    <ExternalLink className="h-4 w-4" /><span>Inspect</span>
                  </button>
                )}
                <button onClick={() => onRegeneratePost(tab)} disabled={isExecuting} className="btn-secondary text-[12px]">
                  <RefreshCw className={`h-4 w-4 ${isExecuting ? 'animate-spin' : ''}`} /><span>Regenerate</span>
                </button>
                {latestPostGroup && (
                  <button onClick={() => onPublishPostGroup(latestPostGroup.id)} className="btn-primary text-[12px] !py-2">
                    <Send className="h-3.5 w-3.5" /><span>Dispatch All</span>
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-[20px] font-bold leading-tight text-white tracking-tight">
                {latestPostGroup?.coreTopic || 'Awaiting fresh generation cycle'}
              </h4>
              <p className="text-[14px] text-[--fg-soft] leading-relaxed">
                {latestPostGroup?.coreIdea || 'Trigger Autopilot to synthesize content from researched trends.'}
              </p>
            </div>

            {/* Platform tabs */}
            {latestPostGroup && (
              <div className="mt-8 flex gap-6 border-b border-white/10">
                {(['linkedin', 'instagram', 'facebook'] as PlatformType[]).map((p) => {
                  const meta = PLATFORM_META[p];
                  const Icon = meta.icon;
                  return (
                    <button
                      key={p}
                      onClick={() => setTab(p)}
                      className={`flex items-center gap-2 pb-4 text-[13px] font-bold transition-all relative ${
                        tab === p ? 'text-white' : 'text-[--muted] hover:text-[--fg-soft]'
                      }`}
                    >
                      <Icon className={`h-4.5 w-4.5 ${tab === p ? meta.color : ''}`} />
                      {meta.name}
                      {tab === p && (
                        <motion.div 
                          layoutId="activeTab"
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-[--accent]"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Preview */}
            {latestPostGroup && currentPost && (
              <div className="mt-8 grid gap-8 md:grid-cols-2">
                <div className="space-y-6">
                  <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-4">
                    <div>
                      <p className="eyebrow !text-[10px] mb-2 opacity-60">HOOK</p>
                      <p className="text-[15px] leading-relaxed text-white font-medium italic">"{currentPost.hook}"</p>
                    </div>
                    <div>
                      <p className="eyebrow !text-[10px] mb-2 opacity-60">BODY</p>
                      <p className="text-[14px] leading-relaxed text-[--fg-soft] line-clamp-6">{currentPost.body}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {currentPost.hashtags.map((h, i) => <span key={i} className="badge !bg-[--accent]/5 !text-[--accent] !border-[--accent]/20">{h}</span>)}
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-[--bg-deep] overflow-hidden shadow-2xl relative group">
                  {currentPost.visualImageUrl ? (
                    <img src={currentPost.visualImageUrl} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                      <Sparkles className="h-8 w-8 text-white/10" />
                      <span className="text-[12px] text-[--muted]">Visual generation in progress</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                    <span className="text-[11px] text-white font-medium uppercase tracking-widest">Premium Visual AI</span>
                  </div>
                </div>
              </div>
            )}
          </motion.section>

          {/* Activity feed */}
          <motion.section variants={item} className="panel p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="section-title flex items-center gap-2"><Radio className="h-4 w-4 text-[--accent]" /> High-Signal Trends</h3>
              <span className="badge !text-[9px]"><Clock className="h-3 w-3 mr-1" /> Real-time Feed</span>
            </div>
            {recentActivity.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {recentActivity.map((c) => (
                  <button 
                    key={c.id} 
                    onClick={onTriggerAutopilot} 
                    className="flex items-center justify-between gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-[--accent]/30 hover:bg-white/10 transition-all text-left"
                  >
                    <div className="min-w-0">
                      <p className="text-[14px] font-bold text-white truncate">{c.title}</p>
                      <p className="text-[11px] text-[--muted] mt-0.5">{c.category}</p>
                    </div>
                    <div className="flex flex-col items-end shrink-0">
                      <span className="mono text-[14px] font-bold text-[--accent]">{c.scores?.finalScore || 0}</span>
                      <span className="text-[9px] uppercase font-bold text-[--muted]">Score</span>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <Radio className="mx-auto h-8 w-8 text-white/5 mb-3" />
                <p className="text-[13px] text-[--muted]">Pulse your radar to discover upcoming trends.</p>
              </div>
            )}
          </motion.section>
        </div>

        {/* Right (1 col) */}
        <div className="space-y-8">
          {/* Automation */}
          <motion.section variants={item} className="panel p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="section-title">Schedule Status</h3>
              <div className="flex h-2 w-2 rounded-full bg-[--success] shadow-[0_0_8px_var(--color-success)]" />
            </div>
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-bold text-[--muted] uppercase tracking-wider">Pipeline</span>
                <span className="text-[13px] font-bold text-white">{stats.automationEnabled ? 'ENGAGED' : 'STANDBY'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-bold text-[--muted] uppercase tracking-wider">Next Sync</span>
                <span className="text-[13px] font-mono font-bold text-[--accent]">{formatNextRun(schedulerState)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-bold text-[--muted] uppercase tracking-wider">Last Run</span>
                <span className="text-[13px] font-bold text-white">{schedulerState?.lastRunAt ? formatDate(schedulerState.lastRunAt) : '—'}</span>
              </div>
            </div>
            <button
              onClick={() => onToggleAutomation(!stats.automationEnabled)}
              className="btn-secondary w-full justify-center mt-8 text-[12px] !py-3 font-bold"
            >
              {stats.automationEnabled ? 'Deactivate Scheduler' : 'Activate Scheduler'}
            </button>
          </motion.section>

          {/* Channels */}
          <motion.section variants={item} className="panel p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="section-title">Connectivity</h3>
              <button onClick={onOpenBufferSettings} className="btn-ghost text-[11px] !p-1 font-bold">CONFIG</button>
            </div>
            <div className="space-y-3">
              {channels.map((ch) => {
                const Icon = ch.meta.icon;
                return (
                  <div key={ch.key} className="flex items-center gap-4 p-3.5 rounded-xl bg-white/5 border border-white/5 group hover:border-white/10 transition-colors">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-black/40 border border-white/5 transition-transform group-hover:scale-105 ${ch.meta.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[14px] font-bold text-white truncate">{ch.name}</p>
                      <p className="text-[10px] mono text-[--muted] font-medium">{ch.id ? ch.id.slice(0, 12) + '…' : 'DISCONNECTED'}</p>
                    </div>
                    <div className={`h-1.5 w-1.5 rounded-full ${ch.active ? 'bg-[--success] shadow-[0_0_5px_var(--color-success)]' : 'bg-white/10'}`} />
                  </div>
                );
              })}
            </div>
          </motion.section>

          {/* Brand brain */}
          <motion.section variants={item} className="panel p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="section-title flex items-center gap-2"><Brain className="h-4.5 w-4.5 text-[--accent]" /> Brand Intelligence</h3>
              <button onClick={onOpenBrandBrain} className="btn-ghost text-[11px] !p-1 font-bold">EDIT</button>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-[10px] font-bold text-[--muted] uppercase tracking-widest mb-1">VOICE</p>
                <p className="text-[13px] font-bold text-white line-clamp-1">{brandBrain?.toneOfVoice || 'NOT SET'}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-[--muted] uppercase tracking-widest mb-1">AUDIENCE</p>
                <p className="text-[13px] font-bold text-white line-clamp-1">{brandBrain?.targetAudience || 'GLOBAL'}</p>
              </div>
              <div className="col-span-2 pt-2">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-bold text-[--muted] uppercase tracking-widest">CONTENT COMPOSITION</p>
                  <p className="text-[10px] font-bold text-[--accent]">70/20/10</p>
                </div>
                <div className="flex h-1.5 w-full rounded-full overflow-hidden bg-white/5">
                  <div className="h-full bg-[--accent] opacity-80" style={{ width: '70%' }} />
                  <div className="h-full bg-white opacity-20" style={{ width: '20%' }} />
                  <div className="h-full bg-white opacity-5" style={{ width: '10%' }} />
                </div>
              </div>
            </div>
          </motion.section>
        </div>
      </div>
    </motion.div>
  );
};
