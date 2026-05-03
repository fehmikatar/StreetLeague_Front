import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {
    LucideAngularModule,
    ArrowLeft, Loader2, RefreshCcw,
    Heart, MessageCircle,
    ImagePlus, Send, Trash2, X,
    ChevronDown, ChevronUp,
    Users
} from 'lucide-angular';
import {
    CommunityService,
    TeamPostResponse,
    TeamCommentResponse
} from '../services/community.service';
import { TeamService } from '../services/team.service';
import { environment } from '../../environments/environment';
import { ReactionPickerComponent } from '../components/reaction-picker/reaction-picker';
import { ReactionsModalComponent } from '../components/reactions-modal/reactions-modal';
import { ReactionType, REACTION_EMOJIS } from '../models/reaction-type.enum';
import { UserReaction } from '../models/reaction.model';

interface PostState {
    data: TeamPostResponse;
    showComments: boolean;
    comments: TeamCommentResponse[];
    loadingComments: boolean;
    newCommentText: string;
    submittingComment: boolean;
    replyingTo: TeamCommentResponse | null;
}

@Component({
    selector: 'app-team-community',
    standalone: true,
    imports: [
        CommonModule, 
        RouterModule, 
        LucideAngularModule,
        ReactionPickerComponent,
        ReactionsModalComponent
    ],
    template: `
<div class="min-h-screen bg-background">
  <div class="max-w-2xl mx-auto px-4 py-6">

    <!-- Back -->
    <button (click)="goBack()"
      class="mb-5 inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-muted hover:bg-muted/70 transition-colors text-sm font-medium">
      <lucide-icon [name]="ArrowLeftIcon" [size]="16"></lucide-icon>
      Back to team
    </button>

    <!-- Header -->
    <div class="flex items-center gap-3 mb-6">
      <div class="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-sm">
        <lucide-icon [name]="UsersIcon" [size]="20" class="text-white"></lucide-icon>
      </div>
      <div>
        <h1 class="text-xl font-bold text-foreground leading-tight">
          {{ teamName ? teamName + ' Community' : 'Team Community' }}
        </h1>
        <p class="text-xs text-muted-foreground">Share moments with your teammates</p>
      </div>
    </div>

    <!-- Error banner -->
    <div *ngIf="errorBanner"
      class="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-300 flex items-center justify-between gap-4">
      <span>{{ errorBanner }}</span>
      <button (click)="loadPosts(true)"
        class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 transition-colors font-medium text-xs">
        <lucide-icon [name]="RefreshCcwIcon" [size]="13"></lucide-icon>
        Retry
      </button>
    </div>

    <!-- ── Create Post ─────────────────────────────────────────────────── -->
    <div class="bg-card border border-border rounded-2xl p-4 mb-5 shadow-sm">
      <div class="flex items-start gap-3">
        <div class="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-accent flex-shrink-0
                    flex items-center justify-center text-white text-xs font-bold select-none">
          {{ currentUserInitials }}
        </div>
        <textarea
          [value]="newPostContent"
          (input)="onPostInput($event)"
          placeholder="What's on your mind?"
          rows="2"
          [disabled]="submittingPost"
          class="flex-1 resize-none rounded-xl border border-border bg-muted/30 px-3 py-2 text-sm
                 text-foreground placeholder:text-muted-foreground focus:outline-none
                 focus:ring-2 focus:ring-primary/50 disabled:opacity-60 transition-all"
        ></textarea>
      </div>

      <div *ngIf="newPostImagePreview" class="mt-3 ml-12 relative inline-block">
        <img [src]="newPostImagePreview" alt="Preview"
          class="max-h-48 rounded-xl border border-border object-cover">
        <button (click)="removePostImage()"
          class="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive shadow-md
                 flex items-center justify-center">
          <lucide-icon [name]="XIcon" [size]="12" class="text-white"></lucide-icon>
        </button>
      </div>

      <div class="mt-3 ml-12 flex items-center justify-between gap-3">
        <div class="flex items-center gap-2">
          <label
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                   text-muted-foreground hover:bg-muted cursor-pointer transition-colors select-none">
            <lucide-icon [name]="ImagePlusIcon" [size]="15"></lucide-icon>
            Photo
            <input type="file" accept="image/jpeg,image/png,image/gif"
              class="hidden" (change)="onImageSelected($event)" [disabled]="submittingPost">
          </label>
          <span class="text-xs tabular-nums"
            [ngClass]="newPostContent.length > 4800 ? 'text-destructive font-medium' : 'text-muted-foreground'">
            {{ 5000 - newPostContent.length }}
          </span>
        </div>
        <button (click)="submitPost()"
          [disabled]="!newPostContent.trim() || submittingPost || newPostContent.length > 5000"
          class="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold
                 bg-primary text-primary-foreground hover:bg-primary/90
                 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
          <lucide-icon *ngIf="submittingPost" [name]="Loader2Icon" [size]="14" class="animate-spin"></lucide-icon>
          <lucide-icon *ngIf="!submittingPost" [name]="SendIcon" [size]="14"></lucide-icon>
          {{ submittingPost ? 'Posting…' : 'Post' }}
        </button>
      </div>

      <p *ngIf="postError" class="mt-2 ml-12 text-xs text-destructive">{{ postError }}</p>
    </div>

    <!-- ── Loading ─────────────────────────────────────────────────────── -->
    <div *ngIf="loading" class="flex flex-col items-center py-16 gap-3 text-muted-foreground">
      <lucide-icon [name]="Loader2Icon" [size]="32" class="animate-spin"></lucide-icon>
      <span class="text-sm">Loading posts…</span>
    </div>

    <!-- ── Empty state ────────────────────────────────────────────────── -->
    <div *ngIf="!loading && posts.length === 0 && !errorBanner" class="text-center py-16">
      <div class="h-16 w-16 rounded-2xl bg-muted mx-auto flex items-center justify-center mb-4">
        <lucide-icon [name]="UsersIcon" [size]="32" class="text-muted-foreground opacity-40"></lucide-icon>
      </div>
      <p class="text-lg font-semibold text-foreground">No posts yet</p>
      <p class="text-sm text-muted-foreground mt-1">Be the first to share something with your team!</p>
    </div>

    <!-- ── Posts feed ─────────────────────────────────────────────────── -->
    <div *ngFor="let post of posts; trackBy: trackPost"
      class="bg-card border border-border rounded-2xl mb-4 shadow-sm overflow-hidden">

      <!-- Post header -->
      <div class="flex items-center justify-between px-4 pt-4 pb-3">
        <div class="flex items-center gap-3 min-w-0">
          <div class="h-9 w-9 rounded-full overflow-hidden flex-shrink-0">
            <img *ngIf="post.data.author.profileImageUrl"
              [src]="getFullUrl(post.data.author.profileImageUrl)"
              [alt]="post.data.author.firstName"
              class="h-full w-full object-cover">
            <div *ngIf="!post.data.author.profileImageUrl"
              class="h-full w-full bg-gradient-to-br from-primary/70 to-accent/70
                     flex items-center justify-center text-white text-xs font-bold">
              {{ getInitials(post.data.author.firstName, post.data.author.lastName) }}
            </div>
          </div>
          <div class="min-w-0">
            <p class="text-sm font-semibold text-foreground leading-none truncate">
              {{ post.data.author.firstName }} {{ post.data.author.lastName }}
            </p>
            <p class="text-xs text-muted-foreground mt-0.5">{{ formatTime(post.data.createdAt) }}</p>
          </div>
        </div>
        <button *ngIf="post.data.author.id === currentUserId"
          (click)="confirmDeletePost(post)"
          title="Delete post"
          class="h-8 w-8 rounded-lg inline-flex items-center justify-center flex-shrink-0
                 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors">
          <lucide-icon [name]="Trash2Icon" [size]="15"></lucide-icon>
        </button>
      </div>

      <!-- Post content -->
      <div class="px-4 pb-3">
        <p class="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{{ post.data.content }}</p>
      </div>

      <!-- Post image -->
      <div *ngIf="post.data.imageUrl" class="px-4 pb-3">
        <img [src]="getFullUrl(post.data.imageUrl)" alt="Post image"
          (click)="openFullscreen(getFullUrl(post.data.imageUrl!))"
          class="w-full rounded-xl object-cover max-h-80 cursor-zoom-in border border-border
                 hover:opacity-95 transition-opacity">
      </div>

      <!-- ✅ Résumé des réactions (cliquable) -->
      <div *ngIf="post.data.reactions && post.data.reactions.length > 0"
           class="px-4 pb-2 flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity"
           (click)="openReactionsModal(post)">
        <span *ngFor="let reaction of post.data.reactions" 
              class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted/50 text-xs">
          <span>{{ reaction.emoji }}</span>
          <span class="font-semibold tabular-nums">{{ reaction.count }}</span>
        </span>
      </div>

      <!-- Actions bar -->
      <div class="px-4 pb-3 pt-1 flex items-center gap-1 border-t border-border">
        
        <!-- ✅ Réaction avec picker -->
        <div class="relative">
          <button
            (mouseenter)="showReactionPicker(post.data.id)"
            (mouseleave)="scheduleHidePicker()"
            (click)="toggleReaction(post)"
            class="inline-flex items-center gap-1.5 text-sm font-medium rounded-lg px-2.5 py-1.5
                   hover:bg-muted/60 transition-colors"
            [ngClass]="post.data.currentUserReaction ? 'text-primary' : 'text-muted-foreground'">
            <span *ngIf="post.data.currentUserReaction" class="text-base">
              {{ getReactionEmoji(post.data.currentUserReaction) }}
            </span>
            <lucide-icon *ngIf="!post.data.currentUserReaction" [name]="HeartIcon" [size]="16"></lucide-icon>
            <span class="tabular-nums">{{ post.data.likeCount }}</span>
          </button>

          <!-- Picker de réactions -->
          <app-reaction-picker
            *ngIf="activePickerId === post.data.id"
            (reactionSelected)="onReactionSelected(post, $event)"
            (mouseenter)="cancelHidePicker()"
            (mouseleave)="scheduleHidePicker()">
          </app-reaction-picker>
        </div>

        <!-- Comment toggle -->
        <button (click)="toggleComments(post)"
          class="inline-flex items-center gap-1.5 text-sm font-medium rounded-lg px-2.5 py-1.5
                 text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-colors">
          <lucide-icon [name]="MessageCircleIcon" [size]="16"></lucide-icon>
          <span class="tabular-nums">{{ post.data.commentCount }}</span>
        </button>

        <div class="flex-1"></div>

        <button (click)="toggleComments(post)"
          class="inline-flex items-center gap-1 text-xs text-muted-foreground
                 hover:text-foreground transition-colors px-2 py-1.5 rounded-lg hover:bg-muted/60">
          {{ post.showComments ? 'Hide' : 'Comments' }}
          <lucide-icon [name]="post.showComments ? ChevronUpIcon : ChevronDownIcon" [size]="13"></lucide-icon>
        </button>
      </div>

      <!-- ── Comments section ─────────────────────────────────────────── -->
      <div *ngIf="post.showComments" class="border-t border-border">
        <div *ngIf="post.loadingComments" class="flex justify-center py-5">
          <lucide-icon [name]="Loader2Icon" [size]="20" class="animate-spin text-muted-foreground"></lucide-icon>
        </div>

        <div *ngIf="!post.loadingComments" class="px-4 pt-3 space-y-3 max-h-72 overflow-y-auto">
          <div *ngIf="post.comments.length === 0"
            class="text-center py-2 text-sm text-muted-foreground">
            No comments yet. Be the first!
          </div>

          <div *ngFor="let comment of post.comments" class="space-y-3">
            <div class="flex items-start gap-2.5">
              <div class="h-7 w-7 rounded-full overflow-hidden flex-shrink-0 mt-0.5">
                <img *ngIf="comment.author.profileImageUrl"
                  [src]="getFullUrl(comment.author.profileImageUrl)"
                  [alt]="comment.author.firstName"
                  class="h-full w-full object-cover">
                <div *ngIf="!comment.author.profileImageUrl"
                  class="h-full w-full bg-gradient-to-br from-primary/50 to-accent/50
                         flex items-center justify-center text-white text-xs font-bold">
                  {{ getInitials(comment.author.firstName, comment.author.lastName) }}
                </div>
              </div>
              <div class="flex-1 min-w-0">
                <div class="bg-muted/40 rounded-2xl rounded-tl-sm px-3 py-2">
                  <p class="text-xs font-semibold text-foreground mb-0.5">
                    {{ comment.author.firstName }} {{ comment.author.lastName }}
                  </p>
                  <p class="text-sm text-foreground leading-snug">{{ comment.content }}</p>
                </div>
                <div class="flex items-center gap-3 mt-1 pl-1">
                  <span class="text-xs text-muted-foreground">{{ formatTime(comment.createdAt) }}</span>
                  <button (click)="setReplyingTo(post, comment)"
                    class="text-xs text-primary font-medium hover:underline">
                    Reply
                  </button>
                  <button *ngIf="comment.author.id === currentUserId"
                    (click)="deleteComment(post, comment)"
                    class="text-xs text-muted-foreground hover:text-destructive transition-colors">
                    Delete
                  </button>
                </div>
              </div>
            </div>

            <!-- Nested Replies -->
            <div *ngIf="comment.replies && comment.replies.length > 0" class="ml-9 space-y-3 pt-1 border-l-2 border-muted pl-4">
              <div *ngFor="let reply of comment.replies" class="flex items-start gap-2.5">
                <div class="h-6 w-6 rounded-full overflow-hidden flex-shrink-0 mt-0.5">
                  <img *ngIf="reply.author.profileImageUrl"
                    [src]="getFullUrl(reply.author.profileImageUrl)"
                    [alt]="reply.author.firstName"
                    class="h-full w-full object-cover">
                  <div *ngIf="!reply.author.profileImageUrl"
                    class="h-full w-full bg-gradient-to-br from-primary/50 to-accent/50
                           flex items-center justify-center text-white text-[10px] font-bold">
                    {{ getInitials(reply.author.firstName, reply.author.lastName) }}
                  </div>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="bg-muted/30 rounded-2xl rounded-tl-sm px-3 py-2">
                    <p class="text-xs font-semibold text-foreground mb-0.5">
                      {{ reply.author.firstName }} {{ reply.author.lastName }}
                    </p>
                    <p class="text-sm text-foreground leading-snug">{{ reply.content }}</p>
                  </div>
                  <div class="flex items-center gap-3 mt-1 pl-1">
                    <span class="text-xs text-muted-foreground">{{ formatTime(reply.createdAt) }}</span>
                    <button *ngIf="reply.author.id === currentUserId"
                      (click)="deleteComment(post, reply, comment)"
                      class="text-xs text-muted-foreground hover:text-destructive transition-colors">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div *ngIf="post.replyingTo" class="px-4 py-1.5 bg-muted/20 flex items-center justify-between border-t border-border">
          <span class="text-xs text-muted-foreground">
            Replying to <span class="font-semibold">{{ post.replyingTo.author.firstName }}</span>
          </span>
          <button (click)="post.replyingTo = null" class="text-muted-foreground hover:text-foreground">
            <lucide-icon [name]="XIcon" [size]="12"></lucide-icon>
          </button>
        </div>

        <div class="px-4 py-3 flex items-center gap-2.5 border-t border-border mt-1">
          <div class="h-7 w-7 rounded-full flex-shrink-0 bg-gradient-to-br from-primary to-accent
                      flex items-center justify-center text-white text-xs font-bold select-none">
            {{ currentUserInitials }}
          </div>
          <input type="text"
            [value]="post.newCommentText"
            (input)="post.newCommentText = $any($event.target).value"
            (keydown.enter)="submitComment(post)"
            placeholder="Write a comment…"
            [disabled]="post.submittingComment"
            class="flex-1 min-w-0 rounded-full border border-border bg-muted/30 px-4 py-1.5 text-sm
                   text-foreground placeholder:text-muted-foreground focus:outline-none
                   focus:ring-2 focus:ring-primary/50 disabled:opacity-60">
          <button (click)="submitComment(post)"
            [disabled]="!post.newCommentText.trim() || post.submittingComment"
            class="h-8 w-8 rounded-full bg-primary flex-shrink-0 flex items-center justify-center
                   text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed
                   transition-colors hover:bg-primary/90">
            <lucide-icon *ngIf="!post.submittingComment" [name]="SendIcon" [size]="14"></lucide-icon>
            <lucide-icon *ngIf="post.submittingComment" [name]="Loader2Icon" [size]="14" class="animate-spin"></lucide-icon>
          </button>
        </div>
      </div>
    </div>

    <!-- ── Load more ──────────────────────────────────────────────────── -->
    <div *ngIf="posts.length > 0 && !isLastPage && !loading" class="flex justify-center mt-2 mb-6">
      <button (click)="loadPosts(false)" [disabled]="loadingMore"
        class="px-6 py-2.5 rounded-xl border border-border bg-card hover:bg-muted/50 text-sm
               font-medium transition-colors disabled:opacity-60 inline-flex items-center gap-2">
        <lucide-icon *ngIf="loadingMore" [name]="Loader2Icon" [size]="15" class="animate-spin"></lucide-icon>
        {{ loadingMore ? 'Loading…' : 'Load more posts' }}
      </button>
    </div>

  </div>

  <!-- ── Fullscreen image modal ────────────────────────────────────────── -->
  <div *ngIf="fullscreenImageUrl"
    class="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
    (click)="closeFullscreen()">
    <button (click)="closeFullscreen()"
      class="absolute top-4 right-4 h-10 w-10 rounded-full bg-white/10 hover:bg-white/20
             flex items-center justify-center transition-colors z-10">
      <lucide-icon [name]="XIcon" [size]="20" class="text-white"></lucide-icon>
    </button>
    <img [src]="fullscreenImageUrl" alt="Full image"
      (click)="$event.stopPropagation()"
      class="max-w-full max-h-full rounded-xl object-contain shadow-2xl">
  </div>

  <!-- ✅ Modal de réactions -->
  <app-reactions-modal
    *ngIf="activeModalPostId !== null"
    [users]="modalUsers"
    [reactionSummaries]="modalReactionSummaries"
    (closeModal)="closeReactionsModal()">
  </app-reactions-modal>

  <!-- ── Toast ─────────────────────────────────────────────────────────── -->
  <div *ngIf="toast"
    class="fixed bottom-6 right-6 z-50 rounded-xl border border-border bg-card
           px-4 py-3 text-sm font-medium text-foreground shadow-xl max-w-xs animate-in">
    {{ toast }}
  </div>
</div>
    `
})
export class TeamCommunityComponent implements OnInit {

