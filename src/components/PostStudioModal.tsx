import React, { useState } from 'react';
import {
  ArrowRight,
  Bot,
  Brain,
  BrainCircuit,
  Check,
  CheckCircle2,
  ChevronDown,
  Copy,
  Download,
  ExternalLink,
  Eye,
  Facebook,
  Flame,
  Image as ImageIcon,
  Instagram,
  Layers,
  Linkedin,
  MessageSquare,
  PenTool,
  Play,
  RefreshCw,
  SendHorizontal,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Wand2,
  X,
  Zap,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PlatformType, SocialMediaPostGroup, ViralHookVariation, WorkspaceProfile } from '../types.js';

interface PostStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostGenerated?: (postGroup: SocialMediaPostGroup) => void;
  onPublishToBuffer?: (postGroup: SocialMediaPostGroup) => void;
  brandBrainTone?: string;
  targetAudience?: string;
  activeWorkspace?: WorkspaceProfile | null;
}

const FRAMEWORKS = [
  {
    id: 'contrarian',
    name: 'Contrarian Myth-Buster',
    badge: 'High Engagement',
    desc: 'Challenges a widespread industry misconception and establishes technical authority.',
    color: 'border-amber-500/30 text-amber-400 bg-amber-500/10',
  },
  {
    id: 'data_backed',
    name: 'Data-Backed Architecture',
    badge: 'High Conversion',
    desc: 'Anchors the argument in latency numbers, ROI metrics, or concrete system benchmarks.',
    color: 'border-blue-500/30 text-blue-400 bg-blue-500/10',
  },
  {
    id: 'story_driven',
    name: 'Founder Story & Failure-Fix',
    badge: 'High Retention',
    desc: 'Vivid narrative about a real production bug, costly failure, and the ultimate architectural solution.',
    color: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10',
  },
  {
    id: 'step_by_step',
    name: 'Step-by-Step Tactical Blueprint',
    badge: 'High Saves',
    desc: 'Actionable, numbered walkthrough that decision-makers bookmark for implementation.',
    color: 'border-purple-500/30 text-purple-400 bg-purple-500/10',
  },
  {
    id: 'hot_take',
    name: 'Executive Hot Take',
    badge: 'High Virality',
    desc: 'Provocative point of view on breaking AI models, agents, or SaaS trends.',
    color: 'border-rose-500/30 text-rose-400 bg-rose-500/10',
  },
] as const;

const TOPIC_PRESETS = [
  'Why 90% of AI Agents Fail in Week 3: Missing State Machines',
  'Automating Enterprise Invoicing: How We Cut Latency by 92%',
  'LangGraph vs CrewAI: Which Framework Survives Production?',
  'The $47,000 Runaway API Loop & How We Architected Guardrails',
  'Webhook Reliability: Building Idempotent Zapier & n8n Systems',
];

