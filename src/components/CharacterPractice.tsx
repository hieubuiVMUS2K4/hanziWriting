import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import HanziWriter from 'hanzi-writer';

type Props = {
  character: string;
  onComplete: () => void;
  onSkip: () => void;
  drawingWidth: number;
  showOutline: boolean;
  onDrawingWidthChange: (width: number) => void;
  onShowOutlineChange: (show: boolean) => void;
};
type WriterControls = { reset: () => void; animate: () => void; outline: (show: boolean) => void };

export default function CharacterPractice({ character, onComplete, onSkip, drawingWidth, showOutline, onDrawingWidthChange, onShowOutlineChange }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<WriterControls | null>(null);
  const latestRef = useRef({ onComplete, showOutline });
  const [message, setMessage] = useState('Đang tải dữ liệu nét…');
  const [ready, setReady] = useState(false);
  const [finished, setFinished] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [animating, setAnimating] = useState(false);

  useEffect(() => { latestRef.current = { onComplete, showOutline }; }, [onComplete, showOutline]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let active = true;
    let strokeIndex = 0;
    let complete = false;
    let animationId = 0;
    let animationActive = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    setMessage('Đang tải dữ liệu nét…');
    setReady(false);
    setFinished(false);
    setLoadError(false);
    setAnimating(false);

    const size = Math.max(1, host.getBoundingClientRect().width);
    const writer = HanziWriter.create(host, character, {
      width: size, height: size, padding: size * 0.073,
      renderer: 'svg', showCharacter: false,
      showOutline: latestRef.current.showOutline,
      drawingColor: '#253b34', highlightColor: '#c27a52', outlineColor: '#deded5', drawingWidth: 7,
      onLoadCharDataSuccess: () => {
        if (!active) return;
        setReady(true);
        setMessage('Bắt đầu viết theo thứ tự nét.');
      },
      onLoadCharDataError: () => {
        if (!active) return;
        setLoadError(true);
        setMessage(`Không tìm thấy dữ liệu luyện viết cho chữ ${character}.`);
      },
    });

    function startQuiz() {
      writer.cancelQuiz();
      void writer.quiz({
        quizStartStrokeNum: strokeIndex,
        showHintAfterMisses: latestRef.current.showOutline ? 2 : false,
        highlightOnComplete: latestRef.current.showOutline,
        onCorrectStroke: (data) => {
          if (!active) return;
          strokeIndex = data.strokeNum + 1;
          setMessage('Đúng thứ tự nét, tiếp tục nhé.');
        },
        onMistake: () => {
          if (active) setMessage(latestRef.current.showOutline ? 'Chưa đúng nét này. Thử lại theo gợi ý nhé.' : 'Chưa đúng nét hoặc thứ tự. Thử viết lại nét này.');
        },
        onComplete: () => {
          if (!active || complete) return;
          complete = true;
          setFinished(true);
          setMessage('Hoàn thành chữ.');
          timer = setTimeout(() => { if (active) latestRef.current.onComplete(); }, 650);
        },
      });
    }

    function applyOutline(show: boolean) {
      if (show) void writer.showOutline({ duration: 0 });
      else void writer.hideOutline({ duration: 0 });
      // Restart from the first unfinished stroke to update hint behavior without losing correct strokes.
      if (!complete && !animationActive) startQuiz();
    }

    controlsRef.current = {
      reset: () => {
        animationId++;
        animationActive = false;
        clearTimeout(timer);
        complete = false;
        strokeIndex = 0;
        setFinished(false);
        setAnimating(false);
        setMessage('Bắt đầu viết theo thứ tự nét.');
        void writer.hideCharacter({ duration: 0 });
        startQuiz();
      },
      animate: () => {
        const token = ++animationId;
        animationActive = true;
        setAnimating(true);
        setMessage('Đang xem thứ tự nét…');
        writer.cancelQuiz();
        void writer.animateCharacter().then(async () => {
          if (!active || token !== animationId) return;
          await writer.hideCharacter({ duration: 0 });
          if (!active || token !== animationId) return;
          animationActive = false;
          setAnimating(false);
          setMessage('Tiếp tục viết theo thứ tự nét.');
          applyOutline(latestRef.current.showOutline);
        }).catch(() => {
          if (!active) return;
          animationActive = false;
          setAnimating(false);
          setMessage('Không thể xem animation. Hãy thử viết lại.');
        });
      },
      outline: applyOutline,
    };
    startQuiz();

    const observer = new ResizeObserver(([entry]) => {
      const nextSize = entry.contentRect.width;
      if (active && nextSize > 0) writer.updateDimensions({ width: nextSize, height: nextSize, padding: nextSize * 0.073 });
    });
    observer.observe(host);

    return () => {
      active = false;
      animationId++;
      clearTimeout(timer);
      observer.disconnect();
      writer.cancelQuiz();
      void writer.pauseAnimation();
      controlsRef.current = null;
      host.replaceChildren();
    };
  }, [character]);

  useEffect(() => { controlsRef.current?.outline(showOutline); }, [showOutline]);

  return (
    <div className="character-practice" style={{ '--drawing-width': `${drawingWidth}px` } as CSSProperties}>
      <div className="practice-settings">
        <label className="outline-control">
          <input type="checkbox" checked={showOutline} onChange={(event) => onShowOutlineChange(event.target.checked)} />
          <span>Hiện nét mẫu</span>
        </label>
        <label className="pen-width-control" htmlFor="pen-width">
          <span>Độ dày nét bút <output htmlFor="pen-width">{drawingWidth}px</output></span>
          <input id="pen-width" type="range" min="2" max="16" step="1" value={drawingWidth} onChange={(event) => onDrawingWidthChange(Number(event.target.value))} />
        </label>
        {!showOutline && <p className="practice-mode-note">Tự viết, không có nét mẫu hay gợi ý tự động.</p>}
      </div>
      <div className="character-focus" lang="zh-Hans">{character}</div>
      <div className="writer-frame">
        <div className="writer-host" ref={hostRef} aria-label={`Ô luyện viết chữ ${character}`} />
      </div>
      <p className="feedback" role="status" aria-live="polite">{message}</p>
      <div className="practice-actions">
        <button className="button button-secondary" onClick={() => controlsRef.current?.animate()} disabled={!ready || finished || loadError || animating}>
          <span aria-hidden="true">↻</span> Xem thứ tự nét
        </button>
        <button className="button button-quiet" onClick={() => controlsRef.current?.reset()} disabled={!ready || finished || loadError}>Viết lại</button>
        {(loadError || ready) && <button className="button button-quiet" onClick={onSkip} disabled={finished || animating}>Bỏ qua chữ</button>}
      </div>
    </div>
  );
}