    readonly ArrowLeftIcon   = ArrowLeft;
    readonly Loader2Icon     = Loader2;
    readonly RefreshCcwIcon  = RefreshCcw;
    readonly HeartIcon       = Heart;
    readonly MessageCircleIcon = MessageCircle;
    readonly ImagePlusIcon   = ImagePlus;
    readonly SendIcon        = Send;
    readonly Trash2Icon      = Trash2;
    readonly XIcon           = X;
    readonly ChevronDownIcon = ChevronDown;
    readonly ChevronUpIcon   = ChevronUp;
    readonly UsersIcon       = Users;

    teamId = 0;
    teamName = '';
    currentUserId = 0;
    currentUserInitials = '?';

    posts: PostState[] = [];
    loading = true;
    loadingMore = false;
    errorBanner: string | null = null;
    toast: string | null = null;
    page = 0;
    isLastPage = false;

    newPostContent = '';
    newPostImage: File | null = null;
    newPostImagePreview: string | null = null;
    submittingPost = false;
    postError: string | null = null;

    fullscreenImageUrl: string | null = null;

    // ✅ Propriétés pour les réactions
    activePickerId: number | null = null;
    hidePickerTimeout: any;
    activeModalPostId: number | null = null;
    modalUsers: UserReaction[] = [];
    modalReactionSummaries: any[] = [];

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private communityService: CommunityService,
        private teamService: TeamService,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit(): void {
        this.teamId = Number(this.route.snapshot.paramMap.get('id'));
        if (!this.teamId) {
            this.loading = false;
            this.errorBanner = 'Invalid team ID.';
            return;
        }

        this.currentUserId = Number(localStorage.getItem('user_id')) || 0;
        const name = localStorage.getItem('user_name') || '';
        this.currentUserInitials = name.split(' ')
            .filter(Boolean)
            .map(p => p[0])
            .join('')
            .substring(0, 2)
            .toUpperCase() || '?';

        this.teamService.getTeamById(this.teamId).subscribe({
            next: (team) => { this.teamName = team.name; this.cdr.detectChanges(); },
            error: () => {}
        });

        this.loadPosts(true);
    }

