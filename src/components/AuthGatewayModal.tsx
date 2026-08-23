import React, { useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  Mail,
  Send,
  Shield,
  Sparkles,
  User as UserIcon,
  Users,
  Zap,
} from 'lucide-react';
import { googleSignIn, setCachedAccessToken } from '../lib/firebaseAuth.js';
import { UserAccount, WorkspaceProfile } from '../types.js';

interface AuthGatewayModalProps {
  isOpen: boolean;
  onClose?: () => void;
  workspaces: WorkspaceProfile[];
  onAuthSuccess: (user: UserAccount) => void;
}

export function AuthGatewayModal({
  isOpen,
  onClose,
  workspaces,
  onAuthSuccess,
}: AuthGatewayModalProps) {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup' | 'status'>('signin');
  const [showPassword, setShowPassword] = useState(false);

  // Sign In State
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginPendingInfo, setLoginPendingInfo] = useState<string | null>(null);

  // Sign Up / Access Request State
  const [signupName, setSignupName] = useState('');
  const [signupUsername, setSignupUsername] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupRole, setSignupRole] = useState<'reviewer' | 'client' | 'author' | 'viewer'>('reviewer');
  const [signupWorkspaceId, setSignupWorkspaceId] = useState(workspaces[0]?.id || 'ws_agency_default');
  const [signupNotes, setSignupNotes] = useState('');
  const [signupLoading, setSignupLoading] = useState(false);
  const [signupSuccessData, setSignupSuccessData] = useState<{
    message: string;
    autoApproved: boolean;
    email: string;
  } | null>(null);
  const [signupError, setSignupError] = useState<string | null>(null);

  // Status check state
  const [checkEmail, setCheckEmail] = useState('');
  const [statusResult, setStatusResult] = useState<{
    found: boolean;
    status?: 'pending' | 'approved' | 'rejected';
    message?: string;
  } | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);

  if (!isOpen) return null;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginPendingInfo(null);
    setLoginLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: loginIdentifier,
          password: loginPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        if (data.pending) {
          setLoginPendingInfo(data.message || 'Your account is pending administrator approval.');
        } else {
          setLoginError(data.message || data.error || 'Failed to sign in. Please verify credentials.');
        }
        return;
      }

      // Login successful
      localStorage.setItem('autopilot_authenticated_user', JSON.stringify(data.user));
      onAuthSuccess(data.user);
    } catch (err: any) {
      setLoginError(err.message || 'Network error occurred. Please try again.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoginError(null);
    setLoginPendingInfo(null);
    setLoginLoading(true);

    try {
      const { user, accessToken } = await googleSignIn();
      if (accessToken) {
        setCachedAccessToken(accessToken);
      }

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          googleEmail: user.email,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        if (data.pending) {
          setLoginPendingInfo(data.message || 'Your Google account access request is pending admin approval.');
        } else if (data.notFound) {
          // Pre-fill sign up tab
          setSignupName(user.displayName || '');
          setSignupEmail(user.email || '');
          setSignupUsername((user.email || '').split('@')[0]);
          setActiveTab('signup');
          setSignupError('Account not found. Please submit an access request to obtain platform approval.');
        } else {
          setLoginError(data.message || 'Google authorization failed.');
        }
        return;
      }

      localStorage.setItem('autopilot_authenticated_user', JSON.stringify(data.user));
      onAuthSuccess(data.user);
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setLoginError(err.message || 'Google Sign-In failed.');
      }
    } finally {
      setLoginLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError(null);
    setSignupSuccessData(null);
    setSignupLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: signupName,
          username: signupUsername,
          email: signupEmail,
          password: signupPassword,
          requestedRole: signupRole,
          requestedWorkspaceId: signupWorkspaceId,
          notes: signupNotes,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setSignupError(data.error || 'Failed to submit registration request.');
        return;
      }

      setSignupSuccessData({
        message: data.message,
        autoApproved: data.autoApproved,
        email: signupEmail,
      });

      if (data.autoApproved && data.user) {
        setTimeout(() => {
          localStorage.setItem('autopilot_authenticated_user', JSON.stringify(data.user));
          onAuthSuccess(data.user);
        }, 1200);
      }
    } catch (err: any) {
      setSignupError(err.message || 'Failed to submit registration request.');
    } finally {
      setSignupLoading(false);
    }
  };

  const handleCheckStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkEmail.trim()) return;
    setStatusLoading(true);
    setStatusResult(null);

    try {
      const res = await fetch('/api/auth/requests');
      const data = await res.json();
      const requests = data.requests || [];
      const match = requests.find((r: any) => r.email.toLowerCase() === checkEmail.trim().toLowerCase());

      if (match) {
        setStatusResult({
          found: true,
          status: match.status,
          message:
            match.status === 'approved'
              ? `Your access request for ${match.email} has been approved! You can now sign in with your credentials.`
              : match.status === 'rejected'
              ? `Your access request was declined by the administrator.`
              : `Your request submitted on ${new Date(match.createdAt).toLocaleDateString()} is pending admin approval via Gmail.`,
        });
      } else {
        // Check if already an active user
        const usersRes = await fetch('/api/auth/users');
        const usersData = await usersRes.json();
        const userMatch = (usersData.users || []).find((u: any) => u.email.toLowerCase() === checkEmail.trim().toLowerCase());

        if (userMatch) {
          setStatusResult({
            found: true,
            status: 'approved',
            message: `Account is active! You can sign in as ${userMatch.name} (${userMatch.role}).`,
          });
        } else {
          setStatusResult({
            found: false,
            message: 'No registration request found for this email address. Please click "Sign Up" to request access.',
          });
        }
      }
    } catch (e: any) {
      setStatusResult({ found: false, message: 'Could not check status. Please try again.' });
    } finally {
      setStatusLoading(false);
    }
  };

  // Quick switch bypass helper for testing
  const handleQuickLogin = async (email: string) => {
    setLoginLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: email, password: 'password123' }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        localStorage.setItem('autopilot_authenticated_user', JSON.stringify(data.user));
        onAuthSuccess(data.user);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoginLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-xl animate-fade-in overflow-y-auto">
      <div
        id="auth-gateway-modal"
        className="w-full max-w-xl bg-[#0c0f17] border border-white/[0.12] rounded-2xl shadow-2xl overflow-hidden my-auto flex flex-col relative"
      >
        {/* Top Header Glow */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500" />

        {/* Modal Header */}
        <div className="p-6 sm:p-7 border-b border-white/[0.08] bg-[#0f1422]">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-sm">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
                  Social Media Autopilot
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-blue-500/15 text-blue-400 border border-blue-500/30">
                    Access Portal
                  </span>
                </h2>
                <p className="text-xs sm:text-sm text-[--muted] mt-0.5">
                  Autonomous thought leadership & social distribution network
                </p>
              </div>
            </div>

            {onClose && (
              <button
                onClick={onClose}
                className="btn-icon !h-8 !w-8 text-[--muted] hover:text-white"
                title="Dismiss"
              >
                ✕
              </button>
            )}
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 mt-6 p-1 bg-black/40 border border-white/[0.06] rounded-xl text-xs">
            <button
              onClick={() => {
                setActiveTab('signin');
                setLoginError(null);
                setLoginPendingInfo(null);
              }}
              className={`flex-1 py-2 px-3 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'signin'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30'
                  : 'text-[--muted] hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <KeyRound className="h-3.5 w-3.5" />
              Sign In
            </button>
            <button
              onClick={() => {
                setActiveTab('signup');
                setSignupError(null);
                setSignupSuccessData(null);
              }}
              className={`flex-1 py-2 px-3 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'signup'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30'
                  : 'text-[--muted] hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <UserIcon className="h-3.5 w-3.5" />
              Sign Up / Request Access
            </button>
            <button
              onClick={() => setActiveTab('status')}
              className={`py-2 px-3 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'status'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30'
                  : 'text-[--muted] hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Clock className="h-3.5 w-3.5" />
              Status
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-7 space-y-6">
          {/* TAB 1: SIGN IN */}
          {activeTab === 'signin' && (
            <div className="space-y-5">
              {/* Google Workspace Sign In Button */}
              <div>
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loginLoading}
                  className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-semibold text-sm transition-all shadow-md active:scale-[0.99] disabled:opacity-50 cursor-pointer"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path
                      fill="#EA4335"
                      d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15.1c0 2.8.7 5.4 1.9 7.8l3.7-2.9z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 17C3.7 20.7 7.5 24 12 24z"
                    />
                  </svg>
                  <span>Continue with Google Workspace</span>
                </button>
                <div className="flex items-center gap-3 my-4">
                  <div className="flex-1 h-px bg-white/[0.08]" />
                  <span className="text-[11px] uppercase tracking-wider text-[--muted]">or sign in with password</span>
                  <div className="flex-1 h-px bg-white/[0.08]" />
                </div>
              </div>

              {/* Pending Approval Notice */}
              {loginPendingInfo && (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs flex items-start gap-3 animate-fade-in">
                  <Clock className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-semibold text-amber-200">Account Pending Admin Approval</p>
                    <p className="text-amber-300/90 leading-relaxed">{loginPendingInfo}</p>
                    <p className="text-[11px] text-amber-400/80 pt-1">
                      Once approved by the author (Asabsiddx2000@gmail.com), you will receive a confirmation email.
                    </p>
                  </div>
                </div>
              )}

              {/* Login Error Notice */}
              {loginError && (
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/25 text-red-300 text-xs flex items-center gap-2.5 animate-fade-in">
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                  <span>{loginError}</span>
                </div>
              )}

              {/* Standard Login Form */}
              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[--fg-soft] mb-1.5">
                    Email or Username
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      placeholder="e.g. Asabsiddx2000@gmail.com or asab"
                      required
                      className="input-base !pl-10 w-full"
                    />
                    <Mail className="h-4 w-4 text-[--muted] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-medium text-[--fg-soft]">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-[11px] text-[--muted] hover:text-white flex items-center gap-1"
                    >
                      {showPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                      <span>{showPassword ? 'Hide' : 'Show'}</span>
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Enter your account password"
                      required
                      className="input-base !pl-10 w-full"
                    />
                    <Lock className="h-4 w-4 text-[--muted] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full btn-primary !py-2.5 flex items-center justify-center gap-2 text-sm font-semibold shadow-lg shadow-blue-600/20"
                >
                  {loginLoading ? (
                    <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Enter Autopilot Platform</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Quick Select Testing Accounts */}
              <div className="pt-3 border-t border-white/[0.06]">
                <p className="text-[11px] text-[--muted] mb-2 font-medium">Quick switch accounts (Demo & Testing):</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('Asabsiddx2000@gmail.com')}
                    className="p-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-left transition-all group"
                  >
                    <div className="text-[11px] font-bold text-blue-300 flex items-center gap-1">
                      <Shield className="h-3 w-3" /> Author Admin
                    </div>
                    <div className="text-[10px] text-[--muted] truncate">Asab Siddiqui</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('alex@growthagency.ai')}
                    className="p-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-left transition-all group"
                  >
                    <div className="text-[11px] font-bold text-emerald-300 flex items-center gap-1">
                      <Users className="h-3 w-3" /> Reviewer
                    </div>
                    <div className="text-[10px] text-[--muted] truncate">Alex Rivera</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('mara.rivera@autopilot.studio')}
                    className="p-2 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 text-left transition-all group"
                  >
                    <div className="text-[11px] font-bold text-purple-300 flex items-center gap-1">
                      <Zap className="h-3 w-3" /> Client Viewer
                    </div>
                    <div className="text-[10px] text-[--muted] truncate">Mara Chen</div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SIGN UP / ACCESS REQUEST */}
          {activeTab === 'signup' && (
            <div className="space-y-5">
              {signupSuccessData ? (
                <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-4 animate-fade-in">
                  <div className="h-12 w-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-white">
                      {signupSuccessData.autoApproved ? 'Access Approved & Ready!' : 'Access Request Submitted'}
                    </h3>
                    <p className="text-xs text-emerald-300/90 max-w-md mx-auto leading-relaxed">
                      {signupSuccessData.message}
                    </p>
                  </div>

                  {!signupSuccessData.autoApproved && (
                    <div className="p-3.5 bg-black/40 border border-white/[0.08] rounded-xl text-left text-xs text-[--fg-soft] space-y-2">
                      <div className="flex items-center gap-2 text-blue-400 font-semibold">
                        <Mail className="h-4 w-4" /> Admin Notification Dispatched
                      </div>
                      <p className="text-[11px] text-[--muted]">
                        An approval prompt has been dispatched to the platform author's inbox (<strong>Asabsiddx2000@gmail.com</strong>).
                        Once approved, you will receive an automatic confirmation at <strong>{signupSuccessData.email}</strong>.
                      </p>
                    </div>
                  )}

                  <button
                    onClick={() => {
                      setSignupSuccessData(null);
                      setActiveTab('signin');
                    }}
                    className="btn-secondary !py-2 !px-4 text-xs font-semibold"
                  >
                    Return to Sign In
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSignUp} className="space-y-4">
                  {signupError && (
                    <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/25 text-red-300 text-xs flex items-center gap-2.5">
                      <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                      <span>{signupError}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-medium text-[--fg-soft] mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={signupName}
                        onChange={(e) => setSignupName(e.target.value)}
                        placeholder="e.g. Marcus Vance"
                        required
                        className="input-base w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[--fg-soft] mb-1">
                        Desired Username *
                      </label>
                      <input
                        type="text"
                        value={signupUsername}
                        onChange={(e) => setSignupUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                        placeholder="e.g. marcus_v"
                        required
                        className="input-base w-full"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-medium text-[--fg-soft] mb-1">
                        Work Email Address *
                      </label>
                      <input
                        type="email"
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        placeholder="marcus@techscale.co"
                        required
                        className="input-base w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[--fg-soft] mb-1">
                        Create Password *
                      </label>
                      <input
                        type="password"
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        placeholder="Minimum 6 characters"
                        required
                        minLength={6}
                        className="input-base w-full"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-medium text-[--fg-soft] mb-1">
                        Requested Role
                      </label>
                      <select
                        value={signupRole}
                        onChange={(e) => setSignupRole(e.target.value as any)}
                        className="input-base w-full bg-[#111520]"
                      >
                        <option value="reviewer">Reviewer (Review drafts & approve)</option>
                        <option value="client">Client Viewer (Read-only queue)</option>
                        <option value="author">Co-Author (Campaign strategist)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[--fg-soft] mb-1">
                        Assigned Workspace
                      </label>
                      <select
                        value={signupWorkspaceId}
                        onChange={(e) => setSignupWorkspaceId(e.target.value)}
                        className="input-base w-full bg-[#111520]"
                      >
                        {workspaces.map((ws) => (
                          <option key={ws.id} value={ws.id}>
                            {ws.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[--fg-soft] mb-1">
                      Reason for Request / Note to Admin (Optional)
                    </label>
                    <textarea
                      value={signupNotes}
                      onChange={(e) => setSignupNotes(e.target.value)}
                      placeholder="e.g. I am joining the marketing team to review scheduled LinkedIn posts."
                      rows={2}
                      className="input-base w-full resize-none text-xs"
                    />
                  </div>

                  <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-[11px] text-blue-300 flex items-start gap-2.5">
                    <Sparkles className="h-4 w-4 shrink-0 text-blue-400 mt-0.5" />
                    <span>
                      After submission, an automated approval email is dispatched via Gmail to the platform owner (<strong>Asabsiddx2000@gmail.com</strong>).
                      You will receive an email once your account is activated.
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={signupLoading}
                    className="w-full btn-primary !py-2.5 flex items-center justify-center gap-2 text-sm font-semibold shadow-lg shadow-blue-600/20"
                  >
                    {signupLoading ? (
                      <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        <span>Submit Registration & Request Access</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* TAB 3: CHECK REQUEST STATUS */}
          {activeTab === 'status' && (
            <div className="space-y-5">
              <p className="text-xs text-[--muted]">
                Enter the email address you used when requesting access to check if your account has been approved.
              </p>

              <form onSubmit={handleCheckStatus} className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={checkEmail}
                    onChange={(e) => setCheckEmail(e.target.value)}
                    placeholder="Enter your registered work email"
                    required
                    className="input-base flex-1"
                  />
                  <button
                    type="submit"
                    disabled={statusLoading}
                    className="btn-secondary !px-4 text-xs font-semibold shrink-0"
                  >
                    {statusLoading ? 'Checking...' : 'Check Status'}
                  </button>
                </div>
              </form>

              {statusResult && (
                <div
                  className={`p-4 rounded-xl border text-xs space-y-2 animate-fade-in ${
                    statusResult.status === 'approved'
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : statusResult.status === 'rejected'
                      ? 'bg-red-500/10 border-red-500/30 text-red-300'
                      : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                  }`}
                >
                  <div className="font-semibold flex items-center gap-2">
                    {statusResult.status === 'approved' ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    ) : statusResult.status === 'rejected' ? (
                      <AlertCircle className="h-4 w-4 text-red-400" />
                    ) : (
                      <Clock className="h-4 w-4 text-amber-400" />
                    )}
                    <span>
                      Status:{' '}
                      {statusResult.status
                        ? statusResult.status.toUpperCase()
                        : 'NOT REGISTERED'}
                    </span>
                  </div>
                  <p className="leading-relaxed opacity-90">{statusResult.message}</p>
                  {statusResult.status === 'approved' && (
                    <button
                      onClick={() => {
                        setLoginIdentifier(checkEmail);
                        setActiveTab('signin');
                      }}
                      className="btn-primary !py-1.5 !px-3 text-xs font-semibold mt-2 inline-flex items-center gap-1.5"
                    >
                      <span>Proceed to Sign In</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-black/40 border-t border-white/[0.06] text-center text-[11px] text-[--muted]">
          Protected by Enterprise OAuth & Gmail Approval Gates • Admin: <span className="text-white font-mono">Asabsiddx2000@gmail.com</span>
        </div>
      </div>
    </div>
  );
}
