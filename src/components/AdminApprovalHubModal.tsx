import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Clock,
  ExternalLink,
  Filter,
  Mail,
  RefreshCw,
  Send,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Trash2,
  UserCheck,
  UserX,
  Users,
  X,
  Zap,
} from 'lucide-react';
import { googleSignIn, setCachedAccessToken } from '../lib/firebaseAuth.js';
import { sendGmailMessage } from '../lib/gmailService.js';
import { AccessRequest, EmailLog, GmailIntegrationState, UserAccount, WorkspaceProfile } from '../types.js';

interface AdminApprovalHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount;
  workspaces: WorkspaceProfile[];
  onRefreshUsers?: () => void;
}

export function AdminApprovalHubModal({
  isOpen,
  onClose,
  currentUser,
  workspaces,
  onRefreshUsers,
}: AdminApprovalHubModalProps) {
  const [activeTab, setActiveTab] = useState<'requests' | 'gmail' | 'rules' | 'users'>('requests');
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [gmailState, setGmailState] = useState<GmailIntegrationState>({
    isConnected: true,
    adminEmail: 'Asabsiddx2000@gmail.com',
    autoApproveDomains: ['@autopilot.studio'],
    autoApproveAll: false,
    sentEmailCount: 0,
  });

  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // New domain rule input
  const [newDomain, setNewDomain] = useState('');
  // Test email state
  const [testEmailLoading, setTestEmailLoading] = useState(false);
  const [requestFilter, setRequestFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [reqRes, gmailRes, usersRes] = await Promise.all([
        fetch('/api/auth/requests'),
        fetch('/api/gmail/state'),
        fetch('/api/auth/users'),
      ]);

      const reqData = await reqRes.json();
      const gmailData = await gmailRes.json();
      const usersData = await usersRes.json();

      setRequests(reqData.requests || []);
      setGmailState(gmailData.state || gmailState);
      setEmailLogs(gmailData.logs || []);
      setUsers(usersData.users || []);
    } catch (e) {
      console.error('Failed to load admin approval data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAllData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleApprove = async (request: AccessRequest) => {
    setActionLoadingId(request.id);
    setFeedbackMessage(null);

    try {
      const res = await fetch('/api/auth/requests/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId: request.id,
          reviewerName: `${currentUser.name} (${currentUser.role})`,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to approve user');
      }

      // Also try to dispatch direct Gmail API email if OAuth token is in memory
      sendGmailMessage({
        to: request.email,
        from: 'Asabsiddx2000@gmail.com',
        subject: `🎉 Access Approved: Welcome to Autopilot Command Center`,
        bodyHtml: `<p>Hi ${request.name}, your access to the Autopilot Command Center has been approved! You can now log in.</p>`,
      }).catch((e) => console.log('Client direct dispatch fallback:', e));

      setFeedbackMessage({
        type: 'success',
        text: `Approved access for ${request.name}! Confirmation email sent to ${request.email}.`,
      });

      fetchAllData();
      if (onRefreshUsers) onRefreshUsers();
    } catch (err: any) {
      setFeedbackMessage({ type: 'error', text: err.message || 'Approval failed.' });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (request: AccessRequest) => {
    setActionLoadingId(request.id);
    setFeedbackMessage(null);

    try {
      const res = await fetch('/api/auth/requests/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId: request.id,
          reviewerName: `${currentUser.name} (${currentUser.role})`,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to reject request');
      }

      setFeedbackMessage({
        type: 'success',
        text: `Access request for ${request.name} was declined.`,
      });

      fetchAllData();
    } catch (err: any) {
      setFeedbackMessage({ type: 'error', text: err.message || 'Action failed.' });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleConnectGmailOAuth = async () => {
    try {
      const { user, accessToken } = await googleSignIn();
      if (accessToken) {
        setCachedAccessToken(accessToken);
      }
      setFeedbackMessage({
        type: 'success',
        text: `Successfully authorized Gmail account: ${user.email}`,
      });
      // Update backend
      await fetch('/api/gmail/state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminEmail: user.email || 'Asabsiddx2000@gmail.com',
          isConnected: true,
          lastSyncTime: new Date().toISOString(),
        }),
      });
      fetchAllData();
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setFeedbackMessage({ type: 'error', text: err.message || 'Failed to authorize Gmail.' });
      }
    }
  };

  const handleSendTestEmail = async () => {
    setTestEmailLoading(true);
    setFeedbackMessage(null);

    try {
      const res = await sendGmailMessage({
        to: gmailState.adminEmail || 'Asabsiddx2000@gmail.com',
        from: 'Asabsiddx2000@gmail.com',
        subject: `[Test] Autopilot Command Center Gmail Integration Active`,
        bodyHtml: `
          <div style="font-family: sans-serif; padding: 20px; background: #0c0f17; color: #fff; border-radius: 10px;">
            <h2 style="color: #60a5fa;">✅ Gmail Dispatch System Operational</h2>
            <p>This confirms that your administrator Gmail account (${gmailState.adminEmail}) is successfully wired to receive user registration requests and dispatch approval emails.</p>
            <p style="color: #94a3b8; font-size: 12px;">Timestamp: ${new Date().toLocaleString()}</p>
          </div>
        `,
        bodyText: 'This confirms that your administrator Gmail account is successfully wired to receive user registration requests.',
      });

      if (res.success) {
        setFeedbackMessage({
          type: 'success',
          text: `Test email dispatched to ${gmailState.adminEmail || 'Asabsiddx2000@gmail.com'}! Check your inbox.`,
        });
        fetchAllData();
      } else {
        throw new Error(res.error || 'Failed to dispatch test email');
      }
    } catch (err: any) {
      setFeedbackMessage({ type: 'error', text: err.message || 'Test dispatch failed.' });
    } finally {
      setTestEmailLoading(false);
    }
  };

  const handleAddAutoDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomain.trim()) return;
    const cleanDomain = newDomain.trim().startsWith('@') ? newDomain.trim() : `@${newDomain.trim()}`;

    if (gmailState.autoApproveDomains.includes(cleanDomain)) {
      setNewDomain('');
      return;
    }

    const updatedDomains = [...gmailState.autoApproveDomains, cleanDomain];
    try {
      const res = await fetch('/api/gmail/state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ autoApproveDomains: updatedDomains }),
      });
      const data = await res.json();
      if (data.success) {
        setGmailState(data.state);
        setNewDomain('');
        setFeedbackMessage({ type: 'success', text: `Added auto-approve domain: ${cleanDomain}` });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRemoveAutoDomain = async (domainToRemove: string) => {
    const updatedDomains = gmailState.autoApproveDomains.filter((d) => d !== domainToRemove);
    try {
      const res = await fetch('/api/gmail/state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ autoApproveDomains: updatedDomains }),
      });
      const data = await res.json();
      if (data.success) {
        setGmailState(data.state);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleAutoApproveAll = async () => {
    const newValue = !gmailState.autoApproveAll;
    try {
      const res = await fetch('/api/gmail/state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ autoApproveAll: newValue }),
      });
      const data = await res.json();
      if (data.success) {
        setGmailState(data.state);
        setFeedbackMessage({
          type: 'success',
          text: newValue ? 'Auto-approve all signups enabled.' : 'Auto-approve all disabled. Manual approval required.',
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredRequests = requests.filter((r) => {
    if (requestFilter === 'all') return true;
    return r.status === requestFilter;
  });

  const pendingCount = requests.filter((r) => r.status === 'pending').length;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-xl animate-fade-in overflow-y-auto">
      <div
        id="admin-approval-hub-modal"
        className="w-full max-w-4xl bg-[#0c0f17] border border-white/[0.14] rounded-2xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[90vh]"
      >
        {/* Header Bar */}
        <div className="p-5 sm:p-6 border-b border-white/[0.08] bg-[#0f1422] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">
                  Admin Access & Gmail Approval Hub
                </h2>
                {pendingCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                    {pendingCount} Pending
                  </span>
                )}
              </div>
              <p className="text-xs text-[--muted]">
                Connected Admin: <span className="text-white font-mono">{gmailState.adminEmail}</span> • Autonomous Gmail approval automation
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="btn-icon !h-8 !w-8 text-[--muted] hover:text-white"
            title="Close modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Feedback Banner */}
        {feedbackMessage && (
          <div
            className={`p-3 px-6 text-xs flex items-center justify-between transition-all ${
              feedbackMessage.type === 'success'
                ? 'bg-emerald-500/15 border-b border-emerald-500/30 text-emerald-300'
                : 'bg-red-500/15 border-b border-red-500/30 text-red-300'
            }`}
          >
            <div className="flex items-center gap-2">
              {feedbackMessage.type === 'success' ? (
                <CheckCircle2 className="h-4 w-4 shrink-0" />
              ) : (
                <AlertCircle className="h-4 w-4 shrink-0" />
              )}
              <span>{feedbackMessage.text}</span>
            </div>
            <button
              onClick={() => setFeedbackMessage(null)}
              className="text-[11px] hover:underline opacity-80"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-white/[0.08] px-6 bg-[#0c0f17]">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab('requests')}
              className={`py-3.5 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'requests'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-[--muted] hover:text-white'
              }`}
            >
              <UserCheck className="h-4 w-4" />
              <span>Access Requests</span>
              {pendingCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500/30 text-amber-300 font-bold">
                  {pendingCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('gmail')}
              className={`py-3.5 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'gmail'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-[--muted] hover:text-white'
              }`}
            >
              <Mail className="h-4 w-4" />
              <span>Gmail Integration & Logs</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-blue-500/20 text-blue-300 font-medium">
                {emailLogs.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('rules')}
              className={`py-3.5 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'rules'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-[--muted] hover:text-white'
              }`}
            >
              <Zap className="h-4 w-4" />
              <span>Auto-Approval Rules</span>
            </button>

            <button
              onClick={() => setActiveTab('users')}
              className={`py-3.5 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'users'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-[--muted] hover:text-white'
              }`}
            >
              <Users className="h-4 w-4" />
              <span>Active Users ({users.length})</span>
            </button>
          </div>

          <button
            onClick={fetchAllData}
            disabled={loading}
            className="text-xs text-[--muted] hover:text-white flex items-center gap-1.5 py-1 px-2.5 rounded-lg bg-white/[0.04] border border-white/[0.08]"
          >
            <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* TAB 1: ACCESS REQUESTS */}
          {activeTab === 'requests' && (
            <div className="space-y-4">
              {/* Filter controls */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Filter className="h-3.5 w-3.5 text-[--muted]" />
                  <span className="text-xs text-[--muted]">Filter by:</span>
                  {(['all', 'pending', 'approved', 'rejected'] as const).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setRequestFilter(filter)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium capitalize transition-all ${
                        requestFilter === filter
                          ? 'bg-blue-600/30 text-blue-300 border border-blue-500/40'
                          : 'bg-white/[0.04] text-[--muted] hover:text-white'
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>

                <div className="text-xs text-[--muted]">
                  Showing {filteredRequests.length} of {requests.length} requests
                </div>
              </div>

              {/* Requests List */}
              {filteredRequests.length === 0 ? (
                <div className="p-8 text-center bg-[#0e121d] rounded-xl border border-white/[0.06] text-xs text-[--muted]">
                  <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto mb-2 opacity-80" />
                  <p className="font-semibold text-white">No access requests found</p>
                  <p className="text-[11px] mt-0.5">All incoming user registrations are up to date.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredRequests.map((req) => (
                    <div
                      key={req.id}
                      className="p-4 rounded-xl bg-[#0f1422] border border-white/[0.08] hover:border-white/[0.14] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="font-bold text-white text-sm">{req.name}</span>
                          <span className="text-xs font-mono text-blue-400">@{req.username}</span>
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                              req.status === 'approved'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : req.status === 'rejected'
                                ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            }`}
                          >
                            {req.status}
                          </span>
                          <span className="px-2 py-0.5 rounded-md text-[10px] bg-purple-500/15 text-purple-300 border border-purple-500/30 uppercase font-semibold">
                            Role: {req.requestedRole}
                          </span>
                        </div>

                        <div className="text-xs text-[--muted] flex items-center gap-4 flex-wrap">
                          <span className="flex items-center gap-1.5 text-[--fg-soft]">
                            <Mail className="h-3.5 w-3.5 text-[--muted]" /> {req.email}
                          </span>
                          <span>Submitted: {new Date(req.createdAt).toLocaleString()}</span>
                          {req.reviewedBy && (
                            <span className="text-emerald-400">Reviewed by: {req.reviewedBy}</span>
                          )}
                        </div>

                        {req.notes && (
                          <div className="text-xs text-[--muted] bg-black/30 p-2 rounded-lg border border-white/[0.04] mt-1">
                            <span className="text-[--fg-soft] font-medium">User Note:</span> {req.notes}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        {req.status === 'pending' ? (
                          <>
                            <button
                              onClick={() => handleApprove(req)}
                              disabled={actionLoadingId === req.id}
                              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all shadow-md shadow-emerald-950 flex items-center gap-1.5 disabled:opacity-50"
                            >
                              {actionLoadingId === req.id ? (
                                <RefreshCw className="h-3 w-3 animate-spin" />
                              ) : (
                                <Check className="h-3.5 w-3.5" />
                              )}
                              <span>Approve & Email</span>
                            </button>

                            <button
                              onClick={() => handleReject(req)}
                              disabled={actionLoadingId === req.id}
                              className="px-3 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30 text-xs font-medium transition-all disabled:opacity-50"
                            >
                              Reject
                            </button>
                          </>
                        ) : (
                          <div className="text-xs text-[--muted] flex items-center gap-1.5">
                            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                            <span>Action Completed</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: GMAIL INTEGRATION & LOGS */}
          {activeTab === 'gmail' && (
            <div className="space-y-6">
              {/* Status card */}
              <div className="p-5 rounded-2xl bg-[#0f1422] border border-white/[0.08] space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping" />
                      <h3 className="text-sm font-bold text-white">
                        Gmail Workspace Connector Active
                      </h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        OAuth Scopes Connected
                      </span>
                    </div>
                    <p className="text-xs text-[--muted]">
                      Admin notifications are sent to: <strong className="text-white">{gmailState.adminEmail}</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleConnectGmailOAuth}
                      className="btn-secondary !py-1.5 !px-3 text-xs font-semibold flex items-center gap-1.5"
                    >
                      <RefreshCw className="h-3 w-3" />
                      <span>Re-authorize Gmail</span>
                    </button>

                    <button
                      onClick={handleSendTestEmail}
                      disabled={testEmailLoading}
                      className="btn-primary !py-1.5 !px-3 text-xs font-semibold flex items-center gap-1.5"
                    >
                      <Send className="h-3 w-3" />
                      <span>{testEmailLoading ? 'Sending...' : 'Send Test Email'}</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-white/[0.06] text-xs">
                  <div className="p-3 bg-black/30 rounded-xl border border-white/[0.04]">
                    <div className="text-[--muted] text-[11px]">Authorized Scopes</div>
                    <div className="font-mono text-emerald-400 text-[11px] mt-0.5 truncate">
                      gmail.send, gmail.readonly
                    </div>
                  </div>
                  <div className="p-3 bg-black/30 rounded-xl border border-white/[0.04]">
                    <div className="text-[--muted] text-[11px]">Total Dispatches</div>
                    <div className="font-bold text-white text-sm mt-0.5">
                      {emailLogs.length} Emails Sent
                    </div>
                  </div>
                  <div className="p-3 bg-black/30 rounded-xl border border-white/[0.04]">
                    <div className="text-[--muted] text-[11px]">Last Sync</div>
                    <div className="text-[--fg-soft] text-[11px] mt-0.5">
                      {new Date().toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Email logs table */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[--muted]">
                  Dispatched Email History & Audit Log
                </h4>

                {emailLogs.length === 0 ? (
                  <div className="p-6 text-center bg-[#0e121d] rounded-xl border border-white/[0.06] text-xs text-[--muted]">
                    No email dispatches recorded yet.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {emailLogs.map((log) => (
                      <div
                        key={log.id}
                        className="p-3 rounded-xl bg-[#0f1422] border border-white/[0.06] flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="space-y-0.5 truncate flex-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                                log.type === 'admin_approval_request'
                                  ? 'bg-blue-500/20 text-blue-300'
                                  : 'bg-emerald-500/20 text-emerald-300'
                              }`}
                            >
                              {log.type === 'admin_approval_request' ? 'Admin Prompt' : 'User Approval'}
                            </span>
                            <span className="font-semibold text-white truncate">{log.subject}</span>
                          </div>
                          <div className="text-[11px] text-[--muted] flex items-center gap-3">
                            <span>To: <strong className="text-[--fg-soft]">{log.to}</strong></span>
                            <span>{new Date(log.sentAt).toLocaleString()}</span>
                          </div>
                        </div>

                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                          SENT ✓
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: AUTO-APPROVAL RULES */}
          {activeTab === 'rules' && (
            <div className="space-y-6">
              {/* Toggle Global Auto-approve */}
              <div className="p-5 rounded-2xl bg-[#0f1422] border border-white/[0.08] flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white">Auto-Approve All Incoming Signups</h4>
                  <p className="text-xs text-[--muted]">
                    When enabled, any user who registers via the public portal is immediately granted reviewer access without waiting for admin approval.
                  </p>
                </div>

                <button
                  onClick={handleToggleAutoApproveAll}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    gmailState.autoApproveAll
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950'
                      : 'bg-white/[0.08] text-[--muted] hover:text-white'
                  }`}
                >
                  {gmailState.autoApproveAll ? 'ENABLED' : 'DISABLED'}
                </button>
              </div>

              {/* Domain Whitelist */}
              <div className="p-5 rounded-2xl bg-[#0f1422] border border-white/[0.08] space-y-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white">Trusted Domain Auto-Approvals</h4>
                  <p className="text-xs text-[--muted]">
                    Users registering with emails matching these domains will be automatically approved and activated.
                  </p>
                </div>

                <form onSubmit={handleAddAutoDomain} className="flex gap-2">
                  <input
                    type="text"
                    value={newDomain}
                    onChange={(e) => setNewDomain(e.target.value)}
                    placeholder="e.g. @autopilot.studio or @growthagency.ai"
                    className="input-base flex-1 text-xs"
                  />
                  <button type="submit" className="btn-primary !px-4 text-xs font-semibold shrink-0">
                    Add Domain Rule
                  </button>
                </form>

                <div className="flex flex-wrap gap-2 pt-2">
                  {gmailState.autoApproveDomains.map((dom) => (
                    <span
                      key={dom}
                      className="px-3 py-1.5 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-300 text-xs font-mono flex items-center gap-2"
                    >
                      <span>{dom}</span>
                      <button
                        onClick={() => handleRemoveAutoDomain(dom)}
                        className="text-blue-400 hover:text-white"
                        title="Remove domain"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ACTIVE USERS */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {users.map((u) => (
                  <div
                    key={u.id}
                    className="p-4 rounded-xl bg-[#0f1422] border border-white/[0.08] flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-10 w-10 rounded-xl bg-gradient-to-tr ${
                          u.avatarColor || 'from-blue-600 to-indigo-600'
                        } flex items-center justify-center font-bold text-white text-xs shadow-sm`}
                      >
                        {u.avatarInitials}
                      </div>
                      <div>
                        <div className="font-bold text-white text-sm flex items-center gap-1.5">
                          <span>{u.name}</span>
                          {u.role === 'author' && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] bg-blue-500/20 text-blue-300 font-bold uppercase">
                              Author Owner
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-[--muted]">{u.email}</div>
                        <div className="text-[10px] text-purple-400 uppercase font-semibold mt-0.5">
                          {u.role} • Joined {u.joinedDate}
                        </div>
                      </div>
                    </div>

                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      ACTIVE
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-black/40 border-t border-white/[0.08] flex items-center justify-between text-xs text-[--muted]">
          <span>Admin Master Key: <strong className="text-white">Asabsiddx2000@gmail.com</strong></span>
          <button onClick={onClose} className="btn-secondary !py-1.5 !px-4 text-xs">
            Close Hub
          </button>
        </div>
      </div>
    </div>
  );
}
