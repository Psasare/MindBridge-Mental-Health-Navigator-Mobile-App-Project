import { Request, Response } from 'express';
import { GoalService } from '../services/goal.service.js';

export const getDailyGoals = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { primaryState = 'stress' } = req.query;
    
    // First check if they already have goals generated today
    let status = await GoalService.getDailyStatus(userId);
    
    if (!status) {
      // If not, generate a new set
      const goals = await GoalService.generateDailyGoals(userId, primaryState as string);
      status = await GoalService.getDailyStatus(userId);
    }
    
    res.json({
      goals: status?.goals || [],
      completedIds: status?.completedIds || []
    });
  } catch (error) {
    console.error('Error fetching daily goals:', error);
    res.status(500).json({ error: 'Failed to fetch daily goals' });
  }
};

export const completeGoal = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { goalId, rating, timeSpent, stateBefore, stateAfter } = req.body;
    
    if (!goalId || rating === undefined || timeSpent === undefined) {
      return res.status(400).json({ error: 'goalId, rating, and timeSpent are required' });
    }
    
    const result = await GoalService.completeGoal(userId, goalId, rating, timeSpent, stateBefore, stateAfter);
    res.json(result);
  } catch (error) {
    console.error('Error completing goal:', error);
    res.status(500).json({ error: 'Failed to complete goal' });
  }
};

export const getGamificationStatus = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const status = await GoalService.getGamificationStatus(userId);
    res.json(status);
  } catch (error) {
    console.error('Error fetching gamification status:', error);
    res.status(500).json({ error: 'Failed to fetch gamification status' });
  }
};
