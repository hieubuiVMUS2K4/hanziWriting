import { useEffect, useId, useRef, useState } from 'react';

export type PracticePreferences = { drawingWidth: number; showOutline: boolean; hideHints: boolean };
type Props = { value: PracticePreferences; onChange: (value: PracticePreferences) => void };

export default function PracticeSettings({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);
  const panelId = useId();
  const sliderId = useId();

  useEffect(() => {
    if (!open) return;
    firstInputRef.current?.focus({ preventScroll: true });
    function outside(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function escape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus({ preventScroll: true });
      }
    }
    document.addEventListener('pointerdown', outside);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('pointerdown', outside);
      document.removeEventListener('keydown', escape);
    };
  }, [open]);

  return (
    <div className="settings-menu" ref={rootRef}>
      <button ref={triggerRef} className="settings-trigger" type="button" aria-label="Cài đặt luyện viết" aria-expanded={open} aria-controls={open ? panelId : undefined} aria-haspopup="dialog" onClick={() => setOpen((current) => !current)}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="m9.2 3-.5 2.3-2 1.2-2.3-.7-2 3.4 1.8 1.6v2.4l-1.8 1.6 2 3.4 2.3-.7 2 1.2.5 2.3h4l.5-2.3 2-1.2 2.3.7 2-3.4-1.8-1.6v-2.4L20 9.2l-2-3.4-2.3.7-2-1.2-.5-2.3Z" />
          <circle cx="11.2" cy="12" r="3" />
        </svg>
      </button>
      {open && (
        <div className="settings-popover" id={panelId} role="dialog" aria-labelledby={`${panelId}-title`}>
          <div className="settings-popover-head">
            <h2 id={`${panelId}-title`}>Cài đặt luyện viết</h2>
            <button className="settings-close" type="button" aria-label="Đóng cài đặt" onClick={() => { setOpen(false); triggerRef.current?.focus(); }}>×</button>
          </div>
          <label className="settings-option">
            <input ref={firstInputRef} type="checkbox" checked={value.hideHints} onChange={(event) => onChange({ ...value, hideHints: event.target.checked })} />
            <span><strong>Ẩn gợi ý chữ Hán</strong><small>Chỉ nhìn Pinyin và nghĩa để tự viết. Chữ Hán và nét mẫu đều được ẩn.</small></span>
          </label>
          <label className="settings-option">
            <input type="checkbox" checked={value.hideHints || !value.showOutline} disabled={value.hideHints} onChange={(event) => onChange({ ...value, showOutline: !event.target.checked })} />
            <span><strong>Ẩn nét mẫu</strong><small>Giữ chữ Hán bên ngoài ô viết, tắt nét mẫu và gợi ý nét tự động.</small></span>
          </label>
          <label className="pen-width-control" htmlFor={sliderId}>
            <span>Độ dày nét bút <output htmlFor={sliderId}>{value.drawingWidth}px</output></span>
            <input id={sliderId} type="range" min="2" max="16" step="1" value={value.drawingWidth} onChange={(event) => onChange({ ...value, drawingWidth: Number(event.target.value) })} />
          </label>
        </div>
      )}
    </div>
  );
}
