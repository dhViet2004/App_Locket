import mongoose, { Schema, Document, Types } from 'mongoose';

export type AdminActionType =
  | 'ban_user'
  | 'unban_user'
  | 'suspend_user'
  | 'unsuspend_user'
  | 'delete_post'
  | 'restore_post'
  | 'delete_comment'
  | 'restore_comment'
  | 'grant_role'
  | 'revoke_role'
  | 'plan_update'
  | 'refund'
  | 'feature_toggle'
  | 'ad_create'
  | 'ad_update'
  | 'ad_toggle';

export interface IAdminAuditLog extends Document {
  actor: Types.ObjectId; // admin/mod thực hiện
  action: AdminActionType;
  targetUser?: Types.ObjectId | null;
  targetPost?: Types.ObjectId | null;
  targetComment?: Types.ObjectId | null;
  targetAd?: Types.ObjectId | null;
  details?: Record<string, any>;
  reason?: string | null;
  createdAt: Date;
}

const AdminAuditLogSchema = new Schema<IAdminAuditLog>(
  {
    actor: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    action: {
      type: String,
      enum: [
        'ban_user',
        'unban_user',
        'suspend_user',
        'unsuspend_user',
        'delete_post',
        'restore_post',
        'delete_comment',
        'restore_comment',
        'grant_role',
        'revoke_role',
        'plan_update',
        'refund',
        'feature_toggle',
        'ad_create',
        'ad_update',
        'ad_toggle',
      ],
      required: true,
      index: true,
    },
    targetUser: { type: Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    targetPost: { type: Schema.Types.ObjectId, ref: 'Post', default: null, index: true },
    targetComment: { type: Schema.Types.ObjectId, ref: 'Comment', default: null, index: true },
    targetAd: { type: Schema.Types.ObjectId, ref: 'Ad', default: null, index: true },
    details: { type: Schema.Types.Mixed, default: {} },
    reason: { type: String, default: null },
    createdAt: { type: Date, default: () => new Date(), index: true },
  },
  { timestamps: false }
);

AdminAuditLogSchema.index({ createdAt: -1 });

export const AdminAuditLog = mongoose.model<IAdminAuditLog>('AdminAuditLog', AdminAuditLogSchema);