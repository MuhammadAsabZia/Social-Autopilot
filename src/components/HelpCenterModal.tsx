import React from 'react';
import {
  BookOpen,
  CheckCircle2,
  Cpu,
  ExternalLink,
  HelpCircle,
  Key,
  Layers,
  Radio,
  Send,
  ShieldCheck,
  Sparkles,
  Workflow,
  X,
  Zap,
} from 'lucide-react';
import { motion } from 'motion/react';

interface HelpCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenBufferSettings: () => void;
  onOpenBrandBrain: () => void;
}

export const HelpCenterModal: React.FC<HelpCenterModalProps> = ({
  isOpen,
  onClose,
  onOpenBufferSettings,
  onOpenBrandBrain,
}) => {
  if (!isOpen) return null;

  const PIPELINE_STEPS = [
    { step: 1, title: 'Live Signal Radar', desc: 'Scans Google Search & Tech Radar for breakout AI and tech industry developments.' },
    { step: 2, title: 'Relevance Scoring', desc: 'Filters trends using a 6-metric heuristic against your service expertise and target audience.' },
    { step: 3, title: 'Strategic Synthesis', desc: 'Selects the highest-potential trend and formulates a unique angle adhering to your content mix.' },
    { step: 4, title: 'Omnichannel Adaptation', desc: 'Writes tailor-made formats for LinkedIn, Instagram carousels, and Facebook.' },
    { step: 5, title: 'Imagen AI Visuals', desc: 'Generates branded architecture diagrams, blueprints, and visual assets.' },
    { step: 6, title: 'Quality Control Gate', desc: 'Executes an 8-point automated compliance audit (checks fake stats, promotional tone, safety).' },
    { step: 7, title: 'Buffer Dispatch', desc: 'Automatically schedules the posts to your connected Buffer channels.' },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="w-full max-w-2xl rounded-2xl bg-[#0c0f17] border border-white/[0.14] shadow-[0_25px_60px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-[#12151e]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[--accent]/10 border border-[--accent]/30 text-[--accent]">
              <HelpCircle className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Autopilot Command Center Guide</h2>
              <p className="text-xs text-[--muted]">Operating manual & autonomous pipeline architecture</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[--muted] hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Quickstart Highlight */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-[--accent]/10 via-black/40 to-transparent border border-[--accent]/20 space-y-2">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Sparkles className="h-4 w-4 text-[--accent]" />
              <span>How Autopilot Operates 24/7</span>
            </div>
            <p className="text-[--fg-soft] leading-relaxed">
              Your autonomous operator monitors industry trends, extracts viral hooks, generates tailored copy & diagrams, audits for compliance, and queues omnichannel posts directly to Buffer without requiring manual intervention.
            </p>
          </div>

          {/* 7-Step Pipeline */}
          <div>
            <h3 className="font-bold text-white uppercase tracking-wider text-[11px] mb-3 flex items-center gap-2">
              <Workflow className="h-4 w-4 text-[--accent]" />
              Autonomous 7-Stage Pipeline
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {PIPELINE_STEPS.map((s) => (
                <div key={s.step} className="p-3 rounded-xl bg-black/40 border border-white/[0.06] flex items-start gap-2.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[--accent]/20 text-[--accent] font-bold text-[10px] shrink-0 mt-0.5">
                    {s.step}
                  </span>
                  <div>
                    <h4 className="font-bold text-white">{s.title}</h4>
                    <p className="text-[11px] text-[--muted] mt-0.5 leading-normal">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="pt-2 border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  onClose();
                  onOpenBufferSettings();
                }}
                className="btn-secondary text-xs !py-1.5 !px-3"
              >
                <Key className="h-3.5 w-3.5" />
                <span>Buffer API Settings</span>
              </button>
              <button
                onClick={() => {
                  onClose();
                  onOpenBrandBrain();
                }}
                className="btn-secondary text-xs !py-1.5 !px-3"
              >
                <Cpu className="h-3.5 w-3.5" />
                <span>Brand Brain Persona</span>
              </button>
            </div>
            <span className="text-[11px] text-[--muted]">Version 2.4 Enterprise</span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-white/[0.08] bg-[#0a0c10] flex justify-end">
          <button
            onClick={onClose}
            className="btn-primary text-xs !py-1.5 !px-4"
          >
            Got it, thanks!
          </button>
        </div>
      </motion.div>
    </div>
  );
};
