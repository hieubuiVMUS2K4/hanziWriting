import { useEffect, useMemo, useState } from 'react';
import seedVocabulary from './data/vocabulary.json';
import CharacterPractice from './components/CharacterPractice';
import ImportVocabulary from './components/ImportVocabulary';
import PracticeSettings from './components/PracticeSettings';
import type { PracticePreferences } from './components/PracticeSettings';
import type { VocabularyItem } from './types/vocabulary';
import { isVocabularyList } from './utils/vocabularyParser';
import { calculateProgress, completedPositions, getCharacters, restoreProgress } from './utils/progress';
import type { CharacterCompletion } from './utils/progress';
import { formatPinyin } from './utils/pinyin';
import { ALL_TOPICS, getTopic, getTopicIndexes, getTopics } from './utils/topics';

const VOCAB_KEY = 'hanziwriting.vocabulary.v1';
const PROGRESS_KEY = 'hanziwriting.progress.v2';
const SETTINGS_KEY = 'hanziwriting.settings.v1';
const TOPIC_KEY = 'hanziwriting.topic.v1';
const DEFAULT_VOCABULARY = seedVocabulary as VocabularyItem[];

function readVocabulary(): VocabularyItem[] {
  try {
    const saved = localStorage.getItem(VOCAB_KEY);
    if (!saved) return DEFAULT_VOCABULARY;
    const parsed: unknown = JSON.parse(saved);
    if (!isVocabularyList(parsed)) return DEFAULT_VOCABULARY;
    return parsed.map((item) => {
      const seed = DEFAULT_VOCABULARY.find((entry) => entry.id === item.id && entry.word === item.word);
      return seed ? { ...item, pinyin: seed.pinyin, meaning: seed.meaning, topic: item.topic ?? seed.topic } : item;
    });
  } catch { return DEFAULT_VOCABULARY; }
}

function readProgress(vocabulary: VocabularyItem[]) {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(PROGRESS_KEY) ?? localStorage.getItem('hanziwriting.progress.v1') ?? 'null');
    return restoreProgress(vocabulary, parsed);
  } catch { /* Use the clean start below when local storage is unavailable. */ }
  return restoreProgress(vocabulary, null);
}

function readSettings(): PracticePreferences {
  try {
    const raw = JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? 'null');
    return {
      drawingWidth: typeof raw?.drawingWidth === 'number' && Number.isFinite(raw.drawingWidth)
        ? Math.max(2, Math.min(16, raw.drawingWidth)) : 7,
      showOutline: typeof raw?.showOutline === 'boolean' ? raw.showOutline : true,
      hideHints: typeof raw?.hideHints === 'boolean' ? raw.hideHints : false,
    };
  } catch { return { drawingWidth: 7, showOutline: true, hideHints: false }; }
}

