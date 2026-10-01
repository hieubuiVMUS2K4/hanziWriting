import { useState } from 'react';
import type { VocabularyItem } from '../types/vocabulary';
import { parseVocabulary } from '../utils/vocabularyParser';

type Props = { onImport: (items: VocabularyItem[]) => void };

export default function ImportVocabulary({ onImport }: Props) {
  const [text, setText] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [message, setMessage] = useState('');

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = parseVocabulary(text);
    setErrors(result.errors);
    setMessage('');
    if (result.items.length === 0) {
      if (result.errors.length === 0) setErrors(['Nhập ít nhất một dòng từ vựng.']);
      return;
    }
    onImport(result.items);
    setMessage(`Đã nhập ${result.items.length} dòng. Từ trùng được giữ nguyên theo thứ tự nhập.`);
    setText('');
  }

  return (
    <form className="import-panel" onSubmit={submit}>
      <label className="import-label" htmlFor="vocabulary-input">DÁN DANH SÁCH TỪ VỰNG</label>
      <textarea
        id="vocabulary-input"
        value={text}
        onChange={(event) => { setText(event.target.value); setErrors([]); setMessage(''); }}
        placeholder={'Mỗi dòng một từ:\n你好\n老师\n\nHoặc ba trường, ngăn bằng TAB hay |:\n你好 | ni3hao3 | xin chào'}
        rows={6}
        aria-describedby="import-help"
      />
      <div className="import-footer">
        <p id="import-help">Có thể dán Hanzi đơn lẻ hoặc Hanzi, Pinyin, nghĩa. Duplicate được giữ nguyên.</p>
        <button className="button button-primary" type="submit">Nhập danh sách</button>
      </div>
      {errors.length > 0 && <ul className="import-errors" role="alert">{errors.map((error) => <li key={error}>{error}</li>)}</ul>}
      {message && <p className="import-success" role="status">{message}</p>}
    </form>
  );
}
