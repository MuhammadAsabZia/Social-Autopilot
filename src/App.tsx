import React, { useEffect, useState } from 'react';
import {
  Activity,
  BarChart3,
  Bell,
  Bot,
  Brain,
  BrainCircuit,
  Calendar,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleDot,
  Clock,
  Compass,
  Cpu,
  HelpCircle,
  Layers,
  LayoutDashboard,
  Menu,
  MoreHorizontal,
  PanelLeftClose,
  PanelLeftOpen,
  PenTool,
  Play,
  Plus,
  Radar,
  Radio,
  RefreshCw,
  Search,
  SendHorizontal,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  TrendingUp,
  Workflow,
  X,
  Zap,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Dashboard } from './components/Dashboard.js';
import { TrendRadar } from './components/TrendRadar.js';
import { ContentCalendar } from './components/ContentCalendar.js';
import { AnalyticsView } from './components/AnalyticsView.js';
import { BrandBrainModal } from './components/BrandBrainModal.js';
import { BufferSettingsModal } from './components/BufferSettingsModal.js';
import { PipelineExecutionModal } from './components/PipelineExecutionModal.js';
import { PostDetailModal } from './components/PostDetailModal.js';
import { PostStudioModal } from './components/PostStudioModal.js';
import { WorkspaceSwitcher } from './components/WorkspaceSwitcher.js';
import { DEFAULT_PROFILES, UserProfileModal } from './components/UserProfileModal.js';
import { HelpCenterModal } from './components/HelpCenterModal.js';
import { SearchCommandPaletteModal } from './components/SearchCommandPaletteModal.js';
import { AuthGatewayModal } from './components/AuthGatewayModal.js';
import { AdminApprovalHubModal } from './components/AdminApprovalHubModal.js';
import {
  AutopilotRunProgress,
  BrandBrainConfig,
  BufferConfig,
  PlatformType,
  SchedulerState,
  SocialMediaPostGroup,
  TrendCandidate,
  UserAccount,
  UserProfile,
  WeeklyStrategyInsight,
  WorkspaceProfile,
} from './types.js';

type TabId = 'dashboard' | 'calendar' | 'radar' | 'analytics';

interface NavItemDef {
  id: TabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badgeCount?: (postCount: number, trendCount: number) => number | null;
}

