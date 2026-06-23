import type { Request, Response } from 'express';
export declare const getFeed: (req: Request, res: Response) => Promise<void>;
export declare const createPost: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const toggleHug: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=community.controller.d.ts.map