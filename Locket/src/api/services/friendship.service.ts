import { apiGet, apiPost } from '../client';
import type { FriendsListResponse } from '../../types/api.types';

export function getFriendsApi() {
  return apiGet<FriendsListResponse>('/friendships');
}

export function sendFriendRequestByUsernameApi(username: string) {
  return apiPost('/friendships/request-by-username', { username });
}

export function getPendingRequestsApi() {
  return apiGet('/friendships/pending');
}

export function acceptFriendRequestApi(requestId: string) {
  return apiPost(`/friendships/${requestId}/accept`);
}
