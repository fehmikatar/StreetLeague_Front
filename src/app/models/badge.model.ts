/**
 * Badge Management Models and Interfaces
 * DTO models for Badge API communication
 */

/**
 * Badge response from API
 * Represents a badge that can be earned by players
 */
export interface BadgeResponse {
  id: number;
  name: string;
  description: string | null;
  level: number; // 0-10
  requiredXp: number;
  iconUrl: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Badge request payload for creating/updating badges
 * Used in POST and PUT requests to the backend
 */
export interface BadgeRequest {
  name: string; // Required, unique, max 100 chars
  description: string | null; // Max 255 chars, optional
  level: number; // Required, 0-10
  requiredXp: number; // Required, min 0
  iconUrl: string; // Required, valid URL format
}

/**
 * Represents the current state of a badge in the application
 * Extends BadgeResponse with UI-specific properties
 */
export interface Badge extends BadgeResponse {
  isLoading?: boolean;
  error?: string | null;
}

/**
 * API error response format
 * Based on Spring Boot's error handling
 */
export interface ApiErrorResponse {
  timestamp?: string;
  status?: number;
  error?: string;
  message?: string;
  path?: string;
}

/**
 * Badge validation error details
 * Maps field to error message
 */
export interface BadgeValidationError {
  field: string;
  message: string;
}

/**
 * Badge level tier configuration
 * Helps categorize badges by level ranges
 */
export interface BadgeLevelTier {
  min: number;
  max: number;
  label: string;
  description: string;
  color: string; // Tailwind color class
}

/**
 * Badge statistics for dashboard
 */
export interface BadgeStatistics {
  totalBadges: number;
  mostEarnedBadge?: BadgeResponse;
  leastEarnedBadge?: BadgeResponse;
  averageBadgeLevel: number;
  badgesByLevel: { level: number; count: number }[];
}

/**
 * Form state for badge create/edit operations
 */
export interface BadgeFormState {
  isSubmitting: boolean;
  error: string | null;
  fieldErrors: { [key in keyof BadgeRequest]?: string };
  isDirty: boolean;
  touchedFields: { [key in keyof BadgeRequest]?: boolean };
}

/**
 * Badge catalog filter and sort options
 */
export interface BadgeCatalogFilters {
  searchQuery: string;
  minLevel?: number;
  maxLevel?: number;
  sortBy: 'name' | 'level' | 'xp' | 'createdAt';
  sortOrder: 'asc' | 'desc';
}

/**
 * Badge progress data for a player earning badges
 */
export interface BadgeProgress {
  badge: BadgeResponse;
  currentXp: number;
  isEarned: boolean;
  percentageProgress: number; // 0-100
  dateEarned?: string;
}

/**
 * Predefined badge level tiers
 */
export const BADGE_LEVEL_TIERS: BadgeLevelTier[] = [
  {
    min: 0,
    max: 2,
    label: 'Introductory',
    description: 'Basic achievements',
    color: 'text-gray-500'
  },
  {
    min: 3,
    max: 5,
    label: 'Intermediate',
    description: 'Intermediate achievements',
    color: 'text-blue-500'
  },
  {
    min: 6,
    max: 8,
    label: 'Advanced',
    description: 'Advanced achievements',
    color: 'text-purple-500'
  },
  {
    min: 9,
    max: 10,
    label: 'Master',
    description: 'Master/Legendary achievements',
    color: 'text-amber-500'
  }
];

/**
 * Utility function to get badge level tier
 */
export function getBadgeLevelTier(level: number): BadgeLevelTier {
  return BADGE_LEVEL_TIERS.find(tier => level >= tier.min && level <= tier.max) || BADGE_LEVEL_TIERS[0];
}

/**
 * Utility function to calculate progress percentage
 */
export function calculateBadgeProgress(currentXp: number, requiredXp: number): number {
  if (requiredXp <= 0) return 0;
  return Math.min(Math.round((currentXp / requiredXp) * 100), 100);
}

/**
 * Utility function to get progress color based on percentage
 */
export function getProgressColor(percentage: number): string {
  if (percentage < 33) return 'bg-red-500';
  if (percentage < 67) return 'bg-yellow-500';
  return 'bg-green-500';
}