    loadPosts(reset: boolean): void {
        if (reset) {
            this.page = 0;
            this.loading = true;
            this.errorBanner = null;
        } else {
            this.loadingMore = true;
        }

        this.communityService.getTeamPosts(this.teamId, this.page).subscribe({
            next: (page) => {
                const states = page.content.map(p => this.toState(p));
                this.posts = reset ? states : [...this.posts, ...states];
                this.isLastPage = page.last;
                this.page++;
                this.loading = false;
                this.loadingMore = false;
                
                // ✅ Charger les réactions pour chaque post
                this.posts.forEach(post => this.loadReactions(post));
                
                this.cdr.detectChanges();
            },
            error: (err) => {
                this.loading = false;
                this.loadingMore = false;
                this.errorBanner = this.parseError(err);
                this.cdr.detectChanges();
            }
        });
    }

    // ✅ Charger les réactions d'un post
    loadReactions(post: PostState): void {
        this.communityService.getReactionSummary(post.data.id).subscribe({
            next: (reactions) => {
                post.data.reactions = reactions;
                this.cdr.detectChanges();
            },
            error: () => {}
        });
    }

    // ✅ Afficher le picker de réactions
    showReactionPicker(postId: number): void {
        this.cancelHidePicker();
        this.activePickerId = postId;
    }

