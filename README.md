# Hán Tự

Website frontend-only để học từ vựng tiếng Trung và luyện viết từng chữ Hán. Stack: React, TypeScript, Vite và Hanzi Writer. Không có backend, tài khoản hay cơ sở dữ liệu ngoài. Dữ liệu cá nhân và tiến độ được lưu trong `localStorage` của trình duyệt. Hanzi Writer lấy dữ liệu stroke của ký tự từ CDN nên cần Internet khi tải dữ liệu chữ lần đầu.

## Chạy ứng dụng

```bash
npm install
npm run dev
npm run build
```

## Các phase

### Phase 1 — Luồng luyện viết mẫu `你好` (đã hoàn thành)

- Hanzi Writer quiz kiểm tra thứ tự nét, có feedback, animation và reset.
- Tách từ thành ký tự bằng `Array.from()` và chuyển chữ sau khi hoàn tất.
- Cleanup quiz khi React thay ký tự hoặc unmount.

### Phase 2 — Vocabulary JSON (đã hoàn thành)

- `src/data/vocabulary.json` khởi tạo từ danh sách Pleco `pleco_msutong1_clean.txt`.
- Mỗi item gồm `id`, `word`, `pinyin`, `meaning`.
- Các dấu chấm lửng trong mẫu như `太……了` được bỏ khi tách ký tự luyện viết.

### Phase 3 — Import (đã hoàn thành)

- Nút **Nhập từ** mở trình nhập danh sách.
- Hỗ trợ mỗi dòng một từ; hoặc ba trường ngăn bởi TAB hay `|`.
- Bỏ qua dòng trống, báo dòng sai rõ ràng, giữ duplicate và thứ tự.
- Nhập danh sách mới sẽ thay danh sách hiện tại và được lưu cục bộ.

### Phase 4 — Điều hướng và tiến độ (đã hoàn thành)

- Sidebar từ vựng cho phép chọn trực tiếp từng từ.
- Có từ trước, từ tiếp theo, bỏ qua từ và bỏ qua ký tự thiếu stroke data.
- Hiển thị phần trăm, vị trí trong danh sách và các từ đã hoàn thành.

### Phase 5 — Lưu cục bộ (đã hoàn thành)

- Danh sách, vị trí hiện tại và từ đã luyện lưu bằng `localStorage`.
- Dữ liệu trống/sai định dạng quay về dữ liệu khởi tạo.
- Dữ liệu Pleco gốc vẫn được giữ riêng trong file TXT.

### Phase 6 — Responsive và hoàn thiện (đã hoàn thành)

- Layout desktop chuyển sang danh sách cuộn ngang trên màn hình nhỏ.
- Hỗ trợ thao tác touch/stylus trong vùng luyện; có trạng thái focus bàn phím và feedback đọc được bởi screen reader.
- Thông báo khi không tải được dữ liệu nét và cho phép bỏ qua chữ đó.

## Thêm dữ liệu mặc định

Sửa `src/data/vocabulary.json`:

```json
[
  { "id": "hello", "word": "你好", "pinyin": "ni3hao3", "meaning": "xin chào" },
  { "id": "teacher", "word": "老师", "pinyin": "lao3shi1", "meaning": "giáo viên" }
]
```

Nếu đã có danh sách tùy chỉnh trong localStorage, xóa key `hanziwriting.vocabulary.v1` để dùng lại JSON mặc định.

## Git repository

Repository local được khởi tạo trong thư mục này. Remote `origin`:

```text
https://github.com/hieubuiVMUS2K4/hanziWriting.git
```

Các thay đổi được lưu bằng commit Git và có thể đẩy lên remote bằng `git push -u origin master`.

## Hanzi Writer API

Tích hợp dùng `HanziWriter.create`, `writer.quiz()` với `onCorrectStroke`, `onMistake`, `onComplete`, `writer.animateCharacter()` và `writer.cancelQuiz()`. Tham khảo [tài liệu API chính thức](https://hanziwriter.org/docs.html).
