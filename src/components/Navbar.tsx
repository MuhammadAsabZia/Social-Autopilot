import React from 'react';
import {
  Activity,
  Bot,
  Brain,
  Calendar,
  Clock,
  Flame,
  LineChart,
  Play,
  Radio,
  RefreshCw,
  Sliders,
  Sparkles,
  Zap,
} from 'lucide-react';
import { SchedulerState } from '../types.js';

interface NavbarProps {
  activeTab: 'dashboard' | 'calendar' | 'radar' | 'analytics' | 'logs';
  setActiveTab: (tab: 'dashboard' | 'calendar' | 'radar' | 'analytics' | 'logs') => void;
  schedulerState: SchedulerState | null;
  isExecuting: boolean;
  onTriggerAutopilot: () => void;
  onOpenBrandBrain: () => void;
  onOpenBufferSettings: () => void;
  onToggleAutomation: (enabled: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  schedulerState,
  isExecuting,
  onTriggerAutopilot,
  onOpenBrandBrain,
  onOpenBufferSettings,
  onToggleAutomation,
}) => {
  const isEnabled = schedulerState?.enabled ?? true;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-[--bg]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8">
        {/* Brand Logo & Subtitle */}
        <div className="flex items-center space-x-2.5 sm:space-x-3 shrink-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-card to-card/50 border border-border/30 shadow-lg">
            <Bot className="h-5 w-5 text-accent" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-fg">
                AUTOPILOT<span className="gradient-text">.AI</span>
              </h1>
              <span className="hidden sm:inline-block rounded-full bg-accent/10 border border-accent/20 px-1.5 py-0.2 font-mono text-[9px] font-bold text-accent">
                PRO
              </span>
            </div>
            <p className="hidden xs:block text-[9px] sm:text-[10px] uppercase tracking-[0.18em] font-semibold text-muted">
              Agency Personal Brand Engine
            </p>
          </div>
        </div>

        {/* Center Navigation Tabs - Desktop (md+) */}
        <nav className="hidden items-center space-x-1 rounded-xl border-border bg-[--card] p-1 md:flex">
          <button
            id="nav-tab-dashboard"
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center space-x-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-[rgba(59,130,246,0.15)] text-accent shadow-sm font-bold'
                : 'text-muted hover:bg-[rgba(59,130,246,0.1)] hover:text-fg'
            }`}
          >
            <Activity className="h-3.5 w-3.5" />
            <span>Dashboard</span>
          </button>

          <button
            id="nav-tab-calendar"
            onClick={() => setActiveTab('calendar')}
            className={`flex items-center space-x-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'calendar'
                ? 'bg-[rgba(59,130,246,0.15)] text-accent shadow-sm font-bold'
                : 'text-muted hover:bg-[rgba(59,130,246,0.1)] hover:text-fg'
            }`}
          >
            <Calendar className="h-3.5 w-3.5" />
            <span>Queue & Calendar</span>
          </button>

          <button
            id="nav-tab-radar"
            onClick={() => setActiveTab('radar')}
            className={`flex items-center space-x-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'radar'
                ? 'bg-[rgba(59,130,246,0.15)] text-accent shadow-sm font-bold'
                : 'text-muted:hover:bg-[rgba(59,130,246,0.1)] hover:text-fg'
            }`}
          >
            <Radio className="h-3.5 w-3.5" />
            <span>Trend Radar</span>
          </button>

          <button
            id="nav-tab-analytics"
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center space-x-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'analytics'
                ? 'bg-[rgba(59,130,246,0.15)] text-accent shadow-sm font-bold'
                : 'text-muted:hover:bg-[rgba(59,130,246,0.1)] hover:text-fg'
            }`}
          >
            <LineChart className="h-3.5 w-3.5" />
            <span>AI Strategy</span>
          </button>
        </nav>

        {/* Right Actions & Controls */}
        <div className="flex items-center space-x-1.5 sm:space-x-2.5">
          {/* Automation Switch */}
          <div className="flex items-center gap-1.5 rounded-xl border-border bg-[--card] px-2 py-1">
            <span className="hidden sm:inline text-[10px] font-bold uppercase tracking-wider text-muted">
              Auto
            </span>
            <div
              id="btn-toggle-automation"
              onClick={() => onToggleAutomation(!isEnabled)}
              className={`relative h-5 w-9 cursor-pointer rounded-full transition-colors duration-200 ease-in-out ${
                isEnabled
                  ? 'bg-[rgba(16,185,129,0.2)] shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                  : 'bg-[--border]'
              }`}
              title={isEnabled ? 'Automation Active (Daily 09:00 UTC)' : 'Automation Paused'}
            >
              <div
                className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform duration-200 ease-in-out ${
                  isEnabled ? 'right-0.5' : 'left-0.5'
                }`}
              />
            </div>
          </div>

          {/* Brand Brain Config Button */}
          <button
            id="btn-open-brand-brain"
            onClick={onOpenBrandBrain}
            className="flex items-center space-x-1.5 rounded-xl border-border bg-[--card] px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-muted transition-colors hover:border-border hover:bg-[--card]/50 hover:text-fg cursor-pointer"
            title="Configure Brand Brain, Services & Voice"
          >
            <Brain className="h-3.5 w-3.5 text-accent" />
            <span className="hidden lg:inline">Brand Brain</span>
          </button>

          {/* Buffer Settings Button */}
          <button
            id="btn-open-buffer-settings"
            onClick={onOpenBufferSettings}
            className="flex items-center space-x-1.5 rounded-xl border-border bg-[--card] px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-muted transition-colors hover:border-border hover:bg-[--card]/50 hover:text-fg cursor-pointer"
            title="Configure Buffer API connection and channels"
          >
            <Sliders className="h-3.5 w-3.5 text-muted" />
            <span className="hidden lg:inline">Buffer</span>
          </button>

          {/* Run Autopilot Now Action */}
          <button
            id="btn-run-autopilot-now"
            onClick={onTriggerAutopilot}
            disabled={isExecuting}
            className={`flex items-center space-x-1.5 sm:space-x-2 rounded-xl px-2.5 sm:px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              isExecuting
                ? 'cursor-not-allowed bg-[rgba(239,68,68,0.1)] text-error shadow-none'
                : 'bg-[rgba(59,130,246,0.1)] hover:bg-[rgba(59,130,246,0.2)] shadow-[0_0_15px_rgba(59,130,246,0.2)] active:scale-95'
            }`}
          >
            {isExecuting ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin text-white" />
                <span className="text-white hidden xs:inline">Running...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5" />
                <span className="hidden xs:inline">Run Autopilot</span>
                <span className="xs:hidden">Run</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Bar (Bottom of Header on mobile, with touch-friendly pills) */}
      <div className="flex border-t border-border/80 bg-[--bg] px-1 py-1 md:hidden overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex-1 min-w-[75px] py-2 px-2 text-center text-[11px] font-bold uppercase tracking-wider rounded-lg transition-all flex items-center justify-center space-x-1 ${
            activeTab === 'dashboard'
              ? 'bg-[rgba(59,130,246,0.1)] text-accent border border-accent/30'
              : 'text-muted hover:text-fg'
          }`}
        >
          <Activity className="h-3 w-3" />
          <span>Dashboard</span>
        </button>
        <button
          onClick={() => setActiveTab('calendar')}
          className={`flex-1 min-w-[75px] py-2 px-2 text-center text-[11px] font-bold uppercase tracking-wider rounded-lg transition-all flex items-center justify-center space-x-1 ${
            activeTab === 'calendar'
              ? 'bg-[rgba(59,130,246,0.1)] text-accent border border-accent/30'
              : 'text-muted hover:text-fg'
          }`}
        >
          <Calendar className="h-3 w-3" />
          <span>Calendar</span>
        </button>
        <button
          onClick={() => setActiveTab('radar')}
          className={`flex-1 min-w-[75px] py-2 px-2 text-center text-[11px] font-bold uppercase tracking-wider rounded-lg transition-all flex items-center justify-center space-x-1 ${
            activeTab === 'radar'
              ? 'bg-[rgba(59,130,246,0.1)] text-accent border border-accent/30'
              : 'text-muted hover:text-fg'
          }`}
        >
          <Radio className="h-3 w-3" />
          <span>Radar</span>
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex-1 min-w-[75px] py-2 px-2 text-center text-[11px] font-bold uppercase tracking-wider rounded-lg transition-all flex items-center justify-center space-x-1 ${
            activeTab === 'analytics'
              ? 'bg-[rgba(59,130,246,0.1)] text-accent border border-accent/30'
              : 'text-muted hover:text-fg'
          }`}
        >
          <LineChart className="h-3 w-3" />
          <span>Strategy</span>
        </button>
      </div>
    </header>
  );
};