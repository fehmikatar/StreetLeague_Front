import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Category {
  id?: number;
  nom?: string;
  name?: string;
  description?: string;
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
  description: string;
  prix: number;
  stock: number;
  images: string[];
  category?: Category;
  variants?: ProductVariant[];
  createdAt?: string;
  updatedAt?: string;
  deleted?: boolean;
}

export interface ProductRequest {
  nom: string;
  description: string;
  prix: number;
  stock: number;
  images: string[];
  categoryId: number;
  variants?: ProductVariant[];
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

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = `${environment.apiUrl}/products`;
  private categoryUrl = `${environment.apiUrl}/categories`;
  private cartUrl = `${environment.apiUrl}/cart`;

  constructor(private http: HttpClient) {}

  // ==========================
  // CATEGORIES
  // ==========================
  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(this.categoryUrl);
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

  // ==========================
  // CART
  // ==========================
  addToCart(productId: number, quantity: number = 1, variantId?: number): Observable<any> {
    const payload: any = { productId, quantity };
    if (variantId) payload.variantId = variantId;
    return this.http.post<any>(`${this.cartUrl}/items`, payload);
  }

  getCart(): Observable<any> {
    return this.http.get<any>(this.cartUrl);
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

  // ==========================
  // FAVORITES & WISHLIST
  // ==========================
  private favoriteUrl = `${environment.apiUrl}/favorites`;

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

  getMyFavorites(page: number = 0, size: number = 50): Observable<{ content: FavoriteResponse[], totalPages: number, totalElements: number }> {
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
}
