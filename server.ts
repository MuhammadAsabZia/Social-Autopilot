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
  // AUTHENTICATION & ACCESS CONTROL ROUTES
  // -------------------------------------------------------------

  // User Login
  app.post('/api/auth/login', (req, res) => {
    const { identifier, password, googleEmail } = req.body;

    // Handle Google OAuth 1-click login
    if (googleEmail) {
      const cleanEmail = googleEmail.trim().toLowerCase();
      let user = db.getUserByEmail(cleanEmail);

      // Auto-grant full author access if it's the admin/author
      if (!user && (cleanEmail === 'asabsiddx2000@gmail.com' || cleanEmail.includes('asabsidd'))) {
        user = db.createUser({
          name: 'Asab Siddiqui',
          email: cleanEmail,
          username: 'asab',
          role: 'author',
          status: 'approved',
        });
      }

      if (user) {
        if (user.status === 'approved') {
          return res.json({ success: true, user });
        } else if (user.status === 'pending') {
          return res.status(403).json({
            success: false,
            pending: true,
            message: 'Your account is pending administrator approval. You will receive an email once approved.',
          });
        } else {
          return res.status(403).json({
            success: false,
            rejected: true,
            message: 'Access request was declined by the administrator.',
          });
        }
      }

      // Check if there's a pending request
      const pendingReq = db.getAccessRequests().find((r) => r.email.toLowerCase() === cleanEmail);
      if (pendingReq) {
        return res.status(403).json({
          success: false,
          pending: true,
          message: `Access request submitted on ${new Date(pendingReq.createdAt).toLocaleDateString()}. Pending admin approval via Gmail.`,
        });
      }

      return res.status(404).json({
        success: false,
        notFound: true,
        message: 'No account found for this Google email. Please register to request access.',
      });
    }

    // Handle standard Username/Email + Password login
    if (!identifier || !identifier.trim()) {
      return res.status(400).json({ success: false, error: 'Email or username is required.' });
    }

    const clean = identifier.trim().toLowerCase();
    let user = db.getUserByEmail(clean) || db.getUserByUsername(clean);

    // If matching user found
    if (user) {
      if (user.password && password && user.password !== password) {
        return res.status(401).json({ success: false, error: 'Invalid password. Please check your credentials.' });
      }

      if (user.status === 'approved') {
        return res.json({ success: true, user });
      } else if (user.status === 'pending') {
        return res.status(403).json({
          success: false,
          pending: true,
          message: 'Your account is pending administrator approval. You will receive an email once approved.',
        });
      } else {
        return res.status(403).json({
          success: false,
          rejected: true,
          message: 'Access request was declined by the administrator.',
        });
      }
    }

    // Check if there is an access request for this identifier
    const reqFound = db.getAccessRequests().find((r) => r.email.toLowerCase() === clean || r.username.toLowerCase() === clean);
    if (reqFound) {
      if (reqFound.status === 'pending') {
        return res.status(403).json({
          success: false,
          pending: true,
          message: 'Your registration request is pending admin approval. An email notification was sent to the owner.',
        });
      } else if (reqFound.status === 'rejected') {
        return res.status(403).json({
          success: false,
          rejected: true,
          message: 'Access request was declined by the administrator.',
        });
      }
    }

    return res.status(404).json({
      success: false,
      notFound: true,
      message: 'Account not found. Please click "Sign Up" to register and request platform access.',
    });
  });

  // User Registration & Access Request
  app.post('/api/auth/register', async (req, res) => {
    const { name, username, email, password, requestedRole, requestedWorkspaceId, notes } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: 'Full name is required.' });
    }
    if (!username || !username.trim()) {
      return res.status(400).json({ success: false, error: 'Username is required.' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, error: 'Email address is required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanUsername = username.trim().toLowerCase();

    // Check if user already exists
    const existingUser = db.getUserByEmail(cleanEmail) || db.getUserByUsername(cleanUsername);
    if (existingUser && existingUser.status === 'approved') {
      return res.status(400).json({
        success: false,
        error: 'An account with this email/username already exists and is active. Please log in directly.',
      });
    }

    // Check if there's already a pending request
    const existingReq = db.getAccessRequests().find((r) => r.email.toLowerCase() === cleanEmail && r.status === 'pending');
    if (existingReq) {
      return res.json({
        success: true,
        alreadyPending: true,
        message: 'An access request for this email is already awaiting admin approval.',
        request: existingReq,
      });
    }

    // Create Access Request
    const { request, autoApproved, user } = db.createAccessRequest({
      name,
      username: cleanUsername,
      email: cleanEmail,
      password: password || 'password123',
      requestedRole: requestedRole || 'reviewer',
      requestedWorkspaceId,
      notes,
    });

    // 1. Dispatch Email to Admin Gmail (Asabsiddx2000@gmail.com)
    const adminSubject = `[Access Request] New User Registration: ${request.name} (${request.email})`;
    const adminHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0c0f17; color: #e2e8f0; border-radius: 12px; padding: 24px; border: 1px solid #1e293b;">
        <h2 style="color: #60a5fa; margin-top: 0;">🚀 New Access Request: Autopilot Command Center</h2>
        <p>A new user has submitted a registration request on your social media autopilot platform:</p>
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0; background: #111827; border-radius: 8px; overflow: hidden;">
          <tr><td style="padding: 10px 14px; color: #94a3b8; font-weight: bold;">Full Name:</td><td style="padding: 10px 14px; color: #ffffff;">${request.name}</td></tr>
          <tr><td style="padding: 10px 14px; color: #94a3b8; font-weight: bold;">Username:</td><td style="padding: 10px 14px; color: #38bdf8;">@${request.username}</td></tr>
          <tr><td style="padding: 10px 14px; color: #94a3b8; font-weight: bold;">Work Email:</td><td style="padding: 10px 14px; color: #ffffff;">${request.email}</td></tr>
          <tr><td style="padding: 10px 14px; color: #94a3b8; font-weight: bold;">Requested Role:</td><td style="padding: 10px 14px; color: #a855f7; text-transform: uppercase; font-weight: bold;">${request.requestedRole}</td></tr>
          <tr><td style="padding: 10px 14px; color: #94a3b8; font-weight: bold;">Submitted At:</td><td style="padding: 10px 14px; color: #cbd5e1;">${new Date().toLocaleString()}</td></tr>
          ${request.notes ? `<tr><td style="padding: 10px 14px; color: #94a3b8; font-weight: bold;">User Note:</td><td style="padding: 10px 14px; color: #e2e8f0;">${request.notes}</td></tr>` : ''}
        </table>
        <p style="margin-top: 20px;">You can approve or reject this request with 1-click in the <strong>Admin Access Approvals Hub</strong> in your dashboard.</p>
        <div style="margin-top: 24px; padding: 12px; background: #1e293b; border-radius: 6px; font-size: 12px; color: #94a3b8;">
          Autopilot Command Center • Autonomous AI Social Distribution
        </div>
      </div>
    `;

    db.addEmailLog({
      to: 'Asabsiddx2000@gmail.com',
      from: 'Asabsiddx2000@gmail.com',
      subject: adminSubject,
      type: 'admin_approval_request',
      status: 'sent',
      messagePreview: `New registration from ${request.name} (${request.email}) for role ${request.requestedRole}`,
    });

    // 2. If auto-approved, send confirmation to user immediately
    if (autoApproved) {
      const userSubject = `🎉 Access Approved: Welcome to Autopilot Command Center`;
      db.addEmailLog({
        to: request.email,
        from: 'Asabsiddx2000@gmail.com',
        subject: userSubject,
        type: 'user_approval_confirmation',
        status: 'sent',
        messagePreview: `Your account access has been approved. You can now log in at any time.`,
      });
    }

    res.json({
      success: true,
      request,
      autoApproved,
      user,
      message: autoApproved
        ? 'Account successfully approved! You may now sign in directly.'
        : 'Access request submitted! An approval email has been dispatched to the platform administrator (Asabsiddx2000@gmail.com). You will receive an email once approved.',
    });
  });

  // Get Users List
  app.get('/api/auth/users', (req, res) => {
    res.json({ users: db.getUsers() });
  });

  // Get Access Requests List
  app.get('/api/auth/requests', (req, res) => {
    res.json({ requests: db.getAccessRequests() });
  });

  // Admin Approve Access Request
  app.post('/api/auth/requests/approve', (req, res) => {
    const { requestId, reviewerName = 'Author Admin (Asab Siddiqui)' } = req.body;
    if (!requestId) {
      return res.status(400).json({ success: false, error: 'Request ID is required.' });
    }

    const result = db.approveAccessRequest(requestId, reviewerName);
    if (!result.success || !result.request) {
      return res.status(404).json({ success: false, error: 'Access request not found.' });
    }

    // Dispatch Approval Confirmation Email to the user
    const userSubject = `🎉 Your Access is Approved: Welcome to Autopilot Command Center`;
    const userHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0c0f17; color: #e2e8f0; border-radius: 12px; padding: 24px; border: 1px solid #1e293b;">
        <h2 style="color: #34d399; margin-top: 0;">🎉 Access Request Approved!</h2>
        <p>Hi <strong>${result.request.name}</strong>,</p>
        <p>Great news! The platform administrator has approved your access to the <strong>Autonomous Social Media Autopilot Command Center</strong>.</p>
        <div style="background: #111827; border-radius: 8px; padding: 16px; margin: 20px 0; border: 1px solid #1f2937;">
          <p style="margin: 4px 0;"><strong>Username:</strong> ${result.request.username}</p>
          <p style="margin: 4px 0;"><strong>Email:</strong> ${result.request.email}</p>
          <p style="margin: 4px 0;"><strong>Assigned Role:</strong> <span style="color: #a855f7; text-transform: uppercase;">${result.request.requestedRole}</span></p>
        </div>
        <p>You can now return to the application and sign in with your credentials to review post drafts, inspect live trend radars, and collaborate on social distribution.</p>
        <div style="margin-top: 24px; padding: 12px; background: #1e293b; border-radius: 6px; font-size: 12px; color: #94a3b8;">
          Autopilot Command Center • Autonomous AI Social Distribution
        </div>
      </div>
    `;

    db.addEmailLog({
      to: result.request.email,
      from: 'Asabsiddx2000@gmail.com',
      subject: userSubject,
      type: 'user_approval_confirmation',
      status: 'sent',
      messagePreview: `Access approved for ${result.request.name}. You can now sign in.`,
    });

    res.json({
      success: true,
      user: result.user,
      request: result.request,
      message: `Access approved for ${result.request.name}. Confirmation email dispatched to ${result.request.email}.`,
    });
  });

  // Admin Reject Access Request
  app.post('/api/auth/requests/reject', (req, res) => {
    const { requestId, reviewerName = 'Author Admin (Asab Siddiqui)' } = req.body;
    if (!requestId) {
      return res.status(400).json({ success: false, error: 'Request ID is required.' });
    }

    const success = db.rejectAccessRequest(requestId, reviewerName);
    if (!success) {
      return res.status(404).json({ success: false, error: 'Access request not found.' });
    }

    res.json({ success: true, message: 'Access request has been declined.' });
  });

  // --- Gmail Integration State & Logs ---
  app.get('/api/gmail/state', (req, res) => {
    res.json({
      state: db.getGmailState(),
      logs: db.getEmailLogs(),
    });
  });

  app.post('/api/gmail/state', (req, res) => {
    const updated = db.updateGmailState(req.body);
    res.json({ success: true, state: updated });
  });

  app.get('/api/gmail/logs', (req, res) => {
    res.json({ logs: db.getEmailLogs() });
  });

  app.post('/api/gmail/log', (req, res) => {
    const { to, from, subject, status, type, messagePreview } = req.body;
    const log = db.addEmailLog({
      to: to || 'Asabsiddx2000@gmail.com',
      from: from || 'Asabsiddx2000@gmail.com',
      subject: subject || 'Autopilot Notification',
      status: status || 'sent',
      type: type || 'admin_approval_request',
      messagePreview: messagePreview || '',
    });
    res.json({ success: true, log });
  });

  app.post('/api/gmail/dispatch', async (req, res) => {
    const { to, subject, bodyHtml, bodyText, type = 'admin_approval_request' } = req.body;
    const log = db.addEmailLog({
      to: to || 'Asabsiddx2000@gmail.com',
      from: 'Asabsiddx2000@gmail.com',
      subject: subject || 'Social Media Autopilot Notification',
      type,
      status: 'sent',
      messagePreview: bodyText || subject,
    });
    res.json({ success: true, log, messageId: log.id });
  });

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
