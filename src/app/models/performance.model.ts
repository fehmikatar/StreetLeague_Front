/**
 * Performance Models and DTOs
 * Defines all data structures for player performance tracking
 */

/**
 * Performance Request DTO for create/update operations
 */
export interface PerformanceRequest {
  playerId: number;
  matchId: number;
  score: number; // 0-20 goals
  assists: number; // 0-15 assists
  distanceCovered: number; // 0.0-50.0 km
  timePlayed: number; // 0-120 minutes
  rating: number; // 0.0-10.0
}

/**
 * Performance Response DTO from backend
 */
export interface PerformanceResponse {
  id: number;
  playerId: number;
  matchId: number;
  score: number;
  assists: number;
  distanceCovered: number;
  timePlayed: number;
  rating: number;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Player information for performance context
 */
export interface PlayerInfo {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  skillLevel: number; // 1-5+
  position: string; // striker, midfielder, defender, goalkeeper
  gamesPlayed: number;
  rating: number; // career average
  createdAt?: string;
  isActive: boolean;
}

/**
 * Match information for performance context
 */
export interface MatchInfo {
  id: number;
  name: string;
  date: string;
  status: string;
  teamAId?: number;
  teamBId?: number;
}

/**
 * Performance with enriched player and match data
 */
export interface Performance extends PerformanceResponse {
  player?: PlayerInfo;
  match?: MatchInfo;
}

/**
 * Career statistics aggregated from multiple performances
 */
export interface CareerStats {
  totalGames: number;
  totalGoals: number;
  totalAssists: number;
  totalDistance: number;
  averageRating: number;
  averageGoalsPerMatch: number;
  averageAssistsPerMatch: number;
  averageDistancePerMatch: number;
  bestPerformance: PerformanceResponse | null;
  worstPerformance: PerformanceResponse | null;
  trend: 'improving' | 'declining' | 'stable';
  consistencyScore: number; // 0-100, based on std deviation
}

/**
 * Rating scale visual representation
 */
export interface RatingTier {
  min: number;
  max: number;
  label: string;
  description: string;
  emoji: string;
  color: string;
  bgColor: string;
}

/**
 * Performance rating scale tiers
 */
export const PERFORMANCE_RATING_TIERS: RatingTier[] = [
  {
    min: 9.0,
    max: 10.0,
    label: 'Outstanding',
    description: 'Man of the match performance',
    emoji: '⭐⭐⭐⭐⭐',
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-50 dark:bg-yellow-900/20'
  },
  {
    min: 8.0,
    max: 8.9,
    label: 'Excellent',
    description: 'Dominant display',
    emoji: '⭐⭐⭐⭐',
    color: 'text-green-500',
    bgColor: 'bg-green-50 dark:bg-green-900/20'
  },
  {
    min: 7.0,
    max: 7.9,
    label: 'Good',
    description: 'Solid, reliable performance',
    emoji: '⭐⭐⭐',
    color: 'text-blue-500',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20'
  },
  {
    min: 6.0,
    max: 6.9,
    label: 'Satisfactory',
    description: 'Average, did the job',
    emoji: '⭐⭐',
    color: 'text-gray-500',
    bgColor: 'bg-gray-50 dark:bg-gray-900/20'
  },
  {
    min: 5.0,
    max: 5.9,
    label: 'Below Average',
    description: 'Struggled at times',
    emoji: '⭐',
    color: 'text-orange-500',
    bgColor: 'bg-orange-50 dark:bg-orange-900/20'
  },
  {
    min: 0.0,
    max: 4.9,
    label: 'Poor',
    description: 'Very difficult match',
    emoji: '❌',
    color: 'text-red-500',
    bgColor: 'bg-red-50 dark:bg-red-900/20'
  }
];

/**
 * Performance filter criteria
 */
export interface PerformanceFilter {
  minRating?: number;
  maxRating?: number;
  minGoals?: number;
  maxGoals?: number;
  dateFrom?: string;
  dateTo?: string;
  minDistance?: number;
  maxDistance?: number;
}

/**
 * Performance sort options
 */
export type PerformanceSortOption = 'date-desc' | 'date-asc' | 'rating-desc' | 'rating-asc' | 'goals-desc' | 'goals-asc' | 'assists-desc' | 'assists-asc' | 'distance-desc' | 'distance-asc';

/**
 * Performance comparison data for 2-3 players
 */
export interface PerformanceComparison {
  playerId: number;
  playerName: string;
  stats: {
    goalsEfficiency: number; // 0-10 normalized
    assistContribution: number; // 0-10 normalized
    stamina: number; // 0-10 normalized (distance covered)
    playingTime: number; // 0-10 (% of full match)
    overallRating: number; // 0-10
  };
}

/**
 * Validation error response from API
 */
export interface ValidationError {
  field: string;
  message: string;
  constraint?: string;
}

/**
 * API error response
 */
export interface ApiErrorResponse {
  status: number;
  message: string;
  errors?: ValidationError[];
}

/**
 * Get rating tier by rating value
 */
export function getPerformanceRatingTier(rating: number): RatingTier {
  return PERFORMANCE_RATING_TIERS.find(tier => rating >= tier.min && rating <= tier.max) || PERFORMANCE_RATING_TIERS[PERFORMANCE_RATING_TIERS.length - 1];
}

/**
 * Calculate career statistics from performance array
 */
export function calculateCareerStats(performances: PerformanceResponse[]): CareerStats {
  if (performances.length === 0) {
    return {
      totalGames: 0,
      totalGoals: 0,
      totalAssists: 0,
      totalDistance: 0,
      averageRating: 0,
      averageGoalsPerMatch: 0,
      averageAssistsPerMatch: 0,
      averageDistancePerMatch: 0,
      bestPerformance: null,
      worstPerformance: null,
      trend: 'stable',
      consistencyScore: 0
    };
  }

  const totalGames = performances.length;
  const totalGoals = performances.reduce((sum, p) => sum + p.score, 0);
  const totalAssists = performances.reduce((sum, p) => sum + p.assists, 0);
  const totalDistance = performances.reduce((sum, p) => sum + p.distanceCovered, 0);
  const averageRating = performances.reduce((sum, p) => sum + p.rating, 0) / totalGames;
  const averageGoalsPerMatch = totalGoals / totalGames;
  const averageAssistsPerMatch = totalAssists / totalGames;
  const averageDistancePerMatch = totalDistance / totalGames;

  const bestPerformance = performances.reduce((best, current) =>
    current.rating > best.rating ? current : best
  );

  const worstPerformance = performances.reduce((worst, current) =>
    current.rating < worst.rating ? current : worst
  );

  // Calculate trend (last 5 vs first 5)
  let trend: 'improving' | 'declining' | 'stable' = 'stable';
  if (totalGames >= 5) {
    const recentAvg = performances.slice(-5).reduce((sum, p) => sum + p.rating, 0) / 5;
    const earlyAvg = performances.slice(0, 5).reduce((sum, p) => sum + p.rating, 0) / 5;
    if (recentAvg > earlyAvg + 0.5) trend = 'improving';
    else if (recentAvg < earlyAvg - 0.5) trend = 'declining';
  }

  // Calculate consistency (inverse of std deviation, normalized to 0-100)
  const variance = performances.reduce((sum, p) => sum + Math.pow(p.rating - averageRating, 2), 0) / totalGames;
  const stdDev = Math.sqrt(variance);
  const consistencyScore = Math.max(0, 100 - (stdDev * 25)); // Higher consistency = lower std dev

  return {
    totalGames,
    totalGoals,
    totalAssists,
    totalDistance,
    averageRating,
    averageGoalsPerMatch,
    averageAssistsPerMatch,
    averageDistancePerMatch,
    bestPerformance,
    worstPerformance,
    trend,
    consistencyScore
  };
}

/**
 * Calculate efficiency rating from performance metrics
 * Returns normalized 0-10 score
 */
export function calculateEfficiency(
  score: number,
  assists: number,
  distanceCovered: number,
  timePlayed: number,
  rating: number
): number {
  // Normalize each metric to 0-10 scale
  const goalEfficiency = (score / 20) * 10; // Max 20 goals
  const assistEfficiency = (assists / 15) * 10; // Max 15 assists
  const staminaEfficiency = (distanceCovered / 50) * 10; // Max 50 km
  const timeEfficiency = (timePlayed / 120) * 10; // Max 120 minutes
  const ratingScore = rating; // Already 0-10

  // Weighted average
  return (
    (goalEfficiency * 0.25 +
      assistEfficiency * 0.20 +
      staminaEfficiency * 0.20 +
      timeEfficiency * 0.15 +
      ratingScore * 0.20) / 10
  );
}

/**
 * Calculate performance trend indicator
 * @returns 'improving', 'declining', or 'stable'
 */
export function calculatePerformanceTrend(performances: PerformanceResponse[]): 'improving' | 'declining' | 'stable' {
  if (performances.length < 5) return 'stable';

  const recent = performances.slice(-5).reduce((sum, p) => sum + p.rating, 0) / 5;
  const previous = performances.slice(-10, -5).reduce((sum, p) => sum + p.rating, 0) / 5;

  const difference = recent - previous;
  if (difference > 0.5) return 'improving';
  if (difference < -0.5) return 'declining';
  return 'stable';
}

/**
 * Get trend emoji indicator
 */
export function getTrendEmoji(trend: 'improving' | 'declining' | 'stable'): string {
  switch (trend) {
    case 'improving':
      return '📈';
    case 'declining':
      return '📉';
    default:
      return '➡️';
  }
}

/**
 * Parse API error response
 */
export function parsePerformanceApiError(error: any): string {
  if (!error) return 'An unknown error occurred';

  // Handle validation errors
  if (error.errors && Array.isArray(error.errors) && error.errors.length > 0) {
    return error.errors[0].message || 'Validation error occurred';
  }

  // Handle specific status codes
  if (error.status === 404) {
    return 'Performance record not found';
  }

  if (error.status === 409) {
    return 'Selected player not found in system';
  }

  if (error.status === 422) {
    return 'Selected match not found. Please select a valid match';
  }

  if (error.status === 400) {
    return error.message || 'Invalid performance data provided';
  }

  if (error.status === 500) {
    return 'Server error occurred. Please try again later';
  }

  return error.message || 'An error occurred while processing the request';
}

/**
 * Validate performance data
 */
export function validatePerformanceData(performance: PerformanceRequest): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!performance.playerId) {
    errors.push('Player ID is required');
  }

  if (!performance.matchId) {
    errors.push('Match ID is required');
  }

  if (performance.score < 0 || performance.score > 20) {
    errors.push('Score must be between 0 and 20');
  }

  if (performance.assists < 0 || performance.assists > 15) {
    errors.push('Assists must be between 0 and 15');
  }

  if (performance.distanceCovered < 0 || performance.distanceCovered > 50) {
    errors.push('Distance covered must be between 0 and 50 km');
  }

  if (performance.timePlayed < 0 || performance.timePlayed > 120) {
    errors.push('Time played must be between 0 and 120 minutes');
  }

  if (performance.rating < 0 || performance.rating > 10) {
    errors.push('Rating must be between 0.0 and 10.0');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
