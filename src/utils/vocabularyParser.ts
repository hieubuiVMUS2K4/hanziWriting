import type { ImportResult, VocabularyItem } from '../types/vocabulary';
import { getCharacters } from './progress';

export function parseVocabulary(input: string): ImportResult {
  const items: VocabularyItem[] = [];
  const errors: string[] = [];

  input.split(/\r?\n/).forEach((rawLine, index) => {
    const line = rawLine.replace(/^\uFEFF/, '');
    if (!line.trim()) return;

    const fields = line.includes('\t')
      ? line.split('\t').map((field) => field.trim())
      : line.includes('|')
        ? line.split('|').map((field) => field.trim())
        : [line.trim()];

    if (fields.length !== 1 && fields.length !== 3 && fields.length !== 4) {
      errors.push(`Dòng ${index + 1}: cần một từ, 3 trường Hanzi, Pinyin, nghĩa hoặc 4 trường có thêm chủ đề.`);
      return;
    }
    if (!fields[0]) {
      errors.push(`Dòng ${index + 1}: thiếu chữ Hán.`);
      return;
    }

    if (getCharacters(fields[0]).length === 0) {
      errors.push(`Dòng ${index + 1}: từ cần có ít nhất một chữ Hán.`);
      return;
    }

    items.push({
      id: `import-${crypto.randomUUID()}`,
      word: fields[0],
      pinyin: fields[1] ?? '',
      meaning: fields[2] ?? '',
      ...(fields[3] ? { topic: fields[3] } : {}),
    });
  });

  return { items, errors };
}

export function isVocabularyList(value: unknown): value is VocabularyItem[] {
  return Array.isArray(value) && value.length > 0 && value.every((item) =>
    typeof item === 'object' && item !== null &&
    typeof item.id === 'string' && typeof item.word === 'string' &&
    typeof item.pinyin === 'string' && typeof item.meaning === 'string' &&
    (item.topic === undefined || typeof item.topic === 'string') && getCharacters(item.word).length > 0,
  ) && new Set(value.map((item) => item.id)).size === value.length;
}
