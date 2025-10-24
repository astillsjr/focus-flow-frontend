/**
 * Valid emotions that can be logged for tasks
 * These emotions represent how users feel before starting or after completing tasks
 */
export const VALID_EMOTIONS = [
  'excited',
  'confident',
  'motivated',
  'calm',
  'neutral',
  'nervous',
  'anxious',
  'overwhelmed',
  'frustrated',
  'dread',
  'satisfied',
  'relieved',
  'accomplished',
  'disappointed'
] as const

export type Emotion = typeof VALID_EMOTIONS[number]

/**
 * Helper to check if a string is a valid emotion
 */
export function isValidEmotion(emotion: string): emotion is Emotion {
  return VALID_EMOTIONS.includes(emotion as Emotion)
}

/**
 * Emotion display helpers
 */
export const EMOTION_LABELS: Record<Emotion, string> = {
  excited: 'Excited',
  confident: 'Confident',
  motivated: 'Motivated',
  calm: 'Calm',
  neutral: 'Neutral',
  nervous: 'Nervous',
  anxious: 'Anxious',
  overwhelmed: 'Overwhelmed',
  frustrated: 'Frustrated',
  dread: 'Dread',
  satisfied: 'Satisfied',
  relieved: 'Relieved',
  accomplished: 'Accomplished',
  disappointed: 'Disappointed'
}

