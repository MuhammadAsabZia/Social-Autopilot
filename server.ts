import 'dotenv/config';
import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { AutopilotEngine, getCurrentProgress, subscribeToProgress } from './server/autopilot.js';
import { BufferService } from './server/buffer.js';
import { db } from './server/db.js';
import {
  analyzeWeeklyStrategy,
  auditQualityControl,
  generateCustomStudioPost,
  generateMultiPlatformPosts,
  generateViralHookMatrix,
  researchTrendsWithSearch,
  scoreTrendCandidates,
} from './server/gemini.js';
import { generatePlatformVisualAssets } from './server/images.js';
import { BackgroundScheduler } from './server/scheduler.js';

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT || 3000);

  app.use(express.json({ limit: '20mb' }));
  app.use(express.urlencoded({ extended: true, limit: '20mb' }));

  // Initialize Background 24/7 Scheduler
  BackgroundScheduler.init();

  // -------------------------------------------------------------
  // API ROUTES
  // -------------------------------------------------------------

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Workspaces (Micro-SaaS Multi-Brand Support)
  app.get('/api/workspaces', (req, res) => {
    res.json({
      workspaces: db.getWorkspaces(),
      activeWorkspaceId: db.getActiveWorkspaceId(),
    });
  });

  app.post('/api/workspaces/switch', (req, res) => {
    const { workspaceId } = req.body;
    const switched = db.switchWorkspace(workspaceId);
    if (!switched) {
      return res.status(404).json({ success: false, error: 'Workspace not found' });
    }
    BackgroundScheduler.recalculateNextRun();
    res.json({ success: true, workspace: switched, brandBrain: db.getBrandBrain(), bufferConfig: db.getBufferConfig() });
  });

  app.post('/api/workspaces/create', (req, res) => {
    const { name, brandBrain, bufferConfig } = req.body;
    const created = db.createWorkspace(name, brandBrain, bufferConfig);
    BackgroundScheduler.recalculateNextRun();
    res.json({ success: true, workspace: created });
  });

  // Overall App & Scheduler Status
  app.get('/api/status', (req, res) => {
    const schedulerState = db.getSchedulerState();
    const brandBrain = db.getBrandBrain();
    const bufferConfig = db.getBufferConfig();
    const postGroups = db.getPostGroups();
    const latestPost = postGroups[0] || null;
    const progress = getCurrentProgress();
    const workspaces = db.getWorkspaces();
    const activeWorkspaceId = db.getActiveWorkspaceId();

    res.json({
      scheduler: schedulerState,
      progress,
      latestPost,
      workspaces,
      activeWorkspaceId,
      stats: {
        totalPosts: postGroups.length,
        publishedCount: postGroups.filter((p) => p.overallStatus === 'published').length,
        scheduledCount: postGroups.filter((p) => p.overallStatus === 'scheduled').length,
        bufferConnected: bufferConfig.isConnected,
        bufferSimulated: bufferConfig.isSimulatedMode,
        automationEnabled: schedulerState.enabled,
      },
    });
  });

  // AI Post Studio: Custom Post Generator Co-Pilot
  app.post('/api/studio/generate', async (req, res) => {
    try {
      const { topic, strategicAngle, framework = 'contrarian', toneOfVoice, targetAudience, includeFirstComment = true, generateVisual = true } = req.body;
      if (!topic || typeof topic !== 'string' || !topic.trim()) {
        return res.status(400).json({ success: false, error: 'Topic is required.' });
      }

      const brandBrain = db.getBrandBrain();
      const result = await generateCustomStudioPost(
        {
          topic: topic.trim(),
          strategicAngle,
          framework,
          toneOfVoice,
          targetAudience,
          includeFirstComment,
          generateVisual,
        },
        brandBrain
      );

      // Optionally generate visual artwork
      if (generateVisual) {
        try {
          const visuals = await generatePlatformVisualAssets(
            topic.trim(),
            'Custom Studio Creation',
            {
              linkedin: {
                prompt: result.postGroup.posts.linkedin.visualPrompt || topic.trim(),
                hook: result.postGroup.posts.linkedin.hook,
              },
              instagram: {
                prompt: result.postGroup.posts.instagram.visualPrompt || topic.trim(),
                hook: result.postGroup.posts.instagram.hook,
              },
              facebook: {
                prompt: result.postGroup.posts.facebook.visualPrompt || topic.trim(),
                hook: result.postGroup.posts.facebook.hook,
              },
            }
          );
          if (visuals.linkedin?.visualImageUrl) result.postGroup.posts.linkedin.visualImageUrl = visuals.linkedin.visualImageUrl;
          if (visuals.instagram?.visualImageUrl) result.postGroup.posts.instagram.visualImageUrl = visuals.instagram.visualImageUrl;
          if (visuals.facebook?.visualImageUrl) result.postGroup.posts.facebook.visualImageUrl = visuals.facebook.visualImageUrl;
        } catch (imgErr) {
          console.warn('Studio visual generation warning:', imgErr);
        }
      }

      const saved = db.savePostGroup(result.postGroup);
      res.json({ success: true, postGroup: saved });
    } catch (err: any) {
      console.error('Error generating studio post:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // AI Post Studio: Viral Hook Matrix Generator
  app.post('/api/studio/generate-hooks', async (req, res) => {
    try {
      const { topic, coreIdea } = req.body;
      if (!topic || typeof topic !== 'string' || !topic.trim()) {
        return res.status(400).json({ success: false, error: 'Topic is required.' });
      }
      const brandBrain = db.getBrandBrain();
      const hooks = await generateViralHookMatrix(topic.trim(), coreIdea || topic.trim(), brandBrain);
      res.json({ success: true, hooks });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // AI Post Studio: Live Imagen Visual Generator
  app.post('/api/studio/generate-image', async (req, res) => {
    try {
      const { topic, prompt, platform = 'linkedin' } = req.body;
      const visuals = await generatePlatformVisualAssets(
        topic || 'AI Architecture Teardown',
        'Custom Studio Creation',
        {
          linkedin: platform === 'linkedin' ? { prompt, hook: topic } : undefined,
          instagram: platform === 'instagram' ? { prompt, hook: topic } : undefined,
          facebook: platform === 'facebook' ? { prompt, hook: topic } : undefined,
        }
      );
      const imageUrl = (visuals as any)[platform]?.visualImageUrl || visuals.linkedin?.visualImageUrl || visuals.instagram?.visualImageUrl || visuals.facebook?.visualImageUrl;
      res.json({ success: true, imageUrl });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Brand Brain
  app.get('/api/brand-brain', (req, res) => {
    res.json(db.getBrandBrain());
  });

  app.post('/api/brand-brain', (req, res) => {
    try {
      const updated = db.updateBrandBrain(req.body);
      BackgroundScheduler.recalculateNextRun();
      res.json({ success: true, brandBrain: updated });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // Buffer Config & Connection Test via GraphQL API
  app.get('/api/buffer-config', (req, res) => {
    const rawConfig = db.getBufferConfig();
    const activeKey = BufferService.getApiKey();
    const hasEnvKey = Boolean(activeKey.trim());
    const apiKeyMasked = hasEnvKey
      ? `${activeKey.slice(0, 4)}••••••••${activeKey.slice(-4)}`
      : '';

    res.json({
      ...rawConfig,
      hasEnvKey,
      apiKeyMasked,
      // Never expose the raw key string in full to client
      accessToken: undefined,
    });
  });

  app.post('/api/buffer-config', (req, res) => {
    try {
      const payload = { ...req.body };
      if (payload.apiKey && typeof payload.apiKey === 'string' && payload.apiKey.trim()) {
        BufferService.setRuntimeApiKey(payload.apiKey.trim());
      }
      delete payload.accessToken;
      const updated = db.updateBufferConfig(payload);
      res.json({ success: true, bufferConfig: updated });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  app.post('/api/buffer/test', async (req, res) => {
    const { apiKey } = req.body || {};
    try {
      if (apiKey && typeof apiKey === 'string' && apiKey.trim()) {
        BufferService.setRuntimeApiKey(apiKey.trim());
      }
      const testResult = await BufferService.testConnection(apiKey);
      if (testResult.connected) {
        if (apiKey && typeof apiKey === 'string' && apiKey.trim()) {
          BufferService.setRuntimeApiKey(apiKey.trim());
        }
        // Auto-match and update channels in database
        const currentConfig = db.getBufferConfig();
        const updatedChannels = { ...currentConfig.channels };

        if (Array.isArray(testResult.channels)) {
          testResult.channels.forEach((ch) => {
            const s = (ch.service || '').toLowerCase();
            if (s.includes('linkedin') && updatedChannels.linkedin) {
              updatedChannels.linkedin.channelId = ch.id;
              updatedChannels.linkedin.channelName = ch.name;
              updatedChannels.linkedin.service = ch.service;
              updatedChannels.linkedin.profileId = ch.id;
              updatedChannels.linkedin.profileName = ch.name;
            } else if (s.includes('instagram') && updatedChannels.instagram) {
              updatedChannels.instagram.channelId = ch.id;
              updatedChannels.instagram.channelName = ch.name;
              updatedChannels.instagram.service = ch.service;
              updatedChannels.instagram.profileId = ch.id;
              updatedChannels.instagram.profileName = ch.name;
            } else if (s.includes('facebook') && updatedChannels.facebook) {
              updatedChannels.facebook.channelId = ch.id;
              updatedChannels.facebook.channelName = ch.name;
              updatedChannels.facebook.service = ch.service;
              updatedChannels.facebook.profileId = ch.id;
              updatedChannels.facebook.profileName = ch.name;
            }
          });
        }

        const updateData: any = {
          isConnected: true,
          isSimulatedMode: false,
          hasEnvKey: true,
          organizationId: testResult.organizationId,
          organizationName: testResult.organizationName,
          channels: updatedChannels,
        };
        if (apiKey && typeof apiKey === 'string' && apiKey.trim()) {
          updateData.apiKey = apiKey.trim();
        }

        db.updateBufferConfig(updateData);
      }

      res.json(testResult);
    } catch (err: any) {
      res.status(500).json({ connected: false, error: err.message });
    }
  });

  app.post('/api/buffer/sync-channels', async (req, res) => {
    try {
      const result = await BufferService.testConnection();
      if (!result.connected) {
        return res.status(400).json({ success: false, error: result.error, details: result.details });
      }

      const currentConfig = db.getBufferConfig();
      const updatedChannels = { ...currentConfig.channels };

      result.channels.forEach((ch) => {
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

      const updated = db.updateBufferConfig({
        isConnected: true,
        isSimulatedMode: false,
        organizationId: result.organizationId,
        organizationName: result.organizationName,
        channels: updatedChannels,
      });

      res.json({ success: true, channels: result.channels, bufferConfig: updated });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Test Dispatch a Post to Buffer Queue
  app.post('/api/buffer/test-queue-post', async (req, res) => {
    try {
      const { platform = 'all', text, configOverride } = req.body;
      const result = await BufferService.testDispatchToQueue(platform, text, configOverride);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Create an Idea in Buffer via GraphQL
  app.post('/api/buffer/create-idea', async (req, res) => {
    try {
      const { title, text, organizationId } = req.body;
      const bufferConfig = db.getBufferConfig();
      const targetOrgId = organizationId || bufferConfig.organizationId;

      if (!targetOrgId) {
        return res.status(400).json({
          success: false,
          error: 'No organization ID found. Please connect your Buffer account or provide an organizationId.',
        });
      }

      const result = await BufferService.createIdeaGraphQL(
        targetOrgId,
        title || 'New AI Idea',
        text || ''
      );

      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Autopilot Execution Trigger & Toggle
  app.post('/api/autopilot/run', async (req, res) => {
    // Return early to prevent UI timeout and run in background
    res.json({ success: true, message: 'Autopilot cycle initiated' });

    try {
      await AutopilotEngine.executeFullCycle('manual');
    } catch (err) {
      console.error('Manual autopilot run error:', err);
    }
  });

  app.post('/api/autopilot/toggle', (req, res) => {
    const { enabled } = req.body;
    BackgroundScheduler.toggleAutomation(Boolean(enabled));
    res.json({ success: true, scheduler: db.getSchedulerState() });
  });

  app.get('/api/autopilot/progress', (req, res) => {
    res.json(getCurrentProgress());
  });

  // Post Groups (Content Calendar & History)
  app.get('/api/post-groups', (req, res) => {
    res.json(db.getPostGroups());
  });

  app.get('/api/post-groups/:id', (req, res) => {
    const item = db.getPostGroupById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Post group not found' });
    }
    res.json(item);
  });

  app.post('/api/post-groups', (req, res) => {
    try {
      const saved = db.savePostGroup(req.body);
      res.json({ success: true, postGroup: saved });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  app.delete('/api/post-groups/:id', (req, res) => {
    const success = db.deletePostGroup(req.params.id);
    res.json({ success });
  });

  // Manual Publish to Buffer
  app.post('/api/post-groups/:id/publish', async (req, res) => {
    const postGroup = db.getPostGroupById(req.params.id);
    if (!postGroup) {
      return res.status(404).json({ error: 'Post group not found' });
    }

    try {
      const bufferConfig = db.getBufferConfig();
      const result = await BufferService.publishPosts(postGroup.posts, bufferConfig);

      postGroup.overallStatus = result.simulated ? 'scheduled' : 'published';
      db.savePostGroup(postGroup);

      res.json({ success: true, result, postGroup });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Manual Regenerate Post
  app.post('/api/posts/regenerate', async (req, res) => {
    const { postGroupId, platform } = req.body;
    try {
      const postGroup = db.getPostGroupById(postGroupId);
      if (!postGroup) {
        return res.status(404).json({ error: 'Post group not found' });
      }

      const brandBrain = db.getBrandBrain();
      const mockCandidate = {
        id: 'regen',
        title: postGroup.coreTopic,
        summary: postGroup.coreIdea,
        category: 'AI Automation',
        discoveryDate: new Date().toISOString(),
        mixType: postGroup.mixType,
        rationale: 'Manual user regeneration request',
        suggestedAngle: postGroup.coreIdea,
        scores: {
          serviceRelevance: 95,
          audienceInterest: 90,
          freshness: 95,
          engagementPotential: 90,
          businessOpportunity: 95,
          brandSafety: 99,
          previousUsagePenalty: 0,
          finalScore: 94,
        },
      };

      const regenerated = await generateMultiPlatformPosts(mockCandidate, brandBrain);

      if (platform && platform in regenerated) {
        (postGroup.posts as any)[platform] = (regenerated as any)[platform];
      } else {
        postGroup.posts = {
          linkedin: regenerated.linkedin,
          instagram: regenerated.instagram,
          facebook: regenerated.facebook,
        };
        postGroup.coreIdea = regenerated.coreIdea;
      }

      // Re-audit
      const qc = await auditQualityControl(
        {
          coreTopic: postGroup.coreTopic,
          coreIdea: postGroup.coreIdea,
          linkedin: postGroup.posts.linkedin,
          instagram: postGroup.posts.instagram,
          facebook: postGroup.posts.facebook,
        },
        brandBrain
      );
      postGroup.qualityControl = qc;

      db.savePostGroup(postGroup);
      res.json({ success: true, postGroup });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Live Trend Radar Search
  app.get('/api/trends/research', async (req, res) => {
    try {
      const brandBrain = db.getBrandBrain();
      const existing = db.getPostGroups().map((p) => p.coreTopic);
      const raw = await researchTrendsWithSearch(brandBrain, existing);
      const scored = await scoreTrendCandidates(raw, brandBrain, existing);
      db.recordTrendCandidates(scored);
      res.json({ success: true, candidates: scored });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Analytics & Strategy
  app.get('/api/strategy-insights', (req, res) => {
    res.json(db.getStrategyInsights());
  });

  app.post('/api/strategy-insights/generate', async (req, res) => {
    try {
      const brandBrain = db.getBrandBrain();
      const posts = db.getPostGroups();
      const insight = await analyzeWeeklyStrategy(posts, brandBrain);
      db.saveStrategyInsight(insight);
      res.json({ success: true, insight });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Execution Logs
  app.get('/api/logs', (req, res) => {
    res.json(db.getLogs());
  });

  // Media Serving Endpoint
  app.get('/api/media/:id', (req, res) => {
    const media = db.getMedia(req.params.id);
    if (!media) {
      return res.status(404).send('Media asset not found');
    }
    res.setHeader('Content-Type', media.mimeType);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(media.buffer);
  });

  // Global API error handler
  app.use('/api', (err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('[API Error]', err);
    res.status(500).json({
      success: false,
      error: err?.message || 'Internal server error',
    });
  });

  // -------------------------------------------------------------
  // VITE MIDDLEWARE / STATIC ASSETS
  // -------------------------------------------------------------
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Autopilot Server] Listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
