# 🔧 Locket Backend - Admin Management Guide

## 👤 Admin User

**Default Admin Account:**
- **Email**: `admin@locket.com`
- **Username**: `locket_admin`
- **Password**: `admin123` (hashed in database)
- **Role**: `admin`
- **Permissions**: Full system access

## 🚀 Quick Start

### 1. Login as Admin
```bash
POST /api/auth/login
{
  "email": "admin@locket.com",
  "password": "admin123"
}
```

### 2. Use Admin Token
```bash
Authorization: Bearer <admin_jwt_token>
```

## 📊 Admin Endpoints

### 👥 User Management

#### Get All Users
```bash
GET /api/admin/users
Authorization: Bearer <token>
```

#### Get User by ID
```bash
GET /api/admin/users/:id
Authorization: Bearer <token>
```

#### Update User
```bash
PUT /api/admin/users/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "isVerified": true,
  "isPrivate": false,
  "role": "user"
}
```

#### Delete User
```bash
DELETE /api/admin/users/:id
Authorization: Bearer <token>
```

### 📸 Photo Management

#### Get All Photos (with filters)
```bash
GET /api/admin/photos?page=1&limit=20&userId=1&status=pending
Authorization: Bearer <token>
```

#### Moderate Photo
```bash
PUT /api/admin/photos/:id/moderate
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "approved",
  "reason": "Content is appropriate"
}
```

#### Delete Photo
```bash
DELETE /api/admin/photos/:id
Authorization: Bearer <token>
```

### ❤️ Reaction Management

#### Get All Reactions
```bash
GET /api/admin/reactions?page=1&limit=20&userId=1&photoId=1
Authorization: Bearer <token>
```

#### Delete Reaction
```bash
DELETE /api/admin/reactions/:id
Authorization: Bearer <token>
```

### 📈 Analytics

#### Get System Analytics
```bash
GET /api/admin/analytics
Authorization: Bearer <token>
```

**Response:**
```json
{
  "overview": {
    "totalUsers": 6,
    "totalPhotos": 8,
    "totalReactions": 23,
    "totalFriendships": 8,
    "activeUsers": 5
  },
  "photos": {
    "total": 8,
    "public": 6,
    "private": 2,
    "pending": 0,
    "approved": 8,
    "rejected": 0
  },
  "users": {
    "total": 6,
    "verified": 3,
    "private": 2,
    "admins": 1
  },
  "engagement": {
    "totalReactions": 23,
    "averageReactionsPerPhoto": "2.88",
    "mostUsedEmoji": {
      "emoji": "❤️",
      "count": 8
    }
  }
}
```

### ⚙️ System Info

#### Get System Status
```bash
GET /api/admin/system
Authorization: Bearer <token>
```

## 🛠️ Admin Scripts

### Check Admin Status
```bash
npm run admin
```

### Validate Admin Data
```bash
npm run validate-admin
```

### Sync Data
```bash
npm run sync-to-main
```

### Create Backup
```bash
npm run backup
```

## 🔐 Admin Permissions

### Available Permissions
- `manage_users` - Quản lý users
- `manage_photos` - Quản lý photos
- `moderate_content` - Kiểm duyệt nội dung
- `view_analytics` - Xem thống kê
- `system_settings` - Cài đặt hệ thống

### Permission Levels
1. **Full Admin**: Tất cả permissions
2. **Moderator**: `moderate_content`, `view_analytics`
3. **User Manager**: `manage_users`, `view_analytics`

## 📋 Content Moderation

### Photo Status Options
- `pending` - Chờ kiểm duyệt
- `approved` - Đã duyệt
- `rejected` - Từ chối

### Moderation Reasons
- `inappropriate_content` - Nội dung không phù hợp
- `spam` - Spam
- `copyright_violation` - Vi phạm bản quyền
- `harassment` - Quấy rối
- `other` - Khác

## 🚨 Security Best Practices

1. **Change Default Password**
   ```bash
   PUT /api/admin/users/6
   {
     "password": "$2b$10$newHashedPassword"
   }
   ```

2. **Regular Backups**
   ```bash
   npm run backup
   ```

3. **Monitor Admin Activity**
   - Check analytics regularly
   - Review moderation actions
   - Monitor system logs

4. **Role-Based Access**
   - Create different admin roles
   - Limit permissions as needed
   - Regular permission audits

## 📊 Monitoring & Analytics

### Key Metrics to Monitor
- **User Growth**: New registrations per day/week
- **Content Volume**: Photos uploaded per day
- **Engagement**: Reactions per photo
- **Moderation**: Pending content queue
- **System Health**: Server uptime, memory usage

### Daily Admin Tasks
1. Check pending content for moderation
2. Review user reports
3. Monitor system analytics
4. Backup data
5. Check system health

## 🔧 Troubleshooting

### Common Issues

#### Admin Login Failed
```bash
# Check admin user exists
npm run admin

# Validate admin data
npm run validate-admin
```

#### Permission Denied
```bash
# Check user role
GET /api/admin/users/:id

# Verify token
GET /api/admin/system
```

#### Data Sync Issues
```bash
# Sync from main database
npm run sync-from-main

# Create backup before sync
npm run backup
```

## 📞 Support

- **Documentation**: `DATA_STRUCTURE.md`
- **Setup Guide**: `MODULAR_SETUP.md`
- **API Reference**: `http://localhost:3001/api`
- **Health Check**: `http://localhost:3001/health`

## 🎯 Admin Dashboard Features

### Planned Features
- [ ] Real-time moderation queue
- [ ] User activity monitoring
- [ ] Content analytics dashboard
- [ ] Automated moderation rules
- [ ] Bulk operations
- [ ] Export/Import tools
- [ ] Audit logs
- [ ] Notification system

### Current Capabilities
- ✅ User management
- ✅ Photo moderation
- ✅ Reaction management
- ✅ System analytics
- ✅ Data backup/restore
- ✅ Role-based permissions
