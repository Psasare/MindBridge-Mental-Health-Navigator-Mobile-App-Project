import type { Request, Response } from 'express';
export declare const getDailyGoals: (req: Request, res: Response) => Promise<void>;
export declare const completeGoal: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getGamificationStatus: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=goal.controller.d.ts.map