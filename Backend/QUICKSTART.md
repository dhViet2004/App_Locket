# 🚀 Locket Backend - Quick Start

## ⚡ Bắt đầu nhanh

### 1. Cài đặt
```bash
cd Backend
npm install
```

### 2. Chạy server
```bash
# Development
npm run dev

# Production
npm start

# Windows
scripts/start.bat
```

### 3. Kiểm tra
- Server: http://localhost:3001
- Health: http://localhost:3001/health
- API: http://localhost:3001/api

## 🔐 Test Authentication

### Đăng ký
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User",
    "username": "testuser"
  }'
```

### Đăng nhập
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

## 📱 Kết nối Frontend

```javascript
const API_URL = 'http://localhost:3001/api';

// Login
const login = async (email, password) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  return response.json();
};
```

## 🐳 Docker

```bash
# Build và chạy
docker-compose up -d

# Chỉ chạy backend
docker build -t locket-backend .
docker run -p 3001:3001 locket-backend
```

## 📊 Database

- File: `db.json`
- Backup: `db.json.backup`
- Reset: Xóa `db.json` và restart server

## 🔧 Troubleshooting

### Port đã được sử dụng
```bash
# Tìm process sử dụng port 3001
netstat -ano | findstr :3001

# Kill process (Windows)
taskkill /PID <PID> /F
```

### Database bị lock
```bash
# Xóa file lock
rm db.json.lock
```

## 📚 API Endpoints

- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/me` - Thông tin user
- `GET /api/posts` - Lấy posts
- `POST /api/posts` - Tạo post
- `POST /api/posts/:id/like` - Like post
- `GET /api/stories` - Lấy stories
- `GET /api/notifications` - Thông báo

## 🎯 Next Steps

1. Cấu hình environment variables
2. Setup production database
3. Implement rate limiting
4. Add logging
5. Setup monitoring

---
**Happy Coding! 🎉**