    // ✅ Planifier la fermeture du picker
    scheduleHidePicker(): void {
        this.hidePickerTimeout = setTimeout(() => {
            this.activePickerId = null;
            this.cdr.detectChanges();
        }, 300);
    }

    // ✅ Annuler la fermeture du picker
    cancelHidePicker(): void {
        if (this.hidePickerTimeout) {
            clearTimeout(this.hidePickerTimeout);
        }
    }

    // ✅ Toggle réaction (clic simple)
    toggleReaction(post: PostState): void {
        if (post.data.currentUserReaction) {
            // Retirer la réaction
            this.communityService.removeReaction(post.data.id).subscribe({
                next: () => {
                    post.data.currentUserReaction = undefined;
                    this.loadReactions(post);
                },
                error: () => {}
            });
        } else {
            // Ajouter un Like par défaut
            this.communityService.addReaction(post.data.id, ReactionType.LIKE).subscribe({
                next: () => {
                    post.data.currentUserReaction = ReactionType.LIKE;
                    this.loadReactions(post);
                },
                error: () => {}
            });
        }
        this.activePickerId = null;
    }

    // ✅ Sélectionner une réaction depuis le picker
    onReactionSelected(post: PostState, reactionType: ReactionType): void {
        this.communityService.addReaction(post.data.id, reactionType).subscribe({
            next: () => {
                post.data.currentUserReaction = reactionType;
                this.loadReactions(post);
            },
            error: () => {}
        });
        this.activePickerId = null;
    }

