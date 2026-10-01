# Hán Tự — Hanzi Writing

Ứng dụng web học từ vựng tiếng Trung và luyện viết chữ Hán theo thứ tự nét, dành cho người học sử dụng tiếng Việt. Mỗi từ đi kèm Pinyin, nghĩa tiếng Việt và bài luyện riêng cho từng chữ.

Hán Tự chạy trực tiếp trong trình duyệt với **React, TypeScript, Vite và Hanzi Writer**. Danh sách học, tiến độ và cài đặt được lưu cục bộ, không cần đăng ký tài khoản.

## Tính năng

- **Luyện viết từng chữ:** kiểm tra thứ tự nét, phản hồi khi viết đúng hoặc sai và tự chuyển sang chữ chưa hoàn thành.
- **Xem thứ tự nét:** phát hoạt ảnh minh họa rồi tiếp tục bài luyện.
- **Tự kiểm tra trí nhớ:** ẩn nét mẫu hoặc ẩn cả gợi ý chữ Hán để viết dựa trên Pinyin và nghĩa.
- **Tùy chỉnh nét bút:** điều chỉnh độ dày từ 2 đến 16 px.
- **Quản lý danh sách học:** chọn từ trực tiếp, chuyển từ trước/sau, bỏ qua chữ hoặc từ và luyện lại từ đã hoàn thành.
- **Nhập từ vựng riêng:** hỗ trợ danh sách chữ Hán và định dạng ba trường từ Pleco.
- **Theo dõi tiến độ:** hiển thị số chữ đã viết đúng, số từ hoàn thành và tỷ lệ hoàn thành toàn danh sách.
- **Giao diện thích ứng:** sử dụng trên máy tính và thiết bị di động, hỗ trợ chuột, cảm ứng và bút cảm ứng.

## Bắt đầu

### Yêu cầu

- Node.js 22 hoặc phiên bản mới hơn tương thích với các dependency trong dự án.
- npm.
- Kết nối Internet để cài dependency và tải dữ liệu nét chữ từ CDN của Hanzi Writer.

### Cài đặt và chạy

```bash
git clone https://github.com/hieubuiVMUS2K4/hanziWriting.git
cd hanziWriting
npm ci
npm run dev
```

Mở địa chỉ được Vite hiển thị trong terminal.

### Các lệnh

| Lệnh | Chức năng |
| --- | --- |
| `npm ci` | Cài dependency theo `package-lock.json` |
| `npm run dev` | Khởi động máy chủ phát triển |
| `npm run build` | Kiểm tra TypeScript và tạo bản production trong `dist/` |
| `npm run preview` | Xem bản build production trên máy cục bộ |

Để xem bản production:

```bash
npm run build
npm run preview
```

## Hướng dẫn sử dụng

1. Chọn một từ trong danh sách. Trên màn hình nhỏ, nhấn **Chọn từ** để mở danh sách.
2. Đọc Pinyin và nghĩa, sau đó viết từng nét trong ô luyện theo đúng thứ tự.
3. Dùng **Xem thứ tự nét** khi cần xem mẫu hoặc **Viết lại** để bắt đầu lại chữ hiện tại.
4. Mở cài đặt bằng biểu tượng bánh răng để điều chỉnh độ dày nét bút, ẩn nét mẫu hoặc ẩn gợi ý chữ Hán.
5. Hoàn thành mọi chữ trong từ, rồi chọn **Từ chưa hoàn thành** để tiếp tục.

Khi ẩn gợi ý chữ Hán, ứng dụng ẩn chữ và nét mẫu, đồng thời vô hiệu hóa nút xem thứ tự nét. Khi chỉ ẩn nét mẫu, chữ Hán vẫn hiển thị bên ngoài ô viết; gợi ý nét tự động được tắt nhưng bài luyện vẫn kiểm tra thứ tự nét.

### Cách tính tiến độ

Tiến độ toàn danh sách bằng số vị trí chữ đã viết đúng chia cho tổng số vị trí chữ cần luyện. Mỗi vị trí chỉ được tính một lần; các dòng từ vựng trùng nhau được theo dõi riêng.

- Một từ chỉ hoàn thành khi mọi chữ trong từ đã được viết đúng.
- Xem hoạt ảnh, chuyển từ hoặc bỏ qua chữ/từ không làm tăng tiến độ.
- **Viết lại** bắt đầu lại bài luyện của chữ hiện tại.
- **Luyện lại từ này** xóa kết quả của từ đang chọn.
- Các mẫu như `太……了` chỉ luyện chữ Hán; dấu câu không được tính vào tiến độ.

## Nhập từ vựng

Nhấn **Nhập từ**, dán danh sách và chọn **Nhập danh sách**. Mỗi dòng tương ứng với một mục học.

### Chỉ chữ Hán

```text
你好
老师
```

### Chữ Hán, Pinyin và nghĩa

Dùng dấu `|` hoặc ký tự TAB để phân cách đúng ba trường:

```text
你好 | ni3hao3 | xin chào
老师 | lao3shi1 | giáo viên
```

Có thể dán trực tiếp nội dung từ [pleco_msutong1_clean.txt](./pleco_msutong1_clean.txt), vốn sử dụng TAB giữa các trường.

Ứng dụng nhận Pinyin có số hoặc dấu thanh. Pinyin dạng số được chuyển sang dấu thanh khi hiển thị, ví dụ `ni3hao3` → `nǐ hǎo`. Dòng trống được bỏ qua; thứ tự và các từ trùng được giữ nguyên.

