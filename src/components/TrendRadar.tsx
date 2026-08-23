import React, { useState } from 'react';
import {
  ArrowUpRight,
  ExternalLink,
  Flame,
  Globe2,
  Layers,
  Radar,
  Radio,
  RefreshCw,
  Search,
  Sparkles,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ContentMixType, TrendCandidate } from '../types.js';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.04 }
  }
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } }
};

interface TrendRadarProps {
  candidates: TrendCandidate[];
  onScanTrends: () => void;
  onSelectTrendForGeneration: (trend: TrendCandidate) => void;
  isScanning: boolean;
}

const MIX_LABELS: Record<ContentMixType, string> = {
  service_expertise: 'Expertise (70%)',
  industry_trends: 'Trends (20%)',
  experimental_opinion: 'Opinion (10%)',
};

const FILTERS: { id: 'all' | ContentMixType; label: string }[] = [
  { id: 'all', label: 'All Signals' },
  { id: 'service_expertise', label: 'Expertise' },
  { id: 'industry_trends', label: 'Industry Trends' },
  { id: 'experimental_opinion', label: 'Hot Takes' },
];

function scoreColor(score: number): string {
  if (score >= 88) return 'text-[--accent]';
  if (score >= 70) return 'text-[--success]';
  return 'text-[--warning]';
}

export const TrendRadar: React.FC<TrendRadarProps> = ({
  candidates, onScanTrends, onSelectTrendForGeneration, isScanning,
}) => {
  const [filterMix, setFilterMix] = useState<'all' | ContentMixType>('all');
  const [search, setSearch] = useState('');

  const filtered = candidates.filter((c) => {
    const m = filterMix === 'all' || c.mixType === filterMix;
    const q = c.title.toLowerCase().includes(search.toLowerCase()) || c.summary.toLowerCase().includes(search.toLowerCase()) || c.category.toLowerCase().includes(search.toLowerCase());
    return m && q;
  });

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="h-1.5 w-1.5 rounded-full bg-[--accent] shadow-[0_0_8px_var(--color-accent)]" />
            <p className="eyebrow flex items-center gap-1.5">
              <Radar className="h-3.5 w-3.5" /> Intelligence Radar
            </p>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Trend Radar</h2>
          <p className="mt-0.5 text-[13px] sm:text-[14px] text-[--muted]">
            Multi-signal market intelligence and trending angles ready for autonomous synthesis
          </p>
        </div>

        <button 
          onClick={onScanTrends} 
          disabled={isScanning} 
          className="btn-primary self-start sm:self-auto shadow-lg"
        >
          {isScanning ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin shrink-0" />
              <span>Scanning Web Trends…</span>
            </>
          ) : (
            <>
              <Search className="h-4 w-4 shrink-0" />
              <span>Scan Trends Now</span>
            </>
          )}
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/[0.03] border border-[--border] overflow-x-auto no-scrollbar">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilterMix(f.id)}
              className={`btn-ghost text-[12px] px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                filterMix === f.id 
                  ? '!bg-[--accent-subtle] !text-[--accent] border-[--accent]/30 font-semibold' 
                  : 'text-[--muted]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[--muted]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search discovered topics…"
            className="w-full !pl-10"
          />
        </div>
      </div>

      {/* Candidates Grid */}
      {filtered.length > 0 ? (
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid gap-4 sm:gap-5 md:grid-cols-2 xl:grid-cols-3"
        >
          {filtered.map((c) => {
            const score = c.scores?.finalScore || 0;
            return (
              <motion.div 
                key={c.id} 
                variants={item}
                className="panel panel-hover p-5 flex flex-col justify-between cursor-pointer group" 
                onClick={() => onSelectTrendForGeneration(c)}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="badge badge-muted text-[9px]">{MIX_LABELS[c.mixType] || 'Trend'}</span>
                      <span className="badge text-[9px]">{c.category}</span>
                    </div>
                    <div className="flex items-baseline gap-1 pl-2 shrink-0">
                      <span className={`mono font-bold text-[16px] ${scoreColor(score)}`}>
                        {score}
                      </span>
                      <span className="text-[9px] uppercase font-bold text-[--muted]">Score</span>
                    </div>
                  </div>

                  <h3 className="text-[15px] font-bold leading-snug text-white group-hover:text-[--accent] transition-colors">
                    {c.title}
                  </h3>
                  <p className="mt-2 text-[12px] sm:text-[13px] text-[--fg-soft] line-clamp-3 leading-relaxed">
                    {c.summary}
                  </p>

                  <div className="mt-4 pt-3 border-t border-white/[0.04] space-y-2">
                    {(['serviceRelevance', 'audienceInterest', 'engagementPotential'] as const).map((k) => {
                      const val = c.scores?.[k] ?? 0;
                      const labelMap: Record<string, string> = {
                        serviceRelevance: 'Relevance',
                        audienceInterest: 'Virality',
                        engagementPotential: 'Engagement',
                      };
                      return (
                        <div key={k} className="flex items-center gap-2">
                          <span className="text-[10px] uppercase font-semibold text-[--muted] w-20 shrink-0">
                            {labelMap[k]}
                          </span>
                          <span className="score-track flex-1">
                            <span className="score-fill" style={{ width: `${val}%` }} />
                          </span>
                          <span className="mono text-[10px] text-[--fg-soft] w-7 text-right">{val}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-[--border] flex items-center justify-between gap-2">
                  <a 
                    href={c.sourceUrl || '#'} 
                    target="_blank" 
                    rel="noreferrer" 
                    onClick={(e) => e.stopPropagation()} 
                    className="flex items-center gap-1.5 text-[11px] text-[--muted] hover:text-[--accent] transition-colors min-w-0"
                  >
                    <Globe2 className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate max-w-[130px]">{c.sourceName || 'Web Citation'}</span>
                  </a>

                  <button
                    onClick={(e) => { e.stopPropagation(); onSelectTrendForGeneration(c); }}
                    className="btn-secondary text-[11px] !py-1.5 !px-3 font-semibold shrink-0"
                  >
                    <Sparkles className="h-3 w-3 text-[--accent]" />
                    <span>Synthesize</span>
                  </button>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      ) : (
        <div className="panel py-16 text-center space-y-3">
          <Radar className="mx-auto h-10 w-10 text-white/10" />
          <h3 className="font-semibold text-[15px] text-white">No trends found matching filter</h3>
          <p className="text-[13px] text-[--muted]">Click "Scan Trends Now" to discover fresh topics from the web.</p>
        </div>
      )}
    </div>
  );
};
