import type { VocabularyItem } from '../types/vocabulary';

export type CharacterCompletion = Record<string, number[]>;
export type PracticeProgress = {
  wordIndex: number;
  characterIndex: number;
  completedCharacters: CharacterCompletion;
};

export function getCharacters(word: string): string[] {
  return Array.from(word).filter((character) => /\p{Script=Han}/u.test(character));
}

export function completedPositions(item: VocabularyItem, completion: CharacterCompletion): number[] {
  const count = getCharacters(item.word).length;
  return [...new Set(completion[item.id] ?? [])].filter((index) => Number.isInteger(index) && index >= 0 && index < count);
}

export function calculateProgress(items: VocabularyItem[], completion: CharacterCompletion) {
  let totalCharacters = 0;
  let finishedCharacters = 0;
  let finishedWords = 0;
  items.forEach((item) => {
    const count = getCharacters(item.word).length;
    const finished = completedPositions(item, completion).length;
    totalCharacters += count;
    finishedCharacters += finished;
    if (count > 0 && finished === count) finishedWords++;
  });
  return {
    totalCharacters, finishedCharacters, finishedWords,
    percent: totalCharacters > 0
      ? Math.min(finishedCharacters < totalCharacters ? 99.9 : 100, Math.round(finishedCharacters / totalCharacters * 1000) / 10)
      : 0,
  };
}

export function restoreProgress(items: VocabularyItem[], value: unknown): PracticeProgress {
  const raw = typeof value === 'object' && value !== null ? value as Record<string, unknown> : {};
  const source = typeof raw.completedCharacters === 'object' && raw.completedCharacters !== null
    ? raw.completedCharacters as Record<string, unknown> : {};
  const legacy = Array.isArray(raw.completedIds) ? raw.completedIds : [];
  const completedCharacters: CharacterCompletion = {};
  items.forEach((item) => {
    const saved = source[item.id];
    const positions = Array.isArray(saved) ? saved.filter((position): position is number => typeof position === 'number')
      : legacy.includes(item.id) ? getCharacters(item.word).map((_, index) => index) : [];
    completedCharacters[item.id] = completedPositions(item, { [item.id]: positions });
  });
  const wordIndex = typeof raw.wordIndex === 'number' && Number.isInteger(raw.wordIndex)
    ? Math.max(0, Math.min(raw.wordIndex, items.length - 1)) : 0;
  const count = getCharacters(items[wordIndex]?.word ?? '').length;
  const characterIndex = typeof raw.characterIndex === 'number' && Number.isInteger(raw.characterIndex)
    ? Math.max(0, Math.min(raw.characterIndex, Math.max(0, count - 1))) : 0;
  return { wordIndex, characterIndex, completedCharacters };
}
