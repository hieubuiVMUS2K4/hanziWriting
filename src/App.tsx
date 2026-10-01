import { useState } from 'react';
import CharacterPractice from './components/CharacterPractice';

const word = '你好';
const characters = Array.from(word);

export default function App() {
  const [characterIndex, setCharacterIndex] = useState(0);
  const [completed, setCompleted] = useState(false);
  const currentCharacter = characters[characterIndex];

  function advanceCharacter() {
    if (characterIndex < characters.length - 1) {
      setCharacterIndex((index) => index + 1);
      setCompleted(false);
    } else {
      setCompleted(true);
    }
  }

  function restartWord() {
    setCharacterIndex(0);
    setCompleted(false);
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="Hán Tự, trang chủ">
          <span className="brand-mark" aria-hidden="true">字</span>
          <span>Hán Tự<span className="brand-subtitle">GÓC HỌC TIẾNG TRUNG</span></span>
        </a>
        <span className="phase-label"><span className="status-dot" /> BẢN THỬ ĐẦU TIÊN</span>
      </header>

      <section className="workspace" aria-labelledby="page-title">
        <div className="intro-row">
          <div>
            <p className="eyebrow">LUYỆN VIẾT · BÀI 01</p>
            <h1 id="page-title">Từng nét một.</h1>
            <p className="intro-copy">Nhìn chữ, nhớ nét, rồi tự tay viết lại.</p>
          </div>
          <div className="word-progress" aria-label={`Chữ ${characterIndex + 1} trên ${characters.length}`}>
            <span className="progress-caption">TỪ ĐANG HỌC</span>
            <span className="progress-word">{word}</span>
          </div>
        </div>

        <div className="learning-layout">
          <section className="practice-card" aria-label="Khu vực luyện viết">
            <div className="practice-card-head">
              <span className="section-kicker">LUYỆN VIẾT</span>
              <span className="character-count">CHỮ {characterIndex + 1} / {characters.length}</span>
            </div>

            <div className="writer-stage">
              {completed ? (
                <div className="complete-state" role="status">
                  <span className="complete-mark" aria-hidden="true">✓</span>
                  <strong>Viết xong từ đầu tiên!</strong>
                  <span>Bạn đã hoàn thành {word}.</span>
                  <button className="button button-primary" onClick={restartWord}>Luyện lại từ này</button>
                </div>
              ) : (
                <CharacterPractice
                  key={currentCharacter}
                  character={currentCharacter}
                  onComplete={advanceCharacter}
                />
              )}
            </div>

            {!completed && <div className="practice-hint">Viết các nét theo đúng thứ tự trong ô vuông.</div>}
          </section>

          <aside className="word-card" aria-label="Thông tin từ vựng">
            <div className="word-card-top">
              <span className="section-kicker">TỪ VỰNG</span>
              <span className="level-tag">MẪU</span>
            </div>
            <div className="word-hanzi" lang="zh-Hans">{word}</div>
            <div className="word-pinyin">nǐ hǎo</div>
            <div className="word-meaning">xin chào</div>
            <div className="word-divider" />
            <p className="word-note">Từ gồm hai chữ. Hoàn thành chữ hiện tại để chuyển sang chữ tiếp theo.</p>
            <div className="character-chips" aria-label="Các chữ trong từ">
              {characters.map((character, index) => (
                <span key={`${character}-${index}`} className={`character-chip ${index === characterIndex && !completed ? 'is-current' : ''} ${index < characterIndex || completed ? 'is-done' : ''}`}>
                  {index < characterIndex || completed ? '✓' : character}
                </span>
              ))}
            </div>
          </aside>
        </div>

        <footer className="page-foot"><span>HỌC CHẬM, NHỚ LÂU.</span><span>BUỔI HỌC 01</span></footer>
      </section>
    </main>
  );
}
