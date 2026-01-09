
export enum ViolationType {
  NONE = 'NONE',
  TOXICITY = 'TOXICITY',
  HARASSMENT = 'HARASSMENT',
  SPAM = 'SPAM',
  NSFW = 'NSFW',
  HATE_SPEECH = 'HATE_SPEECH'
}

export enum ModerationAction {
  WARN = 'WARN',
  MUTE = 'MUTE',
  NOTHING = 'NOTHING'
}

export interface ModerationResult {
  action: ModerationAction;
  violationType: ViolationType;
  severity: number; // 1-10
  reason: string;
  suggestedMuteDurationMinutes?: number;
}

export interface UserProfile {
  id: string;
  username: string;
  avatar: string;
  warningCount: number;
  muteCount: number;
  isMuted: boolean;
  muteUntil: number | null; // Timestamp
}

export interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  content: string;
  timestamp: number;
  moderation?: ModerationResult;
}

export interface ModerationLog {
  id: string;
  timestamp: number;
  userId: string;
  username: string;
  action: ModerationAction;
  reason: string;
  content: string;
  duration?: number;
}
