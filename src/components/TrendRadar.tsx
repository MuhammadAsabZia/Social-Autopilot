import React, { useState } from 'react';
import { ExternalLink, Globe, Radio, RefreshCw, Search, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ContentMixType, TrendCandidate } from '../types.js';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } }
};

interface TrendRadarProps {
  candidates: TrendCandidate[];
  onScanTrends: () => void;
  onSelectTrendForGeneration: (trend: TrendCandidate) => void;
  isScanning: boolean;
}

const MIX_LABELS: Record<ContentMixType, string> = {
  service_expertise: 'Expertise',
  industry_trends: 'Trends',
  experimental_opinion: 'Experimental',
};

const FILTERS: { id: 'all' | ContentMixType; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'service_expertise', label: 'Expertise' },
  { id: 'industry_trends', label: 'Trends' },
  { id: 'experimental_opinion', label: 'Experimental' },
];

function scoreColor(score: number): string {
  if (score >= 90) return 'var(--color-accent)';
  if (score >= 75) return 'var(--color-success)';
  return 'var(--color-warning)';
}

export const TrendRadar: React.FC<TrendRadarProps> = ({
  candidates, onScanTrends, onSelectTrendForGeneration, isScanning,
}) => {
  const [filterMix, setFilterMix] = useState<'all' | ContentMixType>('all');
  const [search, setSearch] = useState('');

  const filtered = candidates.filter((c) => {
    const m = filterMix === 'all' || c.mixType === filterMix;
    const q = c.title.toLowerCase().includes(search.toLowerCase()) || c.summary.toLowerCase().includes(search.toLowerCase());
    return m && q;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="eyebrow flex items-center gap-1.5"><Radio className="h-3.5 w-3.5" /> Intelligence</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight">Trend Radar</h2>
          <p className="mt-0.5 text-[13px] text-[--muted]">AI-researched topics scored across seven signals</p>
        </div>
        <button onClick={onScanTrends} disabled={isScanning} className="btn-primary self-start">
          {isScanning ? <><RefreshCw className="h-4 w-4 animate-spin" /><span>Scanning…</span></> : <><Search className="h-4 w-4" /><span>Scan Trends</span></>}
        </button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilterMix(f.id)}
              className={`btn-ghost text-[12px] px-3 ${filterMix === f.id ? '!bg-[--accent]/12 !text-[--accent] border-[--accent]/25' : ''}`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter topics…"
          className="w-full sm:w-64"
        />
      </div>

      {filtered.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((c) => {
            const score = c.scores?.finalScore || 0;
            return (
              <div key={c.id} className="panel panel-hover p-4 flex flex-col cursor-pointer" onClick={() => onSelectTrendForGeneration(c)}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="badge-muted">{MIX_LABELS[c.mixType]}</span>
                    <span className="badge">{c.category}</span>
                  </div>
                  <span className="mono font-semibold" style={{ color: scoreColor(score) }}>{score}</span>
                </div>

                <h3 className="mt-2.5 text-[14px] font-semibold leading-snug text-[--fg]">{c.title}</h3>
                <p className="mt-1 text-[12px] text-[--muted] line-clamp-2 flex-1">{c.summary}</p>

                <div className="mt-3 space-y-1.5">
                  {(['serviceRelevance', 'audienceInterest', 'engagementPotential'] as const).map((k) => (
                    <div key={k} className="flex items-center gap-2">
                      <span className="text-[10px] uppercase tracking-wide text-[--muted] w-20 shrink-0">{k.replace(/([A-Z])/g, ' $1')}</span>
                      <span className="score-track flex-1">
                        <span className="score-fill" style={{ width: `${c.scores?.[k] ?? 0}%` }} />
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-3 pt-3 border-t border-[--border] flex items-center justify-between">
                  <a href={c.sourceUrl || '#'} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="flex items-center gap-1 text-[11px] text-[--muted] hover:text-[--accent]">
                    <Globe className="h-3 w-3" /><span className="truncate max-w-[120px]">{c.sourceName || 'Source'}</span>
                  </a>
                  <button
                    onClick={(e) => { e.stopPropagation(); onSelectTrendForGeneration(c); }}
                    className="btn-secondary text-[11px]"
                  >
                    <Sparkles className="h-3.5 w-3.5" /><span>Generate</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="panel py-16 text-center">
          <Radio className="mx-auto h-9 w-9 text-[--muted]" />
          <h3 className="mt-3 font-medium text-[--fg]">No trends found</h3>
          <p className="mt-1 text-[13px] text-[--muted]">Run a scan to discover topics.</p>
        </div>
      )}
    </div>
  );
};
