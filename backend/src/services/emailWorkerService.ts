import { prisma } from '../config/database.js';
import { Resend } from 'resend';

export class EmailWorkerService {
  private static intervalId: NodeJS.Timeout | null = null;
  private static isProcessing = false;

  // Start the background worker
  static start(intervalSeconds = 30) {
    console.log(`📧 Email worker starting (every ${intervalSeconds}s)`);

    this.intervalId = setInterval(async () => {
      await this.processQueue();
    }, intervalSeconds * 1000);

    // Also run immediately on start
    this.processQueue();
  }

  // Stop the worker (for graceful shutdown)
  static stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('📧 Email worker stopped');
    }
  }

  // Process pending emails
  static async processQueue(batchSize = 10) {
    // Prevent concurrent processing
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      const now = new Date();

      // Get pending emails that are ready to send
      const pendingEmails = await prisma.emailQueue.findMany({
        where: {
          status: 'PENDING',
          OR: [
            { nextRetryAt: null },
            { nextRetryAt: { lte: now } },
          ],
        },
        orderBy: [
          { priority: 'desc' }, // HIGH first
          { createdAt: 'asc' }, // Oldest first
        ],
        take: batchSize,
      });

      if (pendingEmails.length === 0) {
        return;
      }

      console.log(`📧 Processing ${pendingEmails.length} emails`);

      const resendApiKey = process.env.RESEND_API_KEY;
      if (!resendApiKey) {
        console.error('RESEND_API_KEY not configured');
        return;
      }

      const resend = new Resend(resendApiKey);

      for (const email of pendingEmails) {
        try {
          // Send the email
          const { error } = await resend.emails.send({
            from: 'Validuct <notifications@validuct.com>',
            to: [email.recipientEmail],
            subject: email.subject,
            html: email.htmlBody,
          });

          if (error) throw error;

          // Mark as sent
          await prisma.emailQueue.update({
            where: { id: email.id },
            data: { status: 'SENT', sentAt: new Date() },
          });

          console.log(`✅ Email sent: ${email.id}`);

        } catch (error) {
          // Handle failure with retry logic
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          const shouldRetry = email.retryCount < email.maxRetries;

          if (shouldRetry) {
            // Exponential backoff: 5min, 15min, 45min
            const delayMinutes = Math.pow(3, email.retryCount + 1) * 5;
            const nextRetry = new Date(now.getTime() + delayMinutes * 60000);

            await prisma.emailQueue.update({
              where: { id: email.id },
              data: {
                retryCount: email.retryCount + 1,
                nextRetryAt: nextRetry,
                errorMessage,
              },
            });

            console.log(`⚠️ Email ${email.id} failed, retry in ${delayMinutes}min`);
          } else {
            // Max retries reached - mark as failed
            await prisma.emailQueue.update({
              where: { id: email.id },
              data: {
                status: 'FAILED',
                failedAt: new Date(),
                errorMessage,
              },
            });

            console.log(`❌ Email ${email.id} permanently failed`);
          }
        }
      }
    } finally {
      this.isProcessing = false;
    }
  }

  // Get queue stats (for monitoring)
  static async getStats() {
    const [pending, sent, failed] = await Promise.all([
      prisma.emailQueue.count({ where: { status: 'PENDING' } }),
      prisma.emailQueue.count({ where: { status: 'SENT' } }),
      prisma.emailQueue.count({ where: { status: 'FAILED' } }),
    ]);

    return { pending, sent, failed, total: pending + sent + failed };
  }
}
