import mongoose from 'mongoose';
import { env } from './env';

export async function connectDB() {
  if (!env.MONGO_URI) {
    // eslint-disable-next-line no-console
    console.warn('MONGO_URI is empty. Skipping DB connection.');
    return;
  }
  try {
    await mongoose.connect(env.MONGO_URI);
    // eslint-disable-next-line no-console
    console.log('MongoDB connected');
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('MongoDB connection error', err);
    // Do not exit in dev to allow server to run without DB
    if (env.NODE_ENV === 'production') process.exit(1);
  }
}
