import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { ApiService } from './api.service';
import { ReactionType } from '../models/reaction-type.enum';
import { ReactionSummary, AddReactionRequest, UserReaction } from '../models/reaction.model';

// ── Team Community models ──────────────────────────────────────────────────

export interface PostAuthorInfo {
    id: number;
    firstName: string;
    lastName: string;
    profileImageUrl?: string;
}

export interface TeamPostResponse {
    id: number;
    content: string;
    imageUrl?: string;
    author: PostAuthorInfo;
    teamId: number;
    createdAt: string;
    likeCount: number;
    commentCount: number;
    likedByCurrentUser: boolean;
    currentUserReaction?: ReactionType;
    reactions?: ReactionSummary[];
}

export interface TeamCommentResponse {
    id: number;
    content: string;
    author: PostAuthorInfo;
    postId: number;
    parentId?: number;
    replies?: TeamCommentResponse[];
    createdAt: string;
    likeCount?: number;
    likedByCurrentUser?: boolean;
    currentUserReaction?: ReactionType;
    showReactions?: boolean;
}

export interface PageResponse<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
    last: boolean;
    first: boolean;
    number: number;
    size: number;
}

export interface CommunitySummary {
    id: number;
    name: string;
    description?: string;
    categoryId?: number;
    categoryName?: string;
    memberCount?: number;
    teamCount?: number;
    teams?: any[];
    members?: any[];
    access?: string;
    visible?: boolean;
}

export interface CommunityDetail extends CommunitySummary {
    createdAt?: string;
    updatedAt?: string;
    category?: any;
}

@Injectable({ providedIn: 'root' })
export class CommunityService {
    private base: string;
    private readonly communityRefreshSubject = new Subject<void>();
    readonly communityRefresh$ = this.communityRefreshSubject.asObservable();

    constructor(private http: HttpClient, private api: ApiService) {
        this.base = this.api.base;
    }

    // ── Global Posts ──────────────────────────────────────────────────────

    getGlobalPosts(page = 0, size = 10): Observable<any> {
        return this.http.get<any>(`${this.base}/posts?page=${page}&size=${size}`);
    }

    getCommunityPosts(communityId: number): Observable<any[]> {
        return this.http.get<any[]>(`${this.base}/communities/${communityId}/posts`);
    }

    createPost(data: { content: string; communityId?: number; postType?: string }): Observable<any> {
        return this.http.post<any>(`${this.base}/posts`, data);
    }

    createCommunityPost(communityId: number, data: { title: string; content: string }): Observable<any> {
        return this.http.post<any>(`${this.base}/communities/${communityId}/posts`, data);
    }

    deletePost(postId: number): Observable<void> {
        return this.http.delete<void>(`${this.base}/posts/${postId}`);
    }

    // ── Comments ──────────────────────────────────────────────────────────

    getComments(postId: number): Observable<any[]> {
        return this.http.get<any[]>(`${this.base}/posts/${postId}/comments`);
    }

    addComment(postId: number, data: { content: string }): Observable<any> {
        return this.http.post<any>(`${this.base}/posts/${postId}/comments`, data);
    }

    deleteComment(commentId: number): Observable<void> {
        return this.http.delete<void>(`${this.base}/comments/${commentId}`);
    }

    // ── Likes (old system) ────────────────────────────────────────────────

    toggleLike(postId: number): Observable<void> {
        return this.http.post<void>(`${this.base}/posts/${postId}/like`, {});
    }

    // ── Communities ───────────────────────────────────────────────────────

    getCommunities(): Observable<CommunitySummary[]> {
        return this.http.get<CommunitySummary[]>(`${this.base}/communities`);
    }

    getCommunityById(id: number): Observable<CommunityDetail> {
        return this.http.get<CommunityDetail>(`${this.base}/communities/${id}`);
    }

    notifyCommunityRefresh(): void {
        this.communityRefreshSubject.next();
    }

    // ── Team Community Feed ───────────────────────────────────────────────

    getTeamPosts(teamId: number, page = 0): Observable<PageResponse<TeamPostResponse>> {
        return this.http.get<PageResponse<TeamPostResponse>>(
            `${this.base}/community/team/${teamId}/posts?page=${page}`
        );
    }

