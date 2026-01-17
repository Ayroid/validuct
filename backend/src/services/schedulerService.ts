import { DailySummaryService } from './dailySummaryService.js';

export class SchedulerService {
  private static intervalId: NodeJS.Timeout | null = null;
  private static lastRunDate: string | null = null;

  // Start the scheduler - checks every minute if it's time to run daily tasks
  static start() {
    console.log('[Scheduler] Starting scheduler service...');

    // Check every minute
    this.intervalId = setInterval(() => {
      this.checkAndRunScheduledTasks();
    }, 60 * 1000); // 1 minute

    // Also run immediately on startup to check if we missed the daily run
    this.checkAndRunScheduledTasks();
  }

  static stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('[Scheduler] Scheduler service stopped');
    }
  }

  private static async checkAndRunScheduledTasks() {
    const now = new Date();
    const todayDate = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const currentHour = now.getUTCHours();
    const currentMinute = now.getUTCMinutes();

    // Run daily summary at 9:00 UTC (adjust as needed)
    // Only run if:
    // 1. It's 9:00 AM UTC (hour = 9, minute = 0)
    // 2. We haven't already run today
    const scheduledHour = 9;
    const scheduledMinute = 0;

    if (
      currentHour === scheduledHour &&
      currentMinute === scheduledMinute &&
      this.lastRunDate !== todayDate
    ) {
      console.log(`[Scheduler] Running daily summary at ${now.toISOString()}`);
      this.lastRunDate = todayDate;

      try {
        await DailySummaryService.sendDailySummaries();
      } catch (error) {
        console.error('[Scheduler] Error running daily summary:', error);
      }
    }
  }

  // Manual trigger for testing
  static async runDailySummaryNow() {
    console.log('[Scheduler] Manual trigger for daily summary');
    await DailySummaryService.sendDailySummaries();
  }
}
