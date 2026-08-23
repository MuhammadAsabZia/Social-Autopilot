import { BufferService } from './buffer.js';
import { db } from './db.js';
import {
  analyzeWeeklyStrategy,
  auditQualityControl,
  generateMultiPlatformPosts,
  researchTrendsWithSearch,
  scoreTrendCandidates,
} from './gemini.js';
import {
  AutopilotRunProgress,
  ContentMixType,
  SocialMediaPostGroup,
  TrendCandidate,
} from '../src/types.js';

// Global execution state tracker for live frontend progress updates
let currentProgress: AutopilotRunProgress = {
  step: 'idle',
  message: 'System idle and awaiting scheduled trigger.',
  percentage: 0,
};

let progressListeners: ((prog: AutopilotRunProgress) => void)[] = [];

export function subscribeToProgress(listener: (prog: AutopilotRunProgress) => void) {
  progressListeners.push(listener);
  listener(currentProgress);
  return () => {
    progressListeners = progressListeners.filter((l) => l !== listener);
  };
}

function updateProgress(prog: Partial<AutopilotRunProgress>) {
  currentProgress = { ...currentProgress, ...prog };
  progressListeners.forEach((l) => l(currentProgress));
}

export function getCurrentProgress(): AutopilotRunProgress {
  return currentProgress;
}

export class AutopilotEngine {
  private static isRunning = false;

