import { Response, NextFunction } from 'express';
import { VoteService } from '../services/voteService.js';
import { AuthRequest } from '../types/index.js';
import { VoteType } from '@prisma/client';

export class VoteController {
  static async voteOnIdea(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.userId) {
        throw new Error('User ID not found');
      }

      const { id } = req.params;
      const { vote_type } = req.body;

      // Convert vote_type string to VoteType enum
      const voteType = vote_type === 'upvote' ? VoteType.UPVOTE : VoteType.DOWNVOTE;

      const result = await VoteService.voteOnIdea(req.userId, id, voteType);

      res.status(200).json({
        success: true,
        data: {
          vote: {
            vote_type: result.voteType ? result.voteType.toLowerCase() : null,
          },
          upvotes_count: result.upvotesCount,
          downvotes_count: result.downvotesCount,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async removeVote(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.userId) {
        throw new Error('User ID not found');
      }

      const { id } = req.params;

      await VoteService.removeVote(req.userId, id);

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
