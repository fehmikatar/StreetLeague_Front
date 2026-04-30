import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, MessageCircle, Heart, Share2, TrendingUp, Plus, X, Loader2 } from 'lucide-angular';
import { CommunityService } from '../services/community.service';

@Component({
    selector: 'app-community',
    standalone: true,
    imports: [CommonModule, FormsModule, LucideAngularModule],
    template: `
    <div class="min-h-screen bg-background p-4 md:p-6">
      <div class="max-w-7xl mx-auto">
        <div class="flex items-center justify-between mb-8">
          <div>
            <h1 class="mb-2">Community</h1>
            <p class="text-muted-foreground">Connect with other players</p>
          </div>
          <button (click)="openNewPost()" class="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all">
            <lucide-icon [name]="PlusIcon" [size]="16"></lucide-icon>
            New post
          </button>
        </div>

        <!-- New Post Modal -->
        <div *ngIf="showNewPostModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div class="bg-card rounded-2xl border border-border p-6 w-full max-w-lg shadow-2xl">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-semibold text-foreground">New Post</h3>
              <button (click)="showNewPostModal = false" class="p-2 hover:bg-muted rounded-lg transition-colors">
                <lucide-icon [name]="XIcon" [size]="18" class="text-muted-foreground"></lucide-icon>
              </button>
            </div>
            <textarea [(ngModel)]="newPostContent" rows="4" placeholder="Share something with the community..."
              class="w-full px-4 py-3 bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground resize-none mb-4"></textarea>
            <div class="flex gap-3 justify-end">
              <button (click)="showNewPostModal = false" class="px-4 py-2 bg-muted text-foreground rounded-xl hover:bg-muted/70 transition-colors">Cancel</button>
              <button (click)="submitPost()" [disabled]="posting" class="px-4 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50">
                {{ posting ? 'Publishing...' : 'Publish' }}
              </button>
            </div>
          </div>
        </div>

        <div class="grid lg:grid-cols-3 gap-8">
          <!-- Feed -->
          <div class="lg:col-span-2 space-y-6">
            <div *ngIf="loading" class="flex flex-col items-center py-20 gap-3 text-muted-foreground">
              <lucide-icon [name]="Loader2Icon" [size]="32" class="animate-spin"></lucide-icon>
              Loading posts...
            </div>

            <div *ngIf="!loading && posts.length === 0" class="text-center py-20 text-muted-foreground">
              <div class="text-5xl mb-4">💬</div>
              <p>No posts yet. Be the first!</p>
            </div>

            <div *ngFor="let post of posts" class="bg-card rounded-2xl p-6 border border-border">
              <div class="flex items-start gap-4 mb-4">
                <div class="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold shrink-0">
                  {{ getInitials(post.authorFirstName ? (post.authorFirstName + ' ' + post.authorLastName) : (post.authorName || post.author)) }}
                </div>
                <div class="flex-1">
                  <div class="font-semibold">{{ post.authorFirstName ? (post.authorFirstName + ' ' + post.authorLastName) : (post.authorName || post.author || 'User') }}</div>
                  <div class="text-sm text-muted-foreground">{{ formatDate(post.createdAt || post.time) }}</div>
                </div>
              </div>
              <p class="text-foreground mb-4 whitespace-pre-line">{{ post.content }}</p>
              
              <!-- Action buttons -->
              <div class="flex items-center gap-6 pt-4 border-t border-border">
                <button (click)="toggleLike(post)" class="flex items-center gap-2 text-sm transition-colors"
                  [ngClass]="post.liked ? 'text-primary' : 'text-muted-foreground hover:text-primary'">
                  <lucide-icon [name]="HeartIcon" [size]="16"></lucide-icon>
                  {{ post.likesCount ?? post.likes ?? 0 }}
                </button>
                <button (click)="toggleComments(post)" class="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                  <lucide-icon [name]="MessageCircleIcon" [size]="16"></lucide-icon>
                  {{ post.commentsCount ?? post.comments ?? 0 }}
                </button>
              </div>

              <!-- Facebook Style Comment section -->
              <div *ngIf="post.showComment" class="mt-4 pt-4 border-t border-border">
                
                <div *ngIf="post.loadingComments" class="flex justify-center py-4">
                  <lucide-icon [name]="Loader2Icon" [size]="20" class="animate-spin text-muted-foreground"></lucide-icon>
                </div>
                
                <!-- Liste des commentaires -->
                <div *ngIf="!post.loadingComments" class="space-y-3 mb-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  <div *ngFor="let comment of post.commentList" class="flex items-start gap-2">
                    <div class="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold shrink-0 text-xs mt-1">
                      {{ getInitials(comment.authorFirstName ? (comment.authorFirstName + ' ' + comment.authorLastName) : 'User') }}
                    </div>
                    <div class="flex-1">
                      <div class="bg-muted px-4 py-2.5 rounded-2xl inline-block max-w-full">
                        <div class="font-semibold text-xs">{{ comment.authorFirstName }} {{ comment.authorLastName }}</div>
                        <p class="text-sm text-foreground break-words">{{ comment.content }}</p>
                      </div>
                      <div class="text-xs text-muted-foreground ml-2 mt-1">{{ formatDate(comment.createdAt) }}</div>
                    </div>
                  </div>
                  <div *ngIf="post.commentList && post.commentList.length === 0" class="text-sm text-center text-muted-foreground py-2">
                    Be the first to comment!
                  </div>
                </div>

                <!-- Input area -->
                <div class="flex gap-2 items-start mt-2">
                  <div class="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold shrink-0 text-xs">
                    {{ currentUserInitials }}
                  </div>
                  <div class="flex-1 flex gap-2">
                    <input [(ngModel)]="post.commentInput" placeholder="Write a comment..."
                      (keyup.enter)="addComment(post)"
                      class="flex-1 px-4 py-2 bg-muted border border-border rounded-full text-sm focus:outline-none focus:ring-1 focus:ring-primary">
                    <button (click)="addComment(post)" 
                      class="w-9 h-9 flex items-center justify-center bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors shrink-0 disabled:opacity-50"
                      [disabled]="post.addingComment">
                      <lucide-icon *ngIf="!post.addingComment" [name]="MessageCircleIcon" [size]="16"></lucide-icon>
                      <lucide-icon *ngIf="post.addingComment" [name]="Loader2Icon" [size]="16" class="animate-spin"></lucide-icon>
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>

          <!-- Sidebar -->
          <div class="space-y-6">
            <div class="bg-card rounded-2xl p-6 border border-border">
              <h3 class="mb-4">Trending Topics</h3>
              <div class="space-y-3">
                <div *ngFor="let topic of trending" class="flex items-center gap-3 cursor-pointer hover:bg-muted p-2 rounded-lg transition-colors">
                  <div class="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                    <lucide-icon [name]="TrendingUpIcon" [size]="16" class="text-primary"></lucide-icon>
                  </div>
                  <div>
                    <div class="font-semibold text-sm">{{ topic.tag }}</div>
                    <div class="text-xs text-muted-foreground">{{ topic.posts }} posts</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div *ngIf="toast" class="fixed bottom-6 right-6 bg-card border border-border rounded-xl px-4 py-3 shadow-xl text-sm font-medium text-foreground z-50">
        {{ toast }}
      </div>
    </div>

    <style>
      .custom-scrollbar::-webkit-scrollbar { width: 6px; }
      .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
      .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 20px; }
    </style>
  `,
})
export class CommunityComponent implements OnInit {
    readonly MessageCircleIcon = MessageCircle;
    readonly HeartIcon = Heart;
    readonly Share2Icon = Share2;
    readonly TrendingUpIcon = TrendingUp;
    readonly PlusIcon = Plus;
    readonly XIcon = X;
    readonly Loader2Icon = Loader2;