    // ✅ Obtenir l'emoji d'une réaction
    getReactionEmoji(reactionType: ReactionType): string {
        return REACTION_EMOJIS[reactionType];
    }

    // ✅ Ouvrir le modal de réactions
    openReactionsModal(post: PostState): void {
        this.activeModalPostId = post.data.id;
        this.modalReactionSummaries = post.data.reactions || [];
        
        this.communityService.getUsersWhoReacted(post.data.id).subscribe({
            next: (users) => {
                this.modalUsers = users;
                this.cdr.detectChanges();
            },
            error: () => {}
        });
    }

    // ✅ Fermer le modal
    closeReactionsModal(): void {
        this.activeModalPostId = null;
        this.modalUsers = [];
        this.cdr.detectChanges();
    }

    onPostInput(event: Event): void {
        const el = event.target as HTMLTextAreaElement;
        this.newPostContent = el.value;
        el.style.height = 'auto';
        el.style.height = Math.min(el.scrollHeight, 200) + 'px';
    }

    onImageSelected(event: Event): void {
        this.postError = null;
        const input = event.target as HTMLInputElement;
        const file = input?.files?.[0];
        if (!file) return;

        if (!['image/jpeg', 'image/jpg', 'image/png', 'image/gif'].includes(file.type)) {
            this.postError = 'Only JPG, PNG, and GIF files are allowed.';
            input.value = '';
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            this.postError = 'Image must be under 5 MB.';
            input.value = '';
            return;
        }
        this.newPostImage = file;
        const reader = new FileReader();
        reader.onload = () => {
            this.newPostImagePreview = reader.result as string;
            this.cdr.detectChanges();
        };
        reader.readAsDataURL(file);
    }

