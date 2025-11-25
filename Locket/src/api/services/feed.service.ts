import { apiGet } from '../client';
import type { FeedResponse } from '../../types/api.types';

export interface GetFeedParams {
  page?: number;
  limit?: number;
  cursor?: string;
}

export function getFeedApi(params?: GetFeedParams) {
  return apiGet<FeedResponse>('/feed', params);
}

