export interface PromotionRequest {
  name: string;
  promoCode: string;
  discount: number;
  startDate: string;   // LocalDate au format ISO
  endDate: string;
}

export interface PromotionResponse extends PromotionRequest {
  id: number;
  createdAt?: string;
}