    removePostImage(): void {
        this.newPostImage = null;
        this.newPostImagePreview = null;
    }

    submitPost(): void {
        if (!this.newPostContent.trim() || this.submittingPost) return;
        this.postError = null;
        this.submittingPost = true;

        this.communityService.createTeamPost(this.teamId, this.newPostContent).subscribe({
            next: (created) => {
                if (this.newPostImage) {
                    this.communityService.uploadTeamPostImage(created.id, this.newPostImage).subscribe({
                        next: (withImage) => {
                            this.posts.unshift(this.toState(withImage));
                            this.resetPostForm();
                        },
                        error: () => {
                            this.posts.unshift(this.toState(created));
                            this.resetPostForm();
                            this.showToast('Post created, but image upload failed.');
                        }
                    });
                } else {
                    this.posts.unshift(this.toState(created));
                    this.resetPostForm();
                }
            },
            error: (err) => {
                this.submittingPost = false;
                this.postError = this.parseError(err);
                this.cdr.detectChanges();
            }
        });
    }

    confirmDeletePost(post: PostState): void {
        if (!confirm('Delete this post?')) return;
        this.communityService.deleteTeamPost(post.data.id).subscribe({
            next: () => {
                this.posts = this.posts.filter(p => p.data.id !== post.data.id);
                this.cdr.detectChanges();
            },
            error: (err) => this.showToast(this.parseError(err))
        });
    }

