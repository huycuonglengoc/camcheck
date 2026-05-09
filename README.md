# CamCheck - Webcam Test Online

CamCheck là một ứng dụng web (Web App) được xây dựng bằng Next.js, cho phép người dùng kiểm tra webcam của họ trực tuyến một cách nhanh chóng và an toàn. Ứng dụng cũng bao gồm một Admin Panel để quản lý các banner quảng cáo hiển thị trên trang web.

## Tính năng chính

### 1. Dành cho Người dùng (Trang chủ)
- **Kiểm tra Webcam**: Xem trực tiếp camera với độ trễ thấp.
- **Phát hiện thiết bị**: Tự động nhận diện độ phân giải, tốc độ khung hình (FPS) và trạng thái hoạt động.
- **Chuyển đổi thiết bị**: Cho phép chọn giữa nhiều camera nếu có.
- **Tùy chỉnh hình ảnh**: Hỗ trợ lật ảnh (mirror), điều chỉnh độ sáng (brightness) và độ tương phản (contrast).
- **An toàn & Riêng tư**: Mọi thao tác xử lý video đều diễn ra trên trình duyệt (client-side), không có dữ liệu hình ảnh nào được gửi lên server.

### 2. Dành cho Quản trị viên (Admin Panel)
- **Đăng nhập bảo mật**: Sử dụng JWT (JSON Web Tokens) lưu trong HTTP-only cookies để xác thực.
- **Quản lý Quảng cáo (Ad Banners)**:
  - Thêm, sửa, xóa các banner quảng cáo.
  - Hỗ trợ 4 vị trí: Top Banner, Bottom Banner, Left Sidebar, Right Sidebar.
  - Bật/tắt trạng thái hiển thị của từng banner.
- **Thống kê**: Xem tổng quan số lượng banner đang hoạt động theo từng vị trí.

## Công nghệ sử dụng

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Ngôn ngữ**: TypeScript
- **Giao diện**: CSS Modules & Global CSS (Thiết kế hiện đại, Glassmorphism, Dark Theme)
- **Cơ sở dữ liệu**: Upstash Redis (lưu trữ banner quảng cáo trên Vercel) + In-memory fallback (cho môi trường local).
- **Xác thực**: `jose` (JWT signing & verification)
- **Icons/UI**: SVG tĩnh, Animations tùy chỉnh.

## Cấu trúc thư mục (Highlights)

```text
camcheck/
├── app/
│   ├── admin/                # Giao diện Admin Panel
│   │   ├── login/            # Trang đăng nhập Admin
│   │   ├── admin.module.css  # Styles cho Admin Panel
│   │   └── page.tsx          # Dashboard quản lý quảng cáo
│   ├── api/                  # API Routes
│   │   ├── ads/              # API CRUD cho Ad Banners (Bảo vệ bởi Auth)
│   │   └── auth/             # API Đăng nhập/Đăng xuất
│   ├── globals.css           # Design system & CSS chung
│   ├── page.module.css       # Styles cho trang chủ
│   └── page.tsx              # Trang chủ kiểm tra Webcam
├── components/
│   └── AdBannerDisplay.tsx   # Component hiển thị quảng cáo theo vị trí
├── lib/
│   ├── auth.ts               # Tiện ích xử lý JWT & Session
│   └── storage.ts            # Tiện ích kết nối Redis / In-memory DB
├── middleware.ts             # Route Protection (Bảo vệ thư mục /admin)
└── next.config.ts            # Cấu hình Next.js
```

## Hướng dẫn cài đặt & Chạy Local

### 1. Cài đặt dependencies
```bash
npm install
```

### 2. Cấu hình biến môi trường
Tạo file `.env.local` ở thư mục gốc (nếu chưa có) và thêm các biến sau:
```env
# Tài khoản đăng nhập Admin (Thay đổi khi lên Production!)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123

# Khóa bí mật cho JWT (Tạo một chuỗi ngẫu nhiên, dài)
JWT_SECRET=your-super-secret-jwt-key-change-this

# (Tùy chọn) Cấu hình Upstash Redis để lưu dữ liệu vĩnh viễn
# Lấy từ https://console.upstash.com/
# UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
# UPSTASH_REDIS_REST_TOKEN=AXxx...
```
*Lưu ý: Nếu không có cấu hình Redis, ứng dụng sẽ dùng bộ nhớ tạm (In-memory) khi chạy local. Dữ liệu sẽ mất khi khởi động lại server.*

### 3. Chạy Development Server
```bash
npm run dev
```
Truy cập:
- Trang chủ: `http://localhost:3000`
- Admin Panel: `http://localhost:3000/admin` (Mặc định: admin / admin123)

## Triển khai (Deployment) lên Vercel

1. Đẩy mã nguồn lên GitHub.
2. Đăng nhập vào [Vercel](https://vercel.com/) và tạo project mới từ repository đó.
3. Thiết lập các **Environment Variables** trên Vercel:
   - `ADMIN_USERNAME`
   - `ADMIN_PASSWORD`
   - `JWT_SECRET`
   - `UPSTASH_REDIS_REST_URL` (Bắt buộc để lưu quảng cáo)
   - `UPSTASH_REDIS_REST_TOKEN` (Bắt buộc để lưu quảng cáo)
4. Tích hợp Upstash Redis:
   - Trong dashboard Vercel, chuyển sang tab **Storage**.
   - Tạo mới hoặc kết nối với database **Upstash Redis**. Vercel sẽ tự động thêm các biến môi trường `UPSTASH_REDIS_*`.
5. Nhấn Deploy.

## Ghi chú cho việc bảo trì
- **Tùy chỉnh Giao diện**: Mọi token màu sắc, kích thước, hiệu ứng đều nằm trong `app/globals.css` (phần `:root`).
- **Middleware Deprecation**: Project đang dùng Next.js 16, nếu có warning về `middleware`, có thể tham khảo tài liệu Next.js để chuyển sang file config `proxy` trong tương lai nếu cần, nhưng hiện tại file `middleware.ts` vẫn hoạt động bình thường để bảo vệ route `/admin`.
- **Thêm vị trí quảng cáo**: Cần update type `AdPosition` trong `lib/storage.ts` và danh sách `POSITIONS` trong `app/admin/page.tsx` và `app/page.tsx`.
