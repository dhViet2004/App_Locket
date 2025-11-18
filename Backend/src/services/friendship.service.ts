import { Friendship, IFriendship } from '../models/friendship.model';
import { Types } from 'mongoose';
import { ApiError } from '../utils/apiResponse';

const MAX_FRIENDS = 20; // Locket limit

/**
 * Gửi lời mời kết bạn
 * Kiểm tra xem fromUser đã đủ 20 bạn chưa (Locket limit)
 * Nếu chưa thì tạo record status 'pending'
 */
export async function sendRequest(fromUserId: string, toUserId: string): Promise<IFriendship> {
  if (fromUserId === toUserId) {
    throw new ApiError(400, 'Cannot send friend request to yourself');
  }

  // Kiểm tra xem đã có friendship chưa
  const existingFriendship = await Friendship.findOne({
    $or: [
      { userA: new Types.ObjectId(fromUserId), userB: new Types.ObjectId(toUserId) },
      { userA: new Types.ObjectId(toUserId), userB: new Types.ObjectId(fromUserId) },
    ],
  });

  if (existingFriendship) {
    if (existingFriendship.status === 'accepted') {
      throw new ApiError(400, 'Already friends');
    }
    if (existingFriendship.status === 'pending') {
      throw new ApiError(400, 'Friend request already sent');
    }
    if (existingFriendship.status === 'blocked') {
      throw new ApiError(403, 'Cannot send request to blocked user');
    }
  }

  // Kiểm tra số lượng bạn bè hiện tại của fromUser
  const friendCount = await Friendship.countDocuments({
    $or: [
      { userA: new Types.ObjectId(fromUserId), status: 'accepted' },
      { userB: new Types.ObjectId(fromUserId), status: 'accepted' },
    ],
  });

  if (friendCount >= MAX_FRIENDS) {
    throw new ApiError(400, `Maximum ${MAX_FRIENDS} friends limit reached`);
  }

  // Tạo hoặc update friendship request
  let friendship: IFriendship;
  if (existingFriendship) {
    // Update existing friendship
    existingFriendship.status = 'pending';
    existingFriendship.requestedBy = new Types.ObjectId(fromUserId);
    existingFriendship.blockedBy = null;
    await existingFriendship.save();
    friendship = existingFriendship;
  } else {
    // Tạo mới
    friendship = await Friendship.create({
      userA: new Types.ObjectId(fromUserId < toUserId ? fromUserId : toUserId),
      userB: new Types.ObjectId(fromUserId < toUserId ? toUserId : fromUserId),
      requestedBy: new Types.ObjectId(fromUserId),
      status: 'pending',
      blockedBy: null,
    });
  }

  return friendship;
}

/**
 * Chấp nhận lời mời kết bạn
 * Update status thành 'accepted'
 */
export async function acceptRequest(requestId: string, userId: string): Promise<IFriendship> {
  const friendship = await Friendship.findById(requestId);

  if (!friendship) {
    throw new ApiError(404, 'Friend request not found');
  }

  // Kiểm tra xem user có phải là người nhận request không
  const userAId = friendship.userA.toString();
  const userBId = friendship.userB.toString();
  const requestedById = friendship.requestedBy.toString();

  if (userAId !== userId && userBId !== userId) {
    throw new ApiError(403, 'You are not authorized to accept this request');
  }

  if (requestedById === userId) {
    throw new ApiError(400, 'Cannot accept your own request');
  }

  if (friendship.status === 'accepted') {
    throw new ApiError(400, 'Friend request already accepted');
  }

  if (friendship.status === 'blocked') {
    throw new ApiError(403, 'Cannot accept blocked friend request');
  }

  // Kiểm tra số lượng bạn bè của cả 2 user
  const userAFriendCount = await Friendship.countDocuments({
    $or: [
      { userA: friendship.userA, status: 'accepted' },
      { userB: friendship.userA, status: 'accepted' },
    ],
  });

  const userBFriendCount = await Friendship.countDocuments({
    $or: [
      { userA: friendship.userB, status: 'accepted' },
      { userB: friendship.userB, status: 'accepted' },
    ],
  });

  if (userAFriendCount >= MAX_FRIENDS || userBFriendCount >= MAX_FRIENDS) {
    throw new ApiError(400, `One of the users has reached the maximum ${MAX_FRIENDS} friends limit`);
  }

  // Update status thành accepted
  friendship.status = 'accepted';
  friendship.acceptedAt = new Date();
  await friendship.save();

  return friendship;
}

/**
 * Từ chối hoặc hủy lời mời kết bạn
 */
export async function rejectRequest(requestId: string, userId: string): Promise<void> {
  const friendship = await Friendship.findById(requestId);

  if (!friendship) {
    throw new ApiError(404, 'Friend request not found');
  }

  const userAId = friendship.userA.toString();
  const userBId = friendship.userB.toString();

  if (userAId !== userId && userBId !== userId) {
    throw new ApiError(403, 'You are not authorized to reject this request');
  }

  if (friendship.status !== 'pending') {
    throw new ApiError(400, 'Friend request is not pending');
  }

  // Xóa friendship request
  await Friendship.findByIdAndDelete(requestId);
}

