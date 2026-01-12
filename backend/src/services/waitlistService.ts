import { prisma } from '../config/database.js';
import { waitlistSchema } from '../utils/validation.js';
import { AppError } from '../middleware/errorHandler.js';
import { Resend } from 'resend';
import { waitlistEmail } from '../templates/waitlistEmailTemplate.js';

export class WaitlistService {
  static async addToWaitlist(data: unknown) {
    console.log('Adding to waitlist with data:', data);

    // Validate input data
    const validatedData = waitlistSchema.parse(data);

    // Check if email already exists in waitlist
    const existingEntry = await prisma.waitlist.findUnique({
      where: { email: validatedData.email },
    });

    if (existingEntry) {
      throw new AppError('Email is already on the waitlist', 400);
    }

    // Add to waitlist
    const waitlistEntry = await prisma.waitlist.create({
      data: {
        email: validatedData.email,
      },
      select: {
        id: true,
        email: true,
        createdAt: true,
      },
    });

    await this.sendWaitlistEmail(validatedData.email);

    return waitlistEntry;
  }

  static async getWaitlistEntryByEmail(email: string) {
    return prisma.waitlist.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        createdAt: true,
      },
    });
  }

  static async getAllWaitlistEntries() {
    return prisma.waitlist.findMany({
      select: {
        id: true,
        email: true,
        createdAt: true,
      },
    });
  }

  static async removeFromWaitlist(email: string) {
    return prisma.waitlist.delete({
      where: { email },
      select: {
        id: true,
        email: true,
        createdAt: true,
      },
    });
  }

  static async sendWaitlistEmail(toEmail: string) {
    const resendAPIKey = process.env.RESEND_API_KEY;
    if (!resendAPIKey) {
      throw new AppError('Resend API key is not configured', 500);
    }
    const resend = new Resend(resendAPIKey);

    const { data, error } = await resend.emails.send({
      from: waitlistEmail().from,
      to: [toEmail],
      subject: waitlistEmail().subject,
      html: waitlistEmail().html,
    });

    if (error) {
      console.error('Error sending waitlist email:', error);
      throw new AppError('Failed to send waitlist confirmation email', 500);
    }

    return data;
  }
}
