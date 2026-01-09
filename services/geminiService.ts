
import { GoogleGenAI, Type } from "@google/genai";
import { ModerationResult, ViolationType, ModerationAction } from "../types";

export const analyzeMessage = async (content: string): Promise<ModerationResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analyze the following chat message for violations of community safety guidelines.
    Message: "${content}"
    
    Classify based on toxicity, harassment, spam, NSFW, or hate speech.
    If the message is safe, return NOTHING as the action.
    If it's mildly problematic, suggest WARN.
    If it's severely toxic or repeated, suggest MUTE.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          action: {
            type: Type.STRING,
            description: 'The suggested moderation action: WARN, MUTE, or NOTHING.',
          },
          violationType: {
            type: Type.STRING,
            description: 'The type of violation detected.',
          },
          severity: {
            type: Type.NUMBER,
            description: 'Severity score from 1 to 10.',
          },
          reason: {
            type: Type.STRING,
            description: 'Brief explanation of why this action was suggested.',
          },
          suggestedMuteDurationMinutes: {
            type: Type.NUMBER,
            description: 'Optional mute duration if action is MUTE.',
          }
        },
        required: ["action", "violationType", "severity", "reason"],
      }
    }
  });

  try {
    const result = JSON.parse(response.text || "{}");
    return {
      action: result.action as ModerationAction,
      violationType: result.violationType as ViolationType,
      severity: result.severity,
      reason: result.reason,
      suggestedMuteDurationMinutes: result.suggestedMuteDurationMinutes
    };
  } catch (e) {
    console.error("Failed to parse moderation result", e);
    return {
      action: ModerationAction.NOTHING,
      violationType: ViolationType.NONE,
      severity: 0,
      reason: "Analysis failed"
    };
  }
};
