import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Category {
  id?: number;
  nom?: string;
  name?: string;
  description?: string;
  capacity?: number;
}

export interface ProductVariant {
  id?: number;
  size?: string;
  color?: string;
  sku?: string;
  stock?: number;
  priceAdjustment?: number;
}

export interface Product {
  id: number;
  nom: string;
  marque?: string;
  description: string;
  prix: number;
  stock: number;
  images: string[];
  category?: Category;
  variants?: ProductVariant[];
  createdAt?: string;
  updatedAt?: string;
  deleted?: boolean;
  status?: string;
}

export interface ProductRequest {
  nom: string;
  description: string;
  prix: number;
  stock: number;
  images: string[];
  categoryId: number;
  variants?: ProductVariant[];
  status?: string;
}

export interface ProductSearchCriteria {
  keyword?: string | null;
  categoryId?: number | null;
  minPrice?: number | null;
  maxPrice?: number | null;
}

export interface ProductResponse {
  content: Product[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface FavoriteCategory {
  id: number;
  name: string;
}

export interface FavoriteResponse {
  id: number;
  product: Product;
  category?: FavoriteCategory;
  addedAt: string;
}

export interface CartItemDTO {
  id: number;
  productId?: number;
  productName?: string;
  productImage?: string;
  product?: Product;
  price: number;
  quantity: number;
  selectedVariant?: ProductVariant;
  addedAt?: string;
}

export interface CartResponse {
  id: number;
  orderCode?: string;
  items: CartItemDTO[];
  subtotal?: number;
  discount?: number;
  total?: number;
  appliedPromoCode?: string;
  status?: string;
  createdAt?: string;
  lastModified?: string;
  clientName?: string;
  clientAddress?: string;
  clientPostalCode?: string;
  clientCity?: string;
  clientPhone?: string;
  deliveryMode?: string;
  paymentMode?: string;
  deliveryFee?: number;
  deliveryStatus?: string;
  deliveryConfirmationCode?: string;
}

export interface ProductHighDemandDTO {
  id: number;
  nom: string;
  quantityInActiveCarts: number;
  currentStock: number;
  categoryName: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = `${environment.apiUrl}/products`;
  private categoryUrl = `${environment.apiUrl}/categories`;
  private cartUrl = `${environment.apiUrl}/cart`;
  private favoriteUrl = `${environment.apiUrl}/favorites`;
  private statsUrl = `${environment.apiUrl}/stats`;
  private sponsoredUrl = `${environment.apiUrl}/sponsored`;

  constructor(private http: HttpClient) {}

  // ==========================
  // CATEGORIES
  // ==========================
  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(this.categoryUrl);
  }

  createCategory(category: Category): Observable<Category> {
    return this.http.post<Category>(this.categoryUrl, category);
  }

  updateCategory(id: number, category: Category): Observable<Category> {
    return this.http.put<Category>(`${this.categoryUrl}/${id}`, category);
  }

  deleteCategory(id: number): Observable<any> {
    return this.http.delete<any>(`${this.categoryUrl}/${id}`);
  }

  // ==========================
  // PRODUCTS
  // ==========================
  getAllProducts(page: number = 0, size: number = 20): Observable<ProductResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<ProductResponse>(this.apiUrl, { params });
  }

  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  searchProducts(criteria: ProductSearchCriteria, page: number = 0, size: number = 20): Observable<ProductResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (criteria.keyword) params = params.set('keyword', criteria.keyword);
    if (criteria.categoryId) params = params.set('categoryId', criteria.categoryId.toString());
    if (criteria.minPrice != null) params = params.set('minPrice', criteria.minPrice.toString());
    if (criteria.maxPrice != null) params = params.set('maxPrice', criteria.maxPrice.toString());

