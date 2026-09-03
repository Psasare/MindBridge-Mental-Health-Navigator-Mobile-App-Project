import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const GoalService = {
  /**
   * Generates a daily set of 5 goals based on the user's current mental state.
   * Rules: 1 per category, no repeats from the last 7 days.
   */
  generateDailyGoals: async (userId: string, primaryState: string) => {
    // 1. Get today's existing goal set if it exists
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let existingSet = await prisma.dailyGoalSet.findFirst({
      where: {
        userId,
        createdAt: { gte: today }
      }
    });

    if (existingSet && existingSet.goalIds.length > 0) {
      return await prisma.goal.findMany({
        where: { id: { in: existingSet.goalIds } }
      });
    }

    // 2. Fetch user's completion history for the last 7 days to avoid repeats
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentCompletions = await prisma.goalCompletion.findMany({
      where: {
        userId,
        createdAt: { gte: sevenDaysAgo }
      },
      select: { goalId: true }
    });
    const recentlyCompletedGoalIds = recentCompletions.map(c => c.goalId);

    // 3. Fetch goals matching the primary state
    const conditionGoals = await prisma.goal.findMany({
      where: { condition: primaryState }
    });

    // We need a large pool to pick diverse daily goals. If the condition alone 
    // doesn't provide enough variety (e.g. 'stress' only has 1 goal in the DB), 
    // we mix in a general pool of goals so it's not static every day.
    let availableGoals = conditionGoals;
    if (availableGoals.length < 15) {
      const extraGoals = await prisma.goal.findMany({ take: 50 });
      // Merge and deduplicate
      const allIds = new Set(availableGoals.map((g: any) => g.id));
      for (const eg of extraGoals) {
        if (!allIds.has(eg.id)) {
          availableGoals.push(eg);
          allIds.add(eg.id);
        }
      }
    }

    // 4. Fetch distinct categories from the database to avoid hardcoding
    const distinctCategories = await prisma.goal.findMany({
      select: { category: true },
      distinct: ['category']
    });
    const categories = distinctCategories.map(c => c.category);
    const selectedGoals: any[] = [];

    // Shuffle helper
    const shuffleArray = (array: any[]) => {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    };

    // Make sure we shuffle the categories too, so we don't always bias the first few categories
    const shuffledCategories = [...categories];
    shuffleArray(shuffledCategories);

    for (const category of shuffledCategories) {
      if (selectedGoals.length >= 3) break;

      const goalsInCategory = availableGoals.filter(g => g.category === category);
      if (goalsInCategory.length === 0) continue;

      // Filter out recently completed ones
      const freshGoals = goalsInCategory.filter(g => !recentlyCompletedGoalIds.includes(g.id));
      
      const poolToPickFrom = freshGoals.length > 0 ? freshGoals : goalsInCategory;
      shuffleArray(poolToPickFrom);
      selectedGoals.push(poolToPickFrom[0]);
    }

    // If we still don't have 3, fill with random ones
    if (selectedGoals.length < 3) {
      const remainingGoals = availableGoals.filter(g => !selectedGoals.find((sg: any) => sg.id === g.id));
      shuffleArray(remainingGoals);
      selectedGoals.push(...remainingGoals.slice(0, 3 - selectedGoals.length));
    }

    // 5. Save the daily set
    const goalIds = selectedGoals.map((g: any) => g.id);
    await prisma.dailyGoalSet.create({
      data: {
        userId,
        goalIds,
        completedIds: []
      }
    });

    return selectedGoals;
  },

  /**
   * Get the current status of the daily goals
   */
  getDailyStatus: async (userId: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingSet = await prisma.dailyGoalSet.findFirst({
      where: {
        userId,
        createdAt: { gte: today }
      }
    });

    if (!existingSet) return null;

    const goals = await prisma.goal.findMany({
      where: { id: { in: existingSet.goalIds } }
    });

    return {
      setId: existingSet.id,
      completedIds: existingSet.completedIds,
      goals
    };
  },

  /**
   * Mark a goal as complete, award points, check streaks
   */
  completeGoal: async (userId: string, goalId: string, rating: number, timeSpent: number, stateBefore?: string, stateAfter?: string) => {
    // 1. Log completion
    await prisma.goalCompletion.create({
      data: {
        userId,
        goalId,
        rating,
        timeSpent,
        stateBefore: stateBefore || null,
        stateAfter: stateAfter || null
      }
    });

    // 2. Fetch the Goal to know points
    const goal = await prisma.goal.findUnique({ where: { id: goalId } });
    const pointsAwarded = goal?.points || 10;
    const badgeUnlock = goal?.badgeUnlock;

    // 3. Update the Daily Goal Set
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dailySet = await prisma.dailyGoalSet.findFirst({
      where: {
        userId,
        createdAt: { gte: today }
      }
    });

    let newlyCompletedCount = 0;
    if (dailySet && !dailySet.completedIds.includes(goalId)) {
      await prisma.dailyGoalSet.update({
        where: { id: dailySet.id },
        data: {
          completedIds: { push: goalId }
        }
      });
      newlyCompletedCount = dailySet.completedIds.length + 1;
    }

    // 4. Update User Gamification
    let gamification = await prisma.userGamification.findUnique({ where: { userId } });
    if (!gamification) {
      gamification = await prisma.userGamification.create({
        data: { userId }
      });
    }

    let extraPoints = 0;
    if (newlyCompletedCount === 3) extraPoints = 20; // Bonus for hitting 3 goals
    if (newlyCompletedCount === 5) extraPoints = 50; // Bonus for 5 goals

    const badges = [...gamification.badges];
    if (badgeUnlock && !badges.includes(badgeUnlock)) {
      badges.push(badgeUnlock);
    }

    // Update streak if this is the 1st goal today
    let newStreak = gamification.currentStreak;
    let longestStreak = gamification.longestStreak;
    if (newlyCompletedCount === 1) {
      // Check if they completed 3 yesterday
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      const lastCompletedDate = gamification.lastCompletedAt ? new Date(gamification.lastCompletedAt) : null;
      if (lastCompletedDate) {
        lastCompletedDate.setHours(0, 0, 0, 0);
        if (lastCompletedDate.getTime() === yesterday.getTime()) {
          newStreak += 1;
        } else if (lastCompletedDate.getTime() < yesterday.getTime()) {
          newStreak = 1; // reset streak
        }
      } else {
        newStreak = 1;
      }
      longestStreak = Math.max(longestStreak, newStreak);
    }

    await prisma.userGamification.update({
      where: { userId },
      data: {
        totalPoints: gamification.totalPoints + pointsAwarded + extraPoints,
        currentStreak: newStreak,
        longestStreak: longestStreak,
        badges,
        lastCompletedAt: newlyCompletedCount === 1 ? new Date() : gamification.lastCompletedAt
      }
    });

    return {
      pointsAwarded: pointsAwarded + extraPoints,
      badgeUnlocked: badgeUnlock && !gamification.badges.includes(badgeUnlock) ? badgeUnlock : null,
      currentStreak: newStreak
    };
  },

  /**
   * Fetch Gamification Status
   */
  getGamificationStatus: async (userId: string) => {
    let gamification = await prisma.userGamification.findUnique({ where: { userId } });
    if (!gamification) {
      gamification = await prisma.userGamification.create({ data: { userId } });
    }
    return gamification;
  },

  /**
   * Record a daily check-in (e.g. logging a mood) and update streaks immediately
   */
  recordDailyCheckIn: async (userId: string) => {
    let gamification = await prisma.userGamification.findUnique({ where: { userId } });
    if (!gamification) {
      gamification = await prisma.userGamification.create({ data: { userId } });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let newStreak = gamification.currentStreak;
    let longestStreak = gamification.longestStreak;
    let pointsAwarded = 10; // 10 points for daily check-in
    
    let alreadyCheckedInToday = false;

    if (gamification.lastCompletedAt) {
      const lastCompletedDate = new Date(gamification.lastCompletedAt);
      lastCompletedDate.setHours(0, 0, 0, 0);

      if (lastCompletedDate.getTime() === today.getTime()) {
        // Already logged something today that updated the streak
        alreadyCheckedInToday = true;
      } else if (lastCompletedDate.getTime() === yesterday.getTime()) {
        newStreak += 1;
      } else if (lastCompletedDate.getTime() < yesterday.getTime()) {
        newStreak = 1; // reset streak
      }
    } else {
      newStreak = 1;
    }

    if (alreadyCheckedInToday && newStreak === 0) {
      newStreak = 1;
      alreadyCheckedInToday = false; // Force an update to save the streak of 1
    }

    longestStreak = Math.max(longestStreak, newStreak);

    if (!alreadyCheckedInToday) {
      gamification = await prisma.userGamification.update({
        where: { userId },
        data: {
          totalPoints: gamification.totalPoints + pointsAwarded,
          currentStreak: newStreak,
          longestStreak: longestStreak,
          lastCompletedAt: new Date() // Sets last completed to now
        }
      });
    }

    return {
      pointsAwarded: alreadyCheckedInToday ? 0 : pointsAwarded,
      currentStreak: newStreak,
      alreadyCheckedInToday
    };
  }
};
