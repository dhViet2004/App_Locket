# 🚀 Locket Backend - Modular Setup

## ⚡ Quick Start

### 1. Setup ban đầu
```bash
cd Backend
npm install
npm run setup
```

### 2. Chạy server
```bash
npm start
# Server sẽ chạy tại http://localhost:3001
```

## 📁 Cấu trúc File

```
Backend/
├── 📁 data/                    # Files JSON riêng biệt
│   ├── users.json              # 👤 Team A - Auth/Profile
│   ├── friendships.json        # 👥 Team B - Friends/Social
│   ├── photos.json             # 📸 Team C - Core Feature
│   └── reactions.json          # ❤️ Team D - Engagement
├── 📁 scripts/
│   └── sync-data.js           # 🔄 Script đồng bộ dữ liệu
├── 📄 db.json                  # 🗄️ Database chính
├── 📄 data-config.json         # ⚙️ Cấu hình team
└── 📄 server.js               # 🚀 Main server
```

## 🔄 Quản lý Dữ liệu

### Scripts chính
```bash
# Đồng bộ file riêng → db.json chính
npm run sync-to-main

# Đồng bộ db.json chính → file riêng
npm run sync-from-main

# Tạo backup
npm run backup

# Xem trạng thái
npm run status

# Xem thông tin team
npm run teams
```

## 👥 Team Workflow

### Team A - Auth/Profile
- **File**: `data/users.json`
- **Chỉnh sửa**: User data, authentication
- **Sync**: `npm run sync-to-main`

### Team B - Friends/Social
- **File**: `data/friendships.json`
- **Chỉnh sửa**: Friend requests, relationships
- **Sync**: `npm run sync-to-main`

### Team C - Core Feature
- **File**: `data/photos.json`
- **Chỉnh sửa**: Photo uploads, content
- **Sync**: `npm run sync-to-main`

### Team D - Engagement
- **File**: `data/reactions.json`
- **Chỉnh sửa**: Likes, reactions, comments
- **Sync**: `npm run sync-to-main`

## 🛠️ Development Workflow

1. **Team làm việc với file riêng**
2. **Test local với file riêng**
3. **Sync lên database chính**: `npm run sync-to-main`
4. **Test với database chính**
5. **Deploy**

## 📊 API Endpoints

### Users (Team A)
- `GET/POST /api/users`
- `POST /api/auth/login`
- `POST /api/auth/register`

### Friendships (Team B)
- `GET/POST /api/friendships`
- `GET /api/friendships/pending`
- `PUT /api/friendships/accept`

### Photos (Team C)
- `GET/POST /api/photos`
- `POST /api/photos/upload`
- `GET /api/photos/user/:userId`

### Reactions (Team D)
- `GET/POST /api/reactions`
- `GET /api/reactions/photo/:photoId`

## 🔧 Troubleshooting

### Lỗi sync
```bash
npm run status
npm run backup
npm run sync-from-main
```

### Xung đột dữ liệu
```bash
npm run backup
npm run sync-from-main
```

### Reset hoàn toàn
```bash
npm run backup
rm data/*.json
npm run sync-from-main
```

## 📝 Best Practices

1. **Luôn backup** trước khi thay đổi lớn
2. **Sync thường xuyên** để tránh xung đột
3. **Mỗi team** chỉ chỉnh sửa file của mình
4. **Test kỹ** sau khi sync
5. **Commit thường xuyên** để tránh mất dữ liệu

## 🆘 Support

- **Documentation**: `DATA_STRUCTURE.md`
- **Config**: `data-config.json`
- **Scripts**: `scripts/sync-data.js`
- **Status**: `npm run status`
