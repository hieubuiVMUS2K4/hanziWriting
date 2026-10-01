import type { ImportResult, VocabularyItem } from '../types/vocabulary';

export function parseVocabulary(input: string): ImportResult {
  const items: VocabularyItem[] = [];
  const errors: string[] = [];

  input.split(/\r?\n/).forEach((rawLine, index) => {
    const line = rawLine.trim();
    if (!line) return;

    const fields = line.includes('\t')
      ? line.split('\t').map((field) => field.trim())
      : line.includes('|')
        ? line.split('|').map((field) => field.trim())
        : [line];

    if (fields.length !== 1 && fields.length !== 3) {
      errors.push(`Dòng ${index + 1}: cần một từ hoặc đúng 3 trường Hanzi, Pinyin, nghĩa.`);
      return;
    }
    if (!fields[0]) {
      errors.push(`Dòng ${index + 1}: thiếu chữ Hán.`);
      return;
    }

    items.push({
      id: `import-${Date.now()}-${index}`,
      word: fields[0],
      pinyin: fields[1] ?? '',
      meaning: fields[2] ?? '',
    });
  });

  return { items, errors };
}

export function isVocabularyList(value: unknown): value is VocabularyItem[] {
  return Array.isArray(value) && value.length > 0 && value.every((item) =>
    typeof item === 'object' && item !== null &&
    typeof item.id === 'string' && typeof item.word === 'string' &&
    typeof item.pinyin === 'string' && typeof item.meaning === 'string' && item.word.length > 0,
  );
}
