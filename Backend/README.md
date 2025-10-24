# 🔐 Locket Backend API

Backend API cho ứng dụng Locket sử dụng JSON Server với authentication và các tính năng social media.

## 🚀 Tính năng

- ✅ **Authentication**: Đăng ký, đăng nhập với JWT
- ✅ **User Management**: Quản lý profile, avatar, bio
- ✅ **Posts**: Tạo, xem, like/unlike posts
- ✅ **Comments**: Thêm, xem comments
- ✅ **Stories**: Tạo stories với thời gian hết hạn
- ✅ **Notifications**: Hệ thống thông báo
- ✅ **Follow System**: Theo dõi người dùng
- ✅ **Real-time Data**: JSON Server với middleware

## 📦 Cài đặt

```bash
# Di chuyển vào thư mục Backend
cd Backend

# Cài đặt dependencies
npm install

# Hoặc sử dụng yarn
yarn install
```

## 🏃‍♂️ Chạy Server

```bash
# Chạy server development
npm run dev

# Hoặc chạy server production
npm start

# Chạy JSON Server đơn giản
npm run json-server
```

Server sẽ chạy tại: `http://localhost:3001`

## 📚 API Endpoints

### 🔐 Authentication

#### Đăng ký
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "username": "johndoe"
}
```

#### Đăng nhập
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Lấy thông tin user
```http
GET /api/auth/me
Authorization: Bearer <token>
```

#### Cập nhật profile
```http
PUT /api/auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Doe Updated",
  "bio": "New bio",
  "avatar": "https://example.com/avatar.jpg"
}
```

### 📱 Posts

#### Lấy tất cả posts
```http
GET /api/posts
Authorization: Bearer <token>
```

#### Tạo post mới
```http
POST /api/posts
Authorization: Bearer <token>
Content-Type: application/json

{
  "imageUrl": "https://example.com/image.jpg",
  "caption": "Beautiful sunset!",
  "location": "Beach, California"
}
```

#### Like/Unlike post
```http
POST /api/posts/:id/like
Authorization: Bearer <token>
```

### 💬 Comments

#### Lấy comments của post
```http
GET /api/posts/:id/comments
Authorization: Bearer <token>
```

#### Thêm comment
```http
POST /api/posts/:id/comments
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "Great post! 🔥"
}
```

### 📖 Stories

#### Lấy tất cả stories
```http
GET /api/stories
Authorization: Bearer <token>
```

#### Tạo story mới
```http
POST /api/stories
Authorization: Bearer <token>
Content-Type: application/json

{
  "imageUrl": "https://example.com/story.jpg"
}
```

### 🔔 Notifications

#### Lấy notifications
```http
GET /api/notifications
Authorization: Bearer <token>
```

#### Đánh dấu đã đọc
```http
PUT /api/notifications/:id/read
Authorization: Bearer <token>
```

## 🗄️ Database Schema

### Users
```json
{
  "id": 1,
  "email": "user@example.com",
  "password": "hashed_password",
  "name": "John Doe",
  "username": "johndoe",
  "avatar": "https://example.com/avatar.jpg",
  "bio": "User bio",
  "isVerified": false,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### Posts
```json
{
  "id": 1,
  "userId": 1,
  "imageUrl": "https://example.com/image.jpg",
  "caption": "Post caption",
  "location": "Location",
  "likes": 10,
  "comments": 5,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### Comments
```json
{
  "id": 1,
  "postId": 1,
  "userId": 2,
  "content": "Comment content",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### Stories
```json
{
  "id": 1,
  "userId": 1,
  "imageUrl": "https://example.com/story.jpg",
  "expiresAt": "2024-01-02T00:00:00.000Z",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### Notifications
```json
{
  "id": 1,
  "userId": 1,
  "type": "like",
  "fromUserId": 2,
  "postId": 1,
  "message": "John liked your post",
  "isRead": false,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

## 🔧 Cấu hình

### Environment Variables
```bash
PORT=3001
JWT_SECRET=your-secret-key
```

### CORS
Server đã được cấu hình CORS để cho phép requests từ frontend.

### JWT Authentication
- Token hết hạn sau 7 ngày
- Sử dụng Bearer token trong header Authorization
- Format: `Authorization: Bearer <token>`

## 🧪 Testing

### Health Check
```http
GET /health
```

### Test với cURL

#### Đăng ký
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

#### Đăng nhập
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

## 📱 Kết nối với Frontend

Trong ứng dụng React Native/Expo, sử dụng:

```javascript
const API_BASE_URL = 'http://localhost:3001/api';

// Đăng nhập
const login = async (email, password) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });
  return response.json();
};

// Lấy posts
const getPosts = async (token) => {
  const response = await fetch(`${API_BASE_URL}/posts`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return response.json();
};
```

## 🚀 Deployment

### Sử dụng PM2
```bash
npm install -g pm2
pm2 start server.js --name "locket-backend"
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

## 📝 Notes

- Database được lưu trong file `db.json`
- Tất cả passwords được hash bằng bcrypt
- JWT tokens có thời hạn 7 ngày
- Stories tự động hết hạn sau 24 giờ
- Server hỗ trợ CORS cho development

## 🤝 Contributing

1. Fork repository
2. Tạo feature branch
3. Commit changes
4. Push to branch
5. Tạo Pull Request

## 📄 License

MIT License - xem file LICENSE để biết thêm chi tiết.
