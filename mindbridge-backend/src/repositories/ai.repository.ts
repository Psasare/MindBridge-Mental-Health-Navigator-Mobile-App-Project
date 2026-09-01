import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class AiRepository {
  /**
   * Fetches the user's recent mood logs.
   */
  static async getMoodHistory(userId: string, limit: number = 5) {
    return await prisma.moodLog.findMany({
      where: { userId },
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        score: true,
        emotions: true,
        note: true,
        createdAt: true,
      }
    });
  }

  /**
   * Fetches the user's recent journal entries.
   */
  static async getJournalHistory(userId: string, limit: number = 3) {
    return await prisma.journal.findMany({
      where: { userId },
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        title: true,
        content: true,
        mood: true,
        createdAt: true,
      }
    });
  }

  /**
   * Checks the completion status of today's rituals.
   */
  static async getTodayRitualStatus(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const moodLogged = await prisma.moodLog.findFirst({
      where: {
        userId,
        createdAt: { gte: today }
      }
    });

    const journalLogged = await prisma.journal.findFirst({
      where: {
        userId,
        createdAt: { gte: today }
      }
    });

    // Note: Breathing status is handled on the frontend via AsyncStorage in the current architecture,
    // but we can acknowledge backend-tracked rituals here.
    return {
      moodGarden: !!moodLogged,
      journalEntry: !!journalLogged,
      // We could add a Ritual model later for unified tracking
    };
  }

  /**
   * Fetches the last N chat messages for context (from the most recent session if no session ID provided).
   * Or if a sessionId is provided, fetches messages for that specific session.
   */
  static async getChatHistory(userId: string, limit: number = 10, sessionId?: string) {
    if (sessionId) {
      return await prisma.chatMessage.findMany({
        where: { sessionId, session: { userId } },
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          role: true,
          content: true,
          createdAt: true,
        }
      });
    }

    // Default to the most recently updated session
    const latestSession = await prisma.chatSession.findFirst({
      where: { userId },
      orderBy: { updatedAt: 'desc' }
    });

    if (!latestSession) return [];

    return await prisma.chatMessage.findMany({
      where: { sessionId: latestSession.id },
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        role: true,
        content: true,
        createdAt: true,
      }
    });
  }

  /**
   * Fetches all chat sessions for a user.
   */
  static async getChatSessions(userId: string) {
    return await prisma.chatSession.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        title: true,
        createdAt: true,
        updatedAt: true
      }
    });
  }

  /**
   * Creates a new chat session.
   */
  static async createChatSession(userId: string, title?: string) {
    return await prisma.chatSession.create({
      data: {
        userId,
        title: title || 'New Conversation'
      }
    });
  }

  /**
   * Deletes a specific chat session and all its messages (cascade).
   */
  static async deleteChatSession(userId: string, sessionId: string) {
    return await prisma.chatSession.delete({
      where: { id: sessionId, userId }
    });
  }

  static async deleteChatMessage(userId: string, messageId: string) {
    return await prisma.chatMessage.deleteMany({
      where: { id: messageId, session: { userId } }
    });
  }

  /**
   * Deletes multiple chat messages in bulk.
   */
  static async deleteChatMessages(userId: string, messageIds: string[]) {
    return await prisma.chatMessage.deleteMany({
      where: { id: { in: messageIds }, session: { userId } }
    });
  }

  /**
   * Clears all chat messages and sessions for a user.
   */
  static async clearChatHistory(userId: string) {
    return await prisma.chatSession.deleteMany({
      where: { userId }
    });
  }

  /**
   * Fetches the latest assessment results for clinical context.
   */
  static async getLatestAssessments(userId: string) {
    return await prisma.assessmentResult.findMany({
      where: { userId },
      take: 5,
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Searches for resources by category or keyword.
   */
  static async searchResources(category?: string) {
    return await prisma.resource.findMany({
      where: category ? { category: { contains: category, mode: 'insensitive' } } : {},
      take: 3,
    });
  }
}
