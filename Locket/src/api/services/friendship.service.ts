import { apiGet } from '../client';
import type { FriendsListResponse } from '../../types/api.types';

export function getFriendsApi() {
  return apiGet<FriendsListResponse>('/friendships');
}


