import type { Request, Response } from 'express';
export declare const getResources: (req: Request, res: Response) => Promise<void>;
export declare const getRecommendedResources: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const trackResourceInteraction: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=resources.controller.d.ts.map