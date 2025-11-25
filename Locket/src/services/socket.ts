import { io, Socket } from 'socket.io-client';
import { API_BASE_URL } from '../config/api';

/**
 * Lấy base URL cho Socket.io (loại bỏ /api từ API_BASE_URL)
 * Socket.io cần connect vào root URL, không phải /api
 */
const getSocketUrl = (): string => {
  // Nếu có env variable cho production URL, ưu tiên dùng nó
  const productionUrl = process.env.EXPO_PUBLIC_API_URL;
  if (productionUrl && productionUrl.includes('locket-be-z695.onrender.com')) {
    // Loại bỏ /api nếu có
    return productionUrl.replace(/\/api\/?$/, '');
  }

  // Xử lý API_BASE_URL để loại bỏ /api
  try {
    const url = new URL(API_BASE_URL);
    // Loại bỏ /api từ pathname
    let pathname = url.pathname.replace(/\/api\/?$/, '');
    // Nếu pathname rỗng, đặt thành '/'
    if (!pathname || pathname === '') {
      pathname = '/';
    }
    
    // Tạo URL mới không có /api
    return `${url.protocol}//${url.host}${pathname}`;
  } catch (error) {
    // Fallback: xử lý bằng string manipulation
    return API_BASE_URL.replace(/\/api\/?$/, '');
  }
};

/**
 * SocketService - Singleton class để quản lý Socket.io connection
 * Đảm bảo chỉ có 1 kết nối duy nhất trong toàn app
 */
class SocketService {
  private static instance: SocketService | null = null;
  private socket: Socket | null = null;
  private isConnecting: boolean = false;

  /**
   * Private constructor để đảm bảo Singleton pattern
   */
  private constructor() {
    // Không cho phép tạo instance từ bên ngoài
  }

  /**
   * Lấy instance duy nhất của SocketService (Singleton)
   */
  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  /**
   * Kết nối Socket.io với token xác thực
   * @param token - JWT token để xác thực
   */
  public connect(token: string): void {
    // Nếu đã kết nối, không làm gì
    if (this.socket?.connected) {
      return;
    }

    // Nếu đang trong quá trình kết nối, không kết nối lại
    if (this.isConnecting) {
      return;
    }

    // Nếu socket đã tồn tại nhưng chưa kết nối, disconnect trước
    if (this.socket && !this.socket.connected) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }

    this.isConnecting = true;
    const socketUrl = getSocketUrl();

