import { GoalService } from '../services/goal.service.js';
export const getDailyGoals = async (req, res) => {
    try {
        const userId = req.userId;
        const { primaryState = 'stress' } = req.query;
        // First check if they already have goals generated today
        let status = await GoalService.getDailyStatus(userId);
        if (!status) {
            // If not, generate a new set
            const goals = await GoalService.generateDailyGoals(userId, primaryState);
            status = await GoalService.getDailyStatus(userId);
        }
        res.json({
            goals: status?.goals || [],
            completedIds: status?.completedIds || []
        });
    }
    catch (error) {
        console.error('Error fetching daily goals:', error);
        res.status(500).json({ error: 'Failed to fetch daily goals' });
    }
};
export const completeGoal = async (req, res) => {
    try {
        const userId = req.userId;
        const { goalId, rating, timeSpent, stateBefore, stateAfter } = req.body;
        if (!goalId || rating === undefined || timeSpent === undefined) {
            return res.status(400).json({ error: 'goalId, rating, and timeSpent are required' });
        }
        const result = await GoalService.completeGoal(userId, goalId, rating, timeSpent, stateBefore, stateAfter);
        res.json(result);
    }
    catch (error) {
        console.error('Error completing goal:', error);
        res.status(500).json({ error: 'Failed to complete goal' });
    }
};
export const getGamificationStatus = async (req, res) => {
    try {
        const userId = req.userId;
        const status = await GoalService.getGamificationStatus(userId);
        res.json(status);
    }
    catch (error) {
        console.error('Error fetching gamification status:', error);
        res.status(500).json({ error: 'Failed to fetch gamification status' });
    }
};
//# sourceMappingURL=goal.controller.js.map