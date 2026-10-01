export interface VocabularyItem {
  id: string;
  word: string;
  pinyin: string;
  meaning: string;
}

export interface ImportResult {
  items: VocabularyItem[];
  errors: string[];
}
