import React, { useState } from 'react';
import { Check, Copy, Download, ExternalLink, Facebook, FileEdit, Instagram, Linkedin, RefreshCw, Send, X } from 'lucide-react';
import { PlatformType, SocialMediaPostGroup } from '../types.js';

interface PostDetailModalProps {
  postGroup: SocialMediaPostGroup | null;
  onClose: () => void;
  onRegenerateSingle: (platform: PlatformType) => void;
  onEditSingle: (platform: PlatformType) => void;
  onPublishGroup: (id: string) => void;
}

const PLATFORM_META: Record<PlatformType, { name: string; icon: React.ComponentType<{ className?: string }> }> = {
  linkedin: { name: 'LinkedIn', icon: Linkedin },
  instagram: { name: 'Instagram', icon: Instagram },
  facebook: { name: 'Facebook', icon: Facebook },
};

export const PostDetailModal: React.FC<PostDetailModalProps> = ({ postGroup, onClose, onRegenerateSingle, onEditSingle, onPublishGroup }) => {
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformType>('linkedin');
  const [copied, setCopied] = useState(false);

  if (!postGroup) return null;

  const currentPost = postGroup.posts[selectedPlatform];
  const handleCopy = () => { navigator.clipboard.writeText(currentPost.fullFormattedText); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  const mixTypeDisplay = postGroup.mixType.replace('_', ' ');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[--bg]/90 p-4">
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden rounded-xl border border-[--border] bg-[--card]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[--border] p-4">
          <div className="flex items-center gap-2">
            <span className="badge-muted">{mixTypeDisplay}</span>
            <span className="badge-accent">QC {postGroup.qualityControl.score}/100</span>
          </div>
          <h3 className="font-semibold text-[15px] text-[--fg] truncate px-3">{postGroup.coreTopic}</h3>
          <button onClick={onClose} className="btn-icon"><X className="h-4 w-4" /></button>
        </div>

        {/* Platform tabs */}
        <div className="flex border-b border-[--border] px-4">
          {(Object.keys(PLATFORM_META) as PlatformType[]).map((p) => {
            const meta = PLATFORM_META[p];
            const Icon = meta.icon;
            const active = selectedPlatform === p;
            return (
              <button
                key={p}
                onClick={() => setSelectedPlatform(p)}
                className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-[12px] font-medium transition-colors ${active ? 'border-[--accent] text-[--fg]' : 'border-transparent text-[--muted] hover:text-[--fg-soft]'}`}
              >
                <Icon className="h-4 w-4" />
                <span>{meta.name}</span>
              </button>
            );
          })}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div className="rounded-lg border border-[--border] bg-[--bg-elevated] p-3">
            <p className="eyebrow !text-[10px]">Hook</p>
            <p className="mt-1 font-medium text-[13px] text-[--fg] leading-snug">{currentPost.hook}</p>
          </div>

          <div className="rounded-lg border border-[--border] bg-[--bg-elevated] p-3 max-h-64 overflow-y-auto">
            <p className="eyebrow !text-[10px] !text-[--muted]">Body</p>
            <p className="mt-1 text-[13px] leading-relaxed text-[--fg-soft] whitespace-pre-wrap">{currentPost.body}</p>
          </div>

          <div className="rounded-lg border border-[--border] bg-[--bg-elevated] p-3 grid sm:grid-cols-2 gap-3">
            <div>
              <p className="eyebrow !text-[10px]">Call to action</p>
              <p className="mt-1 text-[13px] text-[--fg]">{currentPost.callToAction}</p>
            </div>
            <div>
              <p className="eyebrow !text-[10px] !text-[--muted]">Hashtags</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {currentPost.hashtags.map((h, i) => <span key={i} className="badge">{h}</span>)}
              </div>
            </div>
          </div>

          {currentPost.visualImageUrl && (
            <div className="rounded-lg border border-[--border] bg-[--bg-elevated] p-3">
              <div className="flex items-center justify-between mb-2">
                <p className="eyebrow !text-[10px] !text-[--muted]">Visual</p>
                <a href={currentPost.visualImageUrl} download className="text-[11px] text-[--accent] hover:underline flex items-center gap-1"><Download className="h-3 w-3" /> Download</a>
              </div>
              <img src={currentPost.visualImageUrl} alt="" className="w-full rounded-lg" referrerPolicy="no-referrer" />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-[--border] p-4">
          <div className="flex items-center gap-1.5">
            <button onClick={handleCopy} className="btn-ghost text-[12px]" title="Copy">
              {copied ? <Check className="h-3.5 w-3.5 text-[--success]" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
            <button onClick={() => onEditSingle(selectedPlatform)} className="btn-ghost text-[12px]"><FileEdit className="h-3.5 w-3.5" /></button>
            <button onClick={() => onRegenerateSingle(selectedPlatform)} className="btn-secondary text-[12px]"><RefreshCw className="h-3.5 w-3.5" /></button>
          </div>
          <button onClick={() => onPublishGroup(postGroup.id)} className="btn-primary text-[12px]"><Send className="h-3.5 w-3.5" /><span>Dispatch to Buffer</span></button>
        </div>
      </div>
    </div>
  );
};
