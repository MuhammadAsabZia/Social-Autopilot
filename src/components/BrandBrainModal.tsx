import React, { useState } from 'react';
import { Brain, Check, Plus, Save, Trash2, X, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BrandBrainConfig } from '../types.js';

interface BrandBrainModalProps { config: BrandBrainConfig; isOpen: boolean; onClose: () => void; onSave: (updated: BrandBrainConfig) => void; }

export const BrandBrainModal: React.FC<BrandBrainModalProps> = ({ config, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState<BrandBrainConfig>({ ...config });
  const [newService, setNewService] = useState('');
  const [newSkill, setNewSkill] = useState('');
  const [newAvoid, setNewAvoid] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => { onSave(formData); setSavedSuccess(true); setTimeout(() => { setSavedSuccess(false); onClose(); }, 800); };
  const addService = () => { if (newService.trim()) { setFormData({...formData, services:[...formData.services, newService.trim()]}); setNewService(''); }};
  const removeService = (i:number) => setFormData({...formData, services:formData.services.filter((_,idx)=>idx!==i)});
  const addAvoid = () => { if (newAvoid.trim()) { setFormData({...formData, topicsToAvoid:[...formData.topicsToAvoid, newAvoid.trim()]}); setNewAvoid(''); }};
  const removeAvoid = (i:number) => setFormData({...formData, topicsToAvoid:formData.topicsToAvoid.filter((_,idx)=>idx!==i)});

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/85 backdrop-blur-xl"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden rounded-2xl border border-white/[0.14] bg-[#0c0f17] shadow-[0_25px_60px_rgba(0,0,0,0.9)] z-10"
          >
            <div className="flex items-center justify-between border-b border-white/[0.08] p-6 bg-[#111520]">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[--accent]/10 border border-[--accent]/20 shadow-[0_0_15px_rgba(212,175,55,0.1)]">
                  <Brain className="h-5 w-5 text-[--accent]" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-[18px]">Brand Intelligence & Positioning</h3>
                  <p className="text-[11px] text-[--muted] uppercase tracking-wider font-semibold">Core Configuration</p>
                </div>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-lg text-[--muted] hover:text-white hover:bg-white/[0.06] transition-colors"><X className="h-4 w-4" /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
              <div className="rounded-xl border border-white/5 bg-white/5 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-bold text-white uppercase tracking-widest">Services & Expertise</span>
                  <span className="text-[10px] text-[--muted] font-medium">Auto-injected into content</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.services.map((s,i)=>(
                    <motion.span 
                      layout
                      key={i} 
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[--accent]/10 border border-[--accent]/20 text-[12px] font-bold text-[--accent]"
                    >
                      {s}
                      <button onClick={()=>removeService(i)} className="hover:text-white transition-colors">×</button>
                    </motion.span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input value={newService} onChange={e=>setNewService(e.target.value)} onKeyDown={e=>e.key==='Enter'&&addService()} placeholder="Add core service..." className="flex-1 !bg-black/20 !py-2.5" />
                  <button onClick={addService} className="btn-primary !py-2 !px-5 text-[12px]">Add</button>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-white/5 bg-white/5 p-5">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[--muted] mb-2">Target Audience</label>
                  <textarea rows={3} value={formData.targetAudience} onChange={e=>setFormData({...formData, targetAudience:e.target.value})} className="w-full !bg-black/20 !text-[13px]" placeholder="B2B Founders, CTOs..." />
                </div>
                <div className="rounded-xl border border-white/5 bg-white/5 p-5">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[--muted] mb-2">Brand Voice</label>
                  <textarea rows={3} value={formData.toneOfVoice} onChange={e=>setFormData({...formData, toneOfVoice:e.target.value})} className="w-full !bg-black/20 !text-[13px]" placeholder="Authoritative, direct, technical..." />
                </div>
              </div>

              <div className="rounded-xl border border-white/5 bg-white/5 p-5">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[12px] font-bold text-white uppercase tracking-widest">Content Composition</span>
                  <span className="text-[10px] text-[--muted] font-medium">Weekly Mix Ratio</span>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="rounded-xl bg-[--accent]/10 border border-[--accent]/20 p-4">
                    <span className="text-[18px] font-bold text-[--accent]">{formData.contentMixRatio.serviceExpertise}%</span>
                    <p className="text-[10px] font-bold text-[--muted] uppercase mt-1">Expertise</p>
                  </div>
                  <div className="rounded-xl bg-white/5 border border-white/5 p-4">
                    <span className="text-[18px] font-bold text-white">{formData.contentMixRatio.industryTrends}%</span>
                    <p className="text-[10px] font-bold text-[--muted] uppercase mt-1">Trends</p>
                  </div>
                  <div className="rounded-xl bg-white/5 border border-white/5 p-4">
                    <span className="text-[18px] font-bold text-white">{formData.contentMixRatio.experimental}%</span>
                    <p className="text-[10px] font-bold text-[--muted] uppercase mt-1">Opinion</p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-white/5 bg-white/5 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-bold text-[--error] uppercase tracking-widest">Guardrails</span>
                  <span className="text-[10px] text-[--muted] font-medium">Topics to avoid</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.topicsToAvoid.map((t,i)=>(
                    <motion.span 
                      layout
                      key={i} 
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[--error]/10 border border-[--error]/20 text-[12px] font-bold text-[--error]"
                    >
                      {t}
                      <button onClick={()=>removeAvoid(i)} className="hover:text-white transition-colors">×</button>
                    </motion.span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input value={newAvoid} onChange={e=>setNewAvoid(e.target.value)} onKeyDown={e=>e.key==='Enter'&&addAvoid()} placeholder="Add restricted topic..." className="flex-1 !bg-black/20 !py-2.5 !border-[--error]/20 focus:!border-[--error]" />
                  <button onClick={addAvoid} className="btn-secondary !py-2 !px-5 text-[12px] border-[--error]/20 text-[--error] hover:bg-[--error]/10">Add</button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-white/5 p-6 bg-white/5">
              <button onClick={onClose} className="btn-secondary !px-8 font-bold">CANCEL</button>
              <button onClick={handleSave} className="btn-primary !px-8 shadow-xl">
                {savedSuccess ? <><Check className="h-4.5 w-4.5" /><span>SAVED</span></> : <><Save className="h-4.5 w-4.5" /><span>SAVE CHANGES</span></>}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};