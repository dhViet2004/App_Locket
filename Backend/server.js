const jsonServer = require('json-server');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const express = require('express');

const app = express();
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

// Cấu hình
const PORT = process.env.PORT || 3001;
const JWT_SECRET = 'locket-secret-key-2024';

// Middleware
app.use(cors());
app.use(express.json());
app.use(middlewares);

// Middleware xác thực JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// API Routes

// Đăng ký user mới
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name, username } = req.body;
    
    // Kiểm tra email đã tồn tại
    const existingUser = router.db.get('users').find({ email }).value();
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Kiểm tra username đã tồn tại
    const existingUsername = router.db.get('users').find({ username }).value();
    if (existingUsername) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Tạo user mới
    const newUser = {
      id: Date.now(),
      email,
      password: hashedPassword,
      name,
      username,
      avatar: `https://via.placeholder.com/150/FFD700/000000?text=${name.charAt(0).toUpperCase()}`,
      bio: '',
      isVerified: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    router.db.get('users').push(newUser).write();

    // Tạo JWT token
    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Trả về user (không bao gồm password)
    const { password: _, ...userWithoutPassword } = newUser;
    
    res.status(201).json({
      message: 'User created successfully',
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Đăng nhập
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Tìm user theo email
    const user = router.db.get('users').find({ email }).value();
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Kiểm tra password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Tạo JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Trả về user (không bao gồm password)
    const { password: _, ...userWithoutPassword } = user;
    
    res.json({
      message: 'Login successful',
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Lấy thông tin user hiện tại
app.get('/api/auth/me', authenticateToken, (req, res) => {
  const user = router.db.get('users').find({ id: req.user.userId }).value();
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  const { password: _, ...userWithoutPassword } = user;
  res.json(userWithoutPassword);
});

// Cập nhật profile
app.put('/api/auth/profile', authenticateToken, (req, res) => {
  try {
    const { name, bio, avatar } = req.body;
    const userId = req.user.userId;

    const user = router.db.get('users').find({ id: userId });
    if (!user.value()) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.assign({
      name: name || user.value().name,
      bio: bio || user.value().bio,
      avatar: avatar || user.value().avatar,
      updatedAt: new Date().toISOString()
    }).write();

    const { password: _, ...userWithoutPassword } = user.value();
    res.json({
      message: 'Profile updated successfully',
      user: userWithoutPassword
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Posts API
app.get('/api/posts', authenticateToken, (req, res) => {
  const posts = router.db.get('posts').value();
  res.json(posts);
});

app.post('/api/posts', authenticateToken, (req, res) => {
  try {
    const { imageUrl, caption, location } = req.body;
    const userId = req.user.userId;

    const newPost = {
      id: Date.now(),
      userId,
      imageUrl,
      caption,
      location,
      likes: 0,
      comments: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    router.db.get('posts').push(newPost).write();
    res.status(201).json({
      message: 'Post created successfully',
      post: newPost
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Like/Unlike post
app.post('/api/posts/:id/like', authenticateToken, (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    const userId = req.user.userId;

    // Kiểm tra post có tồn tại
    const post = router.db.get('posts').find({ id: postId }).value();
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Kiểm tra đã like chưa
    const existingLike = router.db.get('likes').find({ postId, userId }).value();
    
    if (existingLike) {
      // Unlike
      router.db.get('likes').remove({ id: existingLike.id }).write();
      router.db.get('posts').find({ id: postId }).update('likes', n => n - 1).write();
      res.json({ message: 'Post unliked', liked: false });
    } else {
      // Like
      const newLike = {
        id: Date.now(),
        postId,
        userId,
        createdAt: new Date().toISOString()
      };
      router.db.get('likes').push(newLike).write();
      router.db.get('posts').find({ id: postId }).update('likes', n => n + 1).write();
      res.json({ message: 'Post liked', liked: true });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Comments API
app.get('/api/posts/:id/comments', authenticateToken, (req, res) => {
  const postId = parseInt(req.params.id);
  const comments = router.db.get('comments').filter({ postId }).value();
  res.json(comments);
});

app.post('/api/posts/:id/comments', authenticateToken, (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    const { content } = req.body;
    const userId = req.user.userId;

    const newComment = {
      id: Date.now(),
      postId,
      userId,
      content,
      createdAt: new Date().toISOString()
    };

    router.db.get('comments').push(newComment).write();
    router.db.get('posts').find({ id: postId }).update('comments', n => n + 1).write();
    
    res.status(201).json({
      message: 'Comment added successfully',
      comment: newComment
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Stories API
app.get('/api/stories', authenticateToken, (req, res) => {
  const stories = router.db.get('stories').value();
  res.json(stories);
});

app.post('/api/stories', authenticateToken, (req, res) => {
  try {
    const { imageUrl } = req.body;
    const userId = req.user.userId;

    const newStory = {
      id: Date.now(),
      userId,
      imageUrl,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      createdAt: new Date().toISOString()
    };

    router.db.get('stories').push(newStory).write();
    res.status(201).json({
      message: 'Story created successfully',
      story: newStory
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Notifications API
app.get('/api/notifications', authenticateToken, (req, res) => {
  const userId = req.user.userId;
  const notifications = router.db.get('notifications').filter({ userId }).value();
  res.json(notifications);
});

app.put('/api/notifications/:id/read', authenticateToken, (req, res) => {
  try {
    const notificationId = parseInt(req.params.id);
    const userId = req.user.userId;

    const notification = router.db.get('notifications').find({ id: notificationId, userId });
    if (!notification.value()) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    notification.assign({ isRead: true }).write();
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin Middleware - Kiểm tra quyền admin
const requireAdmin = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    
    // Kiểm tra role admin
    const userData = router.db.get('users').find({ id: user.userId }).value();
    if (!userData || userData.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    req.user = user;
    next();
  });
};

// Admin API Routes

// Quản lý users
app.get('/api/admin/users', requireAdmin, (req, res) => {
  const users = router.db.get('users').value();
  res.json(users);
});

app.get('/api/admin/users/:id', requireAdmin, (req, res) => {
  const userId = parseInt(req.params.id);
  const user = router.db.get('users').find({ id: userId }).value();
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  res.json(user);
});

app.put('/api/admin/users/:id', requireAdmin, (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const updates = req.body;
    
    const user = router.db.get('users').find({ id: userId });
    if (!user.value()) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    user.assign(updates).write();
    res.json({ message: 'User updated successfully', user: user.value() });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/admin/users/:id', requireAdmin, (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    
    const user = router.db.get('users').find({ id: userId });
    if (!user.value()) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Xóa user và các dữ liệu liên quan
    user.remove().write();
    
    // Xóa photos của user
    router.db.get('photos').remove({ userId }).write();
    
    // Xóa reactions của user
    router.db.get('reactions').remove({ userId }).write();
    
    // Xóa friendships liên quan
    router.db.get('friendships').remove({ requesterId: userId }).write();
    router.db.get('friendships').remove({ addresseeId: userId }).write();
    
    res.json({ message: 'User and related data deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Quản lý photos
app.get('/api/admin/photos', requireAdmin, (req, res) => {
  const { page = 1, limit = 20, userId, status } = req.query;
  let photos = router.db.get('photos').value();
  
  // Filter by user if specified
  if (userId) {
    photos = photos.filter(photo => photo.userId === parseInt(userId));
  }
  
  // Filter by status if specified
  if (status) {
    photos = photos.filter(photo => photo.status === status);
  }
  
  // Pagination
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + parseInt(limit);
  const paginatedPhotos = photos.slice(startIndex, endIndex);
  
  res.json({
    photos: paginatedPhotos,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: photos.length,
      pages: Math.ceil(photos.length / limit)
    }
  });
});

app.put('/api/admin/photos/:id/moderate', requireAdmin, (req, res) => {
  try {
    const photoId = parseInt(req.params.id);
    const { status, reason } = req.body;
    
    const photo = router.db.get('photos').find({ id: photoId });
    if (!photo.value()) {
      return res.status(404).json({ error: 'Photo not found' });
    }
    
    photo.assign({ 
      status, 
      moderatedAt: new Date().toISOString(),
      moderationReason: reason 
    }).write();
    
    res.json({ 
      message: 'Photo moderation updated', 
      photo: photo.value() 
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/admin/photos/:id', requireAdmin, (req, res) => {
  try {
    const photoId = parseInt(req.params.id);
    
    const photo = router.db.get('photos').find({ id: photoId });
    if (!photo.value()) {
      return res.status(404).json({ error: 'Photo not found' });
    }
    
    // Xóa photo và reactions liên quan
    photo.remove().write();
    router.db.get('reactions').remove({ photoId }).write();
    
    res.json({ message: 'Photo and related reactions deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Quản lý reactions
app.get('/api/admin/reactions', requireAdmin, (req, res) => {
  const { page = 1, limit = 20, userId, photoId } = req.query;
  let reactions = router.db.get('reactions').value();
  
  // Filter by user if specified
  if (userId) {
    reactions = reactions.filter(reaction => reaction.userId === parseInt(userId));
  }
  
  // Filter by photo if specified
  if (photoId) {
    reactions = reactions.filter(reaction => reaction.photoId === parseInt(photoId));
  }
  
  // Pagination
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + parseInt(limit);
  const paginatedReactions = reactions.slice(startIndex, endIndex);
  
  res.json({
    reactions: paginatedReactions,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: reactions.length,
      pages: Math.ceil(reactions.length / limit)
    }
  });
});

app.delete('/api/admin/reactions/:id', requireAdmin, (req, res) => {
  try {
    const reactionId = parseInt(req.params.id);
    
    const reaction = router.db.get('reactions').find({ id: reactionId });
    if (!reaction.value()) {
      return res.status(404).json({ error: 'Reaction not found' });
    }
    
    reaction.remove().write();
    res.json({ message: 'Reaction deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Analytics
app.get('/api/admin/analytics', requireAdmin, (req, res) => {
  try {
    const users = router.db.get('users').value();
    const photos = router.db.get('photos').value();
    const reactions = router.db.get('reactions').value();
    const friendships = router.db.get('friendships').value();
    
    const analytics = {
      overview: {
        totalUsers: users.length,
        totalPhotos: photos.length,
        totalReactions: reactions.length,
        totalFriendships: friendships.length,
        activeUsers: users.filter(user => {
          const lastActive = new Date(user.lastActiveAt);
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          return lastActive > thirtyDaysAgo;
        }).length
      },
      photos: {
        total: photos.length,
        public: photos.filter(p => p.isPublic).length,
        private: photos.filter(p => !p.isPublic).length,
        pending: photos.filter(p => p.status === 'pending').length,
        approved: photos.filter(p => p.status === 'approved').length,
        rejected: photos.filter(p => p.status === 'rejected').length
      },
      users: {
        total: users.length,
        verified: users.filter(u => u.isVerified).length,
        private: users.filter(u => u.isPrivate).length,
        admins: users.filter(u => u.role === 'admin').length
      },
      engagement: {
        totalReactions: reactions.length,
        averageReactionsPerPhoto: photos.length > 0 ? (reactions.length / photos.length).toFixed(2) : 0,
        mostUsedEmoji: getMostUsedEmoji(reactions)
      }
    };
    
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// System settings
app.get('/api/admin/system', requireAdmin, (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

// Helper function để tìm emoji được dùng nhiều nhất
function getMostUsedEmoji(reactions) {
  const emojiCount = {};
  reactions.forEach(reaction => {
    if (reaction.emoji) {
      emojiCount[reaction.emoji] = (emojiCount[reaction.emoji] || 0) + 1;
    }
  });
  
  const sortedEmojis = Object.entries(emojiCount)
    .sort(([,a], [,b]) => b - a);
  
  return sortedEmojis.length > 0 ? {
    emoji: sortedEmojis[0][0],
    count: sortedEmojis[0][1]
  } : null;
}

// Sử dụng JSON Server router cho các routes khác
app.use('/api', router);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Locket Backend API is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Locket Backend API is running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api`);
  console.log(`🔐 Auth endpoints: /api/auth/*`);
  console.log(`📱 Posts endpoints: /api/posts/*`);
  console.log(`💬 Comments endpoints: /api/posts/:id/comments`);
  console.log(`📖 Stories endpoints: /api/stories`);
  console.log(`🔔 Notifications endpoints: /api/notifications`);
});

module.exports = app;
