import { useEffect, useRef, useState } from 'react';
import HanziWriter from 'hanzi-writer';

type Props = { character: string; onComplete: () => void; onSkip: () => void };

export default function CharacterPractice({ character, onComplete, onSkip }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const writerRef = useRef<HanziWriter | null>(null);
  const onCompleteRef = useRef(onComplete);
  const onSkipRef = useRef(onSkip);
  const mountedRef = useRef(false);
  const [message, setMessage] = useState('Đang tải dữ liệu nét…');
  const [ready, setReady] = useState(false);
  const [finished, setFinished] = useState(false);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);
  useEffect(() => { onSkipRef.current = onSkip; }, [onSkip]);

  function startQuiz(writer: HanziWriter) {
    writer.quiz({
      onCorrectStroke: () => { if (mountedRef.current) setMessage('Đúng thứ tự nét, tiếp tục nhé.'); },
      onMistake: () => { if (mountedRef.current) setMessage('Chưa đúng nét này. Thử lại theo gợi ý nhé.'); },
      onComplete: () => {
        if (!mountedRef.current) return;
        setFinished(true);
        setMessage('Hoàn thành chữ.');
        window.setTimeout(() => { if (mountedRef.current) onCompleteRef.current(); }, 650);
      },
    });
  }

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    mountedRef.current = true;
    setMessage('Đang tải dữ liệu nét…');
    setReady(false);
    setFinished(false);
    setLoadError(false);

    const size = Math.max(1, host.getBoundingClientRect().width);
    const writer = HanziWriter.create(host, character, {
      width: size,
      height: size,
      padding: size * 0.073,
      showCharacter: false,
      showOutline: true,
      showHintAfterMisses: 2,
      highlightOnComplete: true,
      drawingColor: '#253b34',
      highlightColor: '#c27a52',
      outlineColor: '#deded5',
      drawingWidth: 7,
      onLoadCharDataSuccess: () => {
        if (!mountedRef.current) return;
        setReady(true);
        setMessage('Bắt đầu viết theo thứ tự nét.');
      },
      onLoadCharDataError: () => {
        if (!mountedRef.current) return;
        setLoadError(true);
        setMessage(`Không tìm thấy dữ liệu luyện viết cho chữ ${character}.`);
      },
    });
    writerRef.current = writer;
    startQuiz(writer);
    const observer = new ResizeObserver(([entry]) => {
      const nextSize = entry.contentRect.width;
      if (nextSize > 0) {
        writer.updateDimensions({ width: nextSize, height: nextSize, padding: nextSize * 0.073 });
      }
    });
    observer.observe(host);

    return () => {
      mountedRef.current = false;
      observer.disconnect();
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
    startQuiz(writer);
  }

  function animate() {
    const writer = writerRef.current;
    if (!writer || !ready || finished) return;
    writer.cancelQuiz();
    writer.animateCharacter({
      onComplete: () => {
        if (!mountedRef.current) return;
        writer.hideCharacter();
        startQuiz(writer);
      },
    });
  }

  return (
    <div className="character-practice">
      <div className="character-focus" lang="zh-Hans">{character}</div>
      <div className="writer-frame">
        <div className="writer-host" ref={hostRef} aria-label={`Ô luyện viết chữ ${character}`} />
      </div>
      <p className="feedback" role="status" aria-live="polite">{message}</p>
      <div className="practice-actions">
        <button className="button button-secondary" onClick={animate} disabled={!ready || finished || loadError} aria-label="Xem thứ tự nét">
          <span aria-hidden="true">↻</span> Xem thứ tự nét
        </button>
        <button className="button button-quiet" onClick={reset} disabled={!ready || finished || loadError} aria-label="Viết lại chữ hiện tại">Viết lại</button>
        {(loadError || ready) && <button className="button button-quiet" onClick={onSkipRef.current}>Bỏ qua chữ</button>}
      </div>
    </div>
  );
}
