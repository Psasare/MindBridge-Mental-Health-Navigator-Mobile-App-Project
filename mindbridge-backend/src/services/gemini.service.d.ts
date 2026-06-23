export declare const generateOracleResponse: (userMessage: string, context: any, userId: string) => Promise<string>;
export declare const generateProactiveInsights: (userId: string, context: any) => Promise<any>;
export declare const analyzeVoiceAudio: (base64Audio: string, mimeType: string) => Promise<any>;
export declare const generatePersonalizedAssessment: (userId: string, context: any, testType: string) => Promise<any>;
export declare const evaluatePersonalizedAssessment: (userId: string, context: any, answers: any[], testType: string) => Promise<any>;
export declare const analyzeJournalEntry: (content: string) => Promise<any>;
//# sourceMappingURL=gemini.service.d.ts.map