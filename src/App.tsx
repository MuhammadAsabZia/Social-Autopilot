import React, { useEffect, useState } from 'react';
import { Calendar, Compass, LayoutDashboard, BarChart3, Settings, Sparkles, ChevronLeft, Menu, Search, Bell, CircleDot, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Dashboard } from './components/Dashboard.js';
import { TrendRadar } from './components/TrendRadar.js';
import { ContentCalendar } from './components/ContentCalendar.js';
import { AnalyticsView } from './components/AnalyticsView.js';
import { BrandBrainModal } from './components/BrandBrainModal.js';
import { BufferSettingsModal } from './components/BufferSettingsModal.js';
import { PipelineExecutionModal } from './components/PipelineExecutionModal.js';
import { PostDetailModal } from './components/PostDetailModal.js';
import {
  AutopilotRunProgress,
  BrandBrainConfig,
  BufferConfig,
  PlatformType,
  SchedulerState,
  SocialMediaPostGroup,
  TrendCandidate,
  WeeklyStrategyInsight,
} from './types.js';

type TabId = 'dashboard' | 'calendar' | 'radar' | 'analytics';

const NAV_ITEMS: { id: TabId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
  { id: 'calendar', label: 'Content Queue', icon: Calendar },
  { id: 'radar', label: 'Trend Radar', icon: Compass },
  { id: 'analytics', label: 'AI Strategy', icon: BarChart3 },
];

export function App() {
  const [activeTab, setActiveTab] = useState<TabId>(() => {
    const saved = sessionStorage.getItem('autopilot-active-tab');
    return saved === 'calendar' || saved === 'radar' || saved === 'analytics' ? saved : 'dashboard';
  });
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const changeTab = (tab: TabId) => {
    sessionStorage.setItem('autopilot-active-tab', tab);
    setActiveTab(tab);
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

  const [stats, setStats] = useState({
    totalPosts: 0,
    publishedCount: 0,
    scheduledCount: 0,
    bufferConnected: false,
    bufferSimulated: true,
    automationEnabled: true,
  });

  const [showBrandBrainModal, setShowBrandBrainModal] = useState(false);
  const [showBufferModal, setShowBufferModal] = useState(false);
  const [showPipelineModal, setShowPipelineModal] = useState(false);
  const [selectedPostGroup, setSelectedPostGroup] = useState<SocialMediaPostGroup | null>(null);

  const [isExecuting, setIsExecuting] = useState(false);
  const [isScanningTrends, setIsScanningTrends] = useState(false);
  const [isGeneratingStrategy, setIsGeneratingStrategy] = useState(false);

  const fetchAllData = async () => {
    try {
      const fetchJson = async (url: string, defaultVal: any) => {
        try {
          const res = await fetch(url);
          if (!res.ok) return defaultVal;
          return await res.json();
        } catch { return defaultVal; }
      };

      const [statusRes, brainRes, bufferRes, postsRes, insightsRes] = await Promise.all([
        fetchJson('/api/status', {}),
        fetchJson('/api/brand-brain', null),
        fetchJson('/api/buffer-config', null),
        fetchJson('/api/post-groups', []),
        fetchJson('/api/strategy-insights', []),
      ]);

      if (statusRes?.scheduler) setSchedulerState(statusRes.scheduler);
      if (statusRes?.progress) {
        setProgress(statusRes.progress);
        if (statusRes.progress.step !== 'idle' && statusRes.progress.step !== 'completed') {
          setIsExecuting(true);
        }
      }
      if (statusRes?.stats) setStats(statusRes.stats);
      if (brainRes) setBrandBrain(brainRes);
      if (bufferRes) setBufferConfig(bufferRes);
      if (Array.isArray(postsRes)) setPostGroups(postsRes);
      if (Array.isArray(insightsRes)) setStrategyInsights(insightsRes);
    } catch (err) { console.warn('Backend sync:', err); }
  };

  useEffect(() => { fetchAllData(); }, []);

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
        } catch (err) { console.warn('Progress poll:', err); }
      }, 1500);
    }
    return () => clearInterval(timer);
  }, [isExecuting]);

  const handleTriggerAutopilot = async () => {
    setIsExecuting(true);
    setShowPipelineModal(true);
    try { await fetch('/api/autopilot/run', { method: 'POST' }); }
    catch (err) { console.error(err); setIsExecuting(false); }
  };

  const handleToggleAutomation = async (enabled: boolean) => {
    try {
      const res = await fetch('/api/autopilot/toggle', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled }),
      });
      if (res.ok) { const data = await res.json(); if (data.scheduler) setSchedulerState(data.scheduler); }
    } catch (err) { console.error(err); }
  };

  const handleSaveBrandBrain = async (updated: BrandBrainConfig) => {
    try {
      const res = await fetch('/api/brand-brain', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      if (res.ok) { const data = await res.json(); if (data.brandBrain) setBrandBrain(data.brandBrain); }
    } catch (err) { console.error(err); }
  };

  const handleSaveBufferConfig = async (updated: BufferConfig) => {
    try {
      const res = await fetch('/api/buffer-config', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      if (res.ok) { const data = await res.json(); if (data.bufferConfig) setBufferConfig(data.bufferConfig); }
    } catch (err) { console.error(err); }
  };

  const handleScanTrends = async () => {
    setIsScanningTrends(true);
    try {
      const res = await fetch('/api/trends/research');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.candidates)) {
          setTrendCandidates(data.candidates);
          sessionStorage.setItem('autopilot-trend-candidates', JSON.stringify(data.candidates));
        }
      }
    } catch (err) { console.error(err); } finally { setIsScanningTrends(false); }
  };

  const handlePublishPostGroup = async (id: string) => {
    try {
      const res = await fetch(`/api/post-groups/${id}/publish`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        if (data.postGroup) {
          setPostGroups(prev => prev.map(p => p.id === id ? data.postGroup : p));
          if (selectedPostGroup?.id === id) setSelectedPostGroup(data.postGroup);
        }
      }
    } catch (err) { console.error(err); }
  };

  const handleRegeneratePost = async (platform?: PlatformType) => {
    const targetGroup = selectedPostGroup || postGroups[0];
    if (!targetGroup) return;
    try {
      const res = await fetch('/api/posts/regenerate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postGroupId: targetGroup.id, platform }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.postGroup) {
          setPostGroups(prev => prev.map(p => p.id === targetGroup.id ? data.postGroup : p));
          if (selectedPostGroup) setSelectedPostGroup(data.postGroup);
        }
      }
    } catch (err) { console.error(err); }
  };

  const handleGenerateStrategy = async () => {
    setIsGeneratingStrategy(true);
    try {
      const res = await fetch('/api/strategy-insights/generate', { method: 'POST' });
      if (res.ok) { const data = await res.json(); if (data.insight) setStrategyInsights(prev => [data.insight, ...prev]); }
    } catch (err) { console.error(err); } finally { setIsGeneratingStrategy(false); }
  };

  const latestPost = postGroups[0] || null;
  const activeNav = NAV_ITEMS.find(i => i.id === activeTab)!;

  return (
    <div className="flex h-screen overflow-hidden bg-[--bg] text-[--fg] relative">
      {/* ===== CINEMATIC SMOKY BACKGROUND ===== */}
      <div className="smoky-bg">
        {[...Array(6)].map((_, i) => (
          <div 
            key={i} 
            className="smoke-particle" 
            style={{ 
              width: `${Math.random() * 400 + 200}px`,
              height: `${Math.random() * 400 + 200}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * -3}s`,
              opacity: 0.3
            }} 
          />
        ))}
      </div>

      {/* ===== SIDEBAR ===== */}
      <aside className={`hidden md:flex flex-col glass border-r border-[--border] transition-all duration-500 ease-in-out z-20 ${sidebarOpen ? 'w-64' : 'w-[72px]'}`}>
        <div className="flex items-center gap-3 h-16 px-5 border-b border-[--border]/50">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[--accent] to-[--accent-muted] shadow-[0_0_15px_rgba(212,175,55,0.3)] shrink-0">
            <Sparkles className="h-5 w-5 text-[#060709]" />
          </div>
          {sidebarOpen && (
            <motion.span 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="font-bold tracking-tight text-[16px] bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent"
            >
              Autopilot
            </motion.span>
          )}
        </div>

        <nav className="flex-1 px-3 py-6 space-y-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                 onClick={() => changeTab(item.id)}
                className={`nav-item ${isActive ? 'active' : ''} w-full justify-start`}
                title={sidebarOpen ? undefined : item.label}
              >
                <Icon className="nav-icon" />
                {sidebarOpen && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <div className="px-4 pb-6 space-y-3">
          {sidebarOpen && (
            <div className="rounded-xl border border-[--border]/50 bg-white/5 p-4 backdrop-blur-md">
              <div className="flex items-center justify-between">
                <span className="stat-label text-[10px]">Automation</span>
                <span className={`dot ${stats.automationEnabled ? 'dot-live' : 'dot-idle'}`} />
              </div>
              <p className="mt-2 text-[11px] text-[--fg-soft] font-medium">
                {stats.automationEnabled ? 'Autonomous Pulse Active' : 'Pipeline Standby'}
              </p>
            </div>
          )}
          <button onClick={handleTriggerAutopilot} disabled={isExecuting} className="btn-primary w-full justify-center shadow-lg">
            {isExecuting ? <><RefreshCw className="h-4 w-4 animate-spin" />{sidebarOpen && <span>Running</span>}</> : <><Sparkles className="h-4 w-4" />{sidebarOpen && <span>Run Autopilot</span>}</>}
          </button>
        </div>
      </aside>

      {/* ===== MAIN ===== */}
      <div className="flex flex-1 flex-col min-w-0 relative z-10">
        {/* Top bar */}
        <header className="flex items-center justify-between h-16 px-6 border-b border-[--border]/50 glass z-20">
          <div className="flex items-center gap-4 min-w-0">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="btn-icon">
              <Menu className="h-4 w-4" />
            </button>
            <AnimatePresence mode="wait">
              <motion.h1 
                key={activeTab}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="text-[16px] font-semibold tracking-tight truncate"
              >
                {activeNav.label}
              </motion.h1>
            </AnimatePresence>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-white/5 border border-[--border]/50 text-[11px] font-semibold">
              <span className={`dot ${stats.automationEnabled ? 'dot-live' : 'dot-idle'}`} />
              <span className="text-[--fg-soft]">{stats.automationEnabled ? 'ACTIVE' : 'PAUSED'}</span>
            </div>
            <button onClick={() => setShowBufferModal(true)} className="btn-icon" title="Buffer settings">
              <Settings className="h-4 w-4" />
            </button>
            <button onClick={() => setShowBrandBrainModal(true)} className="btn-icon" title="Brand Brain">
              <Sparkles className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto no-scrollbar">
          <div className="mx-auto max-w-[1400px] px-6 lg:px-10 py-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, cubicBezier: [0.4, 0, 0.2, 1] }}
              >
                {activeTab === 'dashboard' && (
                  <Dashboard
                    latestPostGroup={latestPost}
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
                    onOpenBufferSettings={() => setShowBrandBrainModal(true)}
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
      </div>

      {/* ===== MODALS ===== */}
      {showBrandBrainModal && brandBrain && (
        <BrandBrainModal config={brandBrain} isOpen={showBrandBrainModal} onSave={handleSaveBrandBrain} onClose={() => setShowBrandBrainModal(false)} />
      )}
      {showBufferModal && bufferConfig && (
        <BufferSettingsModal config={bufferConfig} isOpen={showBufferModal} onSave={handleSaveBufferConfig} onClose={() => setShowBufferModal(false)} />
      )}
      {showPipelineModal && (
        <PipelineExecutionModal progress={progress} onClose={() => setShowPipelineModal(false)} />
      )}
      {selectedPostGroup && (
        <PostDetailModal postGroup={selectedPostGroup} onClose={() => setSelectedPostGroup(null)} onRegenerateSingle={handleRegeneratePost} onEditSingle={() => {}} onPublishGroup={handlePublishPostGroup} />
      )}
    </div>
  );
}

export default App;