    toggleComments(post: PostState): void {
        post.showComments = !post.showComments;
        if (post.showComments && post.comments.length === 0 && !post.loadingComments) {
            this.loadComments(post);
        }
        this.cdr.detectChanges();
    }

    private loadComments(post: PostState): void {
        post.loadingComments = true;
        this.communityService.getTeamPostComments(post.data.id).subscribe({
            next: (comments) => {
                post.comments = comments;
                post.loadingComments = false;
                this.cdr.detectChanges();
            },
            error: () => {
                post.loadingComments = false;
                this.cdr.detectChanges();
            }
        });
    }

    setReplyingTo(post: PostState, comment: TeamCommentResponse): void {
        post.replyingTo = comment;
        this.cdr.detectChanges();
    }

    submitComment(post: PostState): void {
        if (!post.newCommentText.trim() || post.submittingComment) return;
        post.submittingComment = true;

        const parentId = post.replyingTo?.id;

        this.communityService.addTeamPostComment(post.data.id, post.newCommentText, parentId).subscribe({
            next: (comment) => {
                if (parentId) {
                    const parent = post.comments.find(c => c.id === parentId);
                    if (parent) {
                        parent.replies = parent.replies || [];
                        parent.replies.push(comment);
                    }
                } else {
                    post.comments.push(comment);
                }
                
                post.data.commentCount++;
                post.newCommentText = '';
                post.submittingComment = false;
                post.replyingTo = null;
                this.cdr.detectChanges();
            },
            error: (err) => {
                post.submittingComment = false;
                this.showToast(this.parseError(err));
                this.cdr.detectChanges();
            }
        });
    }