    toast: string | null = null;
    showNewPostModal = false;
    newPostContent = '';
    loading = true;
    posting = false;
    posts: any[] = [];
    currentUserInitials = 'ME';

    trending = [
        { tag: '#football', posts: 234 },
        { tag: '#basketball', posts: 128 },
        { tag: '#recruitment', posts: 89 },
        { tag: '#tournoi2026', posts: 76 },
    ];

    constructor(private communityService: CommunityService) {}

    ngOnInit() {
        this.currentUserInitials = this.getInitials(localStorage.getItem('user_name') || 'Me');
        this.loadPosts();
    }

    loadPosts() {
        this.communityService.getGlobalPosts().subscribe({
            next: (data: any) => {
                this.posts = (data?.content ?? data ?? []).map((p: any) => ({
                    ...p,
                    // Parse from backend properties
                    liked: p.likedByCurrentUser === true || p.isLikedByCurrentUser === true,
                    showComment: false,
                    commentInput: '',
                    commentList: [],
                    loadingComments: false,
                    addingComment: false
                }));
                this.loading = false;
            },
            error: () => { this.loading = false; }
        });
    }

    toggleLike(post: any) {
        // Optimistic update
        post.liked = !post.liked;
        post.likesCount = (post.likesCount ?? 0) + (post.liked ? 1 : -1);

        this.communityService.toggleLike(post.id).subscribe({
            next: () => {
                // Done
            },
            error: () => {
                // Revert UI on error
                post.liked = !post.liked;
                post.likesCount = (post.likesCount ?? 0) + (post.liked ? 1 : -1);
                this.showToast('Error adding like');
            }
        });
    }

