import { Request, Response } from 'express';
import { WaitlistService } from '../services/waitlistService.js';

/**
 * Controller for handling waitlist-related HTTP requests
 */
export class WaitlistController {
  /**
   * Handle joining the waitlist
   *
   * @param req - Express request object
   * @param res - Express response object
   *
   * @remarks
   * Route: POST /api/waitlist/join
   * No authentication required
   * Request body: { email }
   * Adds the provided email to the waitlist
   * Sends a confirmation email to the user
   */
  static async joinWaitlist(req: Request, res: Response): Promise<void> {
    const { email } = req.body;

    await WaitlistService.addToWaitlist({ email });

    res.status(200).json({
      success: true,
      message: 'Successfully joined the waitlist',
    });
  }
}
