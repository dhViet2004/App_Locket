import dotenv from 'dotenv';
dotenv.config();

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '4000', 10),
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/locket',
  JWT_SECRET: process.env.JWT_SECRET || 'change_me',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
};

// eslint-disable-next-line no-console
console.log(`ENV: NODE_ENV=${env.NODE_ENV} PORT=${env.PORT}`);