export default function App() {
  const [vocabulary, setVocabulary] = useState<VocabularyItem[]>(readVocabulary);
  const [selectedTopic, setSelectedTopic] = useState(() => {
    try {
      const saved = localStorage.getItem(TOPIC_KEY);
      return saved && getTopics(vocabulary).includes(saved) ? saved : ALL_TOPICS;
    } catch { return ALL_TOPICS; }
  });
  const [savedProgress] = useState(() => readProgress(vocabulary));
  const [wordIndex, setWordIndex] = useState(() => {
    const indexes = getTopicIndexes(vocabulary, selectedTopic);
    return indexes.includes(savedProgress.wordIndex) ? savedProgress.wordIndex : indexes[0];
  });
  const [characterIndex, setCharacterIndex] = useState(() => wordIndex === savedProgress.wordIndex ? Math.max(0, savedProgress.characterIndex) : 0);
  const [completion, setCompletion] = useState<CharacterCompletion>(savedProgress.completedCharacters);
  const [settings, setSettings] = useState(readSettings);
  const [notice, setNotice] = useState('');
  const [showImporter, setShowImporter] = useState(false);
  const [showVocabulary, setShowVocabulary] = useState(false);
  const [storageAvailable, setStorageAvailable] = useState(true);

  const topics = useMemo(() => getTopics(vocabulary), [vocabulary]);
  const visibleIndexes = useMemo(() => getTopicIndexes(vocabulary, selectedTopic), [vocabulary, selectedTopic]);
  const visibleWordIndex = visibleIndexes.indexOf(wordIndex);
  const visibleVocabulary = visibleIndexes.map((index) => vocabulary[index]);
  const item = vocabulary[wordIndex];
  const characters = useMemo(() => getCharacters(item?.word ?? ''), [item?.word]);
  const finishedPositions = item ? completedPositions(item, completion) : [];
  const completedIds = vocabulary.filter((entry) => {
    const count = getCharacters(entry.word).length;
    return count > 0 && completedPositions(entry, completion).length === count;
  }).map((entry) => entry.id);
  const currentCharacter = characters[Math.min(characterIndex, Math.max(characters.length - 1, 0))] ?? '';
  const isComplete = Boolean(item && completedIds.includes(item.id));
  const progress = calculateProgress(visibleVocabulary, completion);
  const totalProgress = progress.percent;
  const unfinishedIndexes = visibleIndexes.filter((index) => !completedIds.includes(vocabulary[index].id));
  const nextUnfinishedIndex = unfinishedIndexes.find((index) => index > wordIndex) ?? unfinishedIndexes[0];
  const listComplete = progress.finishedWords === visibleVocabulary.length;

  useEffect(() => {
    try {
      localStorage.setItem(VOCAB_KEY, JSON.stringify(vocabulary));
      localStorage.setItem(PROGRESS_KEY, JSON.stringify({ wordIndex, characterIndex, completedCharacters: completion }));
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
      localStorage.setItem(TOPIC_KEY, selectedTopic);
      setStorageAvailable(true);
    } catch { setStorageAvailable(false); }
  }, [vocabulary, wordIndex, characterIndex, completion, settings, selectedTopic]);

  function selectWord(index: number) {
    if (index < 0 || index >= vocabulary.length) return;
    setWordIndex(index);
    const positions = completedPositions(vocabulary[index], completion);
    const next = getCharacters(vocabulary[index].word).findIndex((_, position) => !positions.includes(position));
    setCharacterIndex(Math.max(0, next));
    setShowVocabulary(false);
    setNotice('');
  }

  function advanceCharacter() {
    if (!item) return;
    const finished = [...new Set([...finishedPositions, characterIndex])];
    setCompletion((current) => ({ ...current, [item.id]: finished }));
    const missing = characters.map((_, index) => index).filter((index) => !finished.includes(index));
    const next = missing.find((index) => index > characterIndex) ?? missing[0];
    if (next !== undefined) setCharacterIndex(next);
  }

  function selectTopic(topic: string) {
    const indexes = getTopicIndexes(vocabulary, topic);
    if (!indexes.length) return;
    setSelectedTopic(topic);
    selectWord(indexes.includes(wordIndex) ? wordIndex : indexes[0]);
  }

  function skipCharacter() {
    const next = characters.findIndex((_, index) => index > characterIndex && !finishedPositions.includes(index));
    if (next >= 0) setCharacterIndex(next);
    else if (visibleWordIndex < visibleIndexes.length - 1) selectWord(visibleIndexes[visibleWordIndex + 1]);
    else setCharacterIndex(Math.max(0, characters.findIndex((_, index) => !finishedPositions.includes(index))));
    setNotice('Chữ bỏ qua chưa được tính vào tiến độ.');
  }

  function restartWord() {
    if (item) setCompletion((current) => ({ ...current, [item.id]: [] }));
    setCharacterIndex(0);
  }

  function importItems(items: VocabularyItem[]) {
    setVocabulary(items);
    setSelectedTopic(ALL_TOPICS);
    setWordIndex(0);
    setCharacterIndex(0);
    setCompletion({});
    setNotice(`Đã nhập ${items.length} dòng từ vựng. Bắt đầu danh sách mới.`);
  }

  function advanceWord() { selectWord(visibleIndexes[Math.min(visibleWordIndex + 1, visibleIndexes.length - 1)]); }
  function previousWord() { selectWord(visibleIndexes[Math.max(visibleWordIndex - 1, 0)]); }

  if (!item) return <main className="empty-state"><h1>Chưa có từ vựng</h1><p>Nhập danh sách từ để bắt đầu luyện viết.</p></main>;

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="Hán Tự, trang chủ">
          <span className="brand-mark" aria-hidden="true">字</span>
          <span>Hán Tự<span className="brand-subtitle">GÓC HỌC TIẾNG TRUNG</span></span>
        </a>
        <button className="import-toggle" onClick={() => setShowImporter((show) => !show)} aria-expanded={showImporter} aria-controls="import-area">
          <span aria-hidden="true">＋</span> Nhập từ
        </button>
      </header>

      {showImporter && <div id="import-area"><ImportVocabulary onImport={(items) => { importItems(items); setShowImporter(false); }} /></div>}
      {notice && <p className="app-notice" role="status">{notice}</p>}

      <section className="workspace" aria-labelledby="page-title">
        <div className="intro-row">
          <div>
            <p className="eyebrow">LUYỆN VIẾT · DANH SÁCH CỦA BẠN</p>
            <h1 id="page-title">Từng nét một.</h1>
            <p className="intro-copy">Nhìn chữ, nhớ nét, rồi tự tay viết lại.</p>
          </div>
          <div className="word-progress">
            <span className="progress-caption">TỪ {visibleWordIndex + 1} / {visibleVocabulary.length}</span>
            {!settings.hideHints && <span className="progress-word">{item.word}</span>}
          </div>
        </div>

        <div className="study-progress" aria-label={`Tiến độ ${totalProgress}%`}>
          <div className="progress-summary"><strong>{listComplete ? '✓ Hoàn thành danh sách' : selectedTopic ? `Tiến độ · ${selectedTopic}` : 'Tiến độ học · Tất cả'}</strong><span>{totalProgress}%</span></div>
          <div className="progress-track" role="progressbar" aria-label="Chữ đã viết đúng" aria-valuemin={0} aria-valuemax={100} aria-valuenow={totalProgress}><span style={{ width: `${totalProgress}%` }} /></div>
          <span className="progress-detail">{progress.finishedWords}/{visibleVocabulary.length} từ hoàn thành · {progress.finishedCharacters}/{progress.totalCharacters} chữ đã viết đúng</span>
        </div>

        <div className="study-layout">
          <aside className={`vocabulary-panel ${showVocabulary ? 'is-open' : ''}`} aria-label="Danh sách từ vựng">
            <div className="vocabulary-head">
              <span className="section-kicker">TỪ VỰNG · {visibleVocabulary.length}</span>
              <button className="vocabulary-toggle" onClick={() => setShowVocabulary((show) => !show)} aria-expanded={showVocabulary} aria-controls="vocabulary-list">
                {showVocabulary ? 'Thu gọn ↑' : 'Chọn từ ↓'}
              </button>
            </div>
            <div className="topic-filter">
              <label htmlFor="topic-select">Chủ đề</label>
              <select id="topic-select" value={selectedTopic} onChange={(event) => selectTopic(event.target.value)}>
                <option value={ALL_TOPICS}>Tất cả ({vocabulary.length})</option>
                {topics.map((topic) => <option key={topic} value={topic}>{topic} ({getTopicIndexes(vocabulary, topic).length})</option>)}
              </select>
            </div>
            <nav id="vocabulary-list" className="vocabulary-list" aria-label="Chọn từ để luyện">
              {visibleIndexes.map((index, position) => {
                const entry = vocabulary[index];
                const finished = completedPositions(entry, completion).length;
                const count = getCharacters(entry.word).length;
                const done = completedIds.includes(entry.id);
                return (
                  <button key={`${entry.id}-${index}`} className={`vocabulary-item ${index === wordIndex ? 'is-active' : ''} ${done ? 'is-complete' : ''}`} onClick={() => selectWord(index)} aria-current={index === wordIndex ? 'true' : undefined}>
                    <span className="vocabulary-check" aria-hidden="true">{done ? '✓' : finished ? '◐' : '○'}</span>
                    <span className="vocabulary-word">{settings.hideHints ? `Từ ${position + 1}` : entry.word}</span>
                    <span className="vocabulary-pinyin">{formatPinyin(entry.pinyin) || 'Chưa có Pinyin'}</span>
                    <span className="vocabulary-status">{done ? '✓ Hoàn thành' : finished ? `Đang học · ${finished}/${count} chữ` : 'Chưa hoàn thành'}</span>
                  </button>
                );
              })}
            </nav>
            {!storageAvailable && <p className="storage-warning" role="status">Không thể lưu trên trình duyệt này.</p>}
          </aside>

          <div className="study-main">
            <div className="learning-layout">
              <section className="practice-card" aria-label="Khu vực luyện viết">
                <div className="practice-card-head">
                  <span className="section-kicker">LUYỆN VIẾT</span>
                  <div className="practice-head-tools">
                    <span className="character-count">CHỮ {Math.min(characterIndex + 1, characters.length)} / {characters.length}</span>
                    <PracticeSettings key={item.id} value={settings} onChange={setSettings} />
                  </div>
                </div>
                <div className={`word-completion ${isComplete ? 'is-complete' : ''}`}>
                  <span>{isComplete ? '✓ Đã hoàn thành từ này' : `${finishedPositions.length}/${characters.length} chữ đã hoàn thành`}</span>
                  <div className="word-completion-track" role="progressbar" aria-label="Tiến độ từ hiện tại" aria-valuemin={0} aria-valuemax={characters.length} aria-valuenow={finishedPositions.length}><span style={{ width: `${characters.length ? finishedPositions.length / characters.length * 100 : 0}%` }} /></div>
                </div>
                <div className="writer-stage">
                  {isComplete ? (
                    <div className="complete-state" role="status">
                      <span className="complete-mark" aria-hidden="true">✓</span>
                      <strong>{listComplete ? 'Hoàn thành cả danh sách!' : 'Hoàn thành từ này!'}</strong>
                      <span>{settings.hideHints ? 'Bạn đã viết đúng mọi chữ trong từ này.' : `Bạn đã luyện xong ${item.word}.`}</span>
                      <div className="complete-actions">
                        <button className="button button-secondary" onClick={restartWord}>Luyện lại từ này</button>
                        <button className="button button-primary" onClick={() => { if (nextUnfinishedIndex !== undefined) selectWord(nextUnfinishedIndex); }} disabled={nextUnfinishedIndex === undefined}>Từ chưa hoàn thành →</button>
                      </div>
                    </div>
                  ) : currentCharacter ? (
                    <CharacterPractice
                      key={`${item.id}-${characterIndex}-${currentCharacter}`}
                      character={currentCharacter}
                      onComplete={advanceCharacter}
                      onSkip={skipCharacter}
                      drawingWidth={settings.drawingWidth}
                      showOutline={settings.showOutline && !settings.hideHints}
                      hideHints={settings.hideHints}
                    />
                  ) : <div className="complete-state"><strong>Từ này không có ký tự để luyện.</strong><button className="button button-primary" onClick={advanceWord}>Tiếp theo →</button></div>}
                </div>
                <div className="word-navigation">
                  <button className="button button-quiet" onClick={previousWord} disabled={visibleWordIndex === 0}>← Từ trước</button>
                  <button className="button button-secondary" onClick={advanceWord} disabled={visibleWordIndex >= visibleVocabulary.length - 1}>Bỏ qua từ</button>
                  <button className="button button-quiet" onClick={advanceWord} disabled={visibleWordIndex >= visibleVocabulary.length - 1}>Từ tiếp theo →</button>
                </div>
              </section>

              <aside className="word-card" aria-label="Thông tin từ vựng">
                <div className="word-card-top"><span className="section-kicker">TỪ VỰNG</span><span className={`level-tag ${isComplete ? 'is-complete' : ''}`}>{isComplete ? '✓ HOÀN THÀNH' : 'ĐANG HỌC'}</span></div>
                {settings.hideHints ? <div className="word-hanzi hidden-word-prompt">Tự nhớ chữ Hán</div> : <div className="word-hanzi" lang="zh-Hans">{item.word}</div>}
                <div className="word-pinyin">{formatPinyin(item.pinyin) || 'Chưa có Pinyin'}</div>
                <div className="word-meaning">{item.meaning || 'Chưa có nghĩa tiếng Việt'}</div>
                <div className="word-topic">Chủ đề: {getTopic(item)}</div>
                <div className="word-divider" />
                <p className="word-note">Mỗi chữ được luyện riêng theo thứ tự trong từ. Có thể chọn từ khác trong danh sách bất cứ lúc nào.</p>
                <div className="character-chips" aria-label="Các chữ trong từ">
                  {characters.map((character, index) => (
                    <span key={`${character}-${index}`} className={`character-chip ${index === characterIndex && !isComplete ? 'is-current' : ''} ${finishedPositions.includes(index) ? 'is-done' : ''}`} aria-label={`Chữ ${index + 1}: ${finishedPositions.includes(index) ? 'hoàn thành' : 'chưa hoàn thành'}`}>
                      {finishedPositions.includes(index) ? '✓' : settings.hideHints ? index + 1 : character}
                    </span>
                  ))}
                </div>
              </aside>
            </div>
            <footer className="page-foot"><span>HỌC CHẬM, NHỚ LÂU.</span><span>BUỔI HỌC {String(visibleWordIndex + 1).padStart(2, '0')}</span></footer>
          </div>
        </div>
      </section>
    </main>
  );
}
