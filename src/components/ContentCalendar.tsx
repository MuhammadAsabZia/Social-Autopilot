import React, { useState } from 'react';
import { Calendar as CalendarIcon, CheckCircle2, Eye, Facebook, Instagram, Linkedin, Send } from 'lucide-react';
import { PlatformType, SocialMediaPostGroup } from '../types.js';

interface ContentCalendarProps {
  postGroups: SocialMediaPostGroup[];
  onSelectPostGroup: (group: SocialMediaPostGroup) => void;
  onPublishPostGroup: (id: string) => void;
}

const FILTERS = ['all', 'published', 'scheduled'] as const;
type Filter = typeof FILTERS[number];

const PLATFORMS: PlatformType[] = ['linkedin', 'instagram', 'facebook'];
const PLAT_ICON: Record<PlatformType, React.ComponentType<{ className?: string }>> = {
  linkedin: Linkedin, instagram: Instagram, facebook: Facebook,
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="eyebrow flex items-center gap-1.5"><CalendarIcon className="h-3.5 w-3.5" /> Pipeline</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight">Content Queue</h2>
          <p className="mt-0.5 text-[13px] text-[--muted]">Scheduled and published posts across all channels</p>
        </div>
        <div className="flex items-center gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`btn-ghost text-[12px] px-3 ${filter === f ? '!bg-[--accent]/12 !text-[--accent] border-[--accent]/25' : ''}`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)} <span className="ml-1 mono opacity-70">{counts[f]}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="panel overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <CalendarIcon className="mx-auto h-9 w-9 text-[--muted]" />
            <h3 className="mt-3 font-medium text-[--fg]">No posts in this view</h3>
            <p className="mt-1 text-[13px] text-[--muted]">Run Autopilot to generate content.</p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Topic</th>
                <th>Channels</th>
                <th>QC</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((group) => (
                <tr key={group.id}>
                  <td className="mono text-[--muted] whitespace-nowrap">{formatDateTime(group.createdAt)}</td>
                  <td>
                    <p className="font-medium text-[--fg] max-w-[320px] truncate">{group.coreTopic}</p>
                    <p className="text-[12px] text-[--muted] max-w-[320px] truncate">{group.coreIdea}</p>
                  </td>
                  <td>
                    <div className="flex items-center gap-1.5">
                      {PLATFORMS.map((p) => {
                        const Icon = PLAT_ICON[p];
                        return (
                          <span key={p} className="plat-chip" title={p}>
                            <Icon className="h-3 w-3" />
                          </span>
                        );
                      })}
                    </div>
                  </td>
                  <td className="mono text-[--accent] whitespace-nowrap">{group.qualityControl.score}/100</td>
                  <td>
                    <span className={`badge ${group.overallStatus === 'published' ? 'badge-success' : 'badge-muted'}`}>
                      {group.overallStatus === 'published' ? <><CheckCircle2 className="h-3 w-3" /> Published</> : 'Queued'}
                    </span>
                  </td>
                  <td className="text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <button onClick={() => onSelectPostGroup(group)} className="btn-icon" title="View"><Eye className="h-4 w-4" /></button>
                      <button onClick={() => onPublishPostGroup(group.id)} className="btn-primary text-[12px]" title="Dispatch">
                        <Send className="h-3.5 w-3.5" /><span className="hidden sm:inline">Dispatch</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
