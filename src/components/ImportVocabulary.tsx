import { useRef, useState } from 'react';
import type { FormEvent } from 'react';
import type { VocabularyItem } from '../types/vocabulary';
import { parseVocabulary } from '../utils/vocabularyParser';

type Props = { onImport: (items: VocabularyItem[]) => void };

export default function ImportVocabulary({ onImport }: Props) {
  const [text, setText] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = parseVocabulary(text);
    setErrors(result.errors);
    if (result.errors.length > 0 || result.items.length === 0) {
      if (result.errors.length === 0) setErrors(['Nhập ít nhất một dòng từ vựng.']);
      textareaRef.current?.focus();
      return;
    }
    onImport(result.items);
  }

  return (
    <form className="import-panel" onSubmit={submit}>
      <div className="import-heading">
        <h2>Thêm danh sách để luyện viết</h2>
        <p>Dán từ vựng của bạn theo một trong hai cách dưới đây.</p>
      </div>
      <div className="import-examples" aria-label="Ví dụ định dạng nhập">
        <div><span>Chỉ chữ Hán</span><code>你好<br />老师</code></div>
        <div><span>Chữ Hán · Pinyin · Nghĩa</span><code>你好 | ni3hao3 | xin chào<br />老师 | lao3shi1 | giáo viên</code></div>
      </div>
      <label className="import-label" htmlFor="vocabulary-input">DÁN DANH SÁCH TỪ VỰNG</label>
      <textarea
        id="vocabulary-input"
        ref={textareaRef}
        value={text}
        onChange={(event) => { setText(event.target.value); setErrors([]); }}
        placeholder={'你好 | ni3hao3 | xin chào\n老师 | lao3shi1 | giáo viên'}
        rows={6}
        aria-describedby={`import-help${errors.length ? ' import-errors' : ''}`}
        aria-invalid={errors.length > 0}
      />
      {errors.length > 0 && <ul id="import-errors" className="import-errors" role="alert">{errors.map((error) => <li key={error}>{error}</li>)}</ul>}
      <div className="import-footer">
        <p id="import-help">Mỗi dòng một từ; dùng TAB hoặc | cho ba trường. Từ trùng được giữ nguyên. Danh sách mới sẽ thay danh sách hiện tại và bắt đầu tiến độ mới.</p>
        <button className="button button-primary" type="submit">Nhập danh sách</button>
      </div>
    </form>
  );
}
