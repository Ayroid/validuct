import { prisma } from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';
import { VoteType } from '@prisma/client';

export class VoteService {
  static async voteOnIdea(userId: string, ideaId: string, voteType: VoteType) {
    // Check if idea exists
    const idea = await prisma.idea.findUnique({
      where: { id: ideaId },
    });

    if (!idea) {
      throw new AppError('Idea not found', 404);
    }

    // Check if user already voted
    const existingVote = await prisma.vote.findUnique({
      where: {
        userId_ideaId: {
          userId,
          ideaId,
        },
      },
    });

    let result;

    if (existingVote) {
      // If same vote type, remove the vote (toggle off)
      if (existingVote.voteType === voteType) {
        await prisma.$transaction(async (tx) => {
          // Delete the vote
          await tx.vote.delete({
            where: { id: existingVote.id },
          });

          // Update idea vote counts
          const updateData =
            voteType === VoteType.UPVOTE
              ? { upvotesCount: { decrement: 1 } }
              : { downvotesCount: { decrement: 1 } };

          await tx.idea.update({
            where: { id: ideaId },
            data: updateData,
          });
        });

        result = null; // Vote removed
      } else {
        // If different vote type, update the vote
        await prisma.$transaction(async (tx) => {
          // Update the vote
          await tx.vote.update({
            where: { id: existingVote.id },
            data: { voteType },
          });

          // Update idea vote counts
          const updateData =
            voteType === VoteType.UPVOTE
              ? {
                  upvotesCount: { increment: 1 },
                  downvotesCount: { decrement: 1 },
                }
              : {
                  upvotesCount: { decrement: 1 },
                  downvotesCount: { increment: 1 },
                };

          await tx.idea.update({
            where: { id: ideaId },
            data: updateData,
          });
        });

        result = voteType;
      }
    } else {
      // Create new vote
      await prisma.$transaction(async (tx) => {
        // Create the vote
        await tx.vote.create({
          data: {
            userId,
            ideaId,
            voteType,
          },
        });

        // Update idea vote counts
        const updateData =
          voteType === VoteType.UPVOTE
            ? { upvotesCount: { increment: 1 } }
            : { downvotesCount: { increment: 1 } };

        await tx.idea.update({
          where: { id: ideaId },
          data: updateData,
        });
      });

      result = voteType;
    }

    // Get updated idea counts
    const updatedIdea = await prisma.idea.findUnique({
      where: { id: ideaId },
      select: {
        upvotesCount: true,
        downvotesCount: true,
      },
    });

    return {
      voteType: result,
      upvotesCount: updatedIdea!.upvotesCount,
      downvotesCount: updatedIdea!.downvotesCount,
    };
  }

  static async removeVote(userId: string, ideaId: string) {
    // Check if idea exists
    const idea = await prisma.idea.findUnique({
      where: { id: ideaId },
    });

    if (!idea) {
      throw new AppError('Idea not found', 404);
    }

    // Check if user has voted
    const existingVote = await prisma.vote.findUnique({
      where: {
        userId_ideaId: {
          userId,
          ideaId,
        },
      },
    });

    if (!existingVote) {
      throw new AppError('No vote found to remove', 404);
    }

    await prisma.$transaction(async (tx) => {
      // Delete the vote
      await tx.vote.delete({
        where: { id: existingVote.id },
      });

      // Update idea vote counts
      const updateData =
        existingVote.voteType === VoteType.UPVOTE
          ? { upvotesCount: { decrement: 1 } }
          : { downvotesCount: { decrement: 1 } };

      await tx.idea.update({
        where: { id: ideaId },
        data: updateData,
      });
    });
  }
}
