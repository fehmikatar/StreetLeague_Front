import { ReactionType } from './reaction-type.enum';

export interface ReactionSummary {
  reactionType: ReactionType;
  emoji: string;
  count: number;
}

export interface AddReactionRequest {
  reactionType: ReactionType;
}

export interface UserReaction {
  userId: number;
  name: string;
  profileImage?: string;
  reactionType: ReactionType;
}