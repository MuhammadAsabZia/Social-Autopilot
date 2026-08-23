import React, { useState } from 'react';
import {
  Building,
  Check,
  ChevronDown,
  Globe,
  Layers,
  Plus,
  Sparkles,
  Users,
  X,
} from 'lucide-react';
import { WorkspaceProfile } from '../types.js';

interface WorkspaceSwitcherProps {
  workspaces: WorkspaceProfile[];
  activeWorkspaceId: string;
  onSwitchWorkspace: (workspaceId: string) => void;
  onCreateWorkspace: (name: string, positioning?: string, tone?: string) => void;
}

export const WorkspaceSwitcher: React.FC<WorkspaceSwitcherProps> = ({
  workspaces,
  activeWorkspaceId,
  onSwitchWorkspace,
  onCreateWorkspace,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newBrandName, setNewBrandName] = useState('');
  const [newPositioning, setNewPositioning] = useState('');
  const [newTone, setNewTone] = useState('');

  const activeWorkspace = workspaces.find((w) => w.id === activeWorkspaceId) || workspaces[0];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBrandName.trim()) return;
    onCreateWorkspace(newBrandName.trim(), newPositioning.trim(), newTone.trim());
    setNewBrandName('');
    setNewPositioning('');
    setNewTone('');
    setShowCreateModal(false);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-[--border]/60 text-left transition-all text-xs font-semibold text-white group"
        title="Switch Brand Workspace (Multi-Tenant Micro-SaaS)"
      >
        <div className="flex h-5 w-5 items-center justify-center rounded-lg bg-[--accent]/20 text-[--accent] shrink-0">
          <Building className="h-3 w-3" />
        </div>
        <span className="truncate max-w-[110px] sm:max-w-[150px] font-bold">
          {activeWorkspace?.name || 'Main Workspace'}
        </span>
        <ChevronDown className={`h-3.5 w-3.5 text-[--muted] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-30 bg-black/40 backdrop-blur-xs"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute left-0 mt-2 w-64 rounded-2xl bg-[#0e111a] border border-white/[0.12] shadow-[0_20px_50px_rgba(0,0,0,0.8)] p-2 z-40 space-y-1">
            <div className="px-3 py-2 border-b border-white/[0.06] bg-[#121622] rounded-xl mb-1">
              <span className="text-[10px] font-bold text-[--muted] uppercase tracking-widest block">
                Brand Workspaces
              </span>
              <span className="text-[11px] text-[--fg-soft] font-medium">Multi-Tenant SaaS Profiles</span>
            </div>

            <div className="max-h-56 overflow-y-auto no-scrollbar space-y-1 py-1">
              {workspaces.map((ws) => {
                const isActive = ws.id === activeWorkspaceId;
                return (
                  <button
                    key={ws.id}
                    onClick={() => {
                      onSwitchWorkspace(ws.id);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-colors ${
                      isActive
                        ? 'bg-[--accent-subtle] text-white font-bold border border-[--accent]/30'
                        : 'text-[--muted] hover:text-white hover:bg-white/[0.04]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`h-2 w-2 rounded-full ${isActive ? 'bg-[--accent]' : 'bg-white/20'}`} />
                      <span className="text-xs truncate">{ws.name}</span>
                    </div>
                    {isActive && <Check className="h-3.5 w-3.5 text-[--accent] shrink-0" />}
                  </button>
                );
              })}
            </div>

            <div className="pt-1 border-t border-white/[0.06]">
              <button
                onClick={() => {
                  setIsOpen(false);
                  setShowCreateModal(true);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-[--accent] hover:bg-[--accent-subtle] transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Client / Brand Profile</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Modal: Create New Brand Workspace */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl">
          <div className="w-full max-w-md rounded-2xl bg-[#0d1017] border border-white/[0.14] shadow-[0_25px_60px_rgba(0,0,0,0.9)] p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3 bg-[#111520] -mx-6 -mt-6 p-6 rounded-t-2xl">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[--accent] text-black font-bold shadow-md">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Create New Brand Profile</h3>
                  <p className="text-[11px] text-[--muted]">Multi-tenant client workspace</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-lg text-[--muted] hover:text-white hover:bg-white/[0.06] transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 pt-2">
              <div>
                <label className="block text-[11px] font-bold text-[--muted] uppercase tracking-wider mb-1.5">
                  Brand / Client Name *
                </label>
                <input
                  type="text"
                  required
                  value={newBrandName}
                  onChange={(e) => setNewBrandName(e.target.value)}
                  placeholder="e.g. Fintech Growth Labs"
                  className="w-full rounded-xl bg-[#06080d] border border-white/[0.12] px-3.5 py-2.5 text-sm text-white placeholder-white/25 focus:border-[--accent] focus:outline-none transition-colors shadow-inner"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[--muted] uppercase tracking-wider mb-1.5">
                  Brand Positioning (Optional)
                </label>
                <input
                  type="text"
                  value={newPositioning}
                  onChange={(e) => setNewPositioning(e.target.value)}
                  placeholder="e.g. Modern B2B SaaS automation and AI engineering."
                  className="w-full rounded-xl bg-[#06080d] border border-white/[0.12] px-3.5 py-2.5 text-sm text-white placeholder-white/25 focus:border-[--accent] focus:outline-none transition-colors shadow-inner"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[--muted] uppercase tracking-wider mb-1.5">
                  Tone of Voice (Optional)
                </label>
                <input
                  type="text"
                  value={newTone}
                  onChange={(e) => setNewTone(e.target.value)}
                  placeholder="e.g. Sharp, analytical, direct, zero-fluff founder tone."
                  className="w-full rounded-xl bg-[#06080d] border border-white/[0.12] px-3.5 py-2.5 text-sm text-white placeholder-white/25 focus:border-[--accent] focus:outline-none transition-colors shadow-inner"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary text-xs"
                >
                  Create Workspace
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
