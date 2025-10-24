import { createServer } from 'http';
import { createApp } from './app';
import { env } from './config/env';
import { connectDB } from './config/db';

async function bootstrap() {
  await connectDB();
  const app = createApp();
  const server = createServer(app);
  server.listen(env.PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Server running on http://localhost:${env.PORT}`);
  });
}

bootstrap();
