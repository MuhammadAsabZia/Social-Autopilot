import React from 'react';
import {
  Award,
  BrainCircuit,
  CalendarClock,
  CheckCircle2,
  Clock,
  Flame,
  Lightbulb,
  RefreshCw,
  Sparkles,
  Target,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { WeeklyStrategyInsight } from '../types.js';

interface AnalyticsViewProps {
  insights: WeeklyStrategyInsight[];
  onGenerateStrategy: () => void;
  isGenerating: boolean;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ insights, onGenerateStrategy, isGenerating }) => {
  const current = insights[0];

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="h-1.5 w-1.5 rounded-full bg-[--accent] shadow-[0_0_8px_var(--color-accent)]" />
            <p className="eyebrow flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5" /> Intelligence Loop
            </p>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">AI Strategy & Insights</h2>
          <p className="mt-0.5 text-[13px] sm:text-[14px] text-[--muted]">
            Multi-platform performance feedback, algorithmic hook analysis & timing recommendations
          </p>
        </div>

        <button 
          onClick={onGenerateStrategy} 
          disabled={isGenerating} 
          className="btn-primary self-start sm:self-auto shadow-lg"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin shrink-0" />
              <span>Analyzing Engagement Loop…</span>
            </>
          ) : (
            <>
              <BrainCircuit className="h-4 w-4 shrink-0" />
              <span>Run Strategy Analysis</span>
            </>
          )}
        </button>
      </div>

      {current ? (
        <div className="space-y-6">
          {/* Executive Synthesis */}
          <section className="panel p-5 sm:p-7">
            <div className="flex items-center gap-3 border-b border-white/[0.08] pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[--accent-subtle] border border-[--accent]/30 text-[--accent] shrink-0">
                <BrainCircuit className="h-5 w-5" />
              </div>
              <div>
                <h3 className="section-title text-[16px]">Executive Synthesis</h3>
                <p className="text-[11px] text-[--muted]">Strategic Cycle Starting {current.weekStarting}</p>
              </div>
            </div>
            <p className="mt-4 text-[14px] sm:text-[15px] leading-relaxed text-[--fg-soft]">
              {current.analysisSummary}
            </p>
          </section>

          {/* 4 Quadrants Grid */}
          <div className="grid gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-4">
            {/* Top Topics */}
            <div className="panel p-5 space-y-4">
              <div className="flex items-center gap-2 border-b border-white/[0.06] pb-3">
                <Target className="h-4 w-4 text-[--accent]" />
                <h4 className="section-title text-[13px]">High-Conversion Topics</h4>
              </div>
              <ul className="space-y-2.5">
                {current.bestTopics.slice(0, 4).map((t, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-[13px] text-white">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-[--accent]/10 text-[--accent] mono text-[10px] font-bold">
                      {i + 1}
                    </span>
                    <span className="truncate">{t}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Best Hooks */}
            <div className="panel p-5 space-y-4">
              <div className="flex items-center gap-2 border-b border-white/[0.06] pb-3">
                <Flame className="h-4 w-4 text-[--accent]" />
                <h4 className="section-title text-[13px]">Top Performing Hooks</h4>
              </div>
              <ul className="space-y-3">
                {current.bestHooks.slice(0, 3).map((h, i) => (
                  <li key={i} className="text-[12px] sm:text-[13px] text-[--fg-soft] italic bg-black/20 p-2.5 rounded-lg border border-white/[0.04]">
                    "{h}"
                  </li>
                ))}
              </ul>
            </div>

            {/* Winning Formats */}
            <div className="panel p-5 space-y-4">
              <div className="flex items-center gap-2 border-b border-white/[0.06] pb-3">
                <Award className="h-4 w-4 text-[--accent]" />
                <h4 className="section-title text-[13px]">Winning Formats</h4>
              </div>
              <ul className="space-y-3">
                {current.bestFormats.map((f, i) => (
                  <li key={i} className="text-[12px] sm:text-[13px]">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white capitalize">{f.platform}</span>
                      <span className="badge text-[10px]">{f.format}</span>
                    </div>
                    <p className="mt-1 text-[11px] text-[--muted] leading-relaxed">{f.reason}</p>
                  </li>
                ))}
              </ul>
            </div>

            {/* Optimal Times */}
            <div className="panel p-5 space-y-4">
              <div className="flex items-center gap-2 border-b border-white/[0.06] pb-3">
                <CalendarClock className="h-4 w-4 text-[--accent]" />
                <h4 className="section-title text-[13px]">Optimal Dispatch Times</h4>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {current.bestPostingTimes.map((t, i) => (
                  <span key={i} className="badge badge-accent text-[11px] py-1 px-2.5">
                    <Clock className="h-3 w-3 mr-1" /> {t}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Actionable Directives */}
          <section className="panel p-5 sm:p-7">
            <div className="flex items-center gap-2.5 border-b border-white/[0.08] pb-3.5">
              <Lightbulb className="h-4.5 w-4.5 text-[--accent]" />
              <h4 className="section-title text-[15px]">Directives for Upcoming Autonomous Cycle</h4>
            </div>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {current.actionableRecommendations.map((r, i) => (
                <li key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] text-[13px] text-[--fg-soft]">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[--accent]" />
                  <span className="leading-relaxed">{r}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      ) : (
        <div className="panel py-16 text-center space-y-3">
          <BrainCircuit className="mx-auto h-10 w-10 text-white/10" />
          <h3 className="font-semibold text-[15px] text-white">No strategy evaluation recorded</h3>
          <p className="text-[13px] text-[--muted]">Click "Run Strategy Analysis" above to calculate performance directives.</p>
        </div>
      )}
    </div>
  );
};