    // Tạo socket instance với config
    this.socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      autoConnect: false,
      auth: {
        token: token,
      },
    });

    // Setup event listeners
    this.setupEventListeners();

    // Kết nối
    this.socket.connect();
  }

  /**
   * Setup các event listeners cho socket
   */
  private setupEventListeners(): void {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      this.isConnecting = false;
    });

    this.socket.on('disconnect', (reason) => {
      this.isConnecting = false;
    });

    // Xử lý connection errors, đặc biệt là authentication errors
    this.socket.on('connect_error', (error) => {
      this.isConnecting = false;
      console.error('[Socket] Connection error:', error.message);

      // Kiểm tra nếu là authentication error (token hết hạn hoặc invalid)
      if (
        error.message.includes('Authentication error') ||
        error.message.includes('authentication') ||
        error.message.includes('Unauthorized')
      ) {
        console.error('[Socket] Authentication failed - token may be expired or invalid');
        console.error('[Socket] Disconnecting and clearing socket instance...');
        
        // Disconnect và clear socket instance
        this.disconnect();
        
        // Có thể emit event hoặc callback để UI xử lý logout
        // TODO: Có thể thêm callback hoặc event emitter để notify AuthContext
        console.warn('[Socket] ⚠️ Please re-authenticate and reconnect');
      }
    });
  }

  /**
   * Ngắt kết nối Socket.io
   */
  public disconnect(): void {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
      this.isConnecting = false;
    }
  }

  /**
   * Lấy instance socket hiện tại
   * @returns Socket instance hoặc null nếu chưa kết nối
   */
  public getSocket(): Socket | null {
    return this.socket;
  }

  /**
   * Kiểm tra socket đã kết nối chưa
   */
  public isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  /**
   * Format room ID để đảm bảo luôn có format "conversation:ID"
   * Tránh việc nối chuỗi 2 lần (thành "conversation:conversation:ID")
   * @param conversationId - ID của conversation (có thể đã có hoặc chưa có prefix "conversation:")
   * @returns Room ID với format "conversation:ID"
   */
  private formatRoomId(conversationId: string): string {
    return conversationId.startsWith('conversation:')
      ? conversationId
      : `conversation:${conversationId}`;
  }

  /**
   * Join vào conversation room
   * @param conversationId - ID của conversation
   * Backend sử dụng format room name: "conversation:ID"
   */
  public joinConversation(conversationId: string): void {
    if (!this.socket || !this.socket.connected) {
      console.warn('[Socket] Cannot join conversation: socket not connected');
      return;
    }

    const roomId = this.formatRoomId(conversationId);
    // Backend sử dụng event 'join_room' với room name format: "conversation:ID"
    this.socket.emit('join_room', { conversationId: roomId });
  }

  /**
   * Leave khỏi conversation room
   * @param conversationId - ID của conversation
   * Backend sử dụng format room name: "conversation:ID"
   */
  public leaveConversation(conversationId: string): void {
    if (!this.socket || !this.socket.connected) {
      console.warn('[Socket] Cannot leave conversation: socket not connected');
      return;
    }

    const roomId = this.formatRoomId(conversationId);
    // Backend sử dụng event 'leave_room' với room name format: "conversation:ID"
    this.socket.emit('leave_room', { conversationId: roomId });
  }

  /**
   * Gửi typing indicator (user đang gõ)
   * @param conversationId - ID của conversation
   * Backend sử dụng format room name: "conversation:ID"
   */
  public sendTyping(conversationId: string): void {
    if (!this.socket || !this.socket.connected) {
      console.warn('[Socket] Cannot send typing: socket not connected');
      return;
    }

    const roomId = this.formatRoomId(conversationId);
    this.socket.emit('typing_start', { conversationId: roomId });
  }

  /**
   * Gửi stop typing indicator (user dừng gõ)
   * @param conversationId - ID của conversation
   * Backend sử dụng format room name: "conversation:ID"
   */
  public sendStopTyping(conversationId: string): void {
    if (!this.socket || !this.socket.connected) {
      console.warn('[Socket] Cannot send stop typing: socket not connected');
      return;
    }

    const roomId = this.formatRoomId(conversationId);
    this.socket.emit('typing_stop', { conversationId: roomId });
  }

  /**
   * Helper method: Lắng nghe socket event
   * Wrapper để các màn hình UI không cần truy cập trực tiếp vào socket
   * @param event - Tên event cần lắng nghe
   * @param callback - Callback function khi event được emit
   */
  public on(event: string, callback: (...args: any[]) => void): void {
    if (!this.socket) {
      console.warn(`[Socket] Cannot listen to event "${event}": socket not initialized`);
      return;
    }

    this.socket.on(event, callback);
  }

  /**
   * Helper method: Bỏ lắng nghe socket event
   * Wrapper để các màn hình UI không cần truy cập trực tiếp vào socket
   * @param event - Tên event cần bỏ lắng nghe (optional, nếu không có thì remove tất cả listeners)
   */
  public off(event?: string): void {
    if (!this.socket) {
      console.warn('[Socket] Cannot remove listener: socket not initialized');
      return;
    }

    if (event) {
      this.socket.off(event);
    } else {
      // Nếu không có event, remove tất cả listeners
      // Lưu ý: Điều này sẽ remove cả system listeners (connect, disconnect, etc.)
      // Nếu cần giữ lại system listeners, hãy gọi removeAllListeners() với event cụ thể
      this.socket.removeAllListeners();
    }
  }

  /**
   * Remove tất cả listeners của một event cụ thể
   * @param event - Tên event
   */
  public removeAllListeners(event?: string): void {
    if (!this.socket) {
      return;
    }

    if (event) {
      this.socket.removeAllListeners(event);
    } else {
      this.socket.removeAllListeners();
    }
  }
}

// Export singleton instance
const socketService = SocketService.getInstance();

// Export các methods để dễ sử dụng (backward compatible với code cũ)
export const connect = (token: string) => socketService.connect(token);
export const disconnect = () => socketService.disconnect();
export const getSocket = () => socketService.getSocket();
export const joinConversation = (conversationId: string) =>
  socketService.joinConversation(conversationId);
export const leaveConversation = (conversationId: string) =>
  socketService.leaveConversation(conversationId);
export const sendTyping = (conversationId: string) => socketService.sendTyping(conversationId);
export const sendStopTyping = (conversationId: string) =>
  socketService.sendStopTyping(conversationId);
export const on = (event: string, callback: (...args: any[]) => void) =>
  socketService.on(event, callback);
export const off = (event?: string) => socketService.off(event);
export const isConnected = () => socketService.isConnected();

// Export class instance để có thể sử dụng trực tiếp nếu cần
export default socketService;
