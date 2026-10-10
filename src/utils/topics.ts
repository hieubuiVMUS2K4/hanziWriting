import type { VocabularyItem } from '../types/vocabulary';

export const ALL_TOPICS = '';
export const UNASSIGNED_TOPIC = 'Chưa phân chủ đề';

export function getTopic(item: VocabularyItem): string {
  return item.topic?.trim() || UNASSIGNED_TOPIC;
}

export function getTopics(items: VocabularyItem[]): string[] {
  return [...new Set(items.map(getTopic))].sort((a, b) => a.localeCompare(b, 'vi'));
}

export function getTopicIndexes(items: VocabularyItem[], topic: string): number[] {
  return items.flatMap((item, index) => topic === ALL_TOPICS || getTopic(item) === topic ? [index] : []);
}
