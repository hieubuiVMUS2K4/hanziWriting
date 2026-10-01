import { useEffect, useMemo, useState } from 'react';
import seedVocabulary from './data/vocabulary.json';
import CharacterPractice from './components/CharacterPractice';
import ImportVocabulary from './components/ImportVocabulary';
import type { VocabularyItem } from './types/vocabulary';
import { isVocabularyList } from './utils/vocabularyParser';

const VOCAB_KEY = 'hanziwriting.vocabulary.v1';
const PROGRESS_KEY = 'hanziwriting.progress.v1';
const DEFAULT_VOCABULARY = seedVocabulary as VocabularyItem[];
type SavedProgress = { wordIndex: number; characterIndex: number; completedIds: string[] };

function readVocabulary(): VocabularyItem[] {
  try {
    const saved = localStorage.getItem(VOCAB_KEY);
    if (!saved) return DEFAULT_VOCABULARY;
    const parsed: unknown = JSON.parse(saved);
    return isVocabularyList(parsed) ? parsed : DEFAULT_VOCABULARY;
  } catch { return DEFAULT_VOCABULARY; }
}

function readProgress(): SavedProgress {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(PROGRESS_KEY) ?? 'null');
    if (typeof parsed === 'object' && parsed !== null &&
      Number.isInteger((parsed as SavedProgress).wordIndex) &&
      Number.isInteger((parsed as SavedProgress).characterIndex) &&
      Array.isArray((parsed as SavedProgress).completedIds)) return parsed as SavedProgress;
  } catch { /* Use the clean start below when local storage is unavailable. */ }
  return { wordIndex: 0, characterIndex: 0, completedIds: [] };
}

function splitWord(word: string): string[] {
  return Array.from(word.replace(/[……]/gu, ''));
}

