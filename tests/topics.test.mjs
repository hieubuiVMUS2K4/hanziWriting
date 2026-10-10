import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import ts from 'typescript';

// Load the actual TypeScript utilities without adding a test framework.
function moduleUrl(path) {
  const source = readFileSync(path, 'utf8');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  });
  const code = outputText.replace(/from ['"](\.[^'"]+)['"]/g, (_, relative) => {
    return `from '${moduleUrl(new URL(`${relative}.ts`, path))}'`;
  });
  return `data:text/javascript;base64,${Buffer.from(code).toString('base64')}`;
}

const { ALL_TOPICS, UNASSIGNED_TOPIC, getTopic, getTopics, getTopicIndexes } =
  await import(moduleUrl(new URL('../src/utils/topics.ts', import.meta.url)));
const { parseVocabulary, isVocabularyList } =
  await import(moduleUrl(new URL('../src/utils/vocabularyParser.ts', import.meta.url)));
const { calculateProgress, restoreProgress } =
  await import(moduleUrl(new URL('../src/utils/progress.ts', import.meta.url)));
const seed = JSON.parse(readFileSync(new URL('../src/data/vocabulary.json', import.meta.url), 'utf8'));

test('all mode includes every entry; topics partition the seed without losing IDs', () => {
  assert.equal(seed.length, 176);
  assert.ok(isVocabularyList(seed));
  assert.deepEqual(getTopicIndexes(seed, ALL_TOPICS), seed.map((_, index) => index));
  const grouped = getTopics(seed).flatMap(topic => getTopicIndexes(seed, topic));
  assert.deepEqual(grouped.sort((a, b) => a - b), getTopicIndexes(seed, ALL_TOPICS));
  assert.ok(seed.every(item => item.topic && !item.topic.includes('?')));
  assert.equal(getTopic(seed.find(item => item.word === '你好')), 'Chào hỏi và giới thiệu');
  assert.equal(getTopic(seed.find(item => item.word === '米饭')), 'Ăn uống');
});

test('imports support old formats, pipe/tab topics, blanks, and duplicates', () => {
  const result = parseVocabulary('你好\n老师 | lao3shi1 | giáo viên\n米饭 | mi3fan4 | cơm |  Ăn uống  \n茶\tcha2\ttrà\tĂn uống\n茶 | cha2 | trà | Ăn uống\n\n');
  assert.deepEqual(result.errors, []);
  assert.equal(result.items.length, 5);
  assert.ok(isVocabularyList(result.items));
  assert.equal(new Set(result.items.map(item => item.id)).size, 5);
  assert.deepEqual(getTopicIndexes(result.items, 'Ăn uống'), [2, 3, 4]);
  assert.deepEqual(getTopicIndexes(result.items, UNASSIGNED_TOPIC), [0, 1]);
  assert.equal(getTopic({ ...result.items[0], topic: '  ' }), UNASSIGNED_TOPIC);
});

test('malformed topic data and incorrect import field counts are rejected', () => {
  assert.equal(isVocabularyList([{ ...seed[0], topic: 123 }]), false);
  assert.equal(isVocabularyList([{ ...seed[0], topic: null }]), false);
  const { topic: _topic, ...legacy } = seed[0];
  assert.ok(isVocabularyList([legacy]));
  const result = parseVocabulary('你好 | ni3hao3\n茶 | cha2 | trà | Ăn uống | extra\nabc');
  assert.equal(result.items.length, 0);
  assert.equal(result.errors.length, 3);
});

test('filtering retains original indexes and per-word progress across topics', () => {
  const items = parseVocabulary('茶 | cha2 | trà | Ăn uống\n你好 | ni3hao3 | xin chào | Chào hỏi\n米饭 | mi3fan4 | cơm | Ăn uống').items;
  const completion = { [items[0].id]: [0], [items[1].id]: [0], [items[2].id]: [] };
  const select = topic => getTopicIndexes(items, topic).map(index => items[index]);
  assert.deepEqual(getTopicIndexes(items, 'Ăn uống'), [0, 2]);
  assert.equal(calculateProgress(select('Ăn uống'), completion).finishedWords, 1);
  assert.equal(calculateProgress(select('Chào hỏi'), completion).percent, 50);
  assert.equal(calculateProgress(select(ALL_TOPICS), completion).finishedCharacters, 2);
  assert.deepEqual(restoreProgress(items, { wordIndex: 2, characterIndex: 1, completedCharacters: completion }).completedCharacters, completion);
  assert.equal(calculateProgress(select('Ăn uống'), completion).finishedCharacters, 1);
});

test('a required topic applies to every imported word, including legacy fourth fields', () => {
  const result = parseVocabulary('你好\n您好 | nin2hao3 | xin chào | Chủ đề cũ\n老师\tlao3shi1\tgiáo viên', '  Chủ đề mới  ');
  assert.deepEqual(result.errors, []);
  assert.equal(result.items.length, 3);
  assert.ok(result.items.every(item => item.topic === 'Chủ đề mới'));
  assert.equal(parseVocabulary('你好', '').items.length, 0);
  assert.equal(parseVocabulary('你好', '  ').errors.length, 1);
});

test('adding words to new and existing topics retains saved vocabulary and progress', () => {
  const original = parseVocabulary('茶 | cha2 | trà', 'Ăn uống').items;
  const saved = { wordIndex: 0, characterIndex: 0, completedCharacters: { [original[0].id]: [0] } };
  const additions = parseVocabulary('米饭 | mi3fan4 | cơm', 'Ăn uống').items;
  const newTopic = parseVocabulary('你好 | ni3hao3 | xin chào', 'Chào hỏi').items;
  const combined = [...original, ...additions, ...newTopic];
  const restored = restoreProgress(combined, JSON.parse(JSON.stringify(saved)));
  assert.ok(isVocabularyList(combined));
  assert.deepEqual(combined[0], original[0]);
  assert.deepEqual(getTopicIndexes(combined, 'Ăn uống'), [0, 1]);
  assert.deepEqual(getTopicIndexes(combined, 'Chào hỏi'), [2]);
  assert.equal(getTopicIndexes(combined, ALL_TOPICS).length, 3);
  assert.deepEqual(restored.completedCharacters[original[0].id], [0]);
  assert.deepEqual(restored.completedCharacters[additions[0].id], []);
  assert.deepEqual(restored.completedCharacters[newTopic[0].id], []);
  assert.equal(calculateProgress(combined, restored.completedCharacters).finishedWords, 1);
});
