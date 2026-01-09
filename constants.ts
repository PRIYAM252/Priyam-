
export const MUTE_LEVELS = [
  { strikes: 1, duration: 5 },   // 5 minutes
  { strikes: 2, duration: 30 },  // 30 minutes
  { strikes: 3, duration: 1440 }, // 24 hours
];

export const APP_CONFIG = {
  MODERATION_THRESHOLD: 4, // Severity threshold for action
  MAX_STRIKES_BEFORE_AUTO_MUTE: 2,
};

export const INITIAL_USERS: any[] = [
  { id: 'user-1', username: 'AlexPro', avatar: 'https://picsum.photos/seed/alex/100' },
  { id: 'user-2', username: 'CyberPunk', avatar: 'https://picsum.photos/seed/cyber/100' },
  { id: 'user-3', username: 'SunnyDay', avatar: 'https://picsum.photos/seed/sunny/100' },
];
