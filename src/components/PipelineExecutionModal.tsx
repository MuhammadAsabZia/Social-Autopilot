import React from 'react';
import {
  Activity,
  AlertCircle,
  Bot,
  Check,
  CheckCircle2,
  Cpu,
  Layers,
  Radio,
  RefreshCw,
  Search,
  SendHorizontal,
  ShieldCheck,
  Sparkles,
  Workflow,
  X,
  Zap,
} from 'lucide-react';
import { AutopilotRunProgress } from '../types.js';

interface PipelineExecutionModalProps {
  progress: AutopilotRunProgress | null;
  onClose: () => void;
}

export const PipelineExecutionModal: React.FC<PipelineExecutionModalProps> = ({ progress, onClose }) => {
  if (!progress || progress.step === 'idle') return null;

  const steps = [
    { id: 'researching', title: '1. Autonomous Trend Research', desc: 'Grounding live market search across AI, Tech & SaaS', icon: Search },
    { id: 'scoring', title: '2. Multi-Signal Scoring Engine', desc: 'Grading relevance, audience virality & authority', icon: Cpu },
    { id: 'selecting', title: '3. Strategic Content Selection', desc: 'Aligning with 70/20/10 mix ratio', icon: Sparkles },
    { id: 'adapting', title: '4. Omnichannel Post Synthesis', desc: 'Writing tailored hooks & body copy for LI, IG, FB', icon: Layers },
    { id: 'auditing', title: '5. Executive Quality Audit', desc: 'Enforcing compliance, tone & formatting standards', icon: ShieldCheck },
    { id: 'publishing', title: '6. Buffer Queue Dispatch', desc: 'Transmitting payload to Buffer GraphQL API', icon: SendHorizontal },
  ];

  const order = ['researching', 'scoring', 'selecting', 'adapting', 'auditing', 'publishing', 'completed'];
  const currentIdx = order.indexOf(progress.step);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-xl p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg max-h-[92vh] flex flex-col overflow-hidden rounded-2xl border border-white/[0.14] bg-[#0c0f17] shadow-[0_25px_60px_rgba(0,0,0,0.9)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] px-5 py-4 bg-[#111520]">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[--accent-subtle] border border-[--accent]/30 text-[--accent]">
              <Workflow className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-[15px]">Autopilot Pipeline</h3>
              <p className="text-[10px] text-[--muted] uppercase tracking-widest font-semibold">
                Autonomous Execution Cycle
              </p>
            </div>
          </div>
          {progress.step === 'completed' || progress.step === 'error' ? (
            <button onClick={onClose} className="btn-icon !h-8 !w-8" aria-label="Close modal">
              <X className="h-4 w-4" />
            </button>
          ) : (
            <div className="flex items-center gap-1.5 rounded-full bg-[--accent-subtle] border border-[--accent]/30 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[--accent]">
              <RefreshCw className="h-3 w-3 animate-spin" />
              <span>Processing</span>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="border-b border-white/[0.08] px-5 py-4 bg-black/20">
          <div className="flex justify-between items-center text-[13px] font-semibold mb-2">
            <span className="text-white truncate max-w-[280px]">{progress.message}</span>
            <span className="font-mono font-bold text-[--accent] text-[14px]">{progress.percentage}%</span>
          </div>
          <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[--accent] to-[--accent-soft] shadow-[0_0_12px_var(--color-accent)] transition-all duration-300"
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
        </div>

        {/* Steps List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-2.5 no-scrollbar">
          {steps.map((step) => {
            const stepIdx = order.indexOf(step.id);
            let status: 'upcoming' | 'active' | 'completed' | 'error' = 'upcoming';
            if (progress.step === 'error') status = stepIdx <= currentIdx ? 'error' : 'upcoming';
            else if (progress.step === 'completed' || currentIdx > stepIdx) status = 'completed';
            else if (currentIdx === stepIdx) status = 'active';
            const Icon = step.icon;

            return (
              <div
                key={step.id}
                className={`flex items-start gap-3.5 p-3 rounded-xl transition-all ${
                  status === 'active'
                    ? 'bg-[--accent-subtle] border border-[--accent]/40 shadow-sm'
                    : status === 'completed'
                    ? 'bg-[--success]/5 border border-[--success]/20'
                    : status === 'error'
                    ? 'bg-[--error]/10 border border-[--error]/30'
                    : 'bg-white/[0.02] border border-white/[0.04] opacity-50'
                }`}
              >
                <div
                  className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                    status === 'active'
                      ? 'bg-[--accent] text-black shadow-[0_0_10px_var(--color-accent)]'
                      : status === 'completed'
                      ? 'bg-[--success]/20 text-[--success]'
                      : status === 'error'
                      ? 'bg-[--error]/20 text-[--error]'
                      : 'bg-white/[0.05] text-[--muted]'
                  }`}
                >
                  {status === 'active' ? (
                    <RefreshCw className="h-4 w-4 animate-spin text-black" />
                  ) : status === 'completed' ? (
                    <Check className="h-4 w-4 text-[--success]" />
                  ) : status === 'error' ? (
                    <AlertCircle className="h-4 w-4 text-[--error]" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-[13px] font-bold ${
                      status === 'active'
                        ? 'text-white'
                        : status === 'completed'
                        ? 'text-white'
                        : status === 'error'
                        ? 'text-rose-400'
                        : 'text-[--muted]'
                    }`}
                  >
                    {step.title}
                  </p>
                  <p className="text-[11px] text-[--muted] mt-0.5 leading-snug">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Trend Snippet if present */}
        {progress.selectedTrend && (
          <div className="border-t border-white/[0.08] p-4 bg-black/40">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[--accent] flex items-center gap-1.5">
              <Sparkles className="h-3 w-3" /> Selected Trend Signal ({progress.selectedTrend.scores?.finalScore || 0}/100)
            </p>
            <p className="mt-1 font-bold text-white text-[13px] truncate">{progress.selectedTrend.title}</p>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-white/[0.08] px-5 py-4 bg-black/40">
          <span className="text-[11px] text-[--muted]">
            {progress.step === 'completed'
              ? 'Omnichannel posts generated & saved'
              : progress.step === 'error'
              ? 'Execution halted'
              : 'Autonomous cycle active'}
          </span>
          <button onClick={onClose} className="btn-primary text-[12px] !py-2 !px-4">
            {progress.step === 'completed' ? 'View Output' : 'Dismiss'}
          </button>
        </div>
      </div>
    </div>
  );
};
