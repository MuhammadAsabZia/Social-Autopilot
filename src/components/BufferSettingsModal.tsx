import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  Check,
  CheckCircle2,
  ExternalLink,
  Eye,
  EyeOff,
  Facebook,
  HelpCircle,
  Image as ImageIcon,
  Instagram,
  Key,
  Linkedin,
  Loader2,
  Radio,
  RefreshCw,
  Save,
  SendHorizontal,
  SlidersHorizontal,
  Sparkles,
  TestTube,
  X,
  Zap,
} from 'lucide-react';
import { BufferConfig, BufferGraphQLChannel } from '../types.js';

interface BufferSettingsModalProps {
  config: BufferConfig;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: BufferConfig) => void;
}

export const BufferSettingsModal: React.FC<BufferSettingsModalProps> = ({ config, isOpen, onClose, onSave }) => {
  const [activeTab, setActiveTab] = useState<'settings' | 'test_queue'>('settings');
  const [formData, setFormData] = useState<BufferConfig>({ ...config });
  const [apiKeyInput, setApiKeyInput] = useState<string>('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [testingToken, setTestingToken] = useState(false);
  const [testResult, setTestResult] = useState<{
    tested: boolean;
    success: boolean;
    organizationName?: string;
    message: string;
    details?: string;
    channels?: BufferGraphQLChannel[];
  } | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [testPlatform, setTestPlatform] = useState<'all' | 'linkedin' | 'instagram' | 'facebook'>('all');
  const [customTestText, setCustomTestText] = useState(
    `🚀 [AI Agency Autopilot Verification]\n\nAutomating multi-channel social growth with Gemini 2.5 Flash and Buffer GraphQL API.\n\n• Zero-human content generation\n• High-engagement hook & formatting\n• Synced Buffer queue delivery\n\n#AIAutomation #BuildWithAI #GeminiFlash #SaaS #ContentOps`
  );
  const [dispatchingTest, setDispatchingTest] = useState(false);
  const [dispatchResult, setDispatchResult] = useState<{
    success: boolean;
    isSimulated: boolean;
    message: string;
    results: {
      platform: string;
      channelId: string;
      channelName: string;
      status: 'queued' | 'failed' | 'simulated';
      postId?: string;
      dueAt?: string;
      textPreview: string;
      error?: string;
    }[];
  } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setFormData({ ...config });
      setApiKeyInput((config as any).apiKey || '');
      setTestResult(null);
      setDispatchResult(null);
    }
  }, [isOpen, config]);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setTestingToken(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/buffer/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: apiKeyInput.trim() || undefined }),
      });
      const data = await res.json();
      if (data.connected) {
        const updatedChannels = { ...formData.channels };
        if (Array.isArray(data.channels)) {
          data.channels.forEach((ch: BufferGraphQLChannel) => {
            const s = (ch.service || '').toLowerCase();
            if (s.includes('linkedin') && updatedChannels.linkedin) {
              updatedChannels.linkedin.channelId = ch.id;
              updatedChannels.linkedin.channelName = ch.name;
              updatedChannels.linkedin.profileId = ch.id;
              updatedChannels.linkedin.profileName = ch.name;
            } else if (s.includes('instagram') && updatedChannels.instagram) {
              updatedChannels.instagram.channelId = ch.id;
              updatedChannels.instagram.channelName = ch.name;
              updatedChannels.instagram.profileId = ch.id;
              updatedChannels.instagram.profileName = ch.name;
            } else if (s.includes('facebook') && updatedChannels.facebook) {
              updatedChannels.facebook.channelId = ch.id;
              updatedChannels.facebook.channelName = ch.name;
              updatedChannels.facebook.profileId = ch.id;
              updatedChannels.facebook.profileName = ch.name;
            }
          });
        }
        const newFormData: any = {
          ...formData,
          isConnected: true,
          isSimulatedMode: false,
          hasEnvKey: true,
          organizationName: data.organizationName,
          organizationId: data.organizationId,
          channels: updatedChannels,
        };
        if (apiKeyInput.trim()) {
          newFormData.apiKey = apiKeyInput.trim();
        }
        setFormData(newFormData);
        setTestResult({
          tested: true,
          success: true,
          organizationName: data.organizationName,
          message: `Connected to "${data.organizationName || 'Personal Workspace'}" — ${data.channels?.length || 0} channel(s) detected.`,
          channels: data.channels,
        });
      } else {
        setTestResult({
          tested: true,
          success: false,
          message: data.error || 'Authentication failed',
          details: data.details || 'Please verify your API Access Token from publish.buffer.com',
        });
      }
    } catch (err: any) {
      setTestResult({
        tested: true,
        success: false,
        message: err.message || 'Network error',
        details: 'Check server connection and try again.',
      });
    } finally {
      setTestingToken(false);
    }
  };

  const handleTestQueueDispatch = async () => {
    setDispatchingTest(true);
    setDispatchResult(null);
    try {
      const res = await fetch('/api/buffer/test-queue-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: testPlatform,
          text: customTestText,
          configOverride: {
            ...formData,
            apiKey: apiKeyInput.trim() || undefined,
          },
        }),
      });
      const data = await res.json();
      setDispatchResult(data);
    } catch (err: any) {
      setDispatchResult({ success: false, isSimulated: formData.isSimulatedMode, message: err.message || 'Error', results: [] });
    } finally {
      setDispatchingTest(false);
    }
  };

  const handleSave = () => {
    const payloadToSave: any = {
      ...formData,
    };
    if (apiKeyInput.trim()) {
      payloadToSave.apiKey = apiKeyInput.trim();
    }
    onSave(payloadToSave);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-xl p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden rounded-2xl border border-white/[0.14] bg-[#0c0f17] shadow-[0_25px_60px_rgba(0,0,0,0.9)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] px-6 py-4 bg-[#111520]">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[--accent-subtle] border border-[--accent]/30 text-[--accent]">
              <SlidersHorizontal className="h-4.5 w-4.5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-[16px]">Buffer Integration & API</h3>
              <p className="text-[10px] text-[--muted] uppercase tracking-widest font-semibold">
                Multi-Channel Dispatch Engine
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-[--muted] hover:text-white hover:bg-white/[0.06] transition-colors" aria-label="Close modal">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/[0.08] px-6 bg-black/20 gap-6">
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 py-3 text-[12px] font-bold uppercase tracking-wider transition-all relative ${
              activeTab === 'settings' ? 'text-white' : 'text-[--muted] hover:text-[--fg-soft]'
            }`}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>API & Channel Mapping</span>
            {activeTab === 'settings' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[--accent] shadow-[0_0_8px_var(--color-accent)]" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('test_queue')}
            className={`flex items-center gap-2 py-3 text-[12px] font-bold uppercase tracking-wider transition-all relative ${
              activeTab === 'test_queue' ? 'text-white' : 'text-[--muted] hover:text-[--fg-soft]'
            }`}
          >
            <TestTube className="h-3.5 w-3.5" />
            <span>Live Dispatch Test</span>
            {activeTab === 'test_queue' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[--accent] shadow-[0_0_8px_var(--color-accent)]" />
            )}
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 no-scrollbar">
          {activeTab === 'settings' && (
            <>
              {/* Direct API Key Input Card */}
              <div className="rounded-xl border border-white/[0.08] bg-black/30 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.04] border border-white/[0.08] text-[--accent]">
                      <Key className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <p className="font-bold text-white text-[14px]">Buffer GraphQL Access Token</p>
                      <p className="text-[11px] text-[--muted]">
                        Connect directly via your Buffer developer token or environment
                      </p>
                    </div>
                  </div>

                  <a
                    href="https://publish.buffer.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-[--accent] hover:underline flex items-center gap-1 shrink-0"
                  >
                    Get API Token <ExternalLink className="h-3 w-3" />
                  </a>
                </div>

                {/* Input with Show/Hide and Sync Button */}
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type={showApiKey ? 'text' : 'password'}
                        value={apiKeyInput}
                        onChange={(e) => setApiKeyInput(e.target.value)}
                        placeholder={formData.hasEnvKey ? (formData.apiKeyMasked || '••••••••••••••••••••••••') : 'Paste Buffer GraphQL Access Token here…'}
                        className="w-full !bg-black/50 !text-[13px] font-mono pr-10 border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-white placeholder:text-white/20 focus:border-[--accent] focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[--muted] hover:text-white transition-colors"
                        title={showApiKey ? 'Hide Token' : 'Show Token'}
                      >
                        {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>

                    <button
                      onClick={handleTestConnection}
                      disabled={testingToken}
                      className="btn-primary text-[12px] !py-2.5 !px-4 shrink-0 shadow-lg"
                    >
                      {testingToken ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Connecting…</span>
                        </>
                      ) : (
                        <>
                          <RefreshCw className="h-4 w-4" />
                          <span>Connect & Fetch Channels</span>
                        </>
                      )}
                    </button>
                  </div>

                  <p className="text-[11px] text-[--muted]">
                    {formData.organizationName ? (
                      <span className="text-[--success] flex items-center gap-1 font-semibold">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Workspace: {formData.organizationName}
                      </span>
                    ) : (
                      'Enter your token above and click Connect to automatically load and map your social channels.'
                    )}
                  </p>
                </div>

                {testResult && (
                  <div
                    className={`rounded-xl border p-3.5 text-[12px] flex items-start gap-2.5 ${
                      testResult.success
                        ? 'border-[--success]/30 bg-[--success]/10 text-emerald-300'
                        : 'border-[--error]/30 bg-[--error]/10 text-rose-300'
                    }`}
                  >
                    {testResult.success ? (
                      <CheckCircle2 className="h-4.5 w-4.5 shrink-0 mt-0.5 text-[--success]" />
                    ) : (
                      <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5 text-[--error]" />
                    )}
                    <div>
                      <p className="font-semibold text-white">{testResult.message}</p>
                      {testResult.details && <p className="text-[11px] opacity-80 mt-0.5">{testResult.details}</p>}
                    </div>
                  </div>
                )}
              </div>

              {/* Execution Mode */}
              <div className="rounded-xl border border-white/[0.06] bg-black/30 p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[--muted] uppercase tracking-wider">Engine Execution Mode</span>
                  <span className="text-[11px] font-bold text-white">
                    {formData.isSimulatedMode ? 'Sandbox Simulator' : 'Live Buffer Dispatch'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setFormData({ ...formData, isSimulatedMode: true })}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      formData.isSimulatedMode
                        ? 'border-[--accent] bg-[--accent-subtle] text-white font-bold shadow-sm'
                        : 'border-white/[0.06] bg-black/20 text-[--muted] hover:border-white/[0.14] hover:text-white'
                    }`}
                  >
                    <p className="text-[13px] font-bold">Sandbox Simulator</p>
                    <p className="text-[11px] text-[--muted] mt-0.5 font-normal">Offline mock pipeline (Safe test)</p>
                  </button>
                  <button
                    onClick={() => setFormData({ ...formData, isSimulatedMode: false })}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      !formData.isSimulatedMode
                        ? 'border-[--accent] bg-[--accent-subtle] text-white font-bold shadow-sm'
                        : 'border-white/[0.06] bg-black/20 text-[--muted] hover:border-white/[0.14] hover:text-white'
                    }`}
                  >
                    <p className="text-[13px] font-bold">Live Buffer Sync</p>
                    <p className="text-[11px] text-[--muted] mt-0.5 font-normal">Actual GraphQL queue delivery</p>
                  </button>
                </div>
              </div>

              {/* Channel Configs */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="eyebrow !text-[10px]">CONNECTED DESTINATIONS</p>
                  <span className="text-[11px] text-[--muted]">Auto-mapped from Buffer account</span>
                </div>

                {(['linkedin', 'instagram', 'facebook'] as const).map((ch) => {
                  const Icon = ch === 'linkedin' ? Linkedin : ch === 'instagram' ? Instagram : Facebook;
                  const brandColor = ch === 'linkedin' ? 'text-[#0a66c2]' : ch === 'instagram' ? 'text-[#e1306c]' : 'text-[#1877f2]';
                  const brandBadgeBg = ch === 'linkedin' ? 'bg-[#0a66c2]/10 border-[#0a66c2]/30' : ch === 'instagram' ? 'bg-[#e1306c]/10 border-[#e1306c]/30' : 'bg-[#1877f2]/10 border-[#1877f2]/30';
                  const cfg = formData.channels[ch];
                  return (
                    <div key={ch} className="rounded-xl border border-white/[0.06] bg-black/30 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className={`flex h-8 w-8 items-center justify-center rounded-lg border ${brandBadgeBg}`}>
                            <Icon className={`h-4 w-4 ${brandColor}`} />
                          </div>
                          <div>
                            <p className="font-bold text-white capitalize text-[13px]">{ch}</p>
                            <p className="text-[10px] text-[--muted]">Channel Mapping</p>
                          </div>
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <span className="text-[11px] font-semibold text-[--muted]">Enable in Autopilot</span>
                          <input
                            type="checkbox"
                            checked={cfg?.enabled ?? true}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                channels: { ...formData.channels, [ch]: { ...cfg, enabled: e.target.checked } },
                              })
                            }
                            className="accent-[--accent] h-4 w-4 rounded"
                          />
                        </label>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-[--muted] mb-1">
                            Channel Name
                          </label>
                          <input
                            value={cfg?.channelName || ''}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                channels: {
                                  ...formData.channels,
                                  [ch]: { ...cfg, channelName: e.target.value, profileName: e.target.value },
                                },
                              })
                            }
                            className="w-full !bg-black/40 !text-[13px] border border-white/[0.08] rounded-lg px-3 py-2 text-white"
                            placeholder={`e.g. My ${ch.charAt(0).toUpperCase() + ch.slice(1)}`}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-[--muted] mb-1">
                            GraphQL Channel ID
                          </label>
                          <input
                            value={cfg?.channelId || ''}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                channels: {
                                  ...formData.channels,
                                  [ch]: { ...cfg, channelId: e.target.value, profileId: e.target.value },
                                },
                              })
                            }
                            className="w-full !bg-black/40 !text-[13px] font-mono border border-white/[0.08] rounded-lg px-3 py-2 text-white"
                            placeholder="e.g. 64a1b2c3d..."
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {activeTab === 'test_queue' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-[--accent]/30 bg-[--accent-subtle] p-4 flex items-center gap-3">
                <TestTube className="h-5 w-5 text-[--accent] shrink-0" />
                <div>
                  <p className="font-bold text-white text-[13px]">Direct Queue Dispatch Test</p>
                  <p className="text-[11px] text-[--muted]">
                    Instantly deliver a test post to your live Buffer account queue
                  </p>
                </div>
              </div>

              {/* Fixed Platform Buttons with zero black/disappearing hover bug */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[--muted]">
                  Select Target Destination
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['all', 'linkedin', 'instagram', 'facebook'] as const).map((p) => {
                    const isSelected = testPlatform === p;
                    let activeStyles = 'border-[--accent] bg-[--accent] text-black shadow-md font-bold';
                    if (isSelected) {
                      if (p === 'linkedin') activeStyles = 'border-[#0a66c2] bg-[#0a66c2] text-white shadow-md font-bold';
                      else if (p === 'instagram') activeStyles = 'border-[#e1306c] bg-[#e1306c] text-white shadow-md font-bold';
                      else if (p === 'facebook') activeStyles = 'border-[#1877f2] bg-[#1877f2] text-white shadow-md font-bold';
                    }

                    return (
                      <button
                        key={p}
                        onClick={() => setTestPlatform(p)}
                        className={`py-2.5 px-3 rounded-xl text-center text-[12px] font-semibold uppercase tracking-wider border transition-all duration-150 ${
                          isSelected
                            ? activeStyles
                            : 'border-white/[0.08] bg-white/[0.04] text-[--fg-soft] hover:text-white hover:bg-white/[0.1] hover:border-white/[0.2]'
                        }`}
                      >
                        {p === 'all' ? 'All Channels' : p}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-xl border border-white/[0.06] bg-black/30 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-white uppercase tracking-wider">Test Post Content</span>
                  <button
                    onClick={() =>
                      setCustomTestText(
                        `🚀 [AI Agency Verification]\n\nAutomating social growth with Gemini 2.5 Flash and Buffer GraphQL API.\n\n#AIAutomation #GeminiFlash #BuildWithAI`
                      )
                    }
                    className="text-[10px] text-[--accent] hover:underline"
                  >
                    Reset Text
                  </button>
                </div>
                <textarea
                  rows={4}
                  value={customTestText}
                  onChange={(e) => setCustomTestText(e.target.value)}
                  className="w-full !bg-black/40 !text-[13px] border border-white/[0.08] rounded-xl p-3 text-white focus:outline-none focus:border-[--accent]"
                />
              </div>

              <button
                onClick={handleTestQueueDispatch}
                disabled={dispatchingTest}
                className="btn-primary w-full justify-center text-[13px] !py-3 shadow-lg"
              >
                {dispatchingTest ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                    <span>Dispatching to Buffer…</span>
                  </>
                ) : (
                  <>
                    <SendHorizontal className="h-4 w-4 shrink-0" />
                    <span>Deliver Test Post</span>
                  </>
                )}
              </button>

              {dispatchResult && (
                <div
                  className={`rounded-xl border p-4 text-[12px] space-y-2.5 ${
                    dispatchResult.success ? 'border-[--success]/30 bg-[--success]/10' : 'border-[--error]/30 bg-[--error]/10'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {dispatchResult.success ? (
                        <CheckCircle2 className="h-4 w-4 text-[--success]" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-[--error]" />
                      )}
                      <span className="font-bold text-white">{dispatchResult.message}</span>
                    </div>
                    <a
                      href="https://publish.buffer.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-[--accent] hover:underline flex items-center gap-1"
                    >
                      Buffer Dashboard <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>

                  {dispatchResult.results?.map((r, i) => (
                    <div key={i} className="p-3 rounded-lg bg-black/40 border border-white/[0.06] flex items-center justify-between">
                      <div>
                        <span className="font-bold text-white capitalize">{r.platform}</span>
                        <span className="text-[11px] text-[--muted] ml-2">{r.channelName}</span>
                      </div>
                      <span
                        className={`badge ${
                          r.status === 'queued'
                            ? 'badge-success'
                            : r.status === 'simulated'
                            ? 'badge-muted'
                            : 'badge-error'
                        }`}
                      >
                        {r.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-white/[0.08] px-6 py-4 bg-black/40">
          <button onClick={onClose} className="btn-secondary !py-2 !px-4 text-[12px]">
            Cancel
          </button>
          {activeTab === 'settings' ? (
            <button onClick={handleSave} className="btn-primary !py-2 !px-5 text-[12px] shadow-lg">
              {savedSuccess ? (
                <>
                  <Check className="h-4 w-4" />
                  <span>Saved</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Save & Connect</span>
                </>
              )}
            </button>
          ) : (
            <button onClick={() => setActiveTab('settings')} className="btn-ghost text-[12px]">
              Back to Settings
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
