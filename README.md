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

Tiến độ được tính bằng số vị trí ký tự đã viết đúng chia cho tổng ký tự trong danh sách. Mỗi vị trí chỉ được tính một lần; hai từ trùng ở hai dòng được theo dõi riêng. Chọn từ, bỏ qua chữ/từ hoặc xem animation không cộng tiến độ. Chỉ khi mọi chữ trong một từ đã được viết đúng thì từ đó mới được đánh dấu hoàn thành. Phần đã học được giữ lại khi chuyển từ; **Luyện lại từ này** xóa kết quả của riêng từ đang chọn.

### Phase 5 — Lưu cục bộ (đã hoàn thành)

- Danh sách, vị trí hiện tại và từ đã luyện lưu bằng `localStorage`.
- Dữ liệu trống/sai định dạng quay về dữ liệu khởi tạo.
- Dữ liệu Pleco gốc vẫn được giữ riêng trong file TXT.

Tiến độ theo từng chữ lưu ở `hanziwriting.progress.v2`; bản mới chuyển các từ đã đánh dấu hoàn thành trong dữ liệu v1 sang v2. Bản v1 không ghi riêng lượt viết đúng và lượt bỏ qua, nên kết quả từ cũ được giữ nguyên; dùng **Luyện lại từ này** để xóa kết quả cũ của từ đó nếu cần. Độ dày nét bút và trạng thái nét mẫu lưu ở `hanziwriting.settings.v1`.

### Phase 6 — Responsive và hoàn thiện (đã hoàn thành)

- Mobile hiển thị thông tin từ trước ô viết; danh sách từ thu gọn, mở bằng nút **Chọn từ**.
- Ô viết tự điều chỉnh kích thước với `ResizeObserver` và API `updateDimensions` của Hanzi Writer để giữ đúng tọa độ nhận nét khi xoay/đổi kích thước màn hình.
- Các nút trên thiết bị touch có vùng chạm tối thiểu 44px; form nhập dùng chữ 16px để dễ thao tác trên điện thoại.
- Hỗ trợ thao tác touch/stylus trong vùng luyện; có trạng thái focus bàn phím và feedback đọc được bởi screen reader.
- Thông báo khi không tải được dữ liệu nét và cho phép bỏ qua chữ đó.

Đã kiểm tra bằng Chrome với viewport 320–1440px: không tràn ngang, chọn từ và nhập cấu trúc dài bằng touch, viết hoàn chỉnh chữ `你` rồi chuyển sang `好` sau khi resize giữa bài luyện. Các kiểm tra này dùng trình duyệt mô phỏng mobile; chưa kiểm tra trên điện thoại thật.

## Cài đặt luyện viết

- **Độ dày nét bút**: thanh trượt 2–16px điều chỉnh nét đang vẽ, không làm mất những nét đã viết đúng.
- Bỏ chọn **Hiện nét mẫu** để tự viết trên ô trống. Chế độ này cũng tắt gợi ý nét tự động khi viết sai; vẫn kiểm tra thứ tự nét.
- Có thể xem animation chủ động, sau đó tiếp tục tại nét chưa hoàn thành. **Viết lại** bắt đầu lại chữ hiện tại.

Pinyin trên website hiển thị dấu thanh, ví dụ `ni3hao3` → `nǐ hǎo`. JSON và file Pleco giữ tone number để import. Đã sửa các mục `马`, `怎么样`, `一点儿`, `这儿`, `有空儿`, `空儿` và cách viết hoa `广场`; đuôi 儿 hóa không được ghi như một âm tiết `r5`. Các mục mặc định đã lưu cục bộ tự nhận phiên âm được cập nhật. Tham khảo [CC-CEDICT/MDBG](https://www.mdbg.net/chinese/dictionary?page=worddict&wdqb=%E9%A9%AC&wdrst=0).

Form nhập từ nhận cả Pinyin số và dấu thanh; giữ từ trùng và bỏ dòng trống. Nếu có dòng sai, form hiển thị lỗi và giữ nguyên dữ liệu nhập cùng danh sách hiện tại để sửa trước khi nhập lại.

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
