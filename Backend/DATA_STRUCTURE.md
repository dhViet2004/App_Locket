# 🗄️ Locket Backend - Cấu trúc Database Modular

## 📋 Tổng quan

Backend Locket được thiết kế với cấu trúc modular để các team có thể làm việc song song mà không gây xung đột. Mỗi team quản lý các file JSON riêng biệt theo trách nhiệm của mình.

## 🏗️ Cấu trúc File

```
Backend/
├── 📁 data/                    # Thư mục chứa các file JSON riêng biệt
│   ├── users.json              # Team A - Auth/Profile
│   ├── friendships.json        # Team B - Friends/Social  
│   ├── photos.json             # Team C - Core Feature
│   └── reactions.json          # Team D - Engagement
├── 📁 scripts/                 # Scripts quản lý dữ liệu
│   └── sync-data.js           # Script đồng bộ dữ liệu
├── 📄 db.json                  # Database chính (tự động sync)
├── 📄 data-config.json         # Cấu hình team và endpoints
└── 📄 DATA_STRUCTURE.md        # Tài liệu này
```

## 👥 Phân chia Team

### Team A - Auth/Profile Team
- **File**: `data/users.json`
- **Trách nhiệm**: Đăng ký, đăng nhập, quản lý hồ sơ
- **Endpoints**:
  - `GET/POST /api/users`
  - `POST /api/auth/login`
  - `POST /api/auth/register`
  - `GET/PUT /api/auth/profile`

### Team B - Friends/Social Team
- **File**: `data/friendships.json`
- **Trách nhiệm**: Lời mời kết bạn, quản lý mối quan hệ
- **Endpoints**:
  - `GET/POST /api/friendships`
  - `GET /api/friendships/pending`
  - `PUT /api/friendships/accept`
  - `PUT /api/friendships/block`

### Team C - Core Feature Team
- **File**: `data/photos.json`
- **Trách nhiệm**: Upload ảnh, quản lý nội dung chính
- **Endpoints**:
  - `GET/POST /api/photos`
  - `POST /api/photos/upload`
  - `GET /api/photos/user/:userId`
  - `GET /api/photos/public`

### Team D - Engagement Team
- **File**: `data/reactions.json`
- **Trách nhiệm**: Like, reaction, tương tác người dùng
- **Endpoints**:
  - `GET/POST /api/reactions`
  - `GET /api/reactions/photo/:photoId`
  - `GET /api/reactions/user/:userId`

## 🔄 Quản lý Dữ liệu

### Scripts có sẵn

```bash
# Đồng bộ từ file riêng lẻ lên db.json chính
npm run sync-to-main

# Đồng bộ từ db.json chính xuống file riêng lẻ
npm run sync-from-main

# Tạo backup tất cả dữ liệu
npm run backup

# Xem trạng thái dữ liệu hiện tại
npm run status

# Xem thông tin team
npm run teams

# Setup ban đầu
npm run setup
```

### Quy trình làm việc

1. **Team làm việc với file riêng**:
   ```bash
   # Team A chỉnh sửa data/users.json
   # Team B chỉnh sửa data/friendships.json
   # etc...
   ```

2. **Đồng bộ lên database chính**:
   ```bash
   npm run sync-to-main
   ```

3. **Backup trước khi thay đổi lớn**:
   ```bash
   npm run backup
   ```

## 📊 Schema Database

### Users (Team A)
```json
{
  "id": 1,
  "email": "user@example.com",
  "username": "username",
  "password": "hashed_password",
  "avatarUrl": "https://...",
  "fullName": "Full Name",
  "bio": "User bio",
  "isVerified": false,
  "isPrivate": false,
  "followerCount": 0,
  "followingCount": 0,
  "postCount": 0,
  "createdAt": "2024-01-01T00:00:00Z",
  "lastActiveAt": "2024-01-01T00:00:00Z"
}
```

### Friendships (Team B)
```json
{
  "id": 1,
  "requesterId": 1,
  "receiverId": 2,
  "status": "pending|accepted|blocked",
  "createdAt": "2024-01-01T00:00:00Z",
  "acceptedAt": "2024-01-01T00:00:00Z",
  "blockedAt": "2024-01-01T00:00:00Z"
}
```

### Photos (Team C)
```json
{
  "id": 1,
  "userId": 1,
  "imageUrl": "https://...",
  "caption": "Photo caption",
  "location": "Location name",
  "tags": ["tag1", "tag2"],
  "isPublic": true,
  "viewCount": 0,
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

### Reactions (Team D)
```json
{
  "id": 1,
  "photoId": 1,
  "userId": 1,
  "emoji": "❤️",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

## 🚀 Bắt đầu

1. **Clone và cài đặt**:
   ```bash
   cd Backend
   npm install
   ```

2. **Setup ban đầu**:
   ```bash
   npm run setup
   ```

3. **Chạy server**:
   ```bash
   npm start
   ```

## 🔧 Tùy chỉnh

### Thêm Team mới
1. Tạo file JSON mới trong `data/`
2. Cập nhật `data-config.json`
3. Thêm endpoints vào `server.js`

### Thêm Resource mới
1. Tạo file JSON trong `data/`
2. Cập nhật `sync-data.js`
3. Thêm vào `db.json` chính

## 📝 Lưu ý

- **Luôn backup** trước khi thay đổi lớn
- **Sync thường xuyên** để tránh xung đột
- **Mỗi team** chỉ chỉnh sửa file của mình
- **Test kỹ** sau khi sync để đảm bảo không có lỗi

## 🆘 Troubleshooting

### Lỗi sync
```bash
# Kiểm tra trạng thái
npm run status

# Backup và reset
npm run backup
npm run sync-from-main
```

### Xung đột dữ liệu
```bash
# Backup hiện tại
npm run backup

# Sync từ main (ghi đè local)
npm run sync-from-main
```

### Mất dữ liệu
```bash
# Khôi phục từ backup
cp backups/db-*.json db.json
npm run sync-from-main
```