    return this.http.get<ProductResponse>(`${this.apiUrl}/search`, { params });
  }

  // Obsolete - kept for backward compatibility mostly, redirecting to search.
  getProductsByCategory(categoryId: number, page: number = 0, size: number = 20): Observable<ProductResponse> {
    return this.searchProducts({ categoryId }, page, size);
  }

  getLowStockProducts(threshold: number = 10): Observable<Product[]> {
    const params = new HttpParams().set('threshold', threshold.toString());
    return this.http.get<Product[]>(`${this.apiUrl}/low-stock`, { params });
  }

  getMostFavoritedProducts(limit: number = 10): Observable<Product[]> {
    const params = new HttpParams().set('limit', limit.toString());
    return this.http.get<Product[]>(`${this.apiUrl}/most-favorited`, { params });
  }

  getHighDemandProducts(): Observable<ProductHighDemandDTO[]> {
    return this.http.get<ProductHighDemandDTO[]>(`${this.apiUrl}/high-demand`);
  }

  createProduct(request: ProductRequest): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, request);
  }

  updateProduct(id: number, request: ProductRequest): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/${id}`, request);
  }

  deleteProduct(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  bulkImportProducts(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<any>(`${this.apiUrl}/bulk/import`, formData);
  }

  bulkExportProducts(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/bulk/export`, { responseType: 'blob' });
  }

  uploadImage(file: File): Observable<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ url: string }>(`${this.apiUrl}/upload-image`, formData);
  }

  // ==========================
  // CART
  // ==========================
  addToCart(productId: number, quantity: number = 1, variantId?: number): Observable<any> {
    const payload: any = { productId, quantity };
    if (variantId) payload.variantId = variantId;
    return this.http.post<any>(`${this.cartUrl}/items`, payload);
  }

  getCart(): Observable<CartResponse> {
    return this.http.get<CartResponse>(this.cartUrl);
  }

  removeFromCart(itemId: number): Observable<any> {
    return this.http.delete<any>(`${this.cartUrl}/items/${itemId}`);
  }

  updateCartItem(itemId: number, quantity: number): Observable<any> {
    const payload = { quantity };
    return this.http.put<any>(`${this.cartUrl}/items/${itemId}`, payload);
  }

  clearCart(): Observable<any> {
    return this.http.delete<any>(this.cartUrl);
  }

  checkoutCart(request: any): Observable<CartResponse> {
    return this.http.post<CartResponse>(`${this.cartUrl}/checkout`, request);
  }

  applyPromoCodeCart(code: string): Observable<CartResponse> {
    return this.http.post<CartResponse>(`${this.cartUrl}/promo`, { code });
  }

  removePromoCodeCart(): Observable<CartResponse> {
    return this.http.delete<CartResponse>(`${this.cartUrl}/promo`);
  }

  getMyOrders(): Observable<CartResponse[]> {
    return this.http.get<CartResponse[]>(`${this.cartUrl}/orders/my`);
  }

  getAllOrders(): Observable<CartResponse[]> {
    return this.http.get<CartResponse[]>(`${this.cartUrl}/orders/all`);
  }

  updateOrderStatus(cartId: number, status: string): Observable<CartResponse> {
    return this.http.put<CartResponse>(`${this.cartUrl}/orders/${cartId}/status`, { status });
  }

  calculateDeliveryFee(address: string): Observable<number> {
    const params = new HttpParams().set('address', address);
    return this.http.get<number>(`${this.cartUrl}/calculate-delivery`, { params });
  }

  confirmDelivery(code: string): Observable<string> {
    return this.http.get(`${this.cartUrl}/confirm-delivery/${code}`, { responseType: 'text' });
  }

  // ==========================
  // FAVORITES & WISHLIST
  // ==========================
  addToFavorites(productId: number, categoryId?: number): Observable<FavoriteResponse | null> {
    const body: any = { productId };
    if (categoryId) body.categoryId = categoryId;
    return this.http.post<FavoriteResponse | null>(this.favoriteUrl, body);
  }

  removeFromFavorites(productId: number): Observable<any> {
    return this.http.delete<any>(`${this.favoriteUrl}/${productId}`);
  }

  checkIfFavorite(productId: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.favoriteUrl}/check/${productId}`);
  }

  getMyFavorites(page: number = 0, size: number = 50): Observable<{ content: FavoriteResponse[]; totalPages: number; totalElements: number }> {
    const params = new HttpParams().set('page', page.toString()).set('size', size.toString());
    return this.http.get<any>(this.favoriteUrl, { params });
  }

  getFavoriteCategories(): Observable<FavoriteCategory[]> {
    return this.http.get<FavoriteCategory[]>(`${this.favoriteUrl}/categories`);
  }

  createFavoriteCategory(name: string): Observable<FavoriteCategory> {
    return this.http.post<FavoriteCategory>(`${this.favoriteUrl}/categories`, { name });
  }

  getFavoritesByCategory(categoryId: number): Observable<FavoriteResponse[]> {
    return this.http.get<FavoriteResponse[]>(`${this.favoriteUrl}/category/${categoryId}`);
  }

  categorizeFavorite(favoriteId: number, categoryId: number): Observable<any> {
    return this.http.put<any>(`${this.favoriteUrl}/${favoriteId}/categorize/${categoryId}`, {});
  }

  searchFavorites(productName: string = '', categoryName: string = ''): Observable<FavoriteResponse[]> {
    const params = new HttpParams()
      .set('productName', productName)
      .set('categoryName', categoryName);
    return this.http.get<FavoriteResponse[]>(`${this.favoriteUrl}/search`, { params });
  }

  getLowStockFavorites(): Observable<FavoriteResponse[]> {
    return this.http.get<FavoriteResponse[]>(`${this.favoriteUrl}/low-stock`);
  }

  triggerStockCheck(): Observable<void> {
    return this.http.post<void>(`${this.favoriteUrl}/trigger-check`, {});
  }

  // ==========================
  // RECOMMENDATIONS & STATS
  // ==========================
  getAIRecommendations(userId: number, limit: number = 20): Observable<{
    user_id: number;
    total: number;
    flask_available: boolean;
    debug_favorite_products: number[];
    debug_preferred_categories: number[];
    ranked_products: { product_id: number; rank: number; recommendation_score: number; priority: string }[];
  }> {
    const params = new HttpParams()
      .set('userId', userId.toString())
      .set('limit', limit.toString());
    return this.http.get<any>(`${this.sponsoredUrl}/recommendations/ai`, { params });
  }

  getTopSellingProductsStats(): Observable<any[]> {
    return this.http.get<any[]>(`${this.statsUrl}/top-products`);
  }

  getAbandonedCartStatsCity(): Observable<any[]> {
    return this.http.get<any[]>(`${this.statsUrl}/abandoned-by-city`);
  }

  getPromoCodeUsageStats(): Observable<any[]> {
    return this.http.get<any[]>(`${this.statsUrl}/promo-codes`);
  }

  getOrderSummaryStats(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.statsUrl}/order-summary/${userId}`);
  }
}
