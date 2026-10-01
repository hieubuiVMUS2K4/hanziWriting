# Hán Tự — website cá nhân luyện viết tiếng Trung

Ứng dụng frontend-only dùng React, TypeScript, Vite và Hanzi Writer. Không có tài khoản, backend hay cơ sở dữ liệu. Hanzi Writer tải dữ liệu thứ tự nét của từng chữ khi luyện; cần kết nối Internet để lấy dữ liệu chữ từ CDN của thư viện.

## Chạy ứng dụng

```bash
npm install
npm run dev
npm run build
```

## Lộ trình theo phase

### Phase 1 — Luồng luyện viết hoàn chỉnh cho `你好` (đang triển khai)

- Tích hợp Hanzi Writer vào lifecycle React và dọn instance khi đổi chữ.
- Luyện từng ký tự, phản hồi khi sai/đúng, xem animation thứ tự nét, viết lại.
- Tự chuyển từ `你` sang `好`, rồi hiển thị hoàn thành.
- Bản hiện tại dùng dữ liệu mẫu cố định trong `src/App.tsx`.

### Phase 2 — Vocabulary JSON

- Tạo `src/data/vocabulary.json` với `id`, `word`, `pinyin`, `meaning`.
- Thay từ mẫu bằng danh sách từ vựng và tách chữ bằng `Array.from()`.

### Phase 3 — Import vocabulary

- Thêm textarea nhận mỗi dòng một từ hoặc ba trường `Hanzi | Pinyin | nghĩa`.
- Kiểm tra dòng lỗi, giữ nguyên thứ tự và từ trùng; không tự loại duplicate.

### Phase 4 — Navigation và tiến độ

- Danh sách từ có thể chọn trực tiếp; nút trước/sau, bỏ qua và thanh tiến độ.
- Điều hướng giữa các từ và ký tự theo đúng thứ tự.

### Phase 5 — Lưu cục bộ

- Lưu danh sách cá nhân và vị trí học bằng `localStorage`.
- Có cách khôi phục dữ liệu mẫu nếu bộ nhớ cục bộ trống hoặc không hợp lệ.

### Phase 6 — Responsive và hoàn thiện

- Rà soát điện thoại, tablet, desktop, touch/stylus, focus và thông báo lỗi.
- Tối ưu trạng thái tải dữ liệu ký tự và giao diện hoàn thành.

Mỗi phase sẽ giữ ứng dụng ở trạng thái có thể chạy/build trước khi chuyển phase tiếp theo.

## Thêm từ vựng (Phase 2)

```json
[
  { "id": "1", "word": "你好", "pinyin": "nǐ hǎo", "meaning": "xin chào" },
  { "id": "2", "word": "老师", "pinyin": "lǎoshī", "meaning": "giáo viên" }
]
```

## Hanzi Writer

Ứng dụng dùng API `HanziWriter.create`, `writer.quiz()` với callbacks `onCorrectStroke`, `onMistake`, `onComplete`, `writer.animateCharacter()` và `writer.cancelQuiz()`. Tham khảo [tài liệu API chính thức](https://hanziwriter.org/docs.html).
