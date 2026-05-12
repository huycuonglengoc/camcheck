# Hướng dẫn Deploy lên Railway

## Chuẩn bị

### 1. Cài Railway CLI (tùy chọn)
```bash
npm install -g @railway/cli
railway login
```

---

## Các bước Deploy

### Bước 1: Tạo project trên Railway
1. Vào [railway.app](https://railway.app) → **New Project**
2. Chọn **Deploy from GitHub repo** → chọn repo `camcheck`

### Bước 2: Thêm Redis service
1. Trong project Railway, click **+ New Service**
2. Chọn **Redis**
3. Railway sẽ tự động tạo Redis và inject các biến môi trường:
   - `REDIS_URL` (internal, dùng trong production)
   - `REDIS_PRIVATE_URL` (alias của REDIS_URL)

> **Lưu ý**: `lib/storage.ts` đã được cấu hình để tự động nhận `REDIS_URL` từ Railway — không cần cấu hình thêm gì!

### Bước 3: Cấu hình Environment Variables cho Next.js service
Trong Railway dashboard → chọn **Next.js service** → tab **Variables**, thêm:

| Variable | Value |
|---|---|
| `ADMIN_USERNAME` | `your_admin_username` |
| `ADMIN_PASSWORD` | `your_secure_password` |
| `JWT_SECRET` | *(xem hướng dẫn bên dưới để tạo chuỗi này)* |
| `PORT` | `3000` *(Railway tự set, không cần thêm)* |

> **Không cần** thêm `REDIS_URL` thủ công — Railway tự inject từ Redis service nếu cùng project.

### Bước 4: Cấu hình Start Command
Railway sẽ tự đọc `railway.json`. Build command: `npm run build`, start: `npm run start`.

---

## Generate JWT_SECRET ngẫu nhiên

`JWT_SECRET` là chuỗi bí mật dùng để mã hóa token đăng nhập admin. Bạn cần tạo một chuỗi random rồi điền vào Railway.

**Các bước thực hiện:**

1. Mở **Terminal trên máy tính của bạn** (máy local, không phải trên Railway)
2. Chạy lệnh sau (yêu cầu đã cài Node.js):
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```
3. Lệnh sẽ in ra một chuỗi hex dài ~128 ký tự, ví dụ:
   ```
   a3f1b2c4d5e6f7...abc123def456
   ```
4. **Copy toàn bộ chuỗi** đó
5. Vào **Railway Dashboard** → chọn **Next.js service** → tab **Variables**
6. Tìm biến `JWT_SECRET` (đã thêm ở Bước 3) → **Paste chuỗi vừa copy** vào ô Value
7. Nhấn **Save** / **Deploy**

> **Lưu ý:** Bạn cũng có thể dùng lệnh thay thế: `openssl rand -hex 64`

---

## Kiểm tra sau deploy

1. Truy cập URL Railway cấp (dạng `https://xxx.railway.app`)
2. Vào `/admin/login` để đăng nhập admin
3. Thêm quảng cáo và kiểm tra chúng xuất hiện trên trang chính

---

## Cấu trúc biến môi trường Railway Redis

Railway tự động inject khi cùng project:
```
REDIS_URL=redis://default:<password>@<host>.railway.internal:6379
REDIS_PRIVATE_URL=redis://default:<password>@<host>.railway.internal:6379
```

Code trong `lib/storage.ts` chỉ sử dụng internal URL: `REDIS_PRIVATE_URL` → `REDIS_URL`.

> **Lưu ý**: `REDIS_PUBLIC_URL` không được sử dụng vì có thể gây lỗi protocol khi Railway proxy qua HTTP.
