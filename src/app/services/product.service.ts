import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Category {
  id?: number;
  nom?: string;
  name?: string;
  description?: string;
  capacity?: number;
}

export interface CategoryPayload {
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
  addedAt?: string;
}

export interface CartItemDTO {
  id: number;
  productId: number;
  productName: string;
  productImage?: string;
  price: number;
  quantity: number;
  selectedVariant?: ProductVariant;
  addedAt: string;
}

export interface CartResponse {
  id: number;
  orderCode?: string;
  items: CartItemDTO[];
  subtotal: number;
  discount: number;
  total: number;
  appliedPromoCode?: string;
  status: string;
  createdAt: string;
  lastModified: string;
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

export interface AIRankedProduct {
  product_id: number | string;
  recommendation_score: number;
  rank: number;
  priority?: string;
}

export interface AIRecommendationsResponse {
  ranked_products: AIRankedProduct[];
  flask_available?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = `${environment.apiUrl}/products`;
  private categoryUrl = `${environment.apiUrl}/categories`;
  private cartUrl = `${environment.apiUrl}/cart`;

  constructor(private http: HttpClient) { }

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(this.categoryUrl);
  }

  createCategory(payload: CategoryPayload): Observable<Category> {
    return this.http.post<Category>(this.categoryUrl, payload);
  }

  updateCategory(id: number, payload: CategoryPayload): Observable<Category> {
    return this.http.put<Category>(`${this.categoryUrl}/${id}`, payload);
  }

  deleteCategory(id: number): Observable<any> {
    const byPath = `${this.categoryUrl}/${id}`;
    const byDeleteSuffix = `${this.categoryUrl}/delete/${id}`;

    return this.http.delete<any>(byPath).pipe(
      catchError((error) => {
        if (error?.status === 400) return throwError(() => error);
        if (error?.status !== 404 && error?.status !== 405) return throwError(() => error);

        return this.http.delete<any>(byDeleteSuffix).pipe(
          catchError((suffixError) => {
            if (suffixError?.status === 400) return throwError(() => suffixError);
            if (suffixError?.status !== 404 && suffixError?.status !== 405) return throwError(() => suffixError);

            return this.http.delete<any>(this.categoryUrl, {
              params: new HttpParams().set('id', String(id))
            });
          })
        );
      })
    );
  }

  getAllProducts(page: number = 0, size: number = 20): Observable<ProductResponse> {
    const params = new HttpParams().set('page', page.toString()).set('size', size.toString());
    return this.http.get<ProductResponse>(this.apiUrl, { params });
  }

  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  searchProducts(criteria: ProductSearchCriteria, page: number = 0, size: number = 20): Observable<ProductResponse> {
    let params = new HttpParams().set('page', page.toString()).set('size', size.toString());
    if (criteria.keyword) params = params.set('keyword', criteria.keyword);
    if (criteria.categoryId) params = params.set('categoryId', criteria.categoryId.toString());
    if (criteria.minPrice != null) params = params.set('minPrice', criteria.minPrice.toString());
    if (criteria.maxPrice != null) params = params.set('maxPrice', criteria.maxPrice.toString());
    return this.http.get<ProductResponse>(`${this.apiUrl}/search`, { params });
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

  getCart(): Observable<CartResponse> {
    return this.http.get<CartResponse>(this.cartUrl);
  }

  addToCart(productId: number, quantity: number = 1, variantId?: number): Observable<any> {
    const payload: any = { productId, quantity };
    if (variantId) payload.variantId = variantId;
    return this.http.post<any>(`${this.cartUrl}/items`, payload);
  }

  removeFromCart(itemId: number): Observable<any> {
    return this.http.delete<any>(`${this.cartUrl}/items/${itemId}`);
  }

  updateCartItem(itemId: number, quantity: number): Observable<any> {
    return this.http.put<any>(`${this.cartUrl}/items/${itemId}`, { quantity });
  }

  checkoutCart(request: any): Observable<CartResponse> {
    return this.http.post<CartResponse>(`${this.cartUrl}/checkout`, request);
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

  private favoriteUrl = `${environment.apiUrl}/favorites`;

  addToFavorites(productId: number, categoryId?: number): Observable<FavoriteResponse | null> {
    const body: any = { productId };
    if (categoryId) body.categoryId = categoryId;
    return this.http.post<FavoriteResponse | null>(this.favoriteUrl, body);
  }

  removeFromFavorites(productId: number): Observable<any> {
    return this.http.delete<any>(`${this.favoriteUrl}/${productId}`);
  }

  getMyFavorites(page: number = 0, size: number = 50): Observable<{ content: FavoriteResponse[], totalPages: number, totalElements: number }> {
    const params = new HttpParams().set('page', page.toString()).set('size', size.toString());
    return this.http.get<any>(this.favoriteUrl, { params });
  }

  getTopSellingProductsStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/stats/top-selling`);
  }

  getHighDemandProducts(): Observable<ProductHighDemandDTO[]> {
    return this.http.get<ProductHighDemandDTO[]>(`${this.apiUrl}/high-demand`);
  }

  getAbandonedCartStatsCity(): Observable<any> {
    return this.http.get(`${this.cartUrl}/stats/abandoned-by-city`);
  }

  getPromoCodeUsageStats(): Observable<any> {
    return this.http.get(`${this.cartUrl}/stats/promo-usage`);
  }

  getLowStockProducts(threshold: number): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/low-stock/${threshold}`);
  }

  bulkImportProducts(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/import`, formData);
  }

  bulkExportProducts(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/export`, { responseType: 'blob' });
  }

  getFavoriteCategories(): Observable<FavoriteCategory[]> {
    return this.http.get<FavoriteCategory[]>(`${this.favoriteUrl}/categories`);
  }

  getLowStockFavorites(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.favoriteUrl}/low-stock`);
  }

  getFavoritesByCategory(categoryId: number): Observable<FavoriteResponse[]> {
    return this.http.get<FavoriteResponse[]>(`${this.favoriteUrl}/category/${categoryId}`);
  }

  searchFavorites(name: string, category?: string | number): Observable<FavoriteResponse[]> {
    let params = new HttpParams().set('name', name);
    if (category) params = params.set('category', category.toString());
    return this.http.get<FavoriteResponse[]>(`${this.favoriteUrl}/search`, { params });
  }

  createFavoriteCategory(name: string): Observable<FavoriteCategory> {
    return this.http.post<FavoriteCategory>(`${this.favoriteUrl}/categories`, { name });
  }

  categorizeFavorite(favId: number, catId: number): Observable<any> {
    return this.http.patch(`${this.favoriteUrl}/${favId}/category`, { categoryId: catId });
  }

  triggerStockCheck(): Observable<any> {
    return this.http.post(`${this.apiUrl}/check-stock`, {});
  }

  getAIRecommendations(userId: any, limit: number = 5): Observable<AIRecommendationsResponse> {
    return this.http.get<AIRecommendationsResponse>(`${this.apiUrl}/recommendations/${userId}?limit=${limit}`);
  }

  checkIfFavorite(productId: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.favoriteUrl}/check/${productId}`);
  }

  calculateDeliveryFee(location: string): Observable<number> {
    return this.http.get<number>(`${this.cartUrl}/delivery-fee?location=${encodeURIComponent(location)}`);
  }

  clearCart(): Observable<any> {
    return this.http.delete(`${this.cartUrl}/clear`);
  }
}
