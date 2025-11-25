# Setup Guide - Admin Dashboard

## Lỗi ERR_CONNECTION_REFUSED

Lỗi này xảy ra khi frontend không thể kết nối đến backend. Hãy làm theo các bước sau:

### 1. Tạo file `.env` trong thư mục `App_Locket/ManagerLocket/`

Tạo file `.env` với nội dung:
```
VITE_API_BASE_URL=http://localhost:4000
```

### 2. Đảm bảo Backend đang chạy

Mở terminal mới và chạy backend:

```bash
cd App_Locket/Backend
npm install  # Nếu chưa cài
npm run dev
```

Backend sẽ chạy tại: `http://localhost:4000`

### 3. Chạy Frontend

Trong terminal khác:

```bash
cd App_Locket/ManagerLocket
npm install  # Nếu chưa cài
npm run dev
```

Frontend sẽ chạy tại: `http://localhost:5173`

### 4. Kiểm tra

- Backend đang chạy: Mở `http://localhost:4000/api/health` trong browser, phải thấy `{"ok":true}`
- Frontend đang chạy: Mở `http://localhost:5173/admin/login`

### 5. Troubleshooting

**Nếu vẫn lỗi:**

1. **Kiểm tra port backend:**
   ```bash
   # Windows
   netstat -ano | findstr :4000
   
   # Nếu không có kết quả, backend chưa chạy
   ```

2. **Kiểm tra CORS:**
   - Backend đã config CORS cho phép tất cả origins (`cors()`)
   - Nếu vẫn lỗi, kiểm tra file `App_Locket/Backend/src/app.ts`

3. **Kiểm tra MongoDB:**
   - Backend cần MongoDB đang chạy
   - Kiểm tra `MONGO_URI` trong `.env` của backend

4. **Kiểm tra file .env:**
   - Đảm bảo file `.env` trong `ManagerLocket` có đúng format
   - Không có khoảng trắng thừa
   - Không có dấu ngoặc kép

### 6. Test API trực tiếp

Mở browser và test:
- `http://localhost:4000/api/health` → Phải trả về `{"ok":true}`
- `http://localhost:4000/api/plans` → Phải trả về danh sách plans (hoặc lỗi auth nếu cần token)

