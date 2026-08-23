import React from 'react';
import { Award, Brain, CheckCircle2, Clock, Flame, Lightbulb, Target, TrendingUp } from 'lucide-react';
import { WeeklyStrategyInsight } from '../types.js';

interface AnalyticsViewProps {
  insights: WeeklyStrategyInsight[];
  onGenerateStrategy: () => void;
  isGenerating: boolean;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ insights, onGenerateStrategy, isGenerating }) => {
  const current = insights[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="eyebrow flex items-center gap-1.5"><TrendingUp className="h-3.5 w-3.5" /> Learning Loop</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight">AI Strategy</h2>
          <p className="mt-0.5 text-[13px] text-[--muted]">Weekly analysis of engagement, formats, and timing</p>
        </div>
        <button onClick={onGenerateStrategy} disabled={isGenerating} className="btn-primary self-start">
          {isGenerating ? <><Brain className="h-4 w-4 animate-spin" /><span>Analyzing…</span></> : <><Brain className="h-4 w-4" /><span>Run Analysis</span></>}
        </button>
      </div>

      {current ? (
        <div className="space-y-6">
          {/* Executive synthesis */}
          <section className="panel p-5">
            <div className="flex items-center gap-3 border-b border-[--border] pb-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[--accent]/12 border border-[--accent]/25">
                <Brain className="h-4 w-4 text-[--accent]" />
              </span>
              <div>
                <h3 className="section-title">Executive Synthesis</h3>
                <p className="text-[11px] text-[--muted]">Week of {current.weekStarting}</p>
              </div>
            </div>
            <p className="mt-3 text-[14px] leading-relaxed text-[--fg-soft]">{current.analysisSummary}</p>
          </section>

          {/* Grid */}
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="panel p-4">
              <div className="flex items-center gap-2 border-b border-[--border] pb-2"><Target className="h-4 w-4 text-[--accent]" /><h4 className="section-title !text-[12px]">Top Topics</h4></div>
              <ul className="mt-3 space-y-2">
                {current.bestTopics.slice(0, 4).map((t, i) => (
                  <li key={i} className="flex items-center gap-2 text-[13px] text-[--fg]">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-[--accent]/10 text-[--accent] mono text-[10px] font-semibold">{i + 1}</span>
                    <span className="truncate">{t}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="panel p-4">
              <div className="flex items-center gap-2 border-b border-[--border] pb-2"><Flame className="h-4 w-4 text-[--accent]" /><h4 className="section-title !text-[12px]">Best Hooks</h4></div>
              <ul className="mt-3 space-y-2">
                {current.bestHooks.slice(0, 3).map((h, i) => (
                  <li key={i} className="text-[13px] text-[--fg-soft] line-clamp-2">"{h}"</li>
                ))}
              </ul>
            </div>

            <div className="panel p-4">
              <div className="flex items-center gap-2 border-b border-[--border] pb-2"><Award className="h-4 w-4 text-[--accent]" /><h4 className="section-title !text-[12px]">Winning Formats</h4></div>
              <ul className="mt-3 space-y-2.5">
                {current.bestFormats.map((f, i) => (
                  <li key={i} className="text-[13px]">
                    <span className="font-medium text-[--fg] capitalize">{f.platform}</span>
                    <span className="ml-2 text-[12px] text-[--muted]">{f.format}</span>
                    <p className="text-[11px] text-[--muted] leading-snug">{f.reason}</p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="panel p-4">
              <div className="flex items-center gap-2 border-b border-[--border] pb-2"><Clock className="h-4 w-4 text-[--accent]" /><h4 className="section-title !text-[12px]">Optimal Times</h4></div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {current.bestPostingTimes.map((t, i) => <span key={i} className="badge">{t}</span>)}
              </div>
            </div>
          </div>

          {/* Directives */}
          <section className="panel p-5">
            <div className="flex items-center gap-2 border-b border-[--border] pb-2">
              <Lightbulb className="h-4 w-4 text-[--accent]" />
              <h4 className="section-title">Directives for Next Cycle</h4>
            </div>
            <ul className="mt-3 space-y-2.5">
              {current.actionableRecommendations.map((r, i) => (
                <li key={i} className="flex items-start gap-2.5 text-[13px] text-[--fg-soft]">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[--accent]" />
                  <span className="leading-relaxed">{r}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      ) : (
        <div className="panel py-16 text-center">
          <Brain className="mx-auto h-10 w-10 text-[--muted]" />
          <h3 className="mt-3 font-medium text-[--fg]">No analysis yet</h3>
          <p className="mt-1 text-[13px] text-[--muted]">Click "Run Analysis" to generate insights from historical performance.</p>
        </div>
      )}
    </div>
  );
};
