import React from 'react';
import { Activity, AlertCircle, Bot, Check, CheckCircle2, Cpu, Layers, Radio, RefreshCw, Search, Send, ShieldCheck, Sparkles, Zap, X } from 'lucide-react';
import { AutopilotRunProgress } from '../types.js';

interface PipelineExecutionModalProps { progress: AutopilotRunProgress | null; onClose: () => void; }

export const PipelineExecutionModal: React.FC<PipelineExecutionModalProps> = ({ progress, onClose }) => {
  if (!progress || progress.step === 'idle') return null;

  const steps = [
    { id: 'researching', title: '1. Trend Research', desc: 'Grounding search across AI, Agents, Zapier & SaaS', icon: Search },
    { id: 'scoring', title: '2. Scoring', desc: 'Grading relevance, audience interest, freshness & safety', icon: Cpu },
    { id: 'selecting', title: '3. Selection', desc: 'Aligning with 70/20/10 content mix ratio', icon: Sparkles },
    { id: 'adapting', title: '4. Platform Synthesis', desc: 'Writing unique hooks & layouts for LI, IG, FB', icon: Layers },
    { id: 'auditing', title: '5. Quality Audit', desc: '8 compliance & accuracy standards', icon: ShieldCheck },
    { id: 'publishing', title: '6. Publishing', desc: 'Sending to Buffer queues & database', icon: Send },
  ];

  const order = ['researching','scoring','selecting','adapting','auditing','publishing','completed'];
  const currentIdx = order.indexOf(progress.step);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[--bg]/90 p-4">
      <div className="relative w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden rounded-lg border border-[--border] bg-[--card]">
        <div className="flex items-center justify-between border-b border-[--border] p-4">
          <div className="flex items-center gap-2"><div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[--accent]/10 border border-[--accent]/20"><Bot className="h-4 w-4 text-[--accent]" /></div><div><h3 className="font-semibold text-[--fg]">Autopilot Running</h3><p className="text-[10px] text-[--muted]">Autonomous content cycle</p></div></div>
          {progress.step==='completed'||progress.step==='error'?<button onClick={onClose} className="btn-secondary">Close</button>:(
            <div className="flex items-center gap-1.5 rounded-full bg-[--accent]/10 border border-[--accent]/20 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[--accent]"><RefreshCw className="h-3 w-3 animate-spin" /><span>Running</span></div>
          )}
        </div>
        <div className="border-b border-[--border] p-4">
          <div className="flex justify-between text-sm font-medium mb-1.5"><span className="text-[--fg]">{progress.message}</span><span className="font-mono font-bold text-[--accent]">{progress.percentage}%</span></div>
          <div className="h-2 bg-[--bg-elevated] rounded-full overflow-hidden"><div className="h-full rounded-full bg-[--accent]" style={{width:`${progress.percentage}%`}} /></div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {steps.map((step) => {
            const stepIdx = order.indexOf(step.id);
            let status: 'upcoming'|'active'|'completed'|'error' = 'upcoming';
            if (progress.step==='error') status = stepIdx <= currentIdx ? 'error' : 'upcoming';
            else if (progress.step==='completed' || currentIdx > stepIdx) status = 'completed';
            else if (currentIdx === stepIdx) status = 'active';
            const Icon = step.icon;
            return (
              <div key={step.id} className={`flex items-start gap-3 p-2 rounded-lg transition-colors ${status==='active'?'bg-[--accent]/5 border border-[--accent]/20':status==='completed'?'bg-[--success]/5 border border-[--success]/20':status==='error'?'bg-[--error]/5 border border-[--error]/20':''}`}>
                <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${status==='active'?'bg-[--accent]/15 text-[--accent]':status==='completed'?'bg-[--success]/15 text-[--success]':status==='error'?'bg-[--error]/15 text-[--error]':''}`}>
                  {status==='active'?<RefreshCw className="h-3.5 w-3.5 animate-spin" />:status==='completed'?<Check className="h-3.5 w-3.5" />:status==='error'?<AlertCircle className="h-3.5 w-3.5" />:<Icon className="h-3.5 w-3.5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${status==='active'?'text-[--accent]':status==='completed'?'text-[--fg]':status==='error'?'text-[--error]':'text-[--muted]'}`}>{step.title}</p>
                  <p className="text-[11px] text-[--muted]">{step.desc}</p>
                  {status==='active'&&<span className="inline-block mt-1 text-[10px] font-bold text-[--accent] animate-pulse">Processing…</span>}
                  {status==='completed'&&<span className="inline-block mt-1 text-[10px] font-bold text-[--success]">Verified</span>}
                </div>
              </div>
            );
          })}
        </div>
        {progress.selectedTrend && (<div className="border-t border-[--border] p-3 bg-[--bg-elevated]"><p className="text-[10px] font-bold uppercase tracking-wider text-[--accent]">Selected: {progress.selectedTrend.scores?.finalScore}/100</p><p className="mt-0.5 font-semibold text-[--fg] text-sm">{progress.selectedTrend.title}</p></div>)}
        <div className="flex items-center justify-between border-t border-[--border] p-4">
          <span className="text-[10px] text-[--muted]">{progress.step==='completed'?'Content dispatched to Buffer':progress.step==='error'?'Execution halted':'Running autonomously'}</span>
          <button onClick={onClose} className="btn-primary text-sm">{progress.step==='completed'?'View Posts':'Dismiss'}</button>
        </div>
      </div>
    </div>
  );
};