export default function App() {
  const [vocabulary, setVocabulary] = useState<VocabularyItem[]>(readVocabulary);
  const [savedProgress] = useState<SavedProgress>(readProgress);
  const [wordIndex, setWordIndex] = useState(() => Math.max(0, Math.min(savedProgress.wordIndex, vocabulary.length - 1)));
  const [characterIndex, setCharacterIndex] = useState(() => Math.max(0, savedProgress.characterIndex));
  const [completedIds, setCompletedIds] = useState<string[]>(savedProgress.completedIds);
  const [showImporter, setShowImporter] = useState(false);
  const [showVocabulary, setShowVocabulary] = useState(false);
  const [storageAvailable, setStorageAvailable] = useState(true);

  const item = vocabulary[wordIndex] ?? vocabulary[0];
  const characters = useMemo(() => splitWord(item?.word ?? ''), [item?.word]);
  const currentCharacter = characters[Math.min(characterIndex, Math.max(characters.length - 1, 0))] ?? '';
  const isComplete = Boolean(item && completedIds.includes(item.id));
  const totalProgress = vocabulary.length
    ? Math.min(100, Math.round(((wordIndex + (isComplete ? 1 : characterIndex / Math.max(characters.length, 1))) / vocabulary.length) * 100))
    : 0;

  useEffect(() => {
    try {
      localStorage.setItem(VOCAB_KEY, JSON.stringify(vocabulary));
      localStorage.setItem(PROGRESS_KEY, JSON.stringify({ wordIndex, characterIndex, completedIds }));
      setStorageAvailable(true);
    } catch { setStorageAvailable(false); }
  }, [vocabulary, wordIndex, characterIndex, completedIds]);

  function selectWord(index: number) {
    if (index < 0 || index >= vocabulary.length) return;
    setWordIndex(index);
    setCharacterIndex(0);
    setShowVocabulary(false);
  }

  function advanceCharacter() {
    if (!item) return;
    if (characterIndex < characters.length - 1) {
      setCharacterIndex((index) => index + 1);
      return;
    }
    setCompletedIds((ids) => ids.includes(item.id) ? ids : [...ids, item.id]);
  }

  function restartWord() {
    if (item) setCompletedIds((ids) => ids.filter((id) => id !== item.id));
    setCharacterIndex(0);
  }

  function importItems(items: VocabularyItem[]) {
    setVocabulary(items);
    setWordIndex(0);
    setCharacterIndex(0);
    setCompletedIds([]);
  }

  function advanceWord() { selectWord(Math.min(wordIndex + 1, vocabulary.length - 1)); }
  function previousWord() { selectWord(Math.max(wordIndex - 1, 0)); }

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

      <section className="workspace" aria-labelledby="page-title">
        <div className="intro-row">
          <div>
            <p className="eyebrow">LUYỆN VIẾT · DANH SÁCH CỦA BẠN</p>
            <h1 id="page-title">Từng nét một.</h1>
            <p className="intro-copy">Nhìn chữ, nhớ nét, rồi tự tay viết lại.</p>
          </div>
          <div className="word-progress">
            <span className="progress-caption">TỪ {wordIndex + 1} / {vocabulary.length}</span>
            <span className="progress-word">{item.word}</span>
          </div>
        </div>

        <div className="study-progress" aria-label={`Tiến độ ${totalProgress}%`}>
          <div className="progress-track"><span style={{ width: `${totalProgress}%` }} /></div>
          <span>{completedIds.length} / {vocabulary.length} từ hoàn thành</span>
        </div>

        <div className="study-layout">
          <aside className={`vocabulary-panel ${showVocabulary ? 'is-open' : ''}`} aria-label="Danh sách từ vựng">
            <div className="vocabulary-head">
              <span className="section-kicker">TỪ VỰNG · {vocabulary.length}</span>
              <button className="vocabulary-toggle" onClick={() => setShowVocabulary((show) => !show)} aria-expanded={showVocabulary} aria-controls="vocabulary-list">
                {showVocabulary ? 'Thu gọn ↑' : 'Chọn từ ↓'}
              </button>
            </div>
            <nav id="vocabulary-list" className="vocabulary-list" aria-label="Chọn từ để luyện">
              {vocabulary.map((entry, index) => (
                <button key={`${entry.id}-${index}`} className={`vocabulary-item ${index === wordIndex ? 'is-active' : ''}`} onClick={() => selectWord(index)} aria-current={index === wordIndex ? 'true' : undefined}>
                  <span className="vocabulary-check">{completedIds.includes(entry.id) ? '✓' : ''}</span>
                  <span className="vocabulary-word">{entry.word}</span>
                  <span className="vocabulary-pinyin">{entry.pinyin || '—'}</span>
                </button>
              ))}
            </nav>
            {!storageAvailable && <p className="storage-warning" role="status">Không thể lưu trên trình duyệt này.</p>}
          </aside>

          <div className="study-main">
            <div className="learning-layout">
              <section className="practice-card" aria-label="Khu vực luyện viết">
                <div className="practice-card-head">
                  <span className="section-kicker">LUYỆN VIẾT</span>
                  <span className="character-count">CHỮ {Math.min(characterIndex + 1, characters.length)} / {characters.length}</span>
                </div>
                <div className="writer-stage">
                  {isComplete ? (
                    <div className="complete-state" role="status">
                      <span className="complete-mark" aria-hidden="true">✓</span>
                      <strong>Hoàn thành từ này!</strong>
                      <span>Bạn đã luyện xong {item.word}.</span>
                      <div className="complete-actions">
                        <button className="button button-secondary" onClick={restartWord}>Luyện lại từ này</button>
                        <button className="button button-primary" onClick={advanceWord} disabled={wordIndex >= vocabulary.length - 1}>Từ tiếp theo →</button>
                      </div>
                    </div>
                  ) : currentCharacter ? (
                    <CharacterPractice
                      key={`${item.id}-${characterIndex}-${currentCharacter}`}
                      character={currentCharacter}
                      onComplete={advanceCharacter}
                      onSkip={advanceCharacter}
                    />
                  ) : <div className="complete-state"><strong>Từ này không có ký tự để luyện.</strong><button className="button button-primary" onClick={advanceWord}>Tiếp theo →</button></div>}
                </div>
                {!isComplete && <div className="practice-hint">Viết các nét theo đúng thứ tự trong ô vuông.</div>}
                <div className="word-navigation">
                  <button className="button button-quiet" onClick={previousWord} disabled={wordIndex === 0}>← Từ trước</button>
                  <button className="button button-secondary" onClick={advanceWord} disabled={wordIndex >= vocabulary.length - 1}>Bỏ qua từ</button>
                  <button className="button button-quiet" onClick={advanceWord} disabled={wordIndex >= vocabulary.length - 1}>Từ tiếp theo →</button>
                </div>
              </section>

              <aside className="word-card" aria-label="Thông tin từ vựng">
                <div className="word-card-top"><span className="section-kicker">TỪ VỰNG</span><span className="level-tag">{isComplete ? 'ĐÃ HỌC' : 'ĐANG HỌC'}</span></div>
                <div className="word-hanzi" lang="zh-Hans">{item.word}</div>
                <div className="word-pinyin">{item.pinyin || 'Chưa có Pinyin'}</div>
                <div className="word-meaning">{item.meaning || 'Chưa có nghĩa tiếng Việt'}</div>
                <div className="word-divider" />
                <p className="word-note">Mỗi chữ được luyện riêng theo thứ tự trong từ. Có thể chọn từ khác trong danh sách bất cứ lúc nào.</p>
                <div className="character-chips" aria-label="Các chữ trong từ">
                  {characters.map((character, index) => (
                    <span key={`${character}-${index}`} className={`character-chip ${index === characterIndex && !isComplete ? 'is-current' : ''} ${index < characterIndex || isComplete ? 'is-done' : ''}`}>
                      {index < characterIndex || isComplete ? '✓' : character}
                    </span>
                  ))}
                </div>
              </aside>
            </div>
            <footer className="page-foot"><span>HỌC CHẬM, NHỚ LÂU.</span><span>BUỔI HỌC {String(wordIndex + 1).padStart(2, '0')}</span></footer>
          </div>
        </div>
      </section>
    </main>
  );
}
