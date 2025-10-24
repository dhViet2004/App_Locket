import React, { useState, useEffect } from 'react';
import './UserManagement.css';

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  status: 'active' | 'locked' | 'suspended';
  joinDate: string;
  lastActive: string;
  photosCount: number;
  friendsCount: number;
  isOnline: boolean;
}

interface UserManagementProps {
  onBack: () => void;
}

const UserManagement: React.FC<UserManagementProps> = ({ onBack }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'locked' | 'suspended'>('all');
  const [showModal, setShowModal] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');

  // Mock data
  useEffect(() => {
    const mockUsers: User[] = [
      {
        id: '1',
        name: 'Nguyễn Văn A',
        email: 'nguyenvana@email.com',
        avatar: 'https://khoinguonsangtao.vn/wp-content/uploads/2022/08/hinh-nen-gai-xinh.jpg',
        status: 'active',
        joinDate: '2024-01-15',
        lastActive: '2024-12-20T10:30:00Z',
        photosCount: 45,
        friendsCount: 23,
        isOnline: true
      },
      {
        id: '2',
        name: 'Trần Thị B',
        email: 'tranthib@email.com',
        avatar: 'https://thichtrangtri.com/wp-content/uploads/2025/05/anh-meo-gian-cute-3.jpg',
        status: 'locked',
        joinDate: '2024-02-20',
        lastActive: '2024-12-19T15:45:00Z',
        photosCount: 12,
        friendsCount: 8,
        isOnline: false
      },
      {
        id: '3',
        name: 'Lê Văn C',
        email: 'levanc@email.com',
        avatar: 'https://thanhnien.mediacdn.vn/Uploaded/thaobtn/2022_11_14/e375b2356ecda893f1dc-9121.jpg',
        status: 'active',
        joinDate: '2024-03-10',
        lastActive: '2024-12-20T09:15:00Z',
        photosCount: 78,
        friendsCount: 34,
        isOnline: true
      },
      {
        id: '4',
        name: 'Phạm Thị D',
        email: 'phamthid@email.com',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
        status: 'suspended',
        joinDate: '2024-01-05',
        lastActive: '2024-12-18T20:30:00Z',
        photosCount: 23,
        friendsCount: 15,
        isOnline: false
      },
      {
        id: '5',
        name: 'Hoàng Văn E',
        email: 'hoangvane@email.com',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
        status: 'active',
        joinDate: '2024-04-12',
        lastActive: '2024-12-20T11:20:00Z',
        photosCount: 56,
        friendsCount: 29,
        isOnline: true
      }
    ];
    setUsers(mockUsers);
  }, []);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleToggleLock = (userId: string) => {
    setUsers(prev => prev.map(user => 
      user.id === userId 
        ? { ...user, status: user.status === 'locked' ? 'active' : 'locked' }
        : user
    ));
  };

  const handleSuspend = (userId: string) => {
    setUsers(prev => prev.map(user => 
      user.id === userId 
        ? { ...user, status: 'suspended' }
        : user
    ));
  };

  const handleSendNotification = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setSelectedUser(user);
      setShowModal(true);
    }
  };

  const handleViewDetails = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setSelectedUser(user);
      setShowModal(true);
    }
  };

  const sendNotification = () => {
    if (selectedUser && notificationMessage.trim()) {
      alert(`Đã gửi thông báo cho ${selectedUser.name}: "${notificationMessage}"`);
      setNotificationMessage('');
      setShowModal(false);
      setSelectedUser(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'status-active';
      case 'locked': return 'status-locked';
      case 'suspended': return 'status-suspended';
      default: return 'status-active';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Hoạt động';
      case 'locked': return 'Bị khóa';
      case 'suspended': return 'Tạm khóa';
      default: return 'Hoạt động';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  return (
    <div className="user-management">
      <div className="user-header">
        <button onClick={onBack} className="back-button">
          ← Quay lại Dashboard
        </button>
        <h1>Quản lý người dùng</h1>
        <div className="user-stats">
          <span>Tổng: {users.length}</span>
          <span>Online: {users.filter(u => u.isOnline).length}</span>
          <span>Bị khóa: {users.filter(u => u.status === 'locked').length}</span>
        </div>
      </div>

      <div className="user-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên hoặc email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filter-group">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="filter-select"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Hoạt động</option>
            <option value="locked">Bị khóa</option>
            <option value="suspended">Tạm khóa</option>
          </select>
        </div>
      </div>

      <div className="user-list">
        {filteredUsers.map(user => (
          <div key={user.id} className="user-card">
            <div className="user-info">
              <div className="user-avatar">
                <img src={user.avatar} alt={user.name} />
                <div className={`online-indicator ${user.isOnline ? 'online' : 'offline'}`}></div>
              </div>
              <div className="user-details">
                <h3>{user.name}</h3>
                <p className="user-email">{user.email}</p>
                <div className="user-meta">
                  <span>Tham gia: {formatDate(user.joinDate)}</span>
                  <span>Hoạt động cuối: {formatDateTime(user.lastActive)}</span>
                </div>
                <div className="user-stats">
                  <span>📸 {user.photosCount} ảnh</span>
                  <span>👫 {user.friendsCount} bạn</span>
                </div>
              </div>
            </div>
            <div className="user-status">
              <span className={`status-badge ${getStatusColor(user.status)}`}>
                {getStatusText(user.status)}
              </span>
            </div>
            <div className="user-actions">
              <button
                onClick={() => handleToggleLock(user.id)}
                className={`action-btn ${user.status === 'locked' ? 'unlock' : 'lock'}`}
              >
                {user.status === 'locked' ? '🔓 Mở khóa' : '🔒 Khóa'}
              </button>
              <button
                onClick={() => handleSuspend(user.id)}
                className="action-btn suspend"
                disabled={user.status === 'suspended'}
              >
                ⏸️ Tạm khóa
              </button>
              <button
                onClick={() => handleSendNotification(user.id)}
                className="action-btn notify"
              >
                📢 Thông báo
              </button>
              <button
                onClick={() => handleViewDetails(user.id)}
                className="action-btn details"
              >
                👁️ Chi tiết
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Chi tiết người dùng</h2>
              <button onClick={() => setShowModal(false)} className="close-btn">×</button>
            </div>
            <div className="modal-body">
              <div className="user-profile">
                <img src={selectedUser.avatar} alt={selectedUser.name} className="profile-avatar" />
                <div className="profile-info">
                  <h3>{selectedUser.name}</h3>
                  <p>{selectedUser.email}</p>
                  <span className={`status-badge ${getStatusColor(selectedUser.status)}`}>
                    {getStatusText(selectedUser.status)}
                  </span>
                </div>
              </div>
              <div className="profile-details">
                <div className="detail-row">
                  <span>Tham gia:</span>
                  <span>{formatDate(selectedUser.joinDate)}</span>
                </div>
                <div className="detail-row">
                  <span>Hoạt động cuối:</span>
                  <span>{formatDateTime(selectedUser.lastActive)}</span>
                </div>
                <div className="detail-row">
                  <span>Số ảnh:</span>
                  <span>{selectedUser.photosCount}</span>
                </div>
                <div className="detail-row">
                  <span>Số bạn bè:</span>
                  <span>{selectedUser.friendsCount}</span>
                </div>
                <div className="detail-row">
                  <span>Trạng thái online:</span>
                  <span className={selectedUser.isOnline ? 'online' : 'offline'}>
                    {selectedUser.isOnline ? 'Đang online' : 'Offline'}
                  </span>
                </div>
              </div>
              <div className="notification-section">
                <h4>Gửi thông báo</h4>
                <textarea
                  value={notificationMessage}
                  onChange={(e) => setNotificationMessage(e.target.value)}
                  placeholder="Nhập nội dung thông báo..."
                  className="notification-input"
                />
                <button onClick={sendNotification} className="send-notification-btn">
                  Gửi thông báo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
