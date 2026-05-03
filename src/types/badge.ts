export interface BadgeRequest {
  name: string;
  description?: string;
  level: number;
  requiredXp: number;
  iconUrl?: string;
  category?: 'performance' | 'achievement' | 'social' | 'loyalty';
}

export interface BadgeResponse {
  id: number;
  name: string;
  description?: string;
  level: number;
  requiredXp: number;
  iconUrl?: string;
  category?: 'performance' | 'achievement' | 'social' | 'loyalty';
}

export interface EarnedBadgeResponse {
  id: number;
  badge: BadgeResponse;
  playerId: number;
  obtainDate: string;
  performanceId?: number;
}