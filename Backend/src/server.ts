import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { createApp } from './app';
import { env } from './config/env';
import { connectDB } from './config/db';
import { recapJob } from './jobs/recap.job';
import { initializeSocketIO } from './services/socket.service';

async function bootstrap() {
  await connectDB();
  const app = createApp();
  const server = createServer(app);

  // Khởi tạo Socket.io server
  const io = new SocketIOServer(server, {
    cors: {
      origin: process.env.CORS_ORIGIN || '*', // Có thể config trong env
      methods: ['GET', 'POST'],
      credentials: true,
    },
    // Cho phép authentication qua handshake
    allowRequest: (req, callback) => {
      callback(null, true);
    },
  });

  // Khởi tạo Socket.io handlers
  initializeSocketIO(io);
  console.log('[Server] Socket.io initialized');

  // Khởi động Recap Video Background Job
  // Chạy mỗi 60 phút (có thể config trong env)
  const jobInterval = parseInt(process.env.RECAP_JOB_INTERVAL_MINUTES || '60', 10);
  recapJob.start(jobInterval);
  console.log(`[Server] Recap job started (interval: ${jobInterval} minutes)`);

  server.listen(env.PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Server running on http://localhost:${env.PORT}`);
    console.log(`Socket.io server ready for connections`);
  });

  // Export io để có thể sử dụng ở nơi khác nếu cần
  return { server, io };
}

bootstrap();