export const PostStudioModal: React.FC<PostStudioModalProps> = ({
  isOpen,
  onClose,
  onPostGenerated,
  onPublishToBuffer,
  brandBrainTone,
  targetAudience,
  activeWorkspace,
}) => {
  const [topic, setTopic] = useState('');
  const [strategicAngle, setStrategicAngle] = useState('');
  const [framework, setFramework] = useState<typeof FRAMEWORKS[number]['id']>('contrarian');
  const [tone, setTone] = useState(brandBrainTone || 'Authoritative, practitioner-first, direct, zero-fluff');
  const [audience, setAudience] = useState(targetAudience || 'Founders, CTOs, & Automation Engineers');
  const [includeFirstComment, setIncludeFirstComment] = useState(true);
  const [generateVisual, setGenerateVisual] = useState(true);

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<SocialMediaPostGroup | null>(null);
  const [firstCommentText, setFirstCommentText] = useState<string>('');

  const [activePlatform, setActivePlatform] = useState<PlatformType>('linkedin');
  const [copied, setCopied] = useState(false);
  const [copiedComment, setCopiedComment] = useState(false);

  // Viral Hook Matrix state
  const [hooksLoading, setHooksLoading] = useState(false);
  const [hookVariations, setHookVariations] = useState<ViralHookVariation[]>([]);
  const [showHooksPanel, setShowHooksPanel] = useState(false);

  // Visual generation state
  const [customVisualPrompt, setCustomVisualPrompt] = useState('');
  const [isRegeneratingImage, setIsRegeneratingImage] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setIsGenerating(true);
    try {
      const res = await fetch('/api/studio/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topic.trim(),
          strategicAngle: strategicAngle.trim() || undefined,
          framework,
          toneOfVoice: tone,
          targetAudience: audience,
          includeFirstComment,
          generateVisual,
        }),
      });
      const data = await res.json();
      if (data.success && data.postGroup) {
        setGeneratedResult(data.postGroup);
        if (data.postGroup.firstComment) {
          setFirstCommentText(data.postGroup.firstComment);
        }
        if (onPostGenerated) {
          onPostGenerated(data.postGroup);
        }
      }
    } catch (err) {
      console.error('Failed to generate studio post:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFetchHooks = async () => {
    if (!topic.trim()) return;
    setHooksLoading(true);
    setShowHooksPanel(true);
    try {
      const res = await fetch('/api/studio/generate-hooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topic.trim(),
          coreIdea: strategicAngle.trim() || generatedResult?.coreIdea || topic.trim(),
        }),
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.hooks)) {
        setHookVariations(data.hooks);
      }
    } catch (err) {
      console.error('Failed to fetch hooks:', err);
    } finally {
      setHooksLoading(false);
    }
  };

  const handleApplyHook = (hookText: string) => {
    if (!generatedResult) return;
    const updated = { ...generatedResult };
    const currentP = updated.posts[activePlatform];
    if (currentP) {
      currentP.hook = hookText;
      currentP.fullFormattedText = `${hookText}\n\n${currentP.body}\n\n${currentP.callToAction}\n\n${(currentP.hashtags || []).join(' ')}`;
    }
    setGeneratedResult({ ...updated });
  };

  const handleRegenerateVisual = async () => {
    if (!generatedResult) return;
    setIsRegeneratingImage(true);
    try {
      const res = await fetch('/api/studio/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: generatedResult.coreTopic,
          prompt: customVisualPrompt || generatedResult.posts[activePlatform]?.visualPrompt,
          platform: activePlatform,
        }),
      });
      const data = await res.json();
      if (data.success && data.imageUrl) {
        const updated = { ...generatedResult };
        if (updated.posts[activePlatform]) {
          updated.posts[activePlatform].visualImageUrl = data.imageUrl;
        }
        setGeneratedResult({ ...updated });
      }
    } catch (err) {
      console.error('Failed to regenerate visual:', err);
    } finally {
      setIsRegeneratingImage(false);
    }
  };

  const handleCopyText = (text: string, isComment = false) => {
    navigator.clipboard.writeText(text);
    if (isComment) {
      setCopiedComment(true);
      setTimeout(() => setCopiedComment(false), 2000);
    } else {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const currentPost = generatedResult?.posts[activePlatform];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xl overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 16 }}
        className="w-full max-w-5xl rounded-2xl bg-[#0c0f17] border border-white/[0.14] shadow-[0_25px_60px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-[#111520]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[--accent] to-[--accent-muted] text-black shadow-lg">
              <PenTool className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">AI Post Studio & Creative Co-Pilot</h3>
                <span className="badge badge-accent text-[9px]">MICRO-SAAS ENGINE</span>
              </div>
              <p className="text-[11px] text-[--muted]">
                {activeWorkspace ? `Brand: ${activeWorkspace.name}` : 'Generate bespoke, high-converting posts for LinkedIn, Instagram & Facebook'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[--muted] hover:text-white hover:bg-white/[0.06] transition-colors"
            aria-label="Close Studio Modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Top Inputs: Topic Brief & Framework */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Prompt & Angle */}
            <div className="lg:col-span-2 space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-[--muted] uppercase tracking-wider mb-1.5">
                  Core Topic or Client Brief *
                </label>
                <div className="relative">
                  <textarea
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    rows={2}
                    placeholder="e.g., Why deterministic state machines beat unconstrained LLM loops in production..."
                    className="w-full rounded-xl bg-black/50 border border-white/[0.1] px-3.5 py-2.5 text-sm text-white placeholder-white/25 focus:border-[--accent] focus:outline-none transition-colors"
                  />
                </div>
                {/* Topic Presets */}
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <span className="text-[10px] text-[--muted] flex items-center gap-1 mr-1">
                    <Sparkles className="h-3 w-3 text-[--accent]" /> Presets:
                  </span>
                  {TOPIC_PRESETS.slice(0, 3).map((p) => (
                    <button
                      key={p}
                      onClick={() => setTopic(p)}
                      className="rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] px-2.5 py-0.5 text-[10px] text-[--fg-soft] transition-colors truncate max-w-[220px]"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[--muted] uppercase tracking-wider mb-1.5">
                  Strategic Angle / Key Takeaway (Optional)
                </label>
                <input
                  type="text"
                  value={strategicAngle}
                  onChange={(e) => setStrategicAngle(e.target.value)}
                  placeholder="e.g., Focus on latency reduction, schema validation, and human-in-the-loop fallback."
                  className="w-full rounded-xl bg-black/50 border border-white/[0.1] px-3.5 py-2 text-sm text-white placeholder-white/25 focus:border-[--accent] focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Right 1 Col: Framework Selector */}
            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-[--muted] uppercase tracking-wider mb-1.5">
                Viral Framework Matrix
              </label>
              <div className="space-y-1.5 max-h-[160px] overflow-y-auto no-scrollbar pr-1">
                {FRAMEWORKS.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFramework(f.id)}
                    className={`w-full text-left p-2.5 rounded-xl border transition-all ${
                      framework === f.id
                        ? 'bg-[--accent-subtle] border-[--accent] text-white shadow-md'
                        : 'bg-black/30 border-white/[0.06] text-[--muted] hover:border-white/[0.15] hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] font-bold truncate">{f.name}</span>
                      <span className="text-[9px] font-mono font-semibold px-1.5 py-0.2 rounded bg-white/[0.08]">
                        {f.badge}
                      </span>
                    </div>
                    <p className="text-[10px] line-clamp-1 mt-0.5 opacity-80">{f.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Action Row: Generate Button & Viral Hook Trigger */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/[0.08]">
            <div className="flex items-center gap-4 text-[12px] text-[--muted]">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeFirstComment}
                  onChange={(e) => setIncludeFirstComment(e.target.checked)}
                  className="rounded border-white/20 bg-black/40 text-[--accent] focus:ring-0"
                />
                <span>Generate First Comment</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={generateVisual}
                  onChange={(e) => setGenerateVisual(e.target.checked)}
                  className="rounded border-white/20 bg-black/40 text-[--accent] focus:ring-0"
                />
                <span>Auto-Generate Imagen Visual</span>
              </label>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleFetchHooks}
                disabled={hooksLoading || !topic.trim()}
                className="btn-secondary text-[12px]"
                title="Generate 3 high-converting viral hooks"
              >
                {hooksLoading ? (
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <TrendingUp className="h-3.5 w-3.5 text-[--accent]" />
                )}
                <span>A/B Hook Matrix</span>
              </button>

              <button
                onClick={handleGenerate}
                disabled={isGenerating || !topic.trim()}
                className="btn-primary text-[12px] shadow-xl"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Synthesizing Omnichannel Posts…</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4" />
                    <span>Generate Post Suite</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Viral Hook Matrix Drawer */}
          <AnimatePresence>
            {showHooksPanel && hookVariations.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="rounded-xl border border-[--accent]/30 bg-[--accent-subtle] p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Flame className="h-4 w-4 text-[--accent]" />
                    <h4 className="text-[13px] font-bold text-white">Viral Hook Lab (High Retention)</h4>
                  </div>
                  <button
                    onClick={() => setShowHooksPanel(false)}
                    className="text-[11px] text-[--muted] hover:text-white"
                  >
                    Dismiss
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {hookVariations.map((h) => (
                    <div
                      key={h.id}
                      className="rounded-lg bg-black/60 border border-white/[0.08] p-3 flex flex-col justify-between space-y-2 hover:border-[--accent]/50 transition-colors"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] font-bold text-[--accent] uppercase tracking-wider">{h.label}</span>
                          <span className="text-[10px] font-mono font-bold text-white bg-white/[0.08] px-1.5 py-0.2 rounded">
                            {h.viralityScore}% Virality
                          </span>
                        </div>
                        <p className="text-[12px] text-white font-medium leading-snug">"{h.hookText}"</p>
                        <p className="text-[10px] text-[--muted] mt-1.5 italic">{h.frameworkNote}</p>
                      </div>

                      <button
                        onClick={() => handleApplyHook(h.hookText)}
                        className="btn-ghost text-[11px] !py-1.5 w-full justify-center !bg-white/[0.04] hover:!bg-[--accent] hover:!text-black"
                      >
                        <Check className="h-3 w-3 mr-1" /> Use This Hook
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Generated Result Multi-Platform Live Preview */}
          {generatedResult && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4 pt-2"
            >
              {/* Platform Selector Tabs */}
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-2">
                <div className="flex items-center gap-2">
                  {(['linkedin', 'instagram', 'facebook'] as PlatformType[]).map((p) => {
                    const isActive = activePlatform === p;
                    return (
                      <button
                        key={p}
                        onClick={() => setActivePlatform(p)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                          isActive
                            ? 'bg-white/[0.1] text-white shadow-sm border border-white/[0.12]'
                            : 'text-[--muted] hover:text-white hover:bg-white/[0.04]'
                        }`}
                      >
                        {p === 'linkedin' && <Linkedin className="h-3.5 w-3.5 text-[#0a66c2]" />}
                        {p === 'instagram' && <Instagram className="h-3.5 w-3.5 text-[#e1306c]" />}
                        {p === 'facebook' && <Facebook className="h-3.5 w-3.5 text-[#1877f2]" />}
                        <span>{p}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopyText(currentPost?.fullFormattedText || '')}
                    className="btn-ghost text-[11px]"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-[--success]" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copied ? 'Copied Post' : 'Copy Post'}</span>
                  </button>

                  {onPublishToBuffer && (
                    <button
                      onClick={() => onPublishToBuffer(generatedResult)}
                      className="btn-primary text-[11px] !py-1.5 !px-3"
                    >
                      <SendHorizontal className="h-3.5 w-3.5" />
                      <span>Dispatch to Buffer</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Preview Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left: Text & Hook & First Comment (7 cols) */}
                <div className="lg:col-span-7 space-y-4">
                  {/* Hook Box */}
                  <div className="rounded-xl border border-white/[0.08] bg-black/40 p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-[--accent] uppercase tracking-wider">Opening Hook</span>
                      <span className="text-[10px] font-mono text-[--muted]">Scroll-Stopper</span>
                    </div>
                    <p className="text-[13px] font-semibold text-white leading-snug">{currentPost?.hook}</p>
                  </div>

                  {/* Body Text */}
                  <div className="rounded-xl border border-white/[0.08] bg-black/30 p-4 space-y-3">
                    <span className="text-[10px] font-bold text-[--muted] uppercase tracking-wider">Full Content Copy</span>
                    <div className="text-[12px] sm:text-[13px] text-[--fg-soft] whitespace-pre-wrap leading-relaxed max-h-[220px] overflow-y-auto no-scrollbar">
                      {currentPost?.body}
                    </div>
                    <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between">
                      <span className="text-[11px] font-bold text-[--accent]">{currentPost?.callToAction}</span>
                      <span className="text-[10px] text-[--muted]">{currentPost?.hashtags.slice(0, 3).join(' ')}</span>
                    </div>
                  </div>

                  {/* First Comment Box (Algorithmic Reach) */}
                  {firstCommentText && (
                    <div className="rounded-xl border border-white/[0.08] bg-black/40 p-3.5 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-[--info] uppercase tracking-wider flex items-center gap-1.5">
                          <MessageSquare className="h-3 w-3" /> Algorithmic First Comment (Links & Sources)
                        </span>
                        <button
                          onClick={() => handleCopyText(firstCommentText, true)}
                          className="text-[10px] text-[--muted] hover:text-white flex items-center gap-1"
                        >
                          {copiedComment ? <Check className="h-3 w-3 text-[--success]" /> : <Copy className="h-3 w-3" />}
                          <span>{copiedComment ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                      <p className="text-[11px] text-[--fg-soft] whitespace-pre-wrap leading-relaxed">
                        {firstCommentText}
                      </p>
                    </div>
                  )}
                </div>

                {/* Right: Uncropped Artwork & Visual Generator (5 cols) */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="rounded-xl border border-white/[0.08] bg-black/60 overflow-hidden relative group min-h-[260px] flex flex-col items-center justify-center p-2">
                    {currentPost?.visualImageUrl ? (
                      <div className="relative w-full h-full flex items-center justify-center overflow-hidden rounded-lg">
                        {/* Ambient Backdrop */}
                        <img
                          src={currentPost.visualImageUrl}
                          alt=""
                          aria-hidden="true"
                          className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-25 scale-125 pointer-events-none"
                          referrerPolicy="no-referrer"
                        />
                        {/* High-res uncropped asset */}
                        <img
                          src={currentPost.visualImageUrl}
                          alt=""
                          className="relative z-10 max-h-[280px] max-w-full w-auto h-auto object-contain rounded-lg shadow-xl"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    ) : (
                      <div className="p-6 text-center space-y-2">
                        <ImageIcon className="h-8 w-8 text-white/20 mx-auto" />
                        <p className="text-[12px] text-[--muted]">No visual asset generated yet</p>
                      </div>
                    )}
                  </div>

                  {/* Regenerate Visual Controls */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-[--muted] uppercase tracking-wider">Visual Prompt Fine-Tuning</span>
                      <button
                        onClick={handleRegenerateVisual}
                        disabled={isRegeneratingImage}
                        className="text-[10px] font-bold text-[--accent] hover:underline flex items-center gap-1"
                      >
                        {isRegeneratingImage ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                        <span>Regenerate Image</span>
                      </button>
                    </div>
                    <textarea
                      value={customVisualPrompt || currentPost?.visualPrompt || ''}
                      onChange={(e) => setCustomVisualPrompt(e.target.value)}
                      rows={2}
                      className="w-full rounded-xl bg-black/40 border border-white/[0.08] px-3 py-2 text-[11px] text-[--fg-soft] focus:border-[--accent] focus:outline-none transition-colors"
                      placeholder="Fine-tune prompt for Imagen AI..."
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/[0.08] bg-black/40">
          <div className="flex items-center gap-2">
            <span className="dot dot-live" />
            <span className="text-[11px] text-[--muted]">Gemini 2.5 Flash + Imagen AI Integration</span>
          </div>
          <button
            onClick={onClose}
            className="btn-secondary text-[12px]"
          >
            Done & Close
          </button>
        </div>
      </motion.div>
    </div>
  );
};
