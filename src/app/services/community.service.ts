import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class CommunityService {
    private base: string;

    constructor(private http: HttpClient, private api: ApiService) {
        this.base = this.api.base;
    }

    // Posts
    getGlobalPosts(page = 0, size = 10): Observable<any> {
        return this.http.get<any>(`${this.base}/community/posts?page=${page}&size=${size}`);
    }

    createPost(data: { content: string; communityId?: number; postType?: string }): Observable<any> {
        return this.http.post<any>(`${this.base}/community/posts`, data);
    }

    deletePost(postId: number): Observable<void> {
        return this.http.delete<void>(`${this.base}/posts/${postId}`);
    }

    // Comments
    getComments(postId: number): Observable<any[]> {
        return this.http.get<any[]>(`${this.base}/posts/${postId}/comments`);
    }

    addComment(postId: number, data: { content: string }): Observable<any> {
        return this.http.post<any>(`${this.base}/posts/${postId}/comments`, data);
    }

    deleteComment(commentId: number): Observable<void> {
        return this.http.delete<void>(`${this.base}/comments/${commentId}`);
    }

    // Likes
    toggleLike(postId: number): Observable<void> {
        return this.http.post<void>(`${this.base}/posts/${postId}/like`, {});
    }

    // Communities
    getMyCommunities(): Observable<any[]> {
        return this.http.get<any[]>(`${this.base}/communities/me`);
    }
}