    deleteComment(post: PostState, comment: TeamCommentResponse, parent?: TeamCommentResponse): void {
        if (!confirm('Delete this comment?')) return;
        this.communityService.deleteTeamPostComment(comment.id).subscribe({
            next: () => {
                if (parent) {
                    parent.replies = parent.replies?.filter(r => r.id !== comment.id);
                } else {
                    post.comments = post.comments.filter(c => c.id !== comment.id);
                }
                post.data.commentCount = Math.max(0, post.data.commentCount - 1);
                this.cdr.detectChanges();
            },
            error: (err) => this.showToast(this.parseError(err))
        });
    }

    openFullscreen(url: string): void {
        this.fullscreenImageUrl = url;
        this.cdr.detectChanges();
    }

    closeFullscreen(): void {
        this.fullscreenImageUrl = null;
        this.cdr.detectChanges();
    }

    goBack(): void {
        this.router.navigate(['/app/team', this.teamId]);
    }

    trackPost(_: number, post: PostState): number {
        return post.data.id;
    }

    getInitials(first: string, last: string): string {
        return ((first?.[0] ?? '') + (last?.[0] ?? '')).toUpperCase();
    }

    getFullUrl(url: string): string {
        if (!url) return '';
        if (url.startsWith('/uploads/')) return `${environment.wsUrl}${url}`;
        return url;
    }

    formatTime(value: string): string {
        if (!value) return '';
        const diff = Date.now() - new Date(value).getTime();
        const min  = Math.floor(diff / 60_000);
        const hrs  = Math.floor(diff / 3_600_000);
        const days = Math.floor(diff / 86_400_000);
        if (min  <  1) return 'Just now';
        if (min  < 60) return `${min}m ago`;
        if (hrs  < 24) return `${hrs}h ago`;
        if (days <  7) return `${days}d ago`;
        return new Date(value).toLocaleDateString('en', { day: '2-digit', month: 'short' });
    }

    private toState(data: TeamPostResponse): PostState {
        return {
            data,
            showComments: false,
            comments: [],
            loadingComments: false,
            newCommentText: '',
            submittingComment: false,
            replyingTo: null
        };
    }

    private resetPostForm(): void {
        this.newPostContent = '';
        this.newPostImage = null;
        this.newPostImagePreview = null;
        this.submittingPost = false;
        this.cdr.detectChanges();
    }

    private parseError(err: any): string {
        if (err?.error?.message) return err.error.message;
        if (typeof err?.error === 'string') return err.error;
        if (err?.status === 403) return 'You must be a team member to access this community.';
        if (err?.status === 404) return 'Team not found.';
        if (err?.status === 0)   return 'Unable to reach the server. Check your connection.';
        return 'Something went wrong. Please try again.';
    }

    private showToast(message: string): void {
        this.toast = message;
        setTimeout(() => { this.toast = null; this.cdr.detectChanges(); }, 3500);
    }
}