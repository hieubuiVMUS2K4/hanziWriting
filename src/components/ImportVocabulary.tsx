import { useRef, useState } from 'react';
import type { FormEvent } from 'react';
import type { VocabularyItem } from '../types/vocabulary';
import { parseVocabulary } from '../utils/vocabularyParser';

type Props = {
  topics: string[];
  initialTopic: string;
  onImport: (items: VocabularyItem[]) => void;
};

export default function ImportVocabulary({ topics, initialTopic, onImport }: Props) {
  const [topic, setTopic] = useState(initialTopic);
  const [text, setText] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const topicRef = useRef<HTMLInputElement>(null);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = parseVocabulary(text, topic);
    setErrors(result.errors);
    if (result.errors.length > 0 || result.items.length === 0) {
      if (result.errors.length === 0) setErrors(['Nhập ít nhất một dòng từ vựng.']);
      if (!topic.trim()) topicRef.current?.focus();
      else textareaRef.current?.focus();
      return;
    }
    onImport(result.items);
  }

  return (
    <form className="import-panel" onSubmit={submit}>
      <div className="import-heading">
        <h2>Nhập chủ đề và từ vựng</h2>
        <p>Nhập chủ đề mới hoặc chọn chủ đề có sẵn, rồi thêm các từ cần luyện.</p>
      </div>
      <label className="import-label" htmlFor="import-topic">TÊN CHỦ ĐỀ</label>
      <input
        id="import-topic"
        className="import-topic-input"
        ref={topicRef}
        type="text"
        list="import-topic-options"
        value={topic}
        onChange={(event) => { setTopic(event.target.value); setErrors([]); }}
        placeholder="Ví dụ: Du lịch, Gia đình, Ăn uống"
        required
        aria-describedby={`import-topic-help${errors.length && !topic.trim() ? ' import-errors' : ''}`}
        aria-invalid={errors.length > 0 && !topic.trim()}
      />
      <datalist id="import-topic-options">
        {topics.map((name) => <option key={name} value={name} />)}
      </datalist>
      <p id="import-topic-help" className="import-topic-help">Mọi từ bên dưới sẽ được thêm vào chủ đề này. Dùng tên chủ đề có sẵn để bổ sung từ.</p>
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
        aria-invalid={errors.length > 0 && Boolean(topic.trim())}
      />
      {errors.length > 0 && <ul id="import-errors" className="import-errors" role="alert">{errors.map((error) => <li key={error}>{error}</li>)}</ul>}
      <div className="import-footer">
        <p id="import-help">Mỗi dòng một từ; dùng TAB hoặc | cho ba trường. Chủ đề được lấy từ ô tên phía trên, kể cả khi dòng có trường chủ đề thứ tư. Từ trùng được giữ nguyên. Danh sách và tiến độ đã học vẫn được giữ.</p>
        <button className="button button-primary" type="submit">Thêm từ vào chủ đề</button>
      </div>
    </form>
  );
}