const NAV_ITEMS: NavItemDef[] = [
  { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
  { id: 'calendar', label: 'Content Queue', icon: Layers, badgeCount: (p) => (p > 0 ? p : 12) },
  { id: 'radar', label: 'Trend Radar', icon: Activity, badgeCount: (_, t) => (t > 0 ? t : 4) },
  { id: 'analytics', label: 'AI Strategy', icon: BrainCircuit },
];

export function App() {
  const [activeTab, setActiveTab] = useState<TabId>(() => {
    const saved = sessionStorage.getItem('autopilot-active-tab');
    return saved === 'calendar' || saved === 'radar' || saved === 'analytics' ? saved : 'dashboard';
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Multi-User Profile State
  const [availableUsers, setAvailableUsers] = useState<UserProfile[]>(() => {
    try {
      const saved = localStorage.getItem('autopilot-users');
      return saved ? JSON.parse(saved) : DEFAULT_PROFILES;
    } catch {
      return DEFAULT_PROFILES;
    }
  });

  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('autopilot-current-user');
      if (saved) return JSON.parse(saved);
      // Default to Mara Rivera as in reference or Asab
      return DEFAULT_PROFILES[0];
    } catch {
      return DEFAULT_PROFILES[0];
    }
  });

  const changeTab = (tab: TabId) => {
    sessionStorage.setItem('autopilot-active-tab', tab);
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  const [schedulerState, setSchedulerState] = useState<SchedulerState | null>(null);
  const [progress, setProgress] = useState<AutopilotRunProgress | null>(null);
  const [postGroups, setPostGroups] = useState<SocialMediaPostGroup[]>([]);
  const [trendCandidates, setTrendCandidates] = useState<TrendCandidate[]>(() => {
    try {
      const saved = sessionStorage.getItem('autopilot-trend-candidates');
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });
  const [strategyInsights, setStrategyInsights] = useState<WeeklyStrategyInsight[]>([]);
  const [brandBrain, setBrandBrain] = useState<BrandBrainConfig | null>(null);
  const [bufferConfig, setBufferConfig] = useState<BufferConfig | null>(null);
  const [workspaces, setWorkspaces] = useState<WorkspaceProfile[]>([]);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string>('ws_agency_default');

  const [stats, setStats] = useState({
    totalPosts: 0,
    publishedCount: 0,
    scheduledCount: 0,
    bufferConnected: false,
    bufferSimulated: true,
    automationEnabled: true,
  });

  // Modal controls
  const [showUserProfileModal, setShowUserProfileModal] = useState(false);
  const [showHelpCenterModal, setShowHelpCenterModal] = useState(false);
  const [showBrandBrainModal, setShowBrandBrainModal] = useState(false);
  const [showBufferModal, setShowBufferModal] = useState(false);
  const [showPipelineModal, setShowPipelineModal] = useState(false);
  const [showPostStudioModal, setShowPostStudioModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showAuthGatewayModal, setShowAuthGatewayModal] = useState<boolean>(() => {
    // Check if first visit without authenticated user
    const saved = localStorage.getItem('autopilot_authenticated_user');
    return !saved;
  });
  const [showAdminApprovalHubModal, setShowAdminApprovalHubModal] = useState(false);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPostGroup, setSelectedPostGroup] = useState<SocialMediaPostGroup | null>(null);

  const [isExecuting, setIsExecuting] = useState(false);
  const [isScanningTrends, setIsScanningTrends] = useState(false);
  const [isGeneratingStrategy, setIsGeneratingStrategy] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearchModal((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const fetchPendingRequestsCount = async () => {
    try {
      const res = await fetch('/api/auth/requests');
      if (res.ok) {
        const data = await res.json();
        const pending = (data.requests || []).filter((r: any) => r.status === 'pending').length;
        setPendingRequestsCount(pending);
      }
    } catch {
      // ignore
    }
  };

  const fetchAllData = async () => {
    try {
      const fetchJson = async (url: string, defaultVal: any) => {
        try {
          const res = await fetch(url);
          if (!res.ok) return defaultVal;
          return await res.json();
        } catch {
          return defaultVal;
        }
      };

      const [statusRes, brainRes, bufferRes, postsRes, insightsRes, workspacesRes, reqRes] = await Promise.all([
        fetchJson('/api/status', {}),
        fetchJson('/api/brand-brain', null),
        fetchJson('/api/buffer-config', null),
        fetchJson('/api/post-groups', []),
        fetchJson('/api/strategy-insights', []),
        fetchJson('/api/workspaces', {}),
        fetchJson('/api/auth/requests', { requests: [] }),
      ]);

      if (statusRes?.scheduler) setSchedulerState(statusRes.scheduler);
      if (statusRes?.progress) {
        setProgress(statusRes.progress);
        if (statusRes.progress.step !== 'idle' && statusRes.progress.step !== 'completed') {
          setIsExecuting(true);
        }
      }
      if (statusRes?.stats) setStats(statusRes.stats);
      if (statusRes?.workspaces) setWorkspaces(statusRes.workspaces);
      if (statusRes?.activeWorkspaceId) setActiveWorkspaceId(statusRes.activeWorkspaceId);
      if (workspacesRes?.workspaces) setWorkspaces(workspacesRes.workspaces);
      if (workspacesRes?.activeWorkspaceId) setActiveWorkspaceId(workspacesRes.activeWorkspaceId);

      if (reqRes?.requests) {
        const pending = reqRes.requests.filter((r: any) => r.status === 'pending').length;
        setPendingRequestsCount(pending);
      }

      if (brainRes) setBrandBrain(brainRes);
      if (bufferRes) setBufferConfig(bufferRes);
      if (Array.isArray(postsRes)) setPostGroups(postsRes);
      if (Array.isArray(insightsRes)) setStrategyInsights(insightsRes);
    } catch (err) {
      console.warn('Backend sync:', err);
    }
  };

  const handleAuthSuccess = (user: UserAccount) => {
    setShowAuthGatewayModal(false);
    const convertedProfile: UserProfile = {
      id: user.id,
      name: user.name,
      email: user.email,
      avatarInitials: user.avatarInitials,
      role: user.role === 'author' ? 'Agency Owner & Lead Author' : `${user.role.toUpperCase()} Reviewer`,
      avatarColor: user.avatarColor || 'from-[#e5be49] to-[#a68424]',
      plan: user.plan || 'enterprise',
      joinedDate: user.joinedDate || 'August 2024',
      status: 'active',
      bio: user.bio,
    };
    setCurrentUser(convertedProfile);
    localStorage.setItem('autopilot-current-user', JSON.stringify(convertedProfile));
    fetchAllData();
  };

  const handleSelectUser = (user: UserProfile) => {
    setCurrentUser(user);
    localStorage.setItem('autopilot-current-user', JSON.stringify(user));
  };

  const handleCreateUser = (newUser: Omit<UserProfile, 'id' | 'joinedDate' | 'status'>) => {
    const created: UserProfile = {
      ...newUser,
      id: `user_${Date.now()}`,
      joinedDate: 'August 2026',
      status: 'active',
    };
    const updatedList = [...availableUsers, created];
    setAvailableUsers(updatedList);
    setCurrentUser(created);
    localStorage.setItem('autopilot-users', JSON.stringify(updatedList));
    localStorage.setItem('autopilot-current-user', JSON.stringify(created));
  };

  const handleUpdateCurrentUser = (updated: Partial<UserProfile>) => {
    const updatedUser = { ...currentUser, ...updated };
    setCurrentUser(updatedUser);
    const updatedList = availableUsers.map((u) => (u.id === updatedUser.id ? updatedUser : u));
    setAvailableUsers(updatedList);
    localStorage.setItem('autopilot-users', JSON.stringify(updatedList));
    localStorage.setItem('autopilot-current-user', JSON.stringify(updatedUser));
  };

  const handleSwitchWorkspace = async (workspaceId: string) => {
    try {
      const res = await fetch('/api/workspaces/switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspaceId }),
      });
      const data = await res.json();
      if (data.success) {
        setActiveWorkspaceId(workspaceId);
        if (data.brandBrain) setBrandBrain(data.brandBrain);
        if (data.bufferConfig) setBufferConfig(data.bufferConfig);
        fetchAllData();
      }
    } catch (err) {
      console.error('Failed to switch workspace:', err);
    }
  };

  const handleCreateWorkspace = async (name: string, positioning?: string, tone?: string) => {
    try {
      const baseBrain: Partial<BrandBrainConfig> = {
        services: brandBrain?.services || ['AI Automation', 'AI Agents'],
        skills: brandBrain?.skills || ['Autonomous Agents', 'Workflow Automation'],
        targetAudience: brandBrain?.targetAudience || 'Founders & CTOs',
        brandPositioning: positioning || name,
        toneOfVoice: tone || 'Authoritative and direct',
      };
      const res = await fetch('/api/workspaces/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, brandBrain: baseBrain }),
      });
      const data = await res.json();
      if (data.success && data.workspace) {
        setActiveWorkspaceId(data.workspace.id);
        fetchAllData();
      }
    } catch (err) {
      console.error('Failed to create workspace:', err);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    let timer: any;
    if (isExecuting) {
      timer = setInterval(async () => {
        try {
          const res = await fetch('/api/autopilot/progress');
          if (!res.ok) return;
          const p: AutopilotRunProgress = await res.json();
          setProgress(p);
          if (p.step === 'completed' || p.step === 'error') {
            setIsExecuting(false);
            fetchAllData();
          }
        } catch (err) {
          console.warn('Progress poll:', err);
        }
      }, 1500);
    }
    return () => clearInterval(timer);
  }, [isExecuting]);

  const handleTriggerAutopilot = async () => {
    setIsExecuting(true);
    setShowPipelineModal(true);
    try {
      await fetch('/api/autopilot/run', { method: 'POST' });
    } catch (err) {
      console.error(err);
      setIsExecuting(false);
    }
  };

  const handleToggleAutomation = async (enabled: boolean) => {
    try {
      const res = await fetch('/api/autopilot/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.scheduler) setSchedulerState(data.scheduler);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveBrandBrain = async (updated: BrandBrainConfig) => {
    try {
      const res = await fetch('/api/brand-brain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.brandBrain) setBrandBrain(data.brandBrain);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveBufferConfig = async (updated: BufferConfig) => {
    try {
      const res = await fetch('/api/buffer-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.bufferConfig) setBufferConfig(data.bufferConfig);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleScanTrends = async () => {
    setIsScanningTrends(true);
    try {
      const res = await fetch('/api/trends/scan', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.candidates)) {
          setTrendCandidates(data.candidates);
          sessionStorage.setItem('autopilot-trend-candidates', JSON.stringify(data.candidates));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsScanningTrends(false);
    }
  };

  const handleGenerateStrategy = async () => {
    setIsGeneratingStrategy(true);
    try {
      const res = await fetch('/api/strategy/generate', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        if (data.insight) setStrategyInsights((prev) => [data.insight, ...prev]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingStrategy(false);
    }
  };

  const handleRegeneratePost = async (platform: PlatformType) => {
    if (!latestPost) return;
    try {
      const res = await fetch('/api/posts/regenerate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postGroupId: latestPost.id, platform }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.postGroup) {
          setPostGroups((prev) => prev.map((g) => (g.id === data.postGroup.id ? data.postGroup : g)));
          if (selectedPostGroup?.id === data.postGroup.id) setSelectedPostGroup(data.postGroup);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePublishPostGroup = async (postGroup: SocialMediaPostGroup) => {
    try {
      const res = await fetch('/api/posts/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postGroupId: postGroup.id }),
      });
      if (res.ok) {
        const data = await res.json();
        fetchAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const activeNav = NAV_ITEMS.find((n) => n.id === activeTab) || NAV_ITEMS[0];
  const latestPost = postGroups[0] || null;
  const activeWorkspace = workspaces.find((w) => w.id === activeWorkspaceId) || workspaces[0];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#07080b] text-[#f4f6f9]">
      {/* Background Ambience */}
      <div className="smoky-bg">
        <div className="smoke-particle top-[-10%] left-[20%] w-[500px] h-[500px]" />
        <div className="smoke-particle bottom-[-10%] right-[10%] w-[600px] h-[600px] [animation-delay:-8s]" />
      </div>

      {/* ===== 1. LEFT SIDEBAR (Structurally Matches Autopilot-command-center.png) ===== */}
      <aside className="hidden md:flex flex-col w-64 border-r border-white/[0.08] bg-[#090b10] z-30 shrink-0 select-none">
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/[0.06]">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.06] border border-white/[0.08] text-white shrink-0 shadow-sm">
            <Sparkles className="h-4.5 w-4.5 text-[--accent]" />
          </div>
          <div className="min-w-0">
            <span className="font-bold tracking-tight text-[16px] text-white block leading-tight">
              autopilot
            </span>
            <span className="text-[9px] font-bold uppercase tracking-widest text-[--muted] block mt-0.5">
              SOCIAL OPERATOR
            </span>
          </div>
        </div>

        {/* WORKSPACE Section Header */}
        <div className="px-5 pt-5 pb-2 text-[10px] font-bold uppercase tracking-wider text-[--muted]">
          Workspace
        </div>

        {/* Navigation Items with count badges */}
        <nav className="px-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const badge = item.badgeCount
              ? item.badgeCount(postGroups.length, trendCandidates.length)
              : null;

            return (
              <button
                key={item.id}
                onClick={() => changeTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-white/[0.08] text-white shadow-sm'
                    : 'text-[--muted] hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon
                    className={`h-4 w-4 shrink-0 ${
                      isActive ? 'text-[--accent]' : 'text-[--muted]'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>
                {badge !== null && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                      isActive ? 'text-white' : 'text-[--muted]'
                    }`}
                  >
                    {badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* Dedicated AI Post Studio Nav Button */}
          <button
            onClick={() => setShowPostStudioModal(true)}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-[--accent] hover:bg-[--accent-subtle] border border-[--accent]/20 transition-all mt-2"
          >
            <div className="flex items-center gap-3">
              <PenTool className="h-4 w-4 shrink-0 text-[--accent]" />
              <span>AI Post Studio</span>
            </div>
            <span className="text-[9px] uppercase px-1 py-0.5 rounded bg-[--accent] text-black font-extrabold">
              NEW
            </span>
          </button>
        </nav>

        {/* Bottom Section of Sidebar */}
        <div className="mt-auto p-4 space-y-3.5 border-t border-white/[0.06]">
          {/* OPERATOR HEALTH Card (Matches Reference Image) */}
          <div className="p-3.5 rounded-xl bg-black/40 border border-white/[0.08] space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-white">
              <span className="text-[10px] uppercase font-bold text-[--muted] tracking-wider">
                OPERATOR HEALTH
              </span>
              <span className="h-2 w-2 rounded-full bg-[#34d399] animate-pulse" />
            </div>
            <p className="text-xs text-white font-medium">Everything is in sync.</p>
            {/* Glowing health bar */}
            <div className="h-1 w-full bg-white/[0.06] rounded-full overflow-hidden">
              <div className="h-full w-full bg-gradient-to-r from-[#34d399] to-[#10b981]" />
            </div>
            <p className="text-[10px] text-[--muted]">Last checked 2 min ago</p>
          </div>

          {/* Quick Nav Links: Settings & Help */}
          <div className="space-y-0.5 text-xs font-medium text-[--muted]">
            <button
              onClick={() => setShowUserProfileModal(true)}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:text-white hover:bg-white/[0.04] transition-colors text-left"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span>Workspace settings</span>
            </button>
            <button
              onClick={() => setShowHelpCenterModal(true)}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:text-white hover:bg-white/[0.04] transition-colors text-left"
            >
              <HelpCircle className="h-3.5 w-3.5" />
              <span>Help center</span>
            </button>
          </div>

          {/* User Profile Bar at Bottom (Matches Reference) */}
          <div
            onClick={() => setShowUserProfileModal(true)}
            className="p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] flex items-center justify-between cursor-pointer transition-all group"
            title="Manage profile, switch user, or configure settings"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br ${
                  currentUser.avatarColor || 'from-[#8b5cf6] to-[#6d28d9]'
                } text-black font-extrabold text-xs shrink-0 shadow-sm`}
              >
                {currentUser.avatarInitials}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate group-hover:text-[--accent] transition-colors">
                  {currentUser.name}
                </p>
                <p className="text-[10px] text-[--muted] truncate">{currentUser.role}</p>
              </div>
            </div>
            <button className="p-1 rounded-lg text-[--muted] group-hover:text-white transition-colors">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ===== MOBILE DRAWER ===== */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden"
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="fixed inset-y-0 left-0 w-72 bg-[#090b10] border-r border-white/[0.08] p-5 z-50 flex flex-col justify-between md:hidden shadow-2xl"
            >
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.06] text-white">
                      <Sparkles className="h-4 w-4 text-[--accent]" />
                    </div>
                    <div>
                      <span className="font-bold text-[15px] text-white block leading-none">
                        autopilot
                      </span>
                      <span className="text-[8px] font-bold uppercase tracking-widest text-[--muted]">
                        SOCIAL OPERATOR
                      </span>
                    </div>
                  </div>
                  <button onClick={() => setMobileMenuOpen(false)} className="btn-icon">
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-4">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setShowPostStudioModal(true);
                    }}
                    className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5 px-3 font-bold text-xs bg-[--accent] text-black shadow-md"
                  >
                    <PenTool className="h-4 w-4" />
                    <span>Open AI Post Studio</span>
                  </button>
                </div>

                <nav className="mt-4 space-y-1.5">
                  {NAV_ITEMS.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => changeTab(item.id)}
                        className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold ${
                          isActive
                            ? 'bg-white/[0.08] text-white'
                            : 'text-[--muted] hover:text-white'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>

              <div className="space-y-2 pt-4 border-t border-white/[0.08]">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setShowUserProfileModal(true);
                  }}
                  className="btn-secondary w-full justify-start text-xs"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  <span>User & Workspace Settings</span>
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setShowHelpCenterModal(true);
                  }}
                  className="btn-secondary w-full justify-start text-xs"
                >
                  <HelpCircle className="h-4 w-4" />
                  <span>Help Center & Guide</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ===== 2. MAIN CONTENT AREA & TOP BAR ===== */}
      <div className="flex flex-1 flex-col min-w-0 relative z-10">
        {/* Top Header Bar (Breadcrumbs, Search, Notifications, Profile Pill) */}
        <header className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8 border-b border-white/[0.06] bg-[#07080b]/90 backdrop-blur-md z-20 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="flex md:hidden btn-icon !h-8 !w-8"
              aria-label="Open mobile menu"
            >
              <Menu className="h-4 w-4" />
            </button>

            {/* Breadcrumb Hierarchy: Workspace > Overview */}
            <div className="flex items-center gap-2 text-xs font-medium text-[--muted]">
              <span className="text-[--muted]">Workspace</span>
              <ChevronRight className="h-3.5 w-3.5 text-white/20" />
              <span className="text-white font-semibold">{activeNav.label}</span>
            </div>

            <div className="h-4 w-[1px] bg-white/[0.1] hidden sm:block mx-1" />

            {/* Brand / Multi-Workspace Switcher */}
            <WorkspaceSwitcher
              workspaces={workspaces}
              activeWorkspaceId={activeWorkspaceId}
              onSwitchWorkspace={handleSwitchWorkspace}
              onCreateWorkspace={handleCreateWorkspace}
            />
          </div>

          {/* Center: Integrated Omnisearch Command Bar */}
          <div className="hidden md:flex flex-1 max-w-sm lg:max-w-md mx-3 lg:mx-6 min-w-0">
            <button
              onClick={() => setShowSearchModal(true)}
              className="w-full flex items-center justify-between px-3.5 py-1.5 rounded-xl bg-[#0c0f17] border border-white/[0.08] hover:border-white/[0.18] hover:bg-[#111520] text-left text-xs transition-all shadow-sm group"
              title="Quick Search & Commands (⌘K)"
            >
              <div className="flex items-center gap-2.5 text-[--muted] group-hover:text-[--fg-soft] truncate">
                <Search className="h-3.5 w-3.5 text-[--accent] shrink-0" />
                <span className="truncate">Search queue, trends, commands...</span>
              </div>
              <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono font-medium rounded bg-white/[0.06] text-[--muted] border border-white/[0.08] shrink-0">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Right Header Utilities: Search (mobile), Bell, Post Studio, User Profile Pill */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            {/* Search Icon for mobile */}
            <button
              onClick={() => setShowSearchModal(true)}
              className="btn-icon !h-8 !w-8 text-[--muted] hover:text-white md:hidden"
              title="Search trends & commands"
            >
              <Search className="h-4 w-4" />
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => changeTab('calendar')}
                className="btn-icon !h-8 !w-8 text-[--muted] hover:text-white relative"
                title="Notifications"
              >
                <Bell className="h-4 w-4" />
                <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-[#34d399]" />
              </button>
            </div>

            {/* Admin Approvals & Gmail Dispatch Button */}
            <button
              onClick={() => setShowAdminApprovalHubModal(true)}
              className="btn-secondary hidden lg:inline-flex text-[11px] !py-1.5 !px-2.5 font-semibold border-blue-500/30 text-blue-300 hover:!bg-blue-500/10 items-center gap-1.5 shadow-sm"
              title="Admin Access Requests & Gmail Integration Hub"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-blue-400" />
              <span>Approvals</span>
              {pendingRequestsCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold animate-pulse">
                  {pendingRequestsCount}
                </span>
              )}
            </button>

            {/* AI Post Studio Quick Action */}
            <button
              onClick={() => setShowPostStudioModal(true)}
              className="btn-secondary hidden sm:inline-flex text-[11px] !py-1.5 !px-3 font-bold border-[--accent]/30 text-[--accent] hover:!bg-[--accent-subtle]"
              title="Open AI Post Studio"
            >
              <PenTool className="h-3.5 w-3.5" />
              <span>Studio</span>
            </button>

            {/* Top User Profile Pill (Matches Reference) */}
            <button
              onClick={() => setShowUserProfileModal(true)}
              className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-full bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] transition-all"
              title={`Logged in as ${currentUser.name} • Click to manage or switch account`}
            >
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br ${
                  currentUser.avatarColor || 'from-[#8b5cf6] to-[#6d28d9]'
                } text-black font-extrabold text-[10px] shadow-sm`}
              >
                {currentUser.avatarInitials}
              </div>
              <span className="text-xs font-semibold text-white hidden sm:inline">
                {currentUser.name.split(' ')[0]}
              </span>
              <ChevronDown className="h-3 w-3 text-[--muted]" />
            </button>
          </div>
        </header>

        {/* Scrollable View Content */}
        <main className="flex-1 overflow-y-auto no-scrollbar pb-16 md:pb-6">
          <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10 py-6 sm:py-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              >
                {activeTab === 'dashboard' && (
                  <Dashboard
                    currentUser={currentUser}
                    latestPostGroup={latestPost}
                    postGroups={postGroups}
                    schedulerState={schedulerState}
                    brandBrain={brandBrain}
                    bufferConfig={bufferConfig}
                    stats={stats}
                    trendCandidates={trendCandidates}
                    isExecuting={isExecuting}
                    onTriggerAutopilot={handleTriggerAutopilot}
                    onToggleAutomation={handleToggleAutomation}
                    onRegeneratePost={(p) => handleRegeneratePost(p)}
                    onInspectPostGroup={(g) => setSelectedPostGroup(g)}
                    onPublishPostGroup={handlePublishPostGroup}
                    onOpenBrandBrain={() => setShowBrandBrainModal(true)}
                    onOpenBufferSettings={() => setShowBufferModal(true)}
                    onOpenPostStudio={() => setShowPostStudioModal(true)}
                    onOpenAnalytics={() => changeTab('analytics')}
                  />
                )}
                {activeTab === 'calendar' && (
                  <ContentCalendar
                    postGroups={postGroups}
                    onSelectPostGroup={(g) => setSelectedPostGroup(g)}
                    onPublishPostGroup={handlePublishPostGroup}
                  />
                )}
                {activeTab === 'radar' && (
                  <TrendRadar
                    candidates={trendCandidates}
                    onScanTrends={handleScanTrends}
                    onSelectTrendForGeneration={(trend) => {
                      sessionStorage.setItem('autopilot-selected-trend', trend.id);
                      handleTriggerAutopilot();
                    }}
                    isScanning={isScanningTrends}
                  />
                )}
                {activeTab === 'analytics' && (
                  <AnalyticsView
                    insights={strategyInsights}
                    onGenerateStrategy={handleGenerateStrategy}
                    isGenerating={isGeneratingStrategy}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>

        {/* Mobile Bottom Navigation Bar */}
        <div className="md:hidden fixed bottom-0 inset-x-0 h-14 glass border-t border-[--border] flex items-center justify-around px-2 z-30">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => changeTab(item.id)}
                className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
                  isActive ? 'text-[--accent]' : 'text-[--muted]'
                }`}
              >
                <Icon className="h-4.5 w-4.5" />
                <span className="text-[10px] font-semibold mt-0.5">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ===== 3. MODALS ===== */}
      {showAuthGatewayModal && (
        <AuthGatewayModal
          isOpen={showAuthGatewayModal}
          onClose={() => setShowAuthGatewayModal(false)}
          workspaces={workspaces}
          onAuthSuccess={handleAuthSuccess}
        />
      )}

      {showAdminApprovalHubModal && (
        <AdminApprovalHubModal
          isOpen={showAdminApprovalHubModal}
          onClose={() => setShowAdminApprovalHubModal(false)}
          currentUser={{
            id: currentUser.id,
            name: currentUser.name,
            email: currentUser.email,
            username: currentUser.email.split('@')[0],
            role: currentUser.id === 'user_asab' || currentUser.name.toLowerCase().includes('asab') ? 'author' : 'reviewer',
            status: 'approved',
            workspaceId: activeWorkspaceId,
            avatarInitials: currentUser.avatarInitials,
            avatarColor: currentUser.avatarColor,
            joinedDate: currentUser.joinedDate,
            bio: currentUser.bio,
            plan: currentUser.plan,
          }}
          workspaces={workspaces}
          onRefreshUsers={fetchAllData}
        />
      )}

      {showUserProfileModal && (
        <UserProfileModal
          isOpen={showUserProfileModal}
          onClose={() => setShowUserProfileModal(false)}
          currentUser={currentUser}
          availableUsers={availableUsers}
          onSelectUser={handleSelectUser}
          onCreateUser={handleCreateUser}
          onUpdateCurrentUser={handleUpdateCurrentUser}
          onOpenBufferSettings={() => {
            setShowUserProfileModal(false);
            setShowBufferModal(true);
          }}
          onOpenBrandBrain={() => {
            setShowUserProfileModal(false);
            setShowBrandBrainModal(true);
          }}
          onOpenAdminApprovals={() => {
            setShowUserProfileModal(false);
            setShowAdminApprovalHubModal(true);
          }}
          onOpenAuthGateway={() => {
            setShowUserProfileModal(false);
            setShowAuthGatewayModal(true);
          }}
          pendingApprovalsCount={pendingRequestsCount}
        />
      )}

      {showHelpCenterModal && (
        <HelpCenterModal
          isOpen={showHelpCenterModal}
          onClose={() => setShowHelpCenterModal(false)}
          onOpenBufferSettings={() => {
            setShowHelpCenterModal(false);
            setShowBufferModal(true);
          }}
          onOpenBrandBrain={() => {
            setShowHelpCenterModal(false);
            setShowBrandBrainModal(true);
          }}
        />
      )}

      {showPostStudioModal && (
        <PostStudioModal
          isOpen={showPostStudioModal}
          onClose={() => setShowPostStudioModal(false)}
          onPostGenerated={(newGroup) => {
            setPostGroups((prev) => [newGroup, ...prev]);
            setSelectedPostGroup(newGroup);
          }}
          onPublishToBuffer={handlePublishPostGroup}
          brandBrainTone={brandBrain?.toneOfVoice}
          targetAudience={brandBrain?.targetAudience}
          activeWorkspace={activeWorkspace}
        />
      )}

      {showBrandBrainModal && brandBrain && (
        <BrandBrainModal
          config={brandBrain}
          isOpen={showBrandBrainModal}
          onSave={handleSaveBrandBrain}
          onClose={() => setShowBrandBrainModal(false)}
        />
      )}

      {showBufferModal && bufferConfig && (
        <BufferSettingsModal
          config={bufferConfig}
          isOpen={showBufferModal}
          onSave={handleSaveBufferConfig}
          onClose={() => setShowBufferModal(false)}
        />
      )}

      {showPipelineModal && (
        <PipelineExecutionModal
          progress={progress}
          onClose={() => setShowPipelineModal(false)}
        />
      )}

      {selectedPostGroup && (
        <PostDetailModal
          postGroup={selectedPostGroup}
          onClose={() => setSelectedPostGroup(null)}
          onRegenerateSingle={handleRegeneratePost}
          onEditSingle={() => {}}
          onPublishGroup={handlePublishPostGroup}
        />
      )}

      {showSearchModal && (
        <SearchCommandPaletteModal
          isOpen={showSearchModal}
          onClose={() => setShowSearchModal(false)}
          postGroups={postGroups}
          trendCandidates={trendCandidates}
          workspaces={workspaces}
          onSelectPostGroup={(group) => setSelectedPostGroup(group)}
          onNavigateTab={(tab) => changeTab(tab)}
          onSwitchWorkspace={handleSwitchWorkspace}
          onOpenPipeline={() => setShowPipelineModal(true)}
          onOpenStudio={() => setShowPostStudioModal(true)}
          onOpenBrandBrain={() => setShowBrandBrainModal(true)}
          onOpenBufferSettings={() => setShowBufferModal(true)}
          onOpenUserModal={() => setShowUserProfileModal(true)}
        />
      )}
    </div>
  );
}

export default App;
