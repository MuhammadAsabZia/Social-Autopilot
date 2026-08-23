import React, { useEffect, useState } from 'react';
import { AlertCircle, Check, CheckCircle2, ExternalLink, HelpCircle, Image as ImageIcon, Instagram, Key, Linkedin, Loader2, Radio, RefreshCw, Save, Send, Sliders, Sparkles, TestTube, X, Zap } from 'lucide-react';
import { BufferConfig, BufferGraphQLChannel } from '../types.js';

interface BufferSettingsModalProps { config: BufferConfig; isOpen: boolean; onClose: () => void; onSave: (updated: BufferConfig) => void; }

export const BufferSettingsModal: React.FC<BufferSettingsModalProps> = ({ config, isOpen, onClose, onSave }) => {
  const [activeTab, setActiveTab] = useState<'settings' | 'test_queue'>('settings');
  const [formData, setFormData] = useState<BufferConfig>({ ...config });
  const [testingToken, setTestingToken] = useState(false);
  const [testResult, setTestResult] = useState<{ tested: boolean; success: boolean; organizationName?: string; message: string; details?: string; channels?: BufferGraphQLChannel[]; } | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [testPlatform, setTestPlatform] = useState<'all' | 'linkedin' | 'instagram' | 'facebook'>('all');
  const [customTestText, setCustomTestText] = useState(`🚀 [AI Agency Autopilot Verification]\n\nAutomating multi-channel social growth with Gemini 2.5 Flash and Buffer GraphQL API.\n\n• Zero-human content generation\n• High-engagement hook & formatting\n• Synced Buffer queue delivery\n\n#AIAutomation #BuildWithAI #GeminiFlash #SaaS #ContentOps`);
  const [dispatchingTest, setDispatchingTest] = useState(false);
  const [dispatchResult, setDispatchResult] = useState<{ success: boolean; isSimulated: boolean; message: string; results: { platform: string; channelId: string; channelName: string; status: 'queued' | 'failed' | 'simulated'; postId?: string; dueAt?: string; textPreview: string; error?: string; }[]; } | null>(null);

  useEffect(() => { if (isOpen) { setFormData({ ...config }); setTestResult(null); setDispatchResult(null); } }, [isOpen, config]);
  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setTestingToken(true); setTestResult(null);
    try {
      const res = await fetch('/api/buffer/test', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
      const data = await res.json();
      if (data.connected) {
        const updatedChannels = { ...formData.channels };
        if (Array.isArray(data.channels)) {
          data.channels.forEach((ch: BufferGraphQLChannel) => {
            const s = (ch.service || '').toLowerCase();
            if (s.includes('linkedin') && updatedChannels.linkedin) { updatedChannels.linkedin.channelId = ch.id; updatedChannels.linkedin.channelName = ch.name; updatedChannels.linkedin.profileId = ch.id; updatedChannels.linkedin.profileName = ch.name; }
            else if (s.includes('instagram') && updatedChannels.instagram) { updatedChannels.instagram.channelId = ch.id; updatedChannels.instagram.channelName = ch.name; updatedChannels.instagram.profileId = ch.id; updatedChannels.instagram.profileName = ch.name; }
            else if (s.includes('facebook') && updatedChannels.facebook) { updatedChannels.facebook.channelId = ch.id; updatedChannels.facebook.channelName = ch.name; updatedChannels.facebook.profileId = ch.id; updatedChannels.facebook.profileName = ch.name; }
          });
        }
        setFormData({ ...formData, isConnected: true, isSimulatedMode: false, hasEnvKey: true, organizationName: data.organizationName, organizationId: data.organizationId, channels: updatedChannels });
        setTestResult({ tested: true, success: true, organizationName: data.organizationName, message: `Connected: "${data.organizationName || 'Personal Workspace'}" — ${data.channels?.length || 0} channel(s) found.`, channels: data.channels });
      } else { setTestResult({ tested: true, success: false, message: data.error || 'Authentication failed', details: data.details || 'Check BUFFER_API_KEY in Secrets.' }); }
    } catch (err: any) { setTestResult({ tested: true, success: false, message: err.message || 'Network error', details: 'Check connection and server status.' }); } finally { setTestingToken(false); }
  };

  const handleTestQueueDispatch = async () => {
    setDispatchingTest(true); setDispatchResult(null);
    try {
      const res = await fetch('/api/buffer/test-queue-post', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ platform: testPlatform, text: customTestText, configOverride: formData }) });
      const data = await res.json(); setDispatchResult(data);
    } catch (err: any) { setDispatchResult({ success: false, isSimulated: formData.isSimulatedMode, message: err.message || 'Error', results: [] }); } finally { setDispatchingTest(false); }
  };

  const handleSave = () => { onSave(formData); setSavedSuccess(true); setTimeout(() => { setSavedSuccess(false); onClose(); }, 700); };

  const testButtonLabel = testingToken ? 'Testing…' : 'Test & Sync';
  const testButtonIcon = testingToken ? (<Loader2 className="h-3.5 w-3.5 animate-spin" />) : (<RefreshCw className="h-3.5 w-3.5" />);

  const modeSimClass = formData.isSimulatedMode ? 'btn-primary' : 'btn-secondary';
  const modeLiveClass = !formData.isSimulatedMode ? 'btn-primary' : 'btn-secondary';

  const testQueueButtons = ['all','linkedin','instagram','facebook'].map((p) => (
    <button key={p} onClick={()=>setTestPlatform(p as any)} className={`rounded-lg p-2 text-center text-[10px] font-semibold uppercase tracking-wider ${testPlatform===p?'btn-primary':'btn-secondary'}`}>
      {p==='all'?'All':p.charAt(0).toUpperCase()+p.slice(1)}
    </button>
  ));

  const channelConfigs = ['linkedin','instagram','facebook'].map((ch) => {
    const Icon = ch==='linkedin'?Linkedin:ch==='instagram'?Instagram:ImageIcon;
    const cfg = formData.channels[ch as keyof BufferConfig['channels']] as BufferConfig['channels']['linkedin'];
    return (
      <div key={ch} className="rounded-lg border border-[--border] bg-[--bg-elevated] p-2 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2"><div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.03] border border-[--border]"><Icon className="h-3.5 w-3.5" /></div><div><p className="font-medium text-[--fg] capitalize">{ch}</p><p className="text-[10px] text-[--muted]">Channel ID & name</p></div></div>
          <label className="flex items-center gap-2 cursor-pointer"><span className="text-[10px] text-[--muted]">Enabled</span><input type="checkbox" checked={cfg?.enabled??true} onChange={e=>setFormData({...formData,channels:{...formData.channels,[ch]:{...cfg,enabled:e.target.checked}}})} className="accent-[--accent] h-4 w-4 rounded" /></label>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <div><label className="block text-[10px] font-medium uppercase tracking-wider text-[--muted] mb-1">Name</label><input value={cfg?.channelName||''} onChange={e=>setFormData({...formData,channels:{...formData.channels,[ch]:{...cfg,channelName:e.target.value,profileName:e.target.value}}})} className="w-full bg-[--bg] border border-[--border] rounded-lg px-2.5 py-1.5 text-sm text-[--fg] placeholder-[--muted] focus:border-[--accent] focus:outline-none" placeholder={`e.g. My ${ch.charAt(0).toUpperCase()+ch.slice(1)}`} /></div>
          <div><label className="block text-[10px] font-medium uppercase tracking-wider text-[--muted] mb-1">Channel ID</label><input value={cfg?.channelId||''} onChange={e=>setFormData({...formData,channels:{...formData.channels,[ch]:{...cfg,channelId:e.target.value,profileId:e.target.value}}})} className="w-full bg-[--bg] border border-[--border] rounded-lg px-2.5 py-1.5 text-sm text-[--fg] placeholder-[--muted] font-mono focus:border-[--accent] focus:outline-none" placeholder="e.g. 64a1b2c3d..." /></div>
        </div>
      </div>
    );
  });

  const dispatchResultContent = dispatchResult ? (
    <div className={`rounded-lg border p-3 text-sm ${dispatchResult.success?'border-[--success]/20 bg-[--success]/5':'border-[--error]/20 bg-[--error]/5'}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {dispatchResult.success ? <CheckCircle2 className="h-4 w-4 text-[--success]" /> : <AlertCircle className="h-4 w-4 text-[--error]" />}
          <div>
            <p className="font-medium">{dispatchResult.success?'Verified':'Issue'}</p>
            <p className="text-[10px] text-[--muted]">{dispatchResult.message}</p>
          </div>
        </div>
        <a href="https://publish.buffer.com" target="_blank" rel="noopener" className="text-[10px] text-[--accent]">Open Buffer Dashboard</a>
      </div>
      {dispatchResult.results?.map((r,i) => (
        <div key={i} className="mt-2 p-2 rounded bg-[--bg] border border-[--border]">
          <div className="flex items-center gap-2"><span className="tag">{r.platform}</span><span className="text-[10px] text-[--muted]">{r.channelName}</span></div>
          <div className="mt-1 flex items-center gap-2 text-[10px]">
            {r.status==='queued' && <span className="tag">Queued</span>}
            {r.status==='simulated' && <span className="tag-neutral">Simulated</span>}
            {r.status==='failed' && <span className="tag" style={{borderColor:'rgba(214,69,69,0.2)',background:'rgba(214,69,69,0.1)',color:'#d64545'}}>Failed: {r.error?.slice(0,50)}</span>}
          </div>
        </div>
      ))}
    </div>
  ) : null;

  const testResultContent = testResult ? (
    <div className={`rounded-lg border p-2.5 text-[11px] ${testResult.success?'border-[--success]/20 bg-[--success]/5 text-[--success]':'border-[--error]/20 bg-[--error]/5 text-[--error]'}`}>
      <div className="flex items-center gap-2">
        {testResult.success ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
        <div>
          <p className="font-medium">{testResult.message}</p>
          {testResult.details && <p className="text-[10px] opacity-80 mt-0.5">{testResult.details}</p>}
        </div>
      </div>
    </div>
  ) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[--bg]/90 p-3 sm:p-4">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden rounded-lg border border-[--border] bg-[--card]">
        <div className="flex items-center justify-between border-b border-[--border] p-4">
          <div className="flex items-center gap-2"><div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[--accent]/10 border border-[--accent]/20"><Sliders className="h-4 w-4 text-[--accent]" /></div><div><h3 className="font-semibold text-[--fg]">Buffer Settings</h3><p className="text-[10px] text-[--muted]">API & channel configuration</p></div></div>
          <button onClick={onClose} className="btn-ghost"><X className="h-4.5 w-4.5" /></button>
        </div>
        <div className="flex border-b border-[--border] px-4">
          <button onClick={()=>setActiveTab('settings')} className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider ${activeTab==='settings'?'border-[--accent] text-[--fg]':'border-transparent text-[--muted] hover:text-[--fg]'}`}><Sliders className="h-3.5 w-3.5" /><span>Settings</span></button>
          <button onClick={()=>setActiveTab('test_queue')} className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider ${activeTab==='test_queue'?'border-[--accent] text-[--fg]':'border-transparent text-[--muted] hover:text-[--fg]'}`}><TestTube className="h-3.5 w-3.5" /><span>Queue Test</span></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {activeTab === 'settings' && (
            <>
              <div className="rounded-lg border border-[--border] bg-[--bg-elevated] p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2"><div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[--accent]/10 text-[--accent]"><Key className="h-4 w-4" /></div><div><p className="font-medium text-[--fg]">Buffer API Key</p><p className="text-[10px] text-[--muted]">{formData.organizationName?`Workspace: ${formData.organizationName}`:'Configured via BUFFER_API_KEY secret'}</p></div></div>
                  <button onClick={handleTestConnection} disabled={testingToken} className="btn-primary text-[11px] px-3">{testButtonIcon}<span>{testButtonLabel}</span></button>
                </div>
                {testResultContent}
              </div>
              <div className="rounded-lg border border-[--border] bg-[--bg-elevated] p-3">
                <div className="flex items-center justify-between mb-2"><span className="font-medium text-[--fg]">Mode</span><span className="text-[10px] text-[--muted]">Switch between live & simulation</span></div>
                <div className="flex gap-2">
                  <button onClick={()=>setFormData({...formData,isSimulatedMode:true})} className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium ${modeSimClass}`}>Simulation</button>
                  <button onClick={()=>setFormData({...formData,isSimulatedMode:false})} className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium ${modeLiveClass}`}>Live Buffer</button>
                </div>
              </div>
              <div className="space-y-2">{channelConfigs}</div>
            </>
          )}
          {activeTab === 'test_queue' && (
            <div className="space-y-3">
              <div className="rounded-lg border border-[--accent]/20 bg-[--accent]/5 p-3"><div className="flex items-center gap-2"><TestTube className="h-4 w-4 text-[--accent]" /><div><p className="font-medium text-[--fg]">Queue Dispatch Test</p><p className="text-[10px] text-[--muted]">Verify Buffer receives and stores AI posts</p></div></div></div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">{testQueueButtons}</div>
              <div className="rounded-lg border border-[--border] bg-[--bg-elevated] p-2"><label className="flex items-center justify-between mb-1"><span className="font-medium text-[--fg]">Test Post Content</span><button onClick={()=>setCustomTestText(`🚀 [AI Agency Verification]\n\nAutomating social growth with Gemini 2.5 Flash.\n\n#AIAutomation #GeminiFlash`)} className="text-[10px] text-[--accent]">Reset</button></label><textarea rows={5} value={customTestText} onChange={e=>setCustomTestText(e.target.value)} className="w-full bg-[--bg] border border-[--border] rounded-lg px-2.5 py-2 text-sm text-[--fg] placeholder-[--muted] focus:border-[--accent] focus:outline-none" /></div>
              <button onClick={handleTestQueueDispatch} disabled={dispatchingTest} className="btn-primary w-full justify-center gap-2">{dispatchingTest?(<><Loader2 className="h-4 w-4 animate-spin" /><span>Dispatching…</span></>):(<><Send className="h-4 w-4" /><span>Send Test Post</span></>)}</button>
              {dispatchResultContent}
            </div>
          )}
        </div>
        <div className="flex items-center justify-between border-t border-[--border] p-4">
          {activeTab==='settings'?(
            <button onClick={handleSave} className="btn-primary inline-flex items-center gap-2">{savedSuccess?(<><Check className="h-4 w-4" /><span>Saved</span></>):(<><Save className="h-4 w-4" /><span>Save Configuration</span></>)}</button>
          ):(
            <button onClick={()=>setActiveTab('settings')} className="btn-secondary">Back to Settings</button>
          )}
        </div>
      </div>
    </div>
  );
};