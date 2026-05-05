export interface PromotionRequest {
  name: string;
  promoCode: string;
  discornt: number;
  startDate: string;
  endDate: string;
}

export interface PromotionResponse {
  id: number;
  name: string;
  promoCode: string;
  discornt: number;
  startDate: string;
  endDate: string;
}
