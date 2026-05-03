export interface FieldRequest {
  name: string;
  address: string;
  city: string;
  postalCode: string;
  surface: number;
  capacity: number;
  sportType: string;
  pricePerHour: number;
  description?: string;
  amenities?: string[];
}

export interface FieldResponse {
  id: number;
  name: string;
  address: string;
  city: string;
  postalCode: string;
  surface: number;
  capacity: number;
  sportType: string;
  pricePerHour: number;
  description?: string;
  amenities: string[];
  images: string[];
  ownerId: number;
  createdAt: string;
}