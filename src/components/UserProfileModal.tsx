import React, { useState } from 'react';
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Copy,
  ExternalLink,
  Key,
  Layers,
  Link as LinkIcon,
  LogOut,
  Mail,
  Plus,
  Radio,
  Send,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sliders,
  Sparkles,
  User,
  UserCheck,
  UserPlus,
  Users,
  Workflow,
  X,
  Zap,
} from 'lucide-react';
import { motion } from 'motion/react';
import { UserProfile } from '../types.js';

export const DEFAULT_PROFILES: UserProfile[] = [
  {
    id: 'user_asab',
    name: 'Asab Siddiqui',
    email: 'asabsiddx2000@gmail.com',
    avatarInitials: 'AS',
    role: 'Agency Owner & Lead Author',
    avatarColor: 'from-[#e5be49] to-[#a68424]',
    plan: 'enterprise',
    joinedDate: 'August 2024',
    status: 'active',
    bio: 'Platform Owner overseeing multi-workspace distribution, Buffer API keys, and autonomous AI pipelines.',
  },
  {
    id: 'user_mara',
    name: 'Mara Rivera',
    email: 'mara.rivera@autopilot.studio',
    avatarInitials: 'MR',
    role: 'Lead Content Reviewer',
    avatarColor: 'from-[#8b5cf6] to-[#6d28d9]',
    plan: 'enterprise',
    joinedDate: 'October 2024',
    status: 'active',
    bio: 'Invited Content Architect reviewing high-signal technical teardowns and approving queues.',
  },
  {
    id: 'user_alex',
    name: 'Alex Vance',
    email: 'alex@growthagency.ai',
    avatarInitials: 'AV',
    role: 'Growth Reviewer',
    avatarColor: 'from-[#3b82f6] to-[#1d4ed8]',
    plan: 'pro',
    joinedDate: 'November 2024',
    status: 'active',
    bio: 'Invited Growth Strategist managing client approvals and viral hook variations.',
  },
];

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  availableUsers: UserProfile[];
  onSelectUser: (user: UserProfile) => void;
  onCreateUser: (newUser: Omit<UserProfile, 'id' | 'joinedDate' | 'status'>) => void;
  onUpdateCurrentUser: (updated: Partial<UserProfile>) => void;
  onOpenBufferSettings: () => void;
  onOpenBrandBrain: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  availableUsers,
  onSelectUser,
  onCreateUser,
  onUpdateCurrentUser,
  onOpenBufferSettings,
  onOpenBrandBrain,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'switch' | 'invite' | 'roadmap'>('profile');
  
  // Edit Profile Form State
  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);
  const [role, setRole] = useState(currentUser.role);
  const [bio, setBio] = useState(currentUser.bio || '');
  const [isSaved, setIsSaved] = useState(false);

  // Invite Form State
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState<'Reviewer' | 'Client' | 'Author'>('Reviewer');
  const [inviteWorkspace, setInviteWorkspace] = useState('All Workspaces');
  const [inviteSent, setInviteSent] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const initials = name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'US';

    onUpdateCurrentUser({
      name,
      email,
      role,
      bio,
      avatarInitials: initials,
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    const initials = (inviteName || inviteEmail)
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'IN';

    const colors = [
      'from-[#e5be49] to-[#a68424]',
      'from-[#34d399] to-[#059669]',
      'from-[#38bdf8] to-[#0284c7]',
      'from-[#f472b6] to-[#db2777]',
      'from-[#a78bfa] to-[#7c3aed]',
    ];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    onCreateUser({
      name: inviteName.trim() || inviteEmail.split('@')[0],
      email: inviteEmail.trim(),
      role: `${inviteRole} (${inviteWorkspace})`,
      avatarInitials: initials,
      avatarColor: randomColor,
      plan: 'pro',
      bio: `Invited as ${inviteRole} for ${inviteWorkspace}.`,
    });

    setInviteSent(true);
    setTimeout(() => {
      setInviteSent(false);
      setInviteEmail('');
      setInviteName('');
    }, 2500);
  };

  const generatedInviteLink = `https://autopilot.app/join?token=sec_invite_${Date.now()}&org=agency_autopilot&role=${inviteRole.toLowerCase()}`;

  const handleCopyInviteLink = () => {
    navigator.clipboard.writeText(generatedInviteLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="w-full max-w-2xl rounded-2xl bg-[#0c0f17] border border-white/[0.14] shadow-[0_25px_60px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-[#111520]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[--accent] to-[--accent-muted] text-black font-bold shadow-md">
              <User className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">User Account & Team Architecture</h2>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-[--accent]/10 text-[--accent] border border-[--accent]/30">
                  1 AUTHOR + USERS
                </span>
              </div>
              <p className="text-xs text-[--muted]">Multi-user access control, invite roadmap & operator profiles</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[--muted] hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-white/[0.08] px-6 bg-[#080a10] text-xs font-semibold overflow-x-auto no-scrollbar gap-1 sm:gap-2">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-3 px-3 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'profile'
                ? 'border-[--accent] text-[--accent]'
                : 'border-transparent text-[--muted] hover:text-white'
            }`}
          >
            <UserCheck className="h-3.5 w-3.5" />
            <span>Active Profile</span>
          </button>
          <button
            onClick={() => setActiveTab('switch')}
            className={`py-3 px-3 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'switch'
                ? 'border-[--accent] text-[--accent]'
                : 'border-transparent text-[--muted] hover:text-white'
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            <span>Switch Account ({availableUsers.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('invite')}
            className={`py-3 px-3 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'invite'
                ? 'border-[--accent] text-[--accent]'
                : 'border-transparent text-[--muted] hover:text-white'
            }`}
          >
            <UserPlus className="h-3.5 w-3.5" />
            <span>Invite & Team Roles</span>
          </button>
          <button
            onClick={() => setActiveTab('roadmap')}
            className={`py-3 px-3 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'roadmap'
                ? 'border-[--accent] text-[--accent]'
                : 'border-transparent text-[--muted] hover:text-white'
            }`}
          >
            <Workflow className="h-3.5 w-3.5" />
            <span>Connection Roadmap</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 no-scrollbar">
          {/* TAB 1: ACTIVE PROFILE */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              {/* Profile Card Header */}
              <div className="p-4 rounded-xl bg-[#080a10] border border-white/[0.08] flex items-center justify-between shadow-inner">
                <div className="flex items-center gap-4">
                  <div
                    className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${
                      currentUser.avatarColor || 'from-[--accent] to-[--accent-muted]'
                    } text-black font-extrabold text-lg shadow-lg`}
                  >
                    {currentUser.avatarInitials}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-white">{currentUser.name}</h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[--accent]/10 text-[--accent] border border-[--accent]/30">
                        {currentUser.id === 'user_asab' ? 'Platform Author (Owner)' : 'Invited User'}
                      </span>
                    </div>
                    <p className="text-xs text-[--fg-soft] mt-0.5">{currentUser.role}</p>
                    <p className="text-[11px] text-[--muted] mt-0.5">{currentUser.email}</p>
                  </div>
                </div>

                <div className="text-right hidden sm:block">
                  <span className="flex items-center gap-1.5 text-xs text-[#34d399] font-medium">
                    <span className="h-2 w-2 rounded-full bg-[#34d399] animate-pulse" />
                    Active Session
                  </span>
                  <p className="text-[10px] text-[--muted] mt-1">Full Autopilot Access</p>
                </div>
              </div>

              {/* Edit Details Form */}
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[--fg-soft] mb-1.5">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-xl bg-[#080a10] border border-white/[0.12] px-3.5 py-2.5 text-xs text-white placeholder-white/30 focus:border-[--accent] focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[--fg-soft] mb-1.5">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl bg-[#080a10] border border-white/[0.12] px-3.5 py-2.5 text-xs text-white placeholder-white/30 focus:border-[--accent] focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[--fg-soft] mb-1.5">Role / Designation</label>
                    <input
                      type="text"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      placeholder="e.g. Platform Author, Lead Strategist"
                      className="w-full rounded-xl bg-[#080a10] border border-white/[0.12] px-3.5 py-2.5 text-xs text-white placeholder-white/30 focus:border-[--accent] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[--fg-soft] mb-1.5">Subscription Plan</label>
                    <div className="w-full rounded-xl bg-[#080a10] border border-white/[0.08] px-3.5 py-2.5 text-xs text-[--fg-soft] flex items-center justify-between">
                      <span className="font-semibold text-white">Autonomous Enterprise Pro</span>
                      <Shield className="h-3.5 w-3.5 text-[--accent]" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[--fg-soft] mb-1.5">Bio / Platform Perspective</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={2}
                    placeholder="Brief description of your brand perspective..."
                    className="w-full rounded-xl bg-[#080a10] border border-white/[0.12] px-3.5 py-2 text-xs text-white placeholder-white/30 focus:border-[--accent] focus:outline-none resize-none"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={onOpenBufferSettings}
                      className="btn-secondary text-xs !py-1.5 !px-3"
                    >
                      <Key className="h-3.5 w-3.5 text-[--accent]" />
                      <span>Buffer API Keys</span>
                    </button>
                    <button
                      type="button"
                      onClick={onOpenBrandBrain}
                      className="btn-secondary text-xs !py-1.5 !px-3"
                    >
                      <Sliders className="h-3.5 w-3.5 text-[--accent]" />
                      <span>Brand Voice</span>
                    </button>
                  </div>

                  <button
                    type="submit"
                    className="btn-primary text-xs !py-2 !px-4 font-bold"
                  >
                    {isSaved ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-black" />
                        <span>Saved!</span>
                      </>
                    ) : (
                      <span>Save Profile</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: SWITCH USER */}
          {activeTab === 'switch' && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-[#111520] border border-white/[0.08] text-xs text-[--fg-soft] flex items-center justify-between">
                <div>
                  <span className="font-bold text-white block">Active Multi-User Environment</span>
                  <span className="text-[11px] text-[--muted]">Switch sessions to test reviewer approvals vs author controls</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-white/[0.06] text-[10px] font-bold text-white">
                  {availableUsers.length} Users Registered
                </span>
              </div>

              <div className="space-y-2.5">
                {availableUsers.map((u) => {
                  const isCurrent = u.id === currentUser.id;
                  const isAuthor = u.id === 'user_asab' || u.role.toLowerCase().includes('owner') || u.role.toLowerCase().includes('author');

                  return (
                    <div
                      key={u.id}
                      onClick={() => {
                        onSelectUser(u);
                        onClose();
                      }}
                      className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                        isCurrent
                          ? 'bg-[--accent]/10 border-[--accent] shadow-[0_0_15px_rgba(229,190,73,0.15)]'
                          : 'bg-[#080a10] border-white/[0.08] hover:border-white/[0.2] hover:bg-white/[0.04]'
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${
                            u.avatarColor || 'from-[--accent] to-[--accent-muted]'
                          } text-black font-bold text-sm shrink-0 shadow-md`}
                        >
                          {u.avatarInitials}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-white truncate">{u.name}</h4>
                            {isAuthor && (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[--accent] text-black">
                                AUTHOR / OWNER
                              </span>
                            )}
                            {isCurrent && (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#34d399]/20 text-[#34d399] border border-[#34d399]/30">
                                ACTIVE
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-[--fg-soft] truncate">{u.role}</p>
                          <p className="text-[10px] text-[--muted] truncate">{u.email}</p>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-2">
                        {isCurrent ? (
                          <CheckCircle2 className="h-4 w-4 text-[--accent]" />
                        ) : (
                          <button className="text-xs font-semibold text-[--accent] hover:underline flex items-center gap-1">
                            <span>Switch Session</span>
                            <ArrowRight className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('invite')}
                  className="btn-secondary text-xs w-full justify-center py-2.5 font-bold"
                >
                  <UserPlus className="h-3.5 w-3.5 text-[--accent]" />
                  <span>Invite New Team Member or Client Reviewer</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: INVITE & TEAM ROLES */}
          {activeTab === 'invite' && (
            <div className="space-y-6">
              {/* Role Hierarchy Explainer Banner */}
              <div className="p-4 rounded-xl bg-[#111520] border border-white/[0.1] space-y-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-[--accent]" />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Role Hierarchy: 1 Author & Multiple Invited Users
                  </h4>
                </div>
                <p className="text-xs text-[--fg-soft] leading-relaxed">
                  As the <strong className="text-white">Author (Owner)</strong>, you retain exclusive control over Buffer API keys, schedule automation, and brand voice frameworks. Invited <strong className="text-white">Users & Clients</strong> can review drafts, approve social queues, and suggest hook revisions without exposing your credentials.
                </p>
              </div>

              {/* Invite Form */}
              <form onSubmit={handleSendInvite} className="p-5 rounded-xl bg-[#080a10] border border-white/[0.12] space-y-4">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-[--accent]" />
                  <span>Invite a Member or Client</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-[--muted] mb-1">Full Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Jordan Miller"
                      value={inviteName}
                      onChange={(e) => setInviteName(e.target.value)}
                      className="w-full rounded-xl bg-[#040508] border border-white/[0.12] px-3.5 py-2 text-xs text-white placeholder-white/30 focus:border-[--accent] focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[--muted] mb-1">Work Email Address *</label>
                    <input
                      type="email"
                      placeholder="e.g. jordan@clientagency.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="w-full rounded-xl bg-[#040508] border border-white/[0.12] px-3.5 py-2 text-xs text-white placeholder-white/30 focus:border-[--accent] focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-[--muted] mb-1">Role Permission</label>
                    <select
                      value={inviteRole}
                      onChange={(e: any) => setInviteRole(e.target.value)}
                      className="w-full rounded-xl bg-[#040508] border border-white/[0.12] px-3.5 py-2 text-xs text-white focus:border-[--accent] focus:outline-none"
                    >
                      <option value="Reviewer">Content Reviewer (Approve & Polish Drafts)</option>
                      <option value="Client">Client Viewer (Read-Only Queue & Analytics)</option>
                      <option value="Author">Co-Author (Full Pipeline & API Access)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[--muted] mb-1">Workspace Assignment</label>
                    <select
                      value={inviteWorkspace}
                      onChange={(e) => setInviteWorkspace(e.target.value)}
                      className="w-full rounded-xl bg-[#040508] border border-white/[0.12] px-3.5 py-2 text-xs text-white focus:border-[--accent] focus:outline-none"
                    >
                      <option value="All Workspaces">All Workspaces</option>
                      <option value="Executive AI Autopilot">Executive AI Autopilot</option>
                      <option value="Fintech Growth Labs">Fintech Growth Labs</option>
                      <option value="SaaS Architecture Daily">SaaS Architecture Daily</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-[11px] text-[--muted]">
                    Instant access token generated upon dispatch.
                  </span>
                  <button
                    type="submit"
                    className="btn-primary text-xs !py-2 !px-4 font-bold flex items-center gap-2"
                  >
                    {inviteSent ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-black" />
                        <span>Invitation Dispatched!</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-3.5 w-3.5 text-black" />
                        <span>Send Invite Link</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Magic Link Generator */}
              <div className="p-4 rounded-xl bg-[#080a10] border border-white/[0.08] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <LinkIcon className="h-3.5 w-3.5 text-[--accent]" />
                    <span className="text-xs font-bold text-white">Direct Magic Onboarding Link</span>
                  </div>
                  <span className="text-[10px] text-[--muted]">Auto-authenticated token</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={generatedInviteLink}
                    className="flex-1 rounded-xl bg-[#040508] border border-white/[0.08] px-3 py-2 text-xs font-mono text-[--muted] select-all truncate"
                  />
                  <button
                    type="button"
                    onClick={handleCopyInviteLink}
                    className="btn-secondary text-xs !py-2 !px-3 shrink-0 font-bold"
                  >
                    {copiedLink ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-[#34d399]" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>Copy Link</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Active Roster List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-[--muted] uppercase tracking-wider">
                  Active Workspace Team ({availableUsers.length})
                </h4>
                <div className="divide-y divide-white/[0.06] border border-white/[0.08] rounded-xl overflow-hidden bg-[#080a10]">
                  {availableUsers.map((u) => (
                    <div key={u.id} className="p-3.5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${
                            u.avatarColor || 'from-[--accent] to-[--accent-muted]'
                          } text-black font-bold text-xs`}
                        >
                          {u.avatarInitials}
                        </div>
                        <div>
                          <span className="text-xs font-bold text-white block">{u.name}</span>
                          <span className="text-[11px] text-[--muted]">{u.email}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white/[0.06] text-[--fg-soft]">
                          {u.role}
                        </span>
                        <span className="h-2 w-2 rounded-full bg-[#34d399]" title="Active" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CONNECTION ROADMAP */}
          {activeTab === 'roadmap' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-[#111520] border border-white/[0.1] space-y-2">
                <div className="flex items-center gap-2">
                  <Workflow className="h-4 w-4 text-[--accent]" />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Autopilot Architecture & User Connection Flow
                  </h4>
                </div>
                <p className="text-xs text-[--fg-soft] leading-relaxed">
                  How the one Author sets up the platform, connects Buffer, invites reviewers, and runs zero-human social distribution.
                </p>
              </div>

              {/* 5-Step Roadmap Timeline */}
              <div className="space-y-4">
                {/* Step 1 */}
                <div className="p-4 rounded-xl bg-[#080a10] border border-white/[0.08] flex items-start gap-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[--accent] text-black font-extrabold text-sm shrink-0">
                    1
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-white">Platform Owner Setup (Author)</h4>
                      <span className="badge badge-accent text-[9px]">AUTHOR ONLY</span>
                    </div>
                    <p className="text-xs text-[--fg-soft] leading-relaxed">
                      The author configures the <strong>Brand Intelligence</strong> (positioning, tone, topics to avoid) and inputs the <strong>Buffer API Access Token</strong> to link LinkedIn, Instagram, and Facebook.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="p-4 rounded-xl bg-[#080a10] border border-white/[0.08] flex items-start gap-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[--accent]/20 text-[--accent] border border-[--accent]/30 font-extrabold text-sm shrink-0">
                    2
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-white">User & Client Invitation</h4>
                      <span className="badge badge-muted text-[9px]">INVITE ROADMAP</span>
                    </div>
                    <p className="text-xs text-[--fg-soft] leading-relaxed">
                      The author invites team members or clients via email or direct magic link. Users receive scoped permissions (Reviewer vs Viewer) to access specific client workspaces.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="p-4 rounded-xl bg-[#080a10] border border-white/[0.08] flex items-start gap-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[--accent]/20 text-[--accent] border border-[--accent]/30 font-extrabold text-sm shrink-0">
                    3
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-white">Autonomous Generation & QC Gate</h4>
                      <span className="badge badge-accent text-[9px]">GEMINI ENGINE</span>
                    </div>
                    <p className="text-xs text-[--fg-soft] leading-relaxed">
                      The Autopilot scans real-time tech signals, filters high-authority topics, drafts tailored 3-channel content packs, generates blueprint graphics, and enforces an 8-point 90+ QC compliance score.
                    </p>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="p-4 rounded-xl bg-[#080a10] border border-white/[0.08] flex items-start gap-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[--accent]/20 text-[--accent] border border-[--accent]/30 font-extrabold text-sm shrink-0">
                    4
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-white">Collaborative Queue Review</h4>
                      <span className="badge badge-muted text-[9px]">ALL USERS</span>
                    </div>
                    <p className="text-xs text-[--fg-soft] leading-relaxed">
                      Invited users and clients review the prepared content queue on the responsive dashboard. They can test hook variations, adjust slide copy, or approve posts with 1-click.
                    </p>
                  </div>
                </div>

                {/* Step 5 */}
                <div className="p-4 rounded-xl bg-[#080a10] border border-white/[0.08] flex items-start gap-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#34d399] text-black font-extrabold text-sm shrink-0">
                    5
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-white">1-Click Buffer Dispatch & Live Metrics</h4>
                      <span className="badge badge-accent text-[9px]">LIVE SYNC</span>
                    </div>
                    <p className="text-xs text-[--fg-soft] leading-relaxed">
                      Approved post groups are queued into Buffer channels at optimal posting slots. Engagement rates, reach metrics, and follower growth automatically populate the live dashboard snapshot.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
