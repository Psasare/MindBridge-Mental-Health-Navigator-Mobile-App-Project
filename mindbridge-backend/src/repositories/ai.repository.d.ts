export declare class AiRepository {
    /**
     * Fetches the user's recent mood logs.
     */
    static getMoodHistory(userId: string, limit?: number): Promise<{
        score: number;
        emotions: string[];
        note: string | null;
        createdAt: Date;
    }[]>;
    /**
     * Fetches the user's recent journal entries.
     */
    static getJournalHistory(userId: string, limit?: number): Promise<{
        createdAt: Date;
        title: string | null;
        content: string;
        mood: string | null;
    }[]>;
    /**
     * Checks the completion status of today's rituals.
     */
    static getTodayRitualStatus(userId: string): Promise<{
        moodGarden: boolean;
        journalEntry: boolean;
    }>;
    /**
     * Fetches the last N chat messages for context.
     */
    static getChatHistory(userId: string, limit?: number): Promise<{
        id: string;
        createdAt: Date;
        content: string;
        role: string;
    }[]>;
    static deleteChatMessage(userId: string, messageId: string): Promise<{
        id: string;
        userId: string;
        createdAt: Date;
        content: string;
        role: string;
    }>;
    /**
     * Deletes multiple chat messages in bulk.
     */
    static deleteChatMessages(userId: string, messageIds: string[]): Promise<import("@prisma/client").Prisma.BatchPayload>;
    /**
     * Clears all chat messages for a user.
     */
    static clearChatHistory(userId: string): Promise<import("@prisma/client").Prisma.BatchPayload>;
    /**
     * Fetches the latest assessment results for clinical context.
     */
    static getLatestAssessments(userId: string): Promise<{
        id: string;
        userId: string;
        score: number;
        createdAt: Date;
        type: string;
        severity: string;
    }[]>;
    /**
     * Searches for resources by category or keyword.
     */
    static searchResources(category?: string): Promise<{
        id: string;
        createdAt: Date;
        title: string;
        type: string;
        category: string | null;
        subcategory: string | null;
        duration: string | null;
        author: string | null;
        url: string | null;
        color: string | null;
        urgency: string | null;
        format: string | null;
        effectiveness: number | null;
        campusAvailability: string[];
        timeRequired: string | null;
        languages: string[];
    }[]>;
}
//# sourceMappingURL=ai.repository.d.ts.map