import { useEffect, useRef, useState } from 'react';
import type { VocabularyItem } from '../types/vocabulary';
import { formatPinyin } from '../utils/pinyin';

export default function CopyVocabulary({ items, currentItems }: { items: VocabularyItem[]; currentItems: VocabularyItem[] }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const [scope, setScope] = useState('all');
  const [format, setFormat] = useState('text');
  const [pinyin, setPinyin] = useState(true);
  const [meaning, setMeaning] = useState(true);
  const [status, setStatus] = useState('');
  const selected = scope === 'all' ? items : currentItems;
  const rows = selected.map((item) => [item.word, ...(pinyin ? [formatPinyin(item.pinyin)] : []), ...(meaning ? [item.meaning] : [])]);
  const content = rows.map((row) => format === 'csv'
    ? row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(',')
    : row.join(format === 'tsv' ? '\t' : ' — ')).join('\n');
  useEffect(() => { setStatus(''); }, [content]);
  function close() { dialog.current?.close(); trigger.current?.focus(); }
  return <>
    <div className="copy-list-tools"><button ref={trigger} className="button button-quiet" onClick={() => { setStatus(''); dialog.current?.showModal(); }}>Hiện toàn bộ từ để copy</button></div>
    <dialog ref={dialog} className="copy-dialog" aria-labelledby="copy-title" onClick={(event) => { if (event.target === event.currentTarget) close(); }}>
      <div className="copy-dialog-body">
        <header className="copy-dialog-header"><div><h2 id="copy-title">Sao chép danh sách từ</h2><p>Chọn nội dung và định dạng bạn cần.</p></div><button className="copy-close" aria-label="Đóng" onClick={close}>×</button></header>
        <div className="copy-options">
          <label>Danh sách<select value={scope} onChange={(event) => setScope(event.target.value)}><option value="all">Toàn bộ từ ({items.length})</option><option value="current">Chủ đề đang chọn ({currentItems.length})</option></select></label>
          <label>Định dạng<select value={format} onChange={(event) => setFormat(event.target.value)}><option value="text">Văn bản (dấu gạch ngang)</option><option value="tsv">Bảng Excel (Tab)</option><option value="csv">CSV</option></select></label>
        </div>
        <fieldset className="copy-fields"><legend>Nội dung mỗi từ</legend><span>Chữ Hán</span><label><input type="checkbox" checked={pinyin} onChange={(event) => setPinyin(event.target.checked)} /> Pinyin</label><label><input type="checkbox" checked={meaning} onChange={(event) => setMeaning(event.target.checked)} /> Nghĩa tiếng Việt</label></fieldset>
        <label className="copy-preview-label" htmlFor="copy-preview">Xem trước · {selected.length} từ</label>
        <textarea id="copy-preview" className="copy-preview" readOnly value={content} spellCheck={false} onFocus={(event) => event.currentTarget.select()} />
        <footer className="copy-dialog-footer"><p role="status">{status || 'Mỗi từ một dòng. Có thể chọn trực tiếp nội dung để sao chép.'}</p><button className="button button-secondary" onClick={async () => { try { await navigator.clipboard.writeText(content); setStatus('Đã sao chép danh sách.'); } catch { setStatus('Chọn nội dung trong ô và nhấn Ctrl+C (hoặc giữ để sao chép trên điện thoại).'); } }}>Sao chép {selected.length} từ</button></footer>
      </div>
    </dialog>
  </>;
}