Nếu có dòng không hợp lệ, ứng dụng hiển thị lỗi theo số dòng và giữ danh sách hiện tại để bạn sửa nội dung trước khi nhập lại.

> Nhập thành công sẽ thay thế danh sách hiện tại và bắt đầu tiến độ mới. Hãy giữ bản gốc danh sách của bạn nếu cần dùng lại.

## Dữ liệu và lưu trữ

Dữ liệu mặc định nằm trong [src/data/vocabulary.json](./src/data/vocabulary.json), với cấu trúc:

```json
[
  {
    "id": "hello",
    "word": "你好",
    "pinyin": "ni3hao3",
    "meaning": "xin chào"
  },
  {
    "id": "teacher",
    "word": "老师",
    "pinyin": "lao3shi1",
    "meaning": "giáo viên"
  }
]
```

Mỗi mục cần có `id` duy nhất, `word` chứa ít nhất một chữ Hán và các trường `pinyin`, `meaning` dạng chuỗi.

Ứng dụng sử dụng các khóa `localStorage` sau:

| Khóa | Nội dung |
| --- | --- |
| `hanziwriting.vocabulary.v1` | Danh sách từ vựng |
| `hanziwriting.progress.v2` | Vị trí học và các chữ đã hoàn thành |
| `hanziwriting.settings.v1` | Độ dày nét bút và cài đặt gợi ý |

Dữ liệu được lưu riêng theo trình duyệt và địa chỉ website, không đồng bộ giữa các thiết bị. Xóa dữ liệu website sẽ xóa danh sách tùy chỉnh, tiến độ và cài đặt. Dữ liệu trên localhost cũng độc lập với dữ liệu trên tên miền Vercel.

Để dùng lại JSON mặc định sau khi chỉnh sửa, xóa khóa `hanziwriting.vocabulary.v1` trong Developer Tools → Application → Local Storage rồi tải lại trang. Danh sách tùy chỉnh đã lưu không tự nhận các mục mới thêm vào JSON.

Ứng dụng hỗ trợ chuyển tiến độ cũ từ `hanziwriting.progress.v1` sang v2. Bản v1 không phân biệt chữ viết đúng với chữ bỏ qua, nên kết quả từ đã hoàn thành được giữ lại; có thể dùng **Luyện lại từ này** để học lại.

## Triển khai trên Vercel

Import repository GitHub vào Vercel và sử dụng cấu hình sau:

| Thiết lập | Giá trị |
| --- | --- |
| Framework Preset | `Vite` |
| Root Directory | Thư mục gốc repository |
| Install Command | `npm ci` |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Production Branch | `master` — hoặc nhánh bạn chọn để phát hành |

Nhấn **Deploy** để tạo website. Mã nguồn hiện tại không yêu cầu biến môi trường hay backend riêng.

Sau khi kết nối Git, mỗi lần push lên nhánh production sẽ kích hoạt triển khai production; các nhánh khác tạo bản preview theo cấu hình dự án. Không cần đưa `dist/` hoặc `node_modules/` lên GitHub.

Tham khảo [Vite trên Vercel](https://vercel.com/docs/frameworks/frontend/vite) và [triển khai qua Git](https://vercel.com/docs/git).

## Cấu trúc dự án

```text
src/
├── App.tsx                       # Điều phối danh sách học, tiến độ và lưu trữ
├── main.tsx                      # Khởi tạo ứng dụng React
├── components/
│   ├── CharacterPractice.tsx     # Tích hợp Hanzi Writer và bài luyện từng chữ
│   ├── ImportVocabulary.tsx      # Giao diện nhập danh sách
│   └── PracticeSettings.tsx      # Cài đặt luyện viết
├── data/
│   └── vocabulary.json           # Từ vựng mặc định
├── types/
│   └── vocabulary.ts             # Kiểu dữ liệu từ vựng
├── utils/
│   ├── pinyin.ts                 # Định dạng Pinyin
│   ├── progress.ts               # Tính và khôi phục tiến độ
│   └── vocabularyParser.ts       # Phân tích, kiểm tra dữ liệu nhập
├── styles.css                    # Giao diện chính
├── responsive.css                # Bố cục thích ứng
└── learning-controls.css         # Giao diện điều khiển luyện viết

pleco_msutong1_clean.txt           # Danh sách Pleco gốc
vite.config.ts                    # Cấu hình Vite
```

## Giới hạn hiện tại

- Dữ liệu nét chữ phụ thuộc CDN của Hanzi Writer; ứng dụng chưa có cơ chế tải sẵn để học hoàn toàn ngoại tuyến.
- Khi không tải được dữ liệu nét, ứng dụng thông báo và cho phép bỏ qua chữ đó.
- Việc lưu tiến độ phụ thuộc khả năng sử dụng `localStorage` của trình duyệt.
- Giao diện đã được kiểm tra với viewport mô phỏng 320–1440 px; trải nghiệm trên điện thoại thật cần được kiểm tra thêm.

## Đóng góp

Issue và pull request có thể gửi tại [repository GitHub](https://github.com/hieubuiVMUS2K4/hanziWriting). Khi thay đổi mã nguồn, hãy mô tả hành vi trước/sau và cách kiểm tra; chạy `npm run build` để kiểm tra TypeScript và khả năng tạo bản production.

## Tài liệu tham khảo

- [Hanzi Writer API](https://hanziwriter.org/docs.html)
- [CC-CEDICT / MDBG](https://www.mdbg.net/chinese/dictionary) — tham khảo từ vựng và phiên âm