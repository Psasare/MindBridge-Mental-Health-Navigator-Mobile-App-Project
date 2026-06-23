export declare const GoalService: {
    /**
     * Generates a daily set of 5 goals based on the user's current mental state.
     * Rules: 1 per category, no repeats from the last 7 days.
     */
    generateDailyGoals: (userId: string, primaryState: string) => Promise<any[]>;
    /**
     * Get the current status of the daily goals
     */
    getDailyStatus: (userId: string) => Promise<{
        setId: string;
        completedIds: string[];
        goals: {
            id: string;
            createdAt: Date;
            name: string;
            category: string;
            duration: number;
            condition: string;
            variant: string;
            description: string;
            difficulty: number;
            whyItHelps: string;
            points: number;
            badgeUnlock: string | null;
        }[];
    } | null>;
    /**
     * Mark a goal as complete, award points, check streaks
     */
    completeGoal: (userId: string, goalId: string, rating: number, timeSpent: number, stateBefore?: string, stateAfter?: string) => Promise<{
        pointsAwarded: number;
        badgeUnlocked: string | null;
        currentStreak: number;
    }>;
    /**
     * Fetch Gamification Status
     */
    getGamificationStatus: (userId: string) => Promise<{
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        totalPoints: number;
        currentStreak: number;
        longestStreak: number;
        badges: string[];
        lastCompletedAt: Date | null;
    }>;
};
//# sourceMappingURL=goal.service.d.ts.map