    createTeamPost(teamId: number, content: string, title?: string): Observable<TeamPostResponse> {
        return this.http.post<TeamPostResponse>(
            `${this.base}/community/team/${teamId}/posts`, { content, title: title || 'Post d\'équipe' }
        );
    }

    uploadTeamPostImage(postId: number, file: File): Observable<TeamPostResponse> {
        const form = new FormData();
        form.append('file', file);
        return this.http.post<TeamPostResponse>(
            `${this.base}/community/posts/${postId}/upload-image`, form
        );
    }

    deleteTeamPost(postId: number): Observable<void> {
        return this.http.delete<void>(`${this.base}/community/posts/${postId}`);
    }

    getTeamPostComments(postId: number): Observable<TeamCommentResponse[]> {
        return this.http.get<TeamCommentResponse[]>(
            `${this.base}/community/posts/${postId}/comments`
        );
    }

    addTeamPostComment(postId: number, content: string, parentId?: number): Observable<TeamCommentResponse> {
        const payload: any = { content };
        if (parentId) {
            payload.parentId = parentId;
        }
        return this.http.post<TeamCommentResponse>(
            `${this.base}/community/posts/${postId}/comments`, payload
        );
    }

    deleteTeamPostComment(commentId: number): Observable<void> {
        return this.http.delete<void>(`${this.base}/community/comments/${commentId}`);
    }

    likeTeamPost(postId: number): Observable<TeamPostResponse> {
        return this.http.post<TeamPostResponse>(
            `${this.base}/community/posts/${postId}/like`, {}
        );
    }

    unlikeTeamPost(postId: number): Observable<TeamPostResponse> {
        return this.http.delete<TeamPostResponse>(
            `${this.base}/community/posts/${postId}/like`
        );
    }

    getTeamPostLikers(postId: number): Observable<PostAuthorInfo[]> {
        return this.http.get<PostAuthorInfo[]>(
            `${this.base}/community/posts/${postId}/likes`
        );
    }

    // ── Reactions (Facebook-style emoji reactions) ────────────────────────

    addReaction(postId: number, reactionType: ReactionType): Observable<void> {
        const request: AddReactionRequest = { reactionType };
        return this.http.post<void>(
            `${this.base}/community/posts/${postId}/react`,
            request
        );
    }

    removeReaction(postId: number): Observable<void> {
        return this.http.delete<void>(
            `${this.base}/community/posts/${postId}/react`
        );
    }

    getReactionSummary(postId: number): Observable<ReactionSummary[]> {
        return this.http.get<ReactionSummary[]>(
            `${this.base}/community/posts/${postId}/reactions`
        );
    }

    getUsersWhoReacted(postId: number): Observable<UserReaction[]> {
        return this.http.get<UserReaction[]>(
            `${this.base}/community/posts/${postId}/likes`
        );
    }

    // ── Convenience wrappers used by communities.component ────────────────

    getReactions(postId: number): Observable<{ myReaction: string | null; totalCount: number; counts: Record<string, number> }> {
        return this.http.get<{ myReaction: string | null; totalCount: number; counts: Record<string, number> }>(
            `${this.base}/community/posts/${postId}/reactions`
        );
    }

    react(postId: number, type: string): Observable<{ totalCount: number; counts: Record<string, number> }> {
        return this.http.post<{ totalCount: number; counts: Record<string, number> }>(
            `${this.base}/community/posts/${postId}/react`,
            { reactionType: type }
        );
    }

    getReactionUsers(postId: number): Observable<any[]> {
        return this.http.get<any[]>(
            `${this.base}/community/posts/${postId}/reaction-users`
        );
    }

    // ── Comment Reactions ──────────────────────────────────────────────────

    reactToComment(commentId: number, reactionType: ReactionType): Observable<void> {
        return this.http.post<void>(
            `${this.base}/community/comments/${commentId}/react`,
            { reactionType }
        );
    }

    removeCommentReaction(commentId: number): Observable<void> {
        return this.http.delete<void>(
            `${this.base}/community/comments/${commentId}/react`
        );
    }
}