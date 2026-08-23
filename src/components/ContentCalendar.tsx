import React, { useState } from 'react';
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  ExternalLink,
  Eye,
  Facebook,
  Instagram,
  Layers,
  Linkedin,
  SendHorizontal,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { PlatformType, SocialMediaPostGroup } from '../types.js';

interface ContentCalendarProps {
  postGroups: SocialMediaPostGroup[];
  onSelectPostGroup: (group: SocialMediaPostGroup) => void;
  onPublishPostGroup: (id: string) => void;
}

const FILTERS = ['all', 'published', 'scheduled'] as const;
type Filter = typeof FILTERS[number];

const PLATFORMS: PlatformType[] = ['linkedin', 'instagram', 'facebook'];
const PLAT_META: Record<PlatformType, { name: string; icon: React.ComponentType<{ className?: string }>; color: string }> = {
  linkedin: { name: 'LinkedIn', icon: Linkedin, color: 'text-[#0a66c2]' },
  instagram: { name: 'Instagram', icon: Instagram, color: 'text-[#e1306c]' },
  facebook: { name: 'Facebook', icon: Facebook, color: 'text-[#1877f2]' },
};

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) + ' · ' +
    d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export const ContentCalendar: React.FC<ContentCalendarProps> = ({
  postGroups, onSelectPostGroup, onPublishPostGroup,
}) => {
  const [filter, setFilter] = useState<Filter>('all');
  const filtered = postGroups.filter((p) => filter === 'all' || p.overallStatus === filter);
  const counts = {
    all: postGroups.length,
    published: postGroups.filter(p => p.overallStatus === 'published').length,
    scheduled: postGroups.filter(p => p.overallStatus === 'scheduled').length,
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="h-1.5 w-1.5 rounded-full bg-[--accent] shadow-[0_0_8px_var(--color-accent)]" />
            <p className="eyebrow flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5" /> Omnichannel Queue
            </p>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Content Queue</h2>
          <p className="mt-0.5 text-[13px] sm:text-[14px] text-[--muted]">
            Multi-platform generation history, quality metrics & dispatch status
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/[0.03] border border-[--border] self-start sm:self-auto">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`btn-ghost text-[12px] px-3 py-1.5 rounded-lg transition-all ${
                filter === f 
                  ? '!bg-[--accent-subtle] !text-[--accent] border-[--accent]/30 font-semibold' 
                  : 'text-[--muted]'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)} 
              <span className="ml-1.5 mono text-[11px] opacity-70">({counts[f]})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Table / Cards View */}
      <div className="panel overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <CalendarDays className="mx-auto h-10 w-10 text-white/10" />
            <h3 className="font-semibold text-[15px] text-white">No posts in this queue filter</h3>
            <p className="text-[13px] text-[--muted]">Run Autopilot or adjust your active filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto no-scrollbar">
            <table className="table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Core Angle & Hook</th>
                  <th>Channels</th>
                  <th>QC Score</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((group) => (
                  <tr key={group.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="mono text-[12px] text-[--muted] whitespace-nowrap">
                      {formatDateTime(group.createdAt)}
                    </td>
                    <td>
                      <div className="max-w-xs sm:max-w-md">
                        <p className="font-semibold text-[14px] text-white truncate group-hover:text-[--accent] transition-colors">
                          {group.coreTopic}
                        </p>
                        <p className="text-[12px] text-[--muted] truncate mt-0.5">
                          {group.coreIdea}
                        </p>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-1.5">
                        {PLATFORMS.map((p) => {
                          const meta = PLAT_META[p];
                          const Icon = meta.icon;
                          return (
                            <span key={p} className="plat-chip" title={meta.name}>
                              <Icon className={`h-3 w-3 ${meta.color}`} />
                            </span>
                          );
                        })}
                      </div>
                    </td>
                    <td className="whitespace-nowrap">
                      <span className="badge badge-accent mono text-[11px]">
                        <ShieldCheck className="h-3 w-3" /> {group.qualityControl.score}/100
                      </span>
                    </td>
                    <td className="whitespace-nowrap">
                      <span className={`badge ${group.overallStatus === 'published' ? 'badge-success' : 'badge-muted'}`}>
                        {group.overallStatus === 'published' ? (
                          <>
                            <CheckCircle2 className="h-3 w-3" /> Published
                          </>
                        ) : (
                          <>
                            <Clock className="h-3 w-3" /> Queued
                          </>
                        )}
                      </span>
                    </td>
                    <td className="text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => onSelectPostGroup(group)} 
                          className="btn-icon !h-8 !w-8" 
                          title="Inspect Post"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        <button 
                          onClick={() => onPublishPostGroup(group.id)} 
                          className="btn-primary text-[11px] !py-1.5 !px-3" 
                          title="Dispatch to Buffer"
                        >
                          <SendHorizontal className="h-3 w-3" />
                          <span className="hidden sm:inline">Dispatch</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
