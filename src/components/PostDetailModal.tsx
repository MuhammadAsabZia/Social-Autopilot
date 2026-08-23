import React, { useState } from 'react';
import {
  Check,
  Copy,
  Download,
  ExternalLink,
  Facebook,
  FileEdit,
  Instagram,
  Linkedin,
  RefreshCw,
  SendHorizontal,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react';
import { PlatformType, SocialMediaPostGroup } from '../types.js';

interface PostDetailModalProps {
  postGroup: SocialMediaPostGroup | null;
  onClose: () => void;
  onRegenerateSingle: (platform: PlatformType) => void;
  onEditSingle: (platform: PlatformType) => void;
  onPublishGroup: (id: string) => void;
}

const PLATFORM_META: Record<PlatformType, { name: string; icon: React.ComponentType<{ className?: string }>; color: string; bg: string }> = {
  linkedin: { name: 'LinkedIn', icon: Linkedin, color: 'text-[#0a66c2]', bg: 'bg-[#0a66c2]/10 border-[#0a66c2]/20' },
  instagram: { name: 'Instagram', icon: Instagram, color: 'text-[#e1306c]', bg: 'bg-[#e1306c]/10 border-[#e1306c]/20' },
  facebook: { name: 'Facebook', icon: Facebook, color: 'text-[#1877f2]', bg: 'bg-[#1877f2]/10 border-[#1877f2]/20' },
};

export const PostDetailModal: React.FC<PostDetailModalProps> = ({ postGroup, onClose, onRegenerateSingle, onEditSingle, onPublishGroup }) => {
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformType>('linkedin');
  const [copied, setCopied] = useState(false);

  if (!postGroup) return null;

  const currentPost = postGroup.posts[selectedPlatform];
  const handleCopy = () => { 
    navigator.clipboard.writeText(currentPost.fullFormattedText); 
    setCopied(true); 
    setTimeout(() => setCopied(false), 2000); 
  };

  const mixTypeDisplay = postGroup.mixType.replace('_', ' ');

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-xl p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden rounded-2xl border border-white/[0.14] bg-[#0c0f17] shadow-[0_25px_60px_rgba(0,0,0,0.9)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] px-5 py-4 bg-[#111520]">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="badge badge-accent mono text-[10px]">
              <ShieldCheck className="h-3 w-3" /> QC {postGroup.qualityControl.score}/100
            </span>
            <span className="badge badge-muted text-[10px] hidden xs:inline uppercase">{mixTypeDisplay}</span>
            <h3 className="font-bold text-[14px] sm:text-[15px] text-white truncate max-w-xs sm:max-w-md">
              {postGroup.coreTopic}
            </h3>
          </div>
          <button onClick={onClose} className="btn-icon !h-8 !w-8" aria-label="Close modal">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Platform Tabs */}
        <div className="flex border-b border-white/[0.08] px-5 bg-black/20 gap-4 sm:gap-6 overflow-x-auto no-scrollbar">
          {(Object.keys(PLATFORM_META) as PlatformType[]).map((p) => {
            const meta = PLATFORM_META[p];
            const Icon = meta.icon;
            const active = selectedPlatform === p;
            return (
              <button
                key={p}
                onClick={() => setSelectedPlatform(p)}
                className={`flex items-center gap-2 py-3.5 text-[13px] font-semibold transition-all relative shrink-0 ${
                  active ? 'text-white' : 'text-[--muted] hover:text-[--fg-soft]'
                }`}
              >
                <span className={`flex h-5 w-5 items-center justify-center rounded-md ${meta.bg}`}>
                  <Icon className={`h-3 w-3 ${meta.color}`} />
                </span>
                <span>{meta.name}</span>
                {active && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[--accent] shadow-[0_0_8px_var(--color-accent)]" />
                )}
              </button>
            );
          })}
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 no-scrollbar">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Left: Text Structure */}
            <div className="space-y-3.5">
              <div className="rounded-xl border border-white/[0.06] bg-black/30 p-4">
                <p className="eyebrow !text-[10px] mb-1 opacity-70">HOOK</p>
                <p className="font-semibold text-[14px] text-white leading-snug italic">
                  "{currentPost.hook}"
                </p>
              </div>

              <div className="rounded-xl border border-white/[0.06] bg-black/30 p-4">
                <p className="eyebrow !text-[10px] mb-1.5 opacity-70">BODY TEXT</p>
                <p className="text-[13px] sm:text-[14px] leading-relaxed text-[--fg-soft] whitespace-pre-wrap max-h-72 overflow-y-auto no-scrollbar">
                  {currentPost.body}
                </p>
              </div>

              <div className="rounded-xl border border-white/[0.06] bg-black/30 p-4 space-y-3">
                {currentPost.callToAction && (
                  <div>
                    <p className="eyebrow !text-[10px] mb-1 opacity-70">CALL TO ACTION</p>
                    <p className="text-[13px] font-medium text-white">{currentPost.callToAction}</p>
                  </div>
                )}
                <div>
                  <p className="eyebrow !text-[10px] mb-1.5 opacity-70">TAGS</p>
                  <div className="flex flex-wrap gap-1.5">
                    {currentPost.hashtags.map((h, i) => (
                      <span key={i} className="badge badge-accent text-[10px]">{h}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Visual Artwork */}
            <div className="flex flex-col">
              <div className="rounded-xl border border-white/[0.08] bg-black/60 overflow-hidden relative group flex-1 min-h-[300px] flex items-center justify-center p-2">
                {currentPost.visualImageUrl ? (
                  <div className="relative w-full h-full flex items-center justify-center overflow-hidden rounded-lg">
                    {/* Ambient backdrop */}
                    <img 
                      src={currentPost.visualImageUrl} 
                      alt="" 
                      aria-hidden="true"
                      className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-25 scale-125 pointer-events-none" 
                      referrerPolicy="no-referrer" 
                    />
                    {/* Full Uncropped High-Res Asset */}
                    <img 
                      src={currentPost.visualImageUrl} 
                      alt="" 
                      className="relative z-10 max-h-[380px] max-w-full w-auto h-auto object-contain rounded-lg shadow-xl" 
                      referrerPolicy="no-referrer" 
                    />
                    <div className="absolute top-3 right-3 flex items-center gap-2 z-20">
                      <a 
                        href={currentPost.visualImageUrl} 
                        download 
                        target="_blank" 
                        rel="noreferrer"
                        className="btn-ghost !bg-black/80 text-[11px] text-white flex items-center gap-1.5 border border-white/20 hover:!bg-[--accent] hover:!text-black transition-colors"
                      >
                        <Download className="h-3.5 w-3.5" /> Download
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-6 space-y-2">
                    <Sparkles className="h-8 w-8 text-white/20 mx-auto" />
                    <p className="text-[12px] text-[--muted]">No visual asset attached</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-white/[0.08] px-5 py-4 bg-black/40">
          <div className="flex items-center gap-2">
            <button 
              onClick={handleCopy} 
              className="btn-ghost text-[12px] !py-2 !px-3" 
              title="Copy formatted post"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-[--success]" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? 'Copied to Clipboard' : 'Copy Post'}</span>
            </button>
            <button 
              onClick={() => onRegenerateSingle(selectedPlatform)} 
              className="btn-secondary text-[12px] !py-2 !px-3"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Regenerate</span>
            </button>
          </div>

          <button 
            onClick={() => onPublishGroup(postGroup.id)} 
            className="btn-primary text-[12px] !py-2 !px-4"
          >
            <SendHorizontal className="h-3.5 w-3.5" />
            <span>Dispatch to Buffer</span>
          </button>
        </div>
      </div>
    </div>
  );
};
