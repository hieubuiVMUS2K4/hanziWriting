import { useEffect, useRef, useState } from 'react';
import HanziWriter from 'hanzi-writer';

type Props = { character: string; onComplete: () => void };

export default function CharacterPractice({ character, onComplete }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const writerRef = useRef<HanziWriter | null>(null);
  const onCompleteRef = useRef(onComplete);
  const [message, setMessage] = useState('Đang tải dữ liệu nét…');
  const [ready, setReady] = useState(false);
  const [finished, setFinished] = useState(false);

  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let active = true;
    setMessage('Đang tải dữ liệu nét…');
    setReady(false);
    setFinished(false);

    const writer = HanziWriter.create(host, character, {
      width: 300,
      height: 300,
      padding: 22,
      showCharacter: false,
      showOutline: true,
      showHintAfterMisses: 2,
      highlightOnComplete: true,
      drawingColor: '#253b34',
      highlightColor: '#c27a52',
      outlineColor: '#deded5',
      drawingWidth: 7,
      onLoadCharDataSuccess: () => {
        if (!active) return;
        setReady(true);
        setMessage('Bắt đầu viết theo thứ tự nét.');
      },
      onLoadCharDataError: () => {
        if (!active) return;
        setMessage(`Không tìm thấy dữ liệu luyện viết cho chữ ${character}.`);
      },
    });
    writerRef.current = writer;
    writer.quiz({
      onCorrectStroke: () => { if (active) setMessage('Đúng thứ tự nét, tiếp tục nhé.'); },
      onMistake: () => { if (active) setMessage('Chưa đúng nét này. Thử lại theo gợi ý nhé.'); },
      onComplete: () => {
        writer.hideCharacter();
        if (!active) return;
        setFinished(true);
        setMessage('Hoàn thành chữ.');
        window.setTimeout(() => { if (active) onCompleteRef.current(); }, 650);
      },
    });

    return () => {
      active = false;
      writer.cancelQuiz();
      writerRef.current = null;
      host.replaceChildren();
    };
  }, [character]);

  function reset() {
    const writer = writerRef.current;
    if (!writer) return;
    writer.cancelQuiz();
    setFinished(false);
    setMessage('Bắt đầu viết theo thứ tự nét.');
    writer.quiz({
      onCorrectStroke: () => setMessage('Đúng thứ tự nét, tiếp tục nhé.'),
      onMistake: () => setMessage('Chưa đúng nét này. Thử lại theo gợi ý nhé.'),
      onComplete: () => {
        setFinished(true);
        setMessage('Hoàn thành chữ.');
        window.setTimeout(() => onCompleteRef.current(), 650);
      },
    });
  }

  function animate() {
    const writer = writerRef.current;
    if (!writer || !ready || finished) return;
    writer.cancelQuiz();
    writer.animateCharacter({
      onComplete: () => {
        writer.hideCharacter();
        writer.quiz({
          onCorrectStroke: () => setMessage('Đúng thứ tự nét, tiếp tục nhé.'),
          onMistake: () => setMessage('Chưa đúng nét này. Thử lại theo gợi ý nhé.'),
          onComplete: () => {
            setFinished(true);
            setMessage('Hoàn thành chữ.');
            window.setTimeout(() => onCompleteRef.current(), 650);
          },
        });
      },
    });
  }

  return (
    <div className="character-practice">
      <div className="character-focus" lang="zh-Hans">{character}</div>
      <div className="character-pronunciation">{character === '你' ? 'nǐ' : 'hǎo'}</div>
      <div className="writer-frame">
        <div className="writer-grid" aria-hidden="true"><span /><span /></div>
        <div className="writer-host" ref={hostRef} aria-label={`Ô luyện viết chữ ${character}`} />
      </div>
      <p className="feedback" role="status" aria-live="polite">{message}</p>
      <div className="practice-actions">
        <button className="button button-secondary" onClick={animate} disabled={!ready || finished} aria-label="Xem thứ tự nét">
          <span aria-hidden="true">↻</span> Xem thứ tự nét
        </button>
        <button className="button button-quiet" onClick={reset} disabled={!ready} aria-label="Viết lại chữ hiện tại">Viết lại</button>
      </div>
    </div>
  );
}