    toggleComments(post: any) {
        post.showComment = !post.showComment;
        
        if (post.showComment && (!post.commentList || post.commentList.length === 0)) {
            post.loadingComments = true;
            this.communityService.getComments(post.id).subscribe({
                next: (comments) => {
                    post.commentList = comments || [];
                    post.loadingComments = false;
                },
                error: () => {
                    post.loadingComments = false;
                    this.showToast('Impossible to load comments');
                }
            });
        }
    }

    addComment(post: any) {
        if (!post.commentInput?.trim() || post.addingComment) return;
        
        const content = post.commentInput;
        post.addingComment = true;
        
        this.communityService.addComment(post.id, { content }).subscribe({
            next: (newComment) => {
                post.commentsCount = (post.commentsCount ?? 0) + 1;
                post.commentInput = '';
                if (!post.commentList) post.commentList = [];
                post.commentList.push(newComment);
                post.addingComment = false;
            },
            error: () => {
                post.addingComment = false;
                this.showToast('Error sending comment');
            }
        });
    }

    openNewPost() {
        this.newPostContent = '';
        this.showNewPostModal = true;
    }

    submitPost() {
        if (!this.newPostContent.trim()) return;
        this.posting = true;
        this.communityService.createPost({ 
            content: this.newPostContent,
            postType: 'GENERAL'
        }).subscribe({
            next: (post: any) => {
                this.posts.unshift({ 
                    ...post, 
                    liked: false, 
                    showComment: false, 
                    commentInput: '',
                    commentList: [],
                    loadingComments: false,
                    addingComment: false
                });
                this.showNewPostModal = false;
                this.newPostContent = '';
                this.posting = false;
                this.showToast('Post published! 🎉');
            },
            error: () => {
                this.posting = false;
                this.showToast('Error during publishing');
            }
        });
    }

    getInitials(name: string): string {
        if (!name || name.trim() === '') return '?';
        const parts = name.trim().split(' ').filter(n => n.length > 0);
        if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }

    formatDate(d: string): string {
        if (!d) return '';
        const date = new Date(d);
        const diffMs = Date.now() - date.getTime();
        const diffH = Math.floor(diffMs / 3600000);
        if (diffH < 1) return 'Just now';
        if (diffH < 24) return `${diffH}h ago`;
        return date.toLocaleDateString('en-US', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
    }

    showToast(msg: string) {
        this.toast = msg;
        setTimeout(() => this.toast = null, 3000);
    }
}