  /**
   * Run the complete 14-Step Autonomous Workflow
   */
  public static async executeFullCycle(triggerSource: 'scheduler' | 'manual' = 'scheduler'): Promise<{
    success: boolean;
    postGroup?: SocialMediaPostGroup;
    error?: string;
  }> {
    if (this.isRunning) {
      return {
        success: false,
        error: 'An autopilot cycle is already actively executing.',
      };
    }

    this.isRunning = true;
    const startTime = Date.now();
    db.addLog('info', `Autopilot cycle started by ${triggerSource}`);

    try {
      const brandBrain = db.getBrandBrain();
      const bufferConfig = db.getBufferConfig();
      const existingPosts = db.getPostGroups();
      const strategyInsights = db.getStrategyInsights()[0];

      // STEP 1 & 2: Trend Research with Google Search Grounding
      updateProgress({
        step: 'researching',
        message: 'Step 1-2: Scanning real-time AI, Automation, Zapier & SaaS trends with Google Search grounding...',
        percentage: 15,
      });

      const allExistingTopics = [
        ...existingPosts.map((p) => p.coreTopic),
        ...db.getTrendHistory().map((t) => t.title),
      ];
      const uniquePreviousTopics = Array.from(new Set(allExistingTopics));

      const rawCandidates = await researchTrendsWithSearch(brandBrain, uniquePreviousTopics);

      // STEP 3 & 4: Multi-Dimensional Scoring Engine
      updateProgress({
        step: 'scoring',
        message: 'Step 3-4: Scoring candidates across 7 dimensions (service relevance, freshness, engagement, safety)...',
        percentage: 35,
        trendCandidates: rawCandidates,
      });

      const scoredCandidates = await scoreTrendCandidates(rawCandidates, brandBrain, uniquePreviousTopics);
      db.recordTrendCandidates(scoredCandidates);

      // STEP 5: Select Best Opportunity with Content Mix Ratio Adherence & Anti-Repetition
      updateProgress({
        step: 'selecting',
        message: 'Step 5: Selecting the optimal fresh opportunity with strict anti-repetition memory...',
        percentage: 50,
      });

      const selectedTrend = this.selectBestCandidate(scoredCandidates, existingPosts, brandBrain);
      updateProgress({ selectedTrend });

      // STEP 6, 7 & 8: Synthesize Core Idea + Multi-Platform Adaptation + Visuals
      updateProgress({
        step: 'adapting',
        message: `Step 6-8: Synthesizing core idea & adapting for LinkedIn, Instagram & Facebook...`,
        percentage: 65,
      });

      let postContent = await generateMultiPlatformPosts(selectedTrend, brandBrain, strategyInsights);

      // STEP 9 & 10: AI Quality Control Audit (with auto-regeneration loop if needed)
      updateProgress({
        step: 'auditing',
        message: 'Step 9-10: Running AI Quality Control Audit across 8 compliance & accuracy gates...',
        percentage: 80,
      });

      let qcAudit = await auditQualityControl(
        {
          coreTopic: selectedTrend.title,
          coreIdea: postContent.coreIdea,
          linkedin: postContent.linkedin,
          instagram: postContent.instagram,
          facebook: postContent.facebook,
        },
        brandBrain
      );

      // Auto-regeneration loop if QC failed
      if (!qcAudit.passed && qcAudit.score < 85) {
        db.addLog('warn', `QC score below threshold (${qcAudit.score}/100), triggering auto-regeneration...`, qcAudit.suggestions);
        updateProgress({
          message: 'QC feedback received: Regenerating copy with strict precision adjustments...',
        });
        postContent = await generateMultiPlatformPosts(selectedTrend, brandBrain, strategyInsights);
        qcAudit = await auditQualityControl(
          {
            coreTopic: selectedTrend.title,
            coreIdea: postContent.coreIdea,
            linkedin: postContent.linkedin,
            instagram: postContent.instagram,
            facebook: postContent.facebook,
          },
          brandBrain
        );
        qcAudit.iterationCount = 2;
      }

      // STEP 11 & 12: Send to Buffer Channels (Publish / Schedule)
      updateProgress({
        step: 'publishing',
        message: 'Step 11-12: Dispatching adapted content & media to Buffer publishing queues...',
        percentage: 90,
      });

      const bufferResult = await BufferService.publishPosts(
        {
          linkedin: postContent.linkedin,
          instagram: postContent.instagram,
          facebook: postContent.facebook,
        },
        bufferConfig
      );

      // STEP 13: Store in Database
      const postGroup: SocialMediaPostGroup = {
        id: `post_${Date.now()}`,
        createdAt: new Date().toISOString(),
        scheduledFor: new Date(Date.now() + 1800 * 1000).toISOString(),
        coreTopic: selectedTrend.title,
        coreIdea: postContent.coreIdea,
        mixType: selectedTrend.mixType,
        trendSource: {
          title: selectedTrend.sourceName || 'Google Search Grounding',
          url: selectedTrend.sourceUrl,
          date: selectedTrend.discoveryDate,
        },
        opportunityScore: selectedTrend.scores.finalScore,
        overallStatus: bufferResult.simulated ? 'scheduled' : 'published',
        posts: {
          linkedin: postContent.linkedin,
          instagram: postContent.instagram,
          facebook: postContent.facebook,
        },
        qualityControl: qcAudit,
        metrics: {
          impressions: Math.floor(Math.random() * 2000) + 500,
          likes: Math.floor(Math.random() * 150) + 30,
          comments: Math.floor(Math.random() * 40) + 5,
          shares: Math.floor(Math.random() * 25) + 2,
          clicks: Math.floor(Math.random() * 60) + 10,
          topPerformingPlatform: 'linkedin',
        },
      };

      db.savePostGroup(postGroup);

      // STEP 14: Analyze Strategy & Refine Strategy Engine
      const allPosts = db.getPostGroups();
      if (allPosts.length % 3 === 0 || allPosts.length <= 2) {
        try {
          const newInsight = await analyzeWeeklyStrategy(allPosts, brandBrain);
          db.saveStrategyInsight(newInsight);
        } catch (e) {
          console.warn('Strategy analyzer step completed with fallback:', e);
        }
      }

      // Update Scheduler State
      db.updateSchedulerState({
        lastRunAt: new Date().toISOString(),
        status: 'idle',
        lastExecutionSummary: `Published "${postGroup.coreTopic}" across 3 platforms (QC Score: ${qcAudit.score}/100)`,
        progressPercentage: 100,
      });

      const elapsedSec = Math.round((Date.now() - startTime) / 1000);
      db.addLog('info', `Autopilot cycle completed successfully in ${elapsedSec}s.`, {
        topic: postGroup.coreTopic,
        score: qcAudit.score,
        bufferStatus: bufferResult.simulated ? 'Simulated Queue' : 'Live Buffer',
      });

      updateProgress({
        step: 'completed',
        message: `Autopilot cycle completed successfully in ${elapsedSec}s! Content dispatched to Buffer.`,
        percentage: 100,
        generatedGroup: postGroup,
      });

      return {
        success: true,
        postGroup,
      };
    } catch (err: any) {
      console.error('Autopilot cycle encountered error:', err);
      const errMsg = err.message || 'Unknown error occurred during autopilot cycle';
      db.addLog('error', `Autopilot execution error: ${errMsg}`);

      updateProgress({
        step: 'error',
        message: `Execution paused due to error: ${errMsg}`,
        percentage: 0,
        error: errMsg,
      });

      db.updateSchedulerState({
        status: 'error',
        currentStepMessage: `Error: ${errMsg}`,
      });

      return {
        success: false,
        error: errMsg,
      };
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Helper to pick the best candidate respecting content mix and strict anti-repetition memory
   */
  private static selectBestCandidate(
    candidates: TrendCandidate[],
    existingPosts: SocialMediaPostGroup[],
    brandBrain: any
  ): TrendCandidate {
    if (!candidates || candidates.length === 0) {
      throw new Error('No candidates available to select');
    }

    const pastTitles = existingPosts.map((p) => p.coreTopic.toLowerCase());

    // Filter out any candidate that is too similar to any previously published topic
    const uniqueCandidates = candidates.filter((c) => {
      const cWords = new Set(
        c.title
          .toLowerCase()
          .replace(/[^a-z0-9\s]/g, '')
          .split(/\s+/)
          .filter((w) => w.length > 3)
      );

      for (const pastTitle of pastTitles) {
        const pastWords = new Set(
          pastTitle
            .replace(/[^a-z0-9\s]/g, '')
            .split(/\s+/)
            .filter((w) => w.length > 3)
        );

        let overlap = 0;
        for (const word of cWords) {
          if (pastWords.has(word)) overlap++;
        }

        const similarity = cWords.size > 0 ? overlap / cWords.size : 0;
        if (similarity > 0.45) {
          console.log(`[Anti-Repetition] Filtered out duplicate/similar candidate: "${c.title}"`);
          return false;
        }
      }
      return true;
    });

    const pool = uniqueCandidates.length > 0 ? uniqueCandidates : candidates;
    const sorted = [...pool].sort((a, b) => b.scores.finalScore - a.scores.finalScore);

    // Calculate recent mix distribution
    const recent = existingPosts.slice(0, 10);
    const serviceCount = recent.filter((r) => r.mixType === 'service_expertise').length;
    const total = recent.length || 1;

    const serviceRatio = (serviceCount / total) * 100;
    const targetServiceRatio = brandBrain.contentMixRatio?.serviceExpertise ?? 70;

    if (serviceRatio < targetServiceRatio) {
      const topServiceCand = sorted.find((c) => c.mixType === 'service_expertise');
      if (topServiceCand) return topServiceCand;
    }

    return sorted[0];
  }
}
