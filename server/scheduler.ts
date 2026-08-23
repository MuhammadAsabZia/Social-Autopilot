import { AutopilotEngine } from './autopilot.js';
import { db } from './db.js';

export class BackgroundScheduler {
  private static timer: NodeJS.Timeout | null = null;
  private static isInitialized = false;

  public static init() {
    if (this.isInitialized) return;
    this.isInitialized = true;

    console.log('[Scheduler] Background Autonomous Scheduler initialized.');
    this.recalculateNextRun();

    // Check every 30 seconds
    this.timer = setInterval(() => {
      this.tick();
    }, 30000);
  }

  private static tick() {
    const state = db.getSchedulerState();
    if (!state.enabled || state.status === 'running') {
      return;
    }

    const now = new Date();
    if (state.nextRunAt) {
      const nextRun = new Date(state.nextRunAt);
      if (now >= nextRun) {
        console.log('[Scheduler] Triggering scheduled autonomous cycle at', now.toISOString());
        this.runAutonomousJob();
      }
    }
  }

  public static async runAutonomousJob() {
    const state = db.getSchedulerState();
    if (state.status === 'running') {
      console.log('[Scheduler] Job already running, skipping.');
      return;
    }

    db.updateSchedulerState({
      status: 'running',
      currentStepMessage: 'Autonomous scheduler triggered background cycle...',
      progressPercentage: 5,
    });

    try {
      await AutopilotEngine.executeFullCycle('scheduler');
    } catch (err: any) {
      console.error('[Scheduler] Error executing autonomous cycle:', err);
    } finally {
      this.recalculateNextRun();
    }
  }

  public static recalculateNextRun() {
    const brandBrain = db.getBrandBrain();
    const schedule = brandBrain.postingSchedule || { timeOfDay: '09:30' };
    const [targetHour, targetMinute] = (schedule.timeOfDay || '09:30').split(':').map(Number);

    const now = new Date();
    const next = new Date();
    next.setHours(targetHour || 9, targetMinute || 30, 0, 0);

    // If today's target time has already passed, schedule for tomorrow
    if (next <= now) {
      next.setDate(next.getDate() + 1);
    }

    db.updateSchedulerState({
      nextRunAt: next.toISOString(),
      status: 'idle',
      currentStepMessage: `Next autonomous cycle scheduled for ${next.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} (${next.toLocaleDateString()})`,
    });
  }

  public static toggleAutomation(enabled: boolean) {
    db.updateSchedulerState({ enabled });
    db.addLog('info', `Automation switched ${enabled ? 'ON' : 'PAUSED'}`);
    if (enabled) {
      this.recalculateNextRun();
    }
  }
}
