import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IDevice extends Document {
  user: Types.ObjectId;
  platform: 'ios' | 'android';
  pushToken: string;
  appVersion?: string;
  lastActiveAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const DeviceSchema = new Schema<IDevice>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    platform: { type: String, enum: ['ios', 'android'], required: true },
    pushToken: { type: String, required: true, unique: true },
    appVersion: { type: String },
    lastActiveAt: { type: Date },
  },
  { timestamps: true }
);

DeviceSchema.index({ user: 1, lastActiveAt: -1 });

export const Device = mongoose.model<IDevice>('Device', DeviceSchema);