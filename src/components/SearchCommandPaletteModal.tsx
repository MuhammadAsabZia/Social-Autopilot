import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowRight,
  Brain,
  Calendar,
  Command,
  FileText,
  Key,
  Layers,
  PenTool,
  Play,
  Plus,
  Radio,
  Search,
  Sliders,
  Sparkles,
  TrendingUp,
  UserPlus,
  Users,
  Workflow,
  X,
  Zap,
} from 'lucide-react';
import { motion } from 'motion/react';
import { SocialMediaPostGroup, TrendCandidate, WorkspaceProfile } from '../types.js';

interface SearchCommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  postGroups: SocialMediaPostGroup[];
  trendCandidates: TrendCandidate[];
  workspaces: WorkspaceProfile[];
  onSelectPostGroup: (group: SocialMediaPostGroup) => void;
  onNavigateTab: (tabId: any) => void;
  onSwitchWorkspace: (workspaceId: string) => void;
  onOpenPipeline: () => void;
  onOpenStudio: () => void;
  onOpenBrandBrain: () => void;
  onOpenBufferSettings: () => void;
  onOpenUserModal: () => void;
}

export const SearchCommandPaletteModal: React.FC<SearchCommandPaletteModalProps> = ({
  isOpen,
  onClose,
  postGroups,
  trendCandidates,
  workspaces,
  onSelectPostGroup,
  onNavigateTab,
  onSwitchWorkspace,
  onOpenPipeline,
  onOpenStudio,
  onOpenBrandBrain,
  onOpenBufferSettings,
  onOpenUserModal,
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const trimmed = query.trim().toLowerCase();

  // Filter posts
  const filteredPosts = postGroups.filter(
    (g) =>
      g.coreTopic.toLowerCase().includes(trimmed) ||
      g.posts.linkedin?.hook.toLowerCase().includes(trimmed) ||
      g.posts.linkedin?.body.toLowerCase().includes(trimmed) ||
      g.mixType.toLowerCase().includes(trimmed)
  );

  // Filter trends
  const filteredTrends = trendCandidates.filter(
    (t) =>
      t.title.toLowerCase().includes(trimmed) ||
      t.sourceSummary?.toLowerCase().includes(trimmed) ||
      t.category?.toLowerCase().includes(trimmed)
  );

  // Filter workspaces
  const filteredWorkspaces = workspaces.filter(
    (w) =>
      w.name.toLowerCase().includes(trimmed) ||
      w.brandPositioning?.toLowerCase().includes(trimmed)
  );

  // System Actions
  const SYSTEM_ACTIONS = [
    {
      id: 'action_run_pipeline',
      title: 'Run Autopilot Cycle',
      desc: 'Scan radar signals, synthesize drafts, generate blueprints & audit QC',
      icon: Play,
      color: 'text-[--accent]',
      action: () => {
        onClose();
        onOpenPipeline();
      },
    },
    {
      id: 'action_studio',
      title: 'Create Post in AI Studio',
      desc: 'Draft bespoke multi-platform post with custom hook options',
      icon: PenTool,
      color: 'text-[#38bdf8]',
      action: () => {
        onClose();
        onOpenStudio();
      },
    },
    {
      id: 'action_invite',
      title: 'Invite Team Member or Client Reviewer',
      desc: 'Generate secure access token and assign workspace roles',
      icon: UserPlus,
      color: 'text-[#34d399]',
      action: () => {
        onClose();
        onOpenUserModal();
      },
    },
    {
      id: 'action_brand_brain',
      title: 'Edit Brand Brain & Positioning',
      desc: 'Fine-tune tone of voice, content pillar percentages, and forbidden phrases',
      icon: Brain,
      color: 'text-[#f472b6]',
      action: () => {
        onClose();
        onOpenBrandBrain();
      },
    },
    {
      id: 'action_buffer',
      title: 'Configure Buffer API & Dispatch Channels',
      desc: 'Manage social channel bindings and posting schedule intervals',
      icon: Key,
      color: 'text-[#fbbf24]',
      action: () => {
        onClose();
        onOpenBufferSettings();
      },
    },
  ];

  const filteredActions = SYSTEM_ACTIONS.filter(
    (a) => a.title.toLowerCase().includes(trimmed) || a.desc.toLowerCase().includes(trimmed)
  );

  return (
    <div className="fixed inset-0 z-[110] flex items-start justify-center pt-16 sm:pt-24 p-3 sm:p-4 bg-black/85 backdrop-blur-xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: -10 }}
        className="w-full max-w-2xl rounded-2xl bg-[#0c0f17] border border-white/[0.14] shadow-[0_25px_70px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col max-h-[80vh]"
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-white/[0.08] bg-[#111520] gap-3">
          <Search className="h-5 w-5 text-[--accent] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search queued posts, radar signals, workspaces, or type a command..."
            className="flex-1 bg-transparent text-sm text-white placeholder-white/40 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-md text-[--muted] hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 text-[10px] font-mono font-medium rounded bg-white/[0.06] text-[--muted] border border-white/[0.08]">
            ESC to close
          </kbd>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[--muted] hover:text-white sm:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="p-3 overflow-y-auto space-y-4 flex-1 no-scrollbar text-xs">
          {/* 1. System Commands & Quick Actions */}
          {filteredActions.length > 0 && (
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-[--muted] uppercase tracking-wider px-2 block">
                Quick Commands
              </span>
              {filteredActions.map((act) => {
                const Icon = act.icon;
                return (
                  <button
                    key={act.id}
                    onClick={act.action}
                    className="w-full p-2.5 rounded-xl hover:bg-white/[0.06] transition-colors flex items-center justify-between text-left group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`p-2 rounded-lg bg-white/[0.04] ${act.color} shrink-0`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="font-semibold text-white block group-hover:text-[--accent] transition-colors truncate">
                          {act.title}
                        </span>
                        <span className="text-[11px] text-[--muted] truncate block">
                          {act.desc}
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-[--muted] group-hover:text-white shrink-0 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                );
              })}
            </div>
          )}

          {/* 2. Content Queue / Post Groups */}
          {filteredPosts.length > 0 && (
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-[--muted] uppercase tracking-wider px-2 block">
                Queued Social Posts ({filteredPosts.length})
              </span>
              {filteredPosts.slice(0, 5).map((group) => (
                <button
                  key={group.id}
                  onClick={() => {
                    onClose();
                    onSelectPostGroup(group);
                  }}
                  className="w-full p-2.5 rounded-xl hover:bg-white/[0.06] transition-colors flex items-center justify-between text-left group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 rounded-lg bg-[--accent]/10 text-[--accent] shrink-0">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="font-semibold text-white block group-hover:text-[--accent] transition-colors truncate">
                        {group.coreTopic}
                      </span>
                      <span className="text-[11px] text-[--fg-soft] truncate block">
                        {group.posts.linkedin?.hook || group.posts.facebook?.hook}
                      </span>
                    </div>
                  </div>
                  <div className="shrink-0 flex items-center gap-2">
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#34d399]/20 text-[#34d399]">
                      QC {group.qualityControl?.score || 95}
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 text-[--muted] group-hover:text-white" />
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* 3. Radar Signal Trends */}
          {filteredTrends.length > 0 && (
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-[--muted] uppercase tracking-wider px-2 block">
                Signal Radar Trends ({filteredTrends.length})
              </span>
              {filteredTrends.slice(0, 4).map((trend) => (
                <button
                  key={trend.id}
                  onClick={() => {
                    onClose();
                    onNavigateTab('radar');
                  }}
                  className="w-full p-2.5 rounded-xl hover:bg-white/[0.06] transition-colors flex items-center justify-between text-left group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 rounded-lg bg-[#38bdf8]/10 text-[#38bdf8] shrink-0">
                      <TrendingUp className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="font-semibold text-white block group-hover:text-[#38bdf8] transition-colors truncate">
                        {trend.title}
                      </span>
                      <span className="text-[11px] text-[--muted] truncate block">
                        Relevance: {trend.relevanceScore}/100 • Velocity: {trend.velocityScore}/100
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-[--muted] group-hover:text-white shrink-0" />
                </button>
              ))}
            </div>
          )}

          {/* 4. Client Workspaces */}
          {filteredWorkspaces.length > 0 && (
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-[--muted] uppercase tracking-wider px-2 block">
                Client Workspaces
              </span>
              {filteredWorkspaces.map((ws) => (
                <button
                  key={ws.id}
                  onClick={() => {
                    onClose();
                    onSwitchWorkspace(ws.id);
                  }}
                  className="w-full p-2.5 rounded-xl hover:bg-white/[0.06] transition-colors flex items-center justify-between text-left group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 rounded-lg bg-white/[0.04] text-[--fg-soft] shrink-0">
                      <Layers className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="font-semibold text-white block group-hover:text-[--accent] transition-colors truncate">
                        {ws.name}
                      </span>
                      <span className="text-[11px] text-[--muted] truncate block">
                        {ws.brandPositioning || 'Client profile'}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-[--muted] uppercase">
                    Switch
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Empty state if nothing matched */}
          {filteredActions.length === 0 &&
            filteredPosts.length === 0 &&
            filteredTrends.length === 0 &&
            filteredWorkspaces.length === 0 && (
              <div className="p-8 text-center text-[--muted]">
                <Search className="h-8 w-8 mx-auto mb-2 text-[--muted]/50" />
                <p className="text-xs text-white font-medium">No results found for &ldquo;{query}&rdquo;</p>
                <p className="text-[11px] mt-1">Try searching for &quot;pipeline&quot;, &quot;trends&quot;, &quot;buffer&quot;, or &quot;invite&quot;</p>
              </div>
            )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2.5 bg-[#080a10] border-t border-white/[0.06] flex items-center justify-between text-[11px] text-[--muted]">
          <div className="flex items-center gap-3">
            <span><strong>↑↓</strong> to navigate</span>
            <span><strong>↵</strong> to select</span>
          </div>
          <span>Autopilot Command Center</span>
        </div>
      </motion.div>
    </div>
  );
};
