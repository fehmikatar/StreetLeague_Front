export interface LoyaltyProgram {
  id?: number;
  name: string;
  description: string;
  pointValue: number;
}

export interface LoyaltyTier {
  id?: number;
  programId: number;
  name: string; // e.g., BRONZE, SILVER, GOLD
  minPoints: number;
  multiplier: number;
}

export interface LoyaltyClient {
  id?: number;
  userId: number;
  programId: number;
  pointsBalance: number;
  totalPointsEarned: number;
  tier?: LoyaltyTier;
}

export interface LoyaltyTransaction {
  id?: number;
  clientId: number;
  transactionType: 'EARN' | 'REDEEM' | 'ADJUSTMENT';
  points: number;
  description: string;
  createdAt: string;
}

export interface EnrollRequest {
  userId: number;
  programId: number;
}

export interface AddPointsRequest {
  userId: number;
  points: number;
  reason: string;
}
