import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Subscription, catchError, forkJoin, of } from 'rxjs';
import { LucideAngularModule, ArrowLeft, Building2, Loader2, RefreshCcw, Shield, Users, Eye, AlertTriangle, Heart, MessageCircle, Plus, X, Trash2, Send, ChevronDown, ChevronUp, ImagePlus } from 'lucide-angular';
import { CommunityDetail, CommunityService, CommunitySummary, TeamPostResponse, TeamCommentResponse, PageResponse } from '../services/community.service';
import { Category, ProductService } from '../services/product.service';
import { Team, TeamService } from '../services/team.service';
import { BadWordsFilterService } from '../services/bad-words-filter-service';
import { environment } from '../../environments/environment';

interface TeamPostState {
  data: TeamPostResponse;
  showComments: boolean;
  comments: TeamCommentResponse[];
  loadingComments: boolean;
  newCommentText: string;
  submittingComment: boolean;
}


@Component({
  selector: 'app-communities',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, LucideAngularModule],
  template: `
    <div class="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.08),transparent_45%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.06),transparent_45%)] p-4 md:p-6">

      <!-- ── Team Community Mode ─────────────────────────────────────────── -->
      <div *ngIf="teamMode" class="max-w-2xl mx-auto">

        <button (click)="goBackToTeam()"
          class="mb-5 inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-muted hover:bg-muted/70 transition-colors text-sm font-medium">
          <lucide-icon [name]="ArrowLeftIcon" [size]="16"></lucide-icon>
          Retour à l'équipe
        </button>

        <div class="flex items-center gap-3 mb-6">
          <div class="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-sm">
            <lucide-icon [name]="UsersIcon" [size]="20" class="text-white"></lucide-icon>
          </div>
          <div>
            <h1 class="text-xl font-bold text-foreground leading-tight">{{ teamName ? teamName + ' · Community' : 'Team Community' }}</h1>
            <p class="text-xs text-muted-foreground">Partagez des moments avec votre équipe</p>
          </div>
        </div>

        <div *ngIf="teamErrorBanner"
          class="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-300 flex items-center justify-between gap-4">
          <span>{{ teamErrorBanner }}</span>
          <button (click)="loadTeamPosts(true)"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 transition-colors font-medium text-xs">
            <lucide-icon [name]="RefreshCcwIcon" [size]="13"></lucide-icon>
            Réessayer
          </button>
        </div>

        <!-- Create post -->
        <div class="bg-card border border-border rounded-2xl p-4 mb-5 shadow-sm">
          <div class="flex items-start gap-3">
            <div class="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-accent flex-shrink-0
                        flex items-center justify-center text-white text-xs font-bold select-none">
              {{ teamCurrentUserInitials }}
            </div>
            <textarea [value]="newTeamPostContent" (input)="onTeamPostInput($event)"
              placeholder="Quoi de neuf ?" rows="2" [disabled]="submittingTeamPost"
              class="flex-1 resize-none rounded-xl border border-border bg-muted/30 px-3 py-2 text-sm
                     text-foreground placeholder:text-muted-foreground focus:outline-none
                     focus:ring-2 focus:ring-primary/50 disabled:opacity-60 transition-all"></textarea>
          </div>
          <div *ngIf="newTeamPostImagePreview" class="mt-3 ml-12 relative inline-block">
            <img [src]="newTeamPostImagePreview" alt="Aperçu" class="max-h-48 rounded-xl border border-border object-cover">
            <button (click)="removeTeamPostImage()"
              class="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive shadow-md flex items-center justify-center">
              <lucide-icon [name]="XIcon" [size]="12" class="text-white"></lucide-icon>
            </button>
          </div>
          <div class="mt-3 ml-12 flex items-center justify-between gap-3">
            <div class="flex items-center gap-2">
              <label class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                            text-muted-foreground hover:bg-muted cursor-pointer transition-colors select-none">
                <lucide-icon [name]="ImagePlusIcon" [size]="15"></lucide-icon>
                Photo
                <input type="file" accept="image/jpeg,image/png,image/gif" class="hidden"
                  (change)="onTeamImageSelected($event)" [disabled]="submittingTeamPost">
              </label>
              <span class="text-xs tabular-nums"
                [ngClass]="newTeamPostContent.length > 4800 ? 'text-destructive font-medium' : 'text-muted-foreground'">
                {{ 5000 - newTeamPostContent.length }}
              </span>
            </div>
            <button (click)="submitTeamPost()"
              [disabled]="!newTeamPostContent.trim() || submittingTeamPost || newTeamPostContent.length > 5000"
              class="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold
                     bg-primary text-primary-foreground hover:bg-primary/90
                     disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              <lucide-icon *ngIf="submittingTeamPost" [name]="Loader2Icon" [size]="14" class="animate-spin"></lucide-icon>
              <lucide-icon *ngIf="!submittingTeamPost" [name]="SendIcon" [size]="14"></lucide-icon>
              {{ submittingTeamPost ? 'Publication…' : 'Publier' }}
            </button>
          </div>
          <p *ngIf="teamPostError" class="mt-2 ml-12 text-xs text-destructive">{{ teamPostError }}</p>
        </div>

        <!-- Loading -->
        <div *ngIf="loadingTeamPosts" class="flex flex-col items-center py-16 gap-3 text-muted-foreground">
          <lucide-icon [name]="Loader2Icon" [size]="32" class="animate-spin"></lucide-icon>
          <span class="text-sm">Chargement des posts…</span>
        </div>

        <!-- Empty -->
        <div *ngIf="!loadingTeamPosts && teamPosts.length === 0 && !teamErrorBanner" class="text-center py-16">
          <div class="h-16 w-16 rounded-2xl bg-muted mx-auto flex items-center justify-center mb-4">
            <lucide-icon [name]="UsersIcon" [size]="32" class="text-muted-foreground opacity-40"></lucide-icon>
          </div>
          <p class="text-lg font-semibold text-foreground">Aucun post pour le moment</p>
          <p class="text-sm text-muted-foreground mt-1">Soyez le premier à partager quelque chose !</p>
        </div>

        <!-- Posts feed -->
        <div *ngFor="let post of teamPosts; trackBy: trackTeamPost"
          class="bg-card border border-border rounded-2xl mb-4 shadow-sm overflow-hidden">

          <div class="flex items-center justify-between px-4 pt-4 pb-3">
            <div class="flex items-center gap-3 min-w-0">
              <div class="h-9 w-9 rounded-full overflow-hidden flex-shrink-0">
                <img *ngIf="post.data.author.profileImageUrl"
                  [src]="getFullUrl(post.data.author.profileImageUrl)" [alt]="post.data.author.firstName"
                  class="h-full w-full object-cover">
                <div *ngIf="!post.data.author.profileImageUrl"
                  class="h-full w-full bg-gradient-to-br from-primary/70 to-accent/70
                         flex items-center justify-center text-white text-xs font-bold">
                  {{ getInitials(post.data.author.firstName + ' ' + post.data.author.lastName) }}
                </div>
              </div>
              <div class="min-w-0">
                <p class="text-sm font-semibold text-foreground leading-none truncate">
                  {{ post.data.author.firstName }} {{ post.data.author.lastName }}
                </p>
                <p class="text-xs text-muted-foreground mt-0.5">{{ formatDate(post.data.createdAt) }}</p>
              </div>
            </div>
            <button *ngIf="post.data.author.id === teamCurrentUserId"
              (click)="confirmDeleteTeamPost(post)" title="Supprimer"
              class="h-8 w-8 rounded-lg inline-flex items-center justify-center flex-shrink-0
                     text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors">
              <lucide-icon [name]="Trash2Icon" [size]="15"></lucide-icon>
            </button>
          </div>

          <div class="px-4 pb-3">
            <p class="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{{ post.data.content }}</p>
          </div>

          <div *ngIf="post.data.imageUrl" class="px-4 pb-3">
            <img [src]="getFullUrl(post.data.imageUrl)" alt="Post"
              (click)="openFullscreen(getFullUrl(post.data.imageUrl!))"
              class="w-full rounded-xl object-cover max-h-80 cursor-zoom-in border border-border
                     hover:opacity-95 transition-opacity">
          </div>

          <div class="px-4 pb-3 pt-1 flex items-center gap-1 border-t border-border">
            <button (click)="toggleTeamLike(post)"
              class="inline-flex items-center gap-1.5 text-sm font-medium rounded-lg px-2.5 py-1.5
                     hover:bg-muted/60 transition-colors"
              [ngClass]="post.data.likedByCurrentUser ? 'text-red-500' : 'text-muted-foreground'">
              <lucide-icon [name]="HeartIcon" [size]="16"></lucide-icon>
              <span class="tabular-nums">{{ post.data.likeCount }}</span>
            </button>
            <button (click)="toggleTeamComments(post)"
              class="inline-flex items-center gap-1.5 text-sm font-medium rounded-lg px-2.5 py-1.5
                     text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-colors">
              <lucide-icon [name]="MessageCircleIcon" [size]="16"></lucide-icon>
              <span class="tabular-nums">{{ post.data.commentCount }}</span>
            </button>
            <div class="flex-1"></div>
            <button (click)="toggleTeamComments(post)"
              class="inline-flex items-center gap-1 text-xs text-muted-foreground
                     hover:text-foreground transition-colors px-2 py-1.5 rounded-lg hover:bg-muted/60">
              {{ post.showComments ? 'Masquer' : 'Commentaires' }}
              <lucide-icon [name]="post.showComments ? ChevronUpIcon : ChevronDownIcon" [size]="13"></lucide-icon>
            </button>
          </div>

          <div *ngIf="post.showComments" class="border-t border-border">
            <div *ngIf="post.loadingComments" class="flex justify-center py-5">
              <lucide-icon [name]="Loader2Icon" [size]="20" class="animate-spin text-muted-foreground"></lucide-icon>
            </div>
            <div *ngIf="!post.loadingComments" class="px-4 pt-3 space-y-3 max-h-72 overflow-y-auto">
              <div *ngIf="post.comments.length === 0"
                class="text-center py-2 text-sm text-muted-foreground">
                Soyez le premier à commenter !
              </div>
              <div *ngFor="let comment of post.comments" class="flex items-start gap-2.5">
                <div class="h-7 w-7 rounded-full overflow-hidden flex-shrink-0 mt-0.5">
                  <img *ngIf="comment.author.profileImageUrl"
                    [src]="getFullUrl(comment.author.profileImageUrl)" class="h-full w-full object-cover">
                  <div *ngIf="!comment.author.profileImageUrl"
                    class="h-full w-full bg-gradient-to-br from-primary/50 to-accent/50
                           flex items-center justify-center text-white text-xs font-bold">
                    {{ getInitials(comment.author.firstName + ' ' + comment.author.lastName) }}
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
                    <span class="text-xs text-muted-foreground">{{ formatDate(comment.createdAt) }}</span>
                    <button *ngIf="comment.author.id === teamCurrentUserId"
                      (click)="confirmDeleteTeamComment(post, comment)"
                      class="text-xs text-muted-foreground hover:text-destructive transition-colors">
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div class="px-4 py-3 flex items-center gap-2.5 border-t border-border mt-1">
              <div class="h-7 w-7 rounded-full flex-shrink-0 bg-gradient-to-br from-primary to-accent
                          flex items-center justify-center text-white text-xs font-bold select-none">
                {{ teamCurrentUserInitials }}
              </div>
              <input type="text" [value]="post.newCommentText"
                (input)="post.newCommentText = $any($event.target).value"
                (keydown.enter)="submitTeamComment(post)"
                placeholder="Écrire un commentaire…" [disabled]="post.submittingComment"
                class="flex-1 min-w-0 rounded-full border border-border bg-muted/30 px-4 py-1.5 text-sm
                       text-foreground placeholder:text-muted-foreground focus:outline-none
                       focus:ring-2 focus:ring-primary/50 disabled:opacity-60">
              <button (click)="submitTeamComment(post)"
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

        <!-- Load more -->
        <div *ngIf="teamPosts.length > 0 && !teamIsLastPage && !loadingTeamPosts" class="flex justify-center mt-2 mb-6">
          <button (click)="loadTeamPosts(false)" [disabled]="loadingMoreTeamPosts"
            class="px-6 py-2.5 rounded-xl border border-border bg-card hover:bg-muted/50 text-sm
                   font-medium transition-colors disabled:opacity-60 inline-flex items-center gap-2">
            <lucide-icon *ngIf="loadingMoreTeamPosts" [name]="Loader2Icon" [size]="15" class="animate-spin"></lucide-icon>
            {{ loadingMoreTeamPosts ? 'Chargement…' : 'Charger plus' }}
          </button>
        </div>
      </div>

      <!-- ── General Communities Mode ────────────────────────────────────── -->
      <div *ngIf="!teamMode" class="max-w-[1400px] mx-auto">
        <div class="mb-8 rounded-3xl border border-border bg-card/80 backdrop-blur-sm px-5 py-6 md:px-7 md:py-7 shadow-sm flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 class="mb-2 text-3xl md:text-4xl font-black tracking-tight">Communautés</h1>
            <p class="text-muted-foreground text-sm md:text-base">
              {{ isAdmin ? 'Vue globale des communautés' : 'Vous voyez uniquement les communautés auxquelles vous avez accès' }}
            </p>
          </div>

          <div class="flex flex-wrap gap-2">
            <button (click)="reload()" class="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 hover:bg-muted/70 transition-colors shadow-sm">
              <lucide-icon [name]="RefreshCcwIcon" [size]="16" [class.animate-spin]="loadingList"></lucide-icon>
              Actualiser
            </button>
            <button (click)="goBackToList()" *ngIf="selectedCommunityId" class="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 hover:bg-muted transition-colors shadow-sm">
              <lucide-icon [name]="ArrowLeftIcon" [size]="16"></lucide-icon>
              Retour à la liste
            </button>
          </div>
        </div>

        <div *ngIf="errorBanner" class="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-300 flex items-center justify-between gap-4">
          <span>{{ errorBanner }}</span>
          <button (click)="reload()" class="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 transition-colors">
            <lucide-icon [name]="RefreshCcwIcon" [size]="14"></lucide-icon>
            Réessayer
          </button>
        </div>

        <div *ngIf="detailError" class="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-300 flex items-center gap-2">
          <lucide-icon [name]="AlertTriangleIcon" [size]="16"></lucide-icon>
          {{ detailError }}
        </div>

        <div class="grid gap-6 lg:grid-cols-12">
          <div class="lg:col-span-7">
            <div class="bg-card rounded-3xl border border-border p-5 md:p-6 shadow-sm">
              <div class="flex items-center justify-between gap-3 mb-4">
                <div>
                  <h3 class="mb-1 text-xl font-extrabold">Liste des communautés</h3>
                  <p class="text-sm text-muted-foreground">GET /api/communities</p>
                </div>
                <div class="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                  <lucide-icon [name]="EyeIcon" [size]="13"></lucide-icon>
                  {{ visibleCommunities.length }} visibles
                </div>
              </div>

              <div *ngIf="loadingList" class="flex flex-col items-center py-16 gap-3 text-muted-foreground">
                <lucide-icon [name]="Loader2Icon" [size]="32" class="animate-spin"></lucide-icon>
                Chargement des communautés...
              </div>

              <div *ngIf="!loadingList && visibleCommunities.length === 0" class="rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground">
                <div class="text-4xl mb-3">🏟️</div>
                <p class="font-semibold mb-1">Aucune communauté disponible</p>
                <p class="text-sm">Les communautés visibles apparaîtront ici selon votre accès.</p>
              </div>

              <div *ngIf="!loadingList && visibleCommunities.length > 0" class="grid gap-4 md:grid-cols-2">
                <button
                  *ngFor="let community of visibleCommunities"
                  (click)="openCommunity(community.id)"
                  class="text-left rounded-2xl border p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                  [ngClass]="selectedCommunityId === community.id ? 'border-primary bg-primary/5 shadow-md shadow-primary/10' : 'border-border bg-card hover:bg-muted/30'"
                >
                  <div class="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <h4 class="font-bold text-foreground mb-1">{{ community.name }}</h4>
                      <p class="text-xs text-muted-foreground line-clamp-2">{{ community.description || 'Aucune description disponible.' }}</p>
                    </div>
                    <span class="rounded-full px-2.5 py-1 text-[11px] font-semibold"
                          [ngClass]="isAdmin ? 'bg-emerald-500/15 text-emerald-700' : 'bg-blue-500/15 text-blue-700'">
                      {{ isAdmin ? 'ADMIN' : 'ACCESSIBLE' }}
                    </span>
                  </div>

                  <div class="flex items-center gap-4 text-xs text-muted-foreground">
                    <span class="inline-flex items-center gap-1"><lucide-icon [name]="Building2Icon" [size]="12"></lucide-icon>{{ community.categoryName || 'Catégorie' }}</span>
                    <span class="inline-flex items-center gap-1"><lucide-icon [name]="UsersIcon" [size]="12"></lucide-icon>{{ community.memberCount || 0 }} membres</span>
                  </div>
                </button>
              </div>
            </div>
          </div>

          <div class="lg:col-span-5 bg-card rounded-3xl border border-border p-5 md:p-6 shadow-sm lg:sticky lg:top-6 h-fit">
            <div *ngIf="loadingDetail" class="flex flex-col items-center py-12 gap-3 text-muted-foreground">
              <lucide-icon [name]="Loader2Icon" [size]="28" class="animate-spin"></lucide-icon>
              Chargement du détail...
            </div>

            <ng-container *ngIf="!loadingDetail">
              <div *ngIf="selectedCommunity; else emptyDetail">
                <div class="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <h3 class="mb-1">{{ selectedCommunity.name }}</h3>
                    <p class="text-xs text-muted-foreground">GET /api/communities/{{ selectedCommunity.id }}</p>
                  </div>
                  <div class="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white shadow-lg">
                    <lucide-icon [name]="ShieldIcon" [size]="24"></lucide-icon>
                  </div>
                </div>

                <div class="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-muted/20 p-3 mb-4">
                  <div>
                    <div class="font-semibold text-sm">Partager avec la communauté</div>
                    <div class="text-xs text-muted-foreground">Les joueurs peuvent publier dans cette communauté.</div>
                  </div>
                  <button
                    (click)="toggleComposer()"
                    class="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    <lucide-icon [name]="PlusIcon" [size]="15"></lucide-icon>
                    {{ showPostComposer ? 'Masquer le formulaire' : 'Ajouter un post' }}
                  </button>
                </div>

                <div class="space-y-4 text-sm">

                  <div *ngIf="canCreatePosts && showPostComposer" class="rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/5 to-accent/5 p-5 mt-5 space-y-4 shadow-sm">
                    <div class="flex items-center justify-between gap-3">
                      <div>
                        <div class="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary mb-2">
                          <lucide-icon [name]="MessageCircleIcon" [size]="12"></lucide-icon>
                          Nouveau post
                        </div>
                        <div class="font-semibold text-foreground">Publier dans {{ selectedCommunity.name }}</div>
                        <div class="text-xs text-muted-foreground">Les membres peuvent publier directement dans cette communauté.</div>
                      </div>
                      <button
                        (click)="submitPost()"
                        [disabled]="posting || !newPostContent.trim() || !canSubmitPost"
                        class="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors disabled:opacity-50"
                      >
                        <lucide-icon *ngIf="!posting" [name]="RefreshCcwIcon" [size]="15"></lucide-icon>
                        <lucide-icon *ngIf="posting" [name]="Loader2Icon" [size]="15" class="animate-spin"></lucide-icon>
                        Publier
                      </button>
                    </div>

                    <textarea
                      [(ngModel)]="newPostContent"
                      rows="3"
                      placeholder="Partagez quelque chose avec cette communauté..."
                      class="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    ></textarea>

                    <div class="rounded-xl bg-muted/20 border border-border p-3 text-xs text-muted-foreground">
                      Les nouveaux posts sont enregistrés dans la communauté sélectionnée et visibles après publication.
                    </div>
                  </div>

                  <div *ngIf="!canCreatePosts" class="rounded-xl border border-dashed border-border bg-muted/20 p-4 mt-5 text-sm text-muted-foreground">
                    {{ postComposerHint }}
                  </div>

                  <div class="rounded-2xl border border-border bg-card p-4 mt-5">
                    <div class="flex items-center justify-between gap-3 mb-4">
                      <div>
                        <div class="font-semibold text-base">Posts récents</div>
                        <div class="text-xs text-muted-foreground">Filtrés sur la communauté sélectionnée</div>
                      </div>
                      <button (click)="reloadPosts()" class="text-xs font-semibold text-primary hover:underline" [disabled]="loadingPosts">
                        Actualiser
                      </button>
                    </div>

                    <div *ngIf="loadingPosts" class="flex items-center gap-2 text-sm text-muted-foreground py-4">
                      <lucide-icon [name]="Loader2Icon" [size]="16" class="animate-spin"></lucide-icon>
                      Chargement des posts...
                    </div>

                    <div *ngIf="postsAccessDenied" class="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-800 dark:text-amber-300">
                      {{ usingFallbackCommunities
                        ? 'Posts indisponibles: ces cartes viennent du fallback local et ne pointent pas vers une communauté backend autorisée.'
                        : 'Access denied for this community. You are not allowed to view posts in this community.' }}
                    </div>

                    <div *ngIf="!loadingPosts && communityPosts.length === 0" class="rounded-xl border border-dashed border-border p-5 text-center text-sm text-muted-foreground">
                      Aucun post pour cette communauté pour le moment.
                    </div>

                    <div *ngIf="!loadingPosts && communityPosts.length > 0" class="space-y-3 max-h-72 overflow-auto pr-1">
                      <div *ngFor="let post of communityPosts" class="rounded-2xl border border-border bg-muted/20 p-3">
                        <div class="flex items-start justify-between gap-3 mb-2">
                          <div>
                            <div class="font-semibold text-sm">{{ post.authorName || post.author || 'Utilisateur' }}</div>
                            <div class="text-[11px] text-muted-foreground">{{ formatDate(post.createdAt || post.time) }}</div>
                          </div>
                          <div class="rounded-full bg-primary/10 px-2 py-1 text-[11px] font-semibold text-primary">Post</div>
                        </div>
                        <p class="text-sm whitespace-pre-line text-foreground">{{ post.content }}</p>
                        <div class="mt-3 flex items-center gap-2 border-t border-border pt-3">

                          <!-- Bouton réaction avec popup -->
                          <div style="position: relative; display: inline-block;"
                              (mouseenter)="post.showReactions = true"
                              (mouseleave)="scheduleHideReactions(post)">

                            <!-- Popup réactions -->
                            <div *ngIf="post.showReactions"
                                (mouseenter)="cancelHideReactions(post)"
                                (mouseleave)="scheduleHideReactions(post)"
                                style="position: absolute; bottom: 110%; left: -8px; z-index: 50;"
                                class="flex items-center gap-1 rounded-full border border-border bg-card px-2 py-1.5 shadow-lg">
                              <button *ngFor="let r of reactions"
                                      (click)="selectReaction(post, r)"
                                      [title]="r.label"
                                      class="text-2xl transition-transform duration-150 hover:scale-125 hover:-translate-y-1 border-none bg-transparent cursor-pointer p-1 rounded-full">
                                {{ r.emoji }}
                              </button>
                            </div>

                            <!-- Bouton principal -->
<button (click)="selectReaction(post, post.myReaction ? null : reactions[0])"
        class="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors border-none bg-transparent cursor-pointer"
        [style.color]="post.myReaction ? getReactionColor(post.myReaction) : 'var(--color-text-secondary)'">
  <span class="transition-transform duration-150"
        [class.scale-125]="post.reactionAnimating">
    {{ post.myReaction ? getReactionEmoji(post.myReaction) : '👍' }}
  </span>
  <span>{{ post.myReaction ? getReactionLabel(post.myReaction) : "J'aime" }}</span>
</button>

<!-- ✅ Compteur cliquable EN DEHORS du bouton -->
<span *ngIf="post.totalReactions > 0"
      class="ml-1 text-xs opacity-70 cursor-pointer hover:underline"
      [style.color]="post.myReaction ? getReactionColor(post.myReaction) : 'var(--color-text-secondary)'"
      (click)="openReactionsModal(post)">
  {{ post.totalReactions }}
</span>
                          </div>

                          <!-- Bouton commenter -->
                          <button (click)="toggleComments(post)"
                                  class="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-primary hover:bg-muted transition-colors">
                            <lucide-icon [name]="MessageCircleIcon" [size]="14"></lucide-icon>
                            {{ post.commentsCount ?? post.comments ?? 0 }} Commenter
                          </button>

                        </div>

                        <div *ngIf="post.showComment" class="mt-4 pt-4 border-t border-border space-y-3">
                          <div *ngIf="post.loadingComments" class="flex items-center gap-2 text-sm text-muted-foreground py-2">
                            <lucide-icon [name]="Loader2Icon" [size]="16" class="animate-spin"></lucide-icon>
                            Chargement des commentaires...
                          </div>

                          <div *ngIf="!post.loadingComments" class="space-y-2 max-h-64 overflow-y-auto pr-1">
                            <div *ngFor="let comment of post.commentList" class="rounded-xl bg-card border border-border px-3 py-2">
                              <div class="flex items-start justify-between gap-3 mb-1">
                                <div class="text-xs font-semibold text-foreground">
                                  {{ comment.authorName || comment.authorFirstName || 'Utilisateur' }}
                                </div>
                                <div class="text-[11px] text-muted-foreground">{{ formatDate(comment.createdAt) }}</div>
                              </div>
                              <p class="text-sm text-foreground whitespace-pre-line">{{ comment.content }}</p>
                            </div>

                            <div *ngIf="!post.commentList || post.commentList.length === 0" class="rounded-xl border border-dashed border-border p-3 text-center text-xs text-muted-foreground">
                              Soyez le premier à commenter.
                            </div>
                          </div>

                          <div class="flex gap-2 items-start">
                            <input
                              [(ngModel)]="post.commentInput"
                              placeholder="Écrire un commentaire..."
                              (keyup.enter)="addComment(post)"
                              class="flex-1 rounded-full border border-border bg-card px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                            <button
                              (click)="addComment(post)"
                              [disabled]="post.addingComment || !post.commentInput?.trim()"
                              class="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
                            >
                              {{ post.addingComment ? '...' : 'Envoyer' }}
                            </button>
                            <button
                              (click)="toggleComments(post)"
                              class="inline-flex items-center justify-center rounded-full border border-border bg-card px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                              aria-label="Fermer les commentaires"
                            >
                              <lucide-icon [name]="XIcon" [size]="14"></lucide-icon>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <ng-template #emptyDetail>
                <div class="rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground">
                  <div class="text-4xl mb-3">🔎</div>
                  <p class="font-semibold mb-1">Sélectionnez une communauté</p>
                  <p class="text-sm">Le détail s’affiche ici.</p>
                </div>
              </ng-template>
            </ng-container>
          </div>
        </div>
      </div>

      <div *ngIf="toast" class="fixed bottom-6 right-6 z-50 rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium text-foreground shadow-xl">
        {{ toast }}
      </div>


<div *ngIf="showReactionsModal"
     style="position: fixed; inset: 0; background: rgba(0,0,0,0.55); z-index: 100; display: flex; align-items: center; justify-content: center; padding: 1rem;"
     (click)="closeReactionsModal()">

  <div style="background: white; border-radius: 12px; border: 1px solid #e5e7eb; width: 100%; max-width: 400px; max-height: 80vh; display: flex; flex-direction: column; overflow: hidden; color: #111;"
       (click)="$event.stopPropagation()">

    <!-- Header -->
    <div style="display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; border-bottom: 1px solid #f0f0f0;">
      <span style="font-size: 15px; font-weight: 600; color: #111;">Réactions</span>
      <button (click)="closeReactionsModal()"
              style="width: 28px; height: 28px; border-radius: 50%; border: 1px solid #e5e7eb; background: #f5f5f5; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #666; font-size: 14px;">✕</button>
    </div>

    <!-- Filtres -->
    <div style="display: flex; gap: 6px; padding: 12px 20px; border-bottom: 1px solid #f0f0f0; overflow-x: auto;">
      <button (click)="filterReactionModal(null)"
              style="display: inline-flex; align-items: center; gap: 5px; padding: 5px 14px; border-radius: 20px; font-size: 12px; font-weight: 500; cursor: pointer; white-space: nowrap; transition: all 0.15s;"
              [style.border]="activeReactionFilter === null ? '1.5px solid #378ADD' : '1px solid #e5e7eb'"
              [style.background]="activeReactionFilter === null ? '#E6F1FB' : 'white'"
              [style.color]="activeReactionFilter === null ? '#0C447C' : '#666'">
        Tous
        <span style="border-radius: 10px; padding: 1px 7px; font-size: 11px;"
              [style.background]="activeReactionFilter === null ? '#378ADD' : '#f0f0f0'"
              [style.color]="activeReactionFilter === null ? 'white' : '#666'">
          {{ modalReactionUsers.length }}
        </span>
      </button>

      <button *ngFor="let r of getModalReactionTypes()"
              (click)="filterReactionModal(r.type)"
              style="display: inline-flex; align-items: center; gap: 5px; padding: 5px 14px; border-radius: 20px; font-size: 12px; font-weight: 500; cursor: pointer; white-space: nowrap; transition: all 0.15s;"
              [style.border]="activeReactionFilter === r.type ? '1.5px solid #378ADD' : '1px solid #e5e7eb'"
              [style.background]="activeReactionFilter === r.type ? '#E6F1FB' : 'white'"
              [style.color]="activeReactionFilter === r.type ? '#0C447C' : '#666'">
        <span style="font-size: 15px;">{{ r.emoji }}</span>
        {{ r.count }}
      </button>
    </div>

    <!-- Liste users -->
    <div style="overflow-y: auto; flex: 1; padding: 8px 0;">
      <div *ngIf="loadingModalReactions"
           style="display: flex; align-items: center; justify-content: center; gap: 8px; padding: 2rem; color: #888; font-size: 13px;">
        <lucide-icon [name]="Loader2Icon" [size]="16" class="animate-spin"></lucide-icon>
        Chargement...
      </div>

      <div *ngIf="!loadingModalReactions && filteredModalUsers.length === 0"
           style="text-align: center; padding: 2rem; color: #888; font-size: 13px;">
        Aucune réaction pour le moment.
      </div>

      <div *ngFor="let user of filteredModalUsers"
           style="display: flex; align-items: center; gap: 12px; padding: 10px 20px; transition: background 0.1s; cursor: default;"
           onmouseenter="this.style.background='#f9f9f9'"
           onmouseleave="this.style.background='white'">

        <!-- Avatar + badge -->
        <div style="position: relative; flex-shrink: 0;">
          <div style="width: 42px; height: 42px; border-radius: 50%; background: #E6F1FB; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 500; color: #0C447C;">
            {{ getInitials(user.firstName + ' ' + user.lastName) }}
          </div>
          <div style="position: absolute; bottom: -3px; right: -3px; width: 20px; height: 20px; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; border: 1.5px solid white;">
            {{ getReactionEmoji(user.reactionType) }}
          </div>
        </div>

        <!-- Nom + label -->
        <div style="flex: 1; min-width: 0;">
          <div style="font-size: 13px; font-weight: 500; color: #111; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
            {{ user.firstName }} {{ user.lastName }}
          </div>
          <div style="font-size: 11px; color: #888; margin-top: 1px;">
            {{ getReactionLabel(user.reactionType) }}
          </div>
        </div>

        <span style="font-size: 20px; flex-shrink: 0;">{{ getReactionEmoji(user.reactionType) }}</span>
      </div>
    </div>
  </div>
</div>

      <!-- Fullscreen image viewer -->
      <div *ngIf="fullscreenImageUrl"
        (click)="closeFullscreen()"
        class="fixed inset-0 z-[200] flex items-center justify-center bg-black/85 p-4 cursor-zoom-out">
        <img [src]="fullscreenImageUrl" alt="Image"
          class="max-h-[90vh] max-w-[90vw] rounded-2xl object-contain shadow-2xl">
        <button (click)="closeFullscreen()"
          class="absolute top-4 right-4 h-10 w-10 rounded-full bg-white/10 hover:bg-white/20
                 flex items-center justify-center text-white transition-colors">
          <lucide-icon [name]="XIcon" [size]="20"></lucide-icon>
        </button>
      </div>

    </div>
  `
})
export class CommunitiesComponent implements OnInit, OnDestroy {
  readonly ArrowLeftIcon = ArrowLeft;
  readonly Building2Icon = Building2;
  readonly Loader2Icon = Loader2;
  readonly HeartIcon = Heart;
  readonly MessageCircleIcon = MessageCircle;
  readonly PlusIcon = Plus;
  readonly XIcon = X;
  readonly RefreshCcwIcon = RefreshCcw;
  readonly ShieldIcon = Shield;
  readonly UsersIcon = Users;
  readonly EyeIcon = Eye;
  readonly AlertTriangleIcon = AlertTriangle;
  readonly Trash2Icon = Trash2;
  readonly SendIcon = Send;
  readonly ChevronDownIcon = ChevronDown;
  readonly ChevronUpIcon = ChevronUp;
  readonly ImagePlusIcon = ImagePlus;

  // ── Team community mode ──────────────────────────────────────────────────
  teamMode = false;
  teamId: number | null = null;
  teamName = '';
  teamPosts: TeamPostState[] = [];
  loadingTeamPosts = false;
  loadingMoreTeamPosts = false;
  teamPage = 0;
  teamIsLastPage = false;
  newTeamPostContent = '';
  newTeamPostImage: File | null = null;
  newTeamPostImagePreview: string | null = null;
  submittingTeamPost = false;
  teamPostError: string | null = null;
  teamCurrentUserId = 0;
  teamCurrentUserInitials = '';
  teamErrorBanner: string | null = null;
  fullscreenImageUrl: string | null = null;

  loadingList = true;
  loadingDetail = false;
  errorBanner: string | null = null;
  detailError: string | null = null;
  toast: string | null = null;
  loadingPosts = false;
  postsAccessDenied = false;
  canPostInSelectedCommunity = false;
  posting = false;
  newPostContent = '';
  showPostComposer = true;
  posts: any[] = [];

  currentRole = (localStorage.getItem('user_type') || '').toUpperCase();
  selectedCommunityId: number | null = null;
  selectedCommunity: CommunityDetail | null = null;
  communities: CommunitySummary[] = [];
  visibleCommunities: CommunitySummary[] = [];
  loadingFallback = false;
  usingFallbackCommunities = false;
  private readonly forbiddenPostCommunityIds = new Set<number>();
  private readonly missingDetailCommunityIds = new Set<number>();
  private lastLoadedPostsCommunityId: number | null = null;

  private readonly subscriptions = new Subscription();
  // Propriétés à ajouter
  showReactionsModal = false;
  loadingModalReactions = false;
  modalReactionUsers: any[] = [];
  activeReactionFilter: string | null = null;
  private currentModalPostId: number | null = null;
  constructor(
    private communityService: CommunityService,
    private productService: ProductService,
    private teamService: TeamService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private badWordsFilter: BadWordsFilterService  // ✅ ajout

  ) { }

  get isAdmin(): boolean {
    return this.currentRole === 'ROLE_ADMIN' || this.currentRole === 'ADMIN';
  }

  get isAuthenticated(): boolean {
    return !!localStorage.getItem('auth_token');
  }

  get canCreatePosts(): boolean {
    return this.isAuthenticated;
  }

  get canSubmitPost(): boolean {
    if (!this.isAuthenticated) return false;
    if (!this.selectedCommunityId) return false;
    if (this.loadingPosts) return false;
    if (this.postsAccessDenied) return false;
    return !this.forbiddenPostCommunityIds.has(this.selectedCommunityId);
  }

  get postComposerHint(): string {
    if (!this.isAuthenticated) {
      return 'Connectez-vous pour publier dans cette communauté.';
    }
    if (this.postsAccessDenied) {
      return 'Vous n\'êtes pas autorisé à publier dans cette communauté.';
    }
    if (this.usingFallbackCommunities) {
      return 'Communauté affichée en mode fallback. La publication peut dépendre de la disponibilité de la communauté backend.';
    }
    return 'La publication est indisponible pour le moment.';
  }

  ngOnInit(): void {
    const urlMatch = this.router.url.match(/\/team\/(\d+)\/community/);
    if (urlMatch) {
      this.teamMode = true;
      this.teamId = Number(urlMatch[1]);
      this.initTeamMode();
      return;
    }

    this.subscriptions.add(
      this.communityService.communityRefresh$.subscribe(() => {
        this.loadCommunities(false);
        if (this.selectedCommunityId) {
          this.loadPosts();
        }
      })
    );

    this.subscriptions.add(
      this.route.paramMap.subscribe((params) => {
        const routeId = Number(params.get('id') || 0);
        this.selectedCommunityId = Number.isFinite(routeId) && routeId > 0 ? routeId : null;
        this.loadCommunities(true);
      })
    );

    this.loadCommunities(true);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  reload(): void {
    this.loadCommunities(true);
    if (this.selectedCommunityId) {
      this.loadPosts();
    }
  }

loadCommunities(loadDetail = true): void {
    this.loadingList = true;
    this.errorBanner = null;
    this.communityService.getCommunities().subscribe({
        next: (communities) => {
            this.communities = (communities || []).map((community) => this.normalizeCommunity(community));
            this.visibleCommunities = this.communities;
            this.usingFallbackCommunities = false;
            this.loadingList = false;
            this.loadingFallback = false;

            const selectedFromRoute = this.selectedCommunityId
                ? this.visibleCommunities.find((c) => c.id === this.selectedCommunityId) || null
                : null;

            if (selectedFromRoute) {
                this.selectedCommunity = selectedFromRoute as CommunityDetail;
                if (loadDetail) this.loadCommunityDetail(selectedFromRoute.id);
                this.loadPosts();
            } else if (this.visibleCommunities.length > 0) {
                const first = this.visibleCommunities[0];
                this.selectedCommunityId = first.id;
                this.selectedCommunity = first as CommunityDetail;
                if (loadDetail) this.loadCommunityDetail(first.id);
                this.loadPosts();
            } else {
                this.selectedCommunity = null;
                this.detailError = null;
            }

            this.cdr.detectChanges();
        },
        error: (err) => {
            this.loadingList = false;
            this.errorBanner = this.toReadableError(err);
            this.cdr.detectChanges();
        }
    });
}






  openCommunity(id: number, navigate = true): void {
    this.selectedCommunityId = id;
    this.detailError = null;
    this.postsAccessDenied = false;
    this.canPostInSelectedCommunity = false;
    const selectedSummary = this.visibleCommunities.find((community) => community.id === id) || this.communities.find((community) => community.id === id) || null;
    if (selectedSummary) {
      this.selectedCommunity = selectedSummary as CommunityDetail;
    }
    if (navigate && !this.usingFallbackCommunities) {
      this.router.navigate(['/app/communities', id]);
      this.loadPosts();
    } else if (navigate && this.usingFallbackCommunities) {
      this.router.navigate(['/app/communities']);
      this.loadPosts();
    } else {
      if (!this.usingFallbackCommunities) {
        this.loadCommunityDetail(id);
      }
      this.loadPosts();
    }
  }

  goBackToList(): void {
    this.selectedCommunityId = null;
    this.selectedCommunity = null;
    this.detailError = null;
    this.router.navigate(['/app/communities']);
    this.posts = [];
    this.postsAccessDenied = false;
    this.canPostInSelectedCommunity = false;
    this.lastLoadedPostsCommunityId = null;
  }

  toggleComposer(): void {
    this.showPostComposer = !this.showPostComposer;
  }

  get communityPosts(): any[] {
    if (this.selectedCommunityId === null) {
      return [];
    }

    return this.posts;
  }

  private matchesSelectedCommunity(post: any): boolean {
    const selectedId = Number(this.selectedCommunityId || 0);
    const postCommunityId = Number(post?.communityId || post?.community?.id || post?.community?.communityId || post?.community?.communityId || 0);

    if (selectedId > 0 && postCommunityId === selectedId) {
      return true;
    }

    const selectedCommunity = this.selectedCommunity;
    const postCategoryId = Number(post?.categoryId || post?.community?.categoryId || post?.community?.category?.id || 0);
    if (selectedCommunity?.categoryId && postCategoryId === Number(selectedCommunity.categoryId)) {
      return true;
    }

    const selectedName = this.normalizeCommunityName(selectedCommunity?.name || selectedCommunity?.categoryName || '');
    const postCommunityName = this.normalizeCommunityName(
      post?.community?.name || post?.communityName || post?.categoryName || post?.community?.categoryName || ''
    );

    if (selectedName && postCommunityName && selectedName === postCommunityName) {
      return true;
    }

    return false;
  }

  private loadCommunityDetail(id: number): void {
    if (this.usingFallbackCommunities || this.missingDetailCommunityIds.has(id)) {
      return;
    }

    this.loadingDetail = true;
    this.detailError = null;
    this.communityService.getCommunityById(id).subscribe({
      next: (detail) => {
        const normalizedDetail = this.normalizeCommunity(detail) as CommunityDetail;
        this.selectedCommunity = {
          ...(this.selectedCommunity || {}),
          ...normalizedDetail
        };
        this.loadingDetail = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loadingDetail = false;
        const status = (err as HttpErrorResponse)?.status;
        if (status === 404) {
          this.missingDetailCommunityIds.add(id);
        }
        if (status === 401) {
          this.detailError = 'Session expirée. Reconnectez-vous pour voir cette communauté.';
        } else if (status === 403) {
          this.detailError = 'You are not authorized to view this community.';
        } else if (status === 404) {
          this.detailError = 'Community details are not available for this card.';
        } else {
          this.detailError = this.toReadableError(err);
        }
        this.cdr.detectChanges();
      }
    });
  }

  loadPosts(): void {
    if (!this.selectedCommunityId) {
      this.posts = [];
      this.loadingPosts = false;
      this.canPostInSelectedCommunity = false;
      this.lastLoadedPostsCommunityId = null;
      return;
    }

    if (this.loadingPosts && this.lastLoadedPostsCommunityId === this.selectedCommunityId) {
      return;
    }

    if (this.forbiddenPostCommunityIds.has(this.selectedCommunityId)) {
      this.posts = [];
      this.postsAccessDenied = true;
      this.canPostInSelectedCommunity = false;
      return;
    }

    this.loadingPosts = true;
    this.postsAccessDenied = false;
    this.lastLoadedPostsCommunityId = this.selectedCommunityId;
    this.communityService.getCommunityPosts(this.selectedCommunityId).subscribe({
      next: (data: any) => {
        const items = data?.content ?? data ?? [];
        this.posts = Array.isArray(items)
          ? items.map((post: any) => this.normalizePost(post))
          : [];
        this.canPostInSelectedCommunity = true;
        this.loadingPosts = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.posts = [];
        this.loadingPosts = false;
        this.canPostInSelectedCommunity = false;
        const status = (error as HttpErrorResponse)?.status;
        this.postsAccessDenied = status === 403;
        if (status === 403) {
          this.forbiddenPostCommunityIds.add(this.selectedCommunityId!);
          this.showToast('You are not allowed to view posts in this community.');
        }
        this.cdr.detectChanges();
      }
    });
  }

  reloadPosts(): void {
    this.loadPosts();
  }

  submitPost(): void {
    const rawContent = this.newPostContent.trim();
    if (!rawContent || !this.selectedCommunityId || this.posting || !this.isAuthenticated) {
      if (!this.isAuthenticated) {
        this.showToast('Connectez-vous pour publier dans cette communauté.');
      }
      return;
    }

    if (this.loadingPosts) {
      this.showToast('Vérification des permissions en cours...');
      return;
    }

    if (this.postsAccessDenied) {
      this.showToast('You are not allowed to post in this community.');
      return;
    }

    if (this.forbiddenPostCommunityIds.has(this.selectedCommunityId)) {
      this.postsAccessDenied = true;
      this.detailError = 'You are not allowed to post in this community.';
      this.showToast('You are not allowed to post in this community.');
      this.cdr.detectChanges();
      return;
    }

    if (this.isMembershipDeniedForSelectedCommunity()) {
      this.postsAccessDenied = true;
      this.detailError = 'You are not allowed to post in this community.';
      this.showToast('You are not allowed to post in this community.');
      this.cdr.detectChanges();
      return;
    }

    // ✅ Filtrer les bad words avant envoi
    const content = this.badWordsFilter.filter(rawContent);
    const title = this.derivePostTitle(content);

    this.posting = true;
    this.communityService.createCommunityPost(this.selectedCommunityId, { title, content }).subscribe({
      next: (post: any) => {
        const createdPost = this.normalizePost({
          ...post,
          communityId: post?.communityId || this.selectedCommunityId,
          community: post?.community || this.selectedCommunity || { id: this.selectedCommunityId }
        });
        this.posts.unshift(createdPost);
        this.newPostContent = '';
        this.posting = false;
        this.showToast('Post publié dans la communauté.');
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.posting = false;
        if ((err as HttpErrorResponse)?.status === 403) {
          this.postsAccessDenied = true;
          if (this.selectedCommunityId) {
            this.forbiddenPostCommunityIds.add(this.selectedCommunityId);
          }
          this.detailError = 'You are not allowed to post in this community.';
          this.showToast('You are not allowed to post in this community.');
          this.cdr.detectChanges();
          return;
        }
        this.showToast(this.toReadableError(err));
        this.cdr.detectChanges();
      }
    });
  }
  private derivePostTitle(content: string): string {
    const firstLine = content.split('\n').map((line) => line.trim()).find((line) => line.length > 0) || '';
    return firstLine.length > 80 ? `${firstLine.slice(0, 77)}...` : firstLine;
  }

  private isMembershipDeniedForSelectedCommunity(): boolean {
    if (this.isAdmin) {
      return false;
    }

    const userId = Number(localStorage.getItem('user_id') || 0);
    if (!userId || !this.selectedCommunity) {
      return false;
    }

    const communityMembers = Array.isArray(this.selectedCommunity.members) ? this.selectedCommunity.members : [];
    if (communityMembers.length > 0) {
      const isMember = communityMembers.some((member: any) => Number(member?.userId || member?.id) === userId);
      return !isMember;
    }

    const teams = Array.isArray(this.selectedCommunity.teams) ? this.selectedCommunity.teams : [];
    const teamMembers = teams.flatMap((team: any) => Array.isArray(team?.members) ? team.members : []);
    if (teamMembers.length > 0) {
      const isMember = teamMembers.some((member: any) => Number(member?.userId || member?.id) === userId);
      return !isMember;
    }

    return false;
  }

  toggleLike(post: any): void {
    const previousLiked = !!post.liked;
    const previousLikesCount = Number(post.likesCount ?? post.likes ?? 0);

    post.liked = !previousLiked;
    post.likesCount = previousLikesCount + (post.liked ? 1 : -1);

    this.communityService.toggleLike(post.id).subscribe({
      error: () => {
        post.liked = previousLiked;
        post.likesCount = previousLikesCount;
        this.showToast('Erreur lors de l\'ajout du like');
        this.cdr.detectChanges();
      }
    });
  }

  toggleComments(post: any): void {
    post.showComment = !post.showComment;

    if (!post.showComment) {
      return;
    }

    if (Array.isArray(post.commentList) && post.commentList.length > 0) {
      return;
    }

    post.loadingComments = true;
    this.communityService.getComments(post.id).subscribe({
      next: (comments) => {
        post.commentList = Array.isArray(comments) ? comments : [];
        post.loadingComments = false;
        this.cdr.detectChanges();
      },
      error: () => {
        post.loadingComments = false;
        this.showToast('Impossible de charger les commentaires');
        this.cdr.detectChanges();
      }
    });
  }

  addComment(post: any): void {
    const rawContent = (post.commentInput || '').trim();
    if (!rawContent || post.addingComment) {
      return;
    }

    // ✅ Filtrer les bad words avant envoi
    const content = this.badWordsFilter.filter(rawContent);

    post.addingComment = true;
    this.communityService.addComment(post.id, { content }).subscribe({
      next: (comment) => {
        post.commentsCount = Number(post.commentsCount ?? post.comments ?? 0) + 1;
        post.commentInput = '';
        if (!Array.isArray(post.commentList)) {
          post.commentList = [];
        }
        post.commentList.push(comment);
        post.addingComment = false;
        this.cdr.detectChanges();
      },
      error: () => {
        post.addingComment = false;
        this.showToast('Erreur lors de l\'envoi du commentaire');
        this.cdr.detectChanges();
      }
    });
  }

  private normalizeCommunity(raw: any): CommunitySummary {
    const id = Number(raw?.id || raw?.communityId || 0);
    const category = raw?.category || raw?.sportCategory || raw?.sport || null;
    const categoryName = raw?.categoryName || raw?.category?.nom || raw?.category?.name || raw?.name || raw?.title || '';
    const teams = Array.isArray(raw?.teams) ? raw.teams : Array.isArray(raw?.teamList) ? raw.teamList : [];
    const members = Array.isArray(raw?.members) ? raw.members : Array.isArray(raw?.memberList) ? raw.memberList : [];

    return {
      ...raw,
      id,
      name: raw?.name || raw?.title || categoryName || `Communauté #${id}`,
      description: raw?.description || raw?.summary || '',
      categoryId: Number(raw?.categoryId || category?.id || 0) || undefined,
      categoryName,
      memberCount: Number(raw?.memberCount || members.length || 0),
      teamCount: Number(raw?.teamCount || teams.length || 0),
      teams,
      members,
      access: raw?.access || raw?.visibility || (this.isAdmin ? 'ALL' : 'MEMBER'),
      visible: raw?.visible !== false || this.isAdmin
    };
  }

private normalizePost(post: any): any {
  const normalized: any = {
    ...post,
    liked: post?.likedByCurrentUser === true || post?.liked === true,
    myReaction: post?.myReaction || null,
    totalReactions: post?.totalReactions || post?.likesCount || 0,
    reactionCounts: post?.reactionCounts || {},
    showReactions: false,
    reactionAnimating: false,
    hideReactionTimer: null,
    showComment: false,
    commentInput: '',
    commentList: [],
    loadingComments: false,
    addingComment: false
  };

  // ✅ Charger la réaction de l'user au refresh
  this.communityService.getReactions(post.id).subscribe({
    next: (res) => {
      normalized.myReaction = res.myReaction || null;
      normalized.totalReactions = res.totalCount || 0;
      normalized.reactionCounts = res.counts || {};
      this.cdr.detectChanges();
    },
    error: () => {}
  });

  return normalized;
}

  private normalizeCommunityName(value: string): string {
    return (value || '').trim().toLowerCase();
  }

  formatDate(value: string): string {
    if (!value) return '';
    const date = new Date(value);
    const diffMs = Date.now() - date.getTime();
    const diffHours = Math.floor(diffMs / 3600000);
    if (diffHours < 1) return 'À l\'instant';
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  }

  private toReadableError(error: unknown): string {
    const httpError = error as HttpErrorResponse;
    if (httpError?.status === 401) return 'Session expirée. Reconnectez-vous.';
    if (httpError?.status === 403) return 'You are not authorized to view this community.';
    if (httpError?.status === 404) return 'Communauté introuvable.';
    if (httpError?.status === 0) return 'Impossible de joindre le serveur. Vérifiez votre connexion.';

    const serverMessage = (httpError?.error?.message || httpError?.error?.error || httpError?.message || '').toString().trim();
    return serverMessage || 'Erreur inattendue lors du chargement des communautés.';
  }

  private showToast(message: string): void {
    this.toast = message;
    setTimeout(() => {
      this.toast = null;
      this.cdr.detectChanges();
    }, 2800);
  }


  readonly reactions = [
    { type: 'LIKE', emoji: '👍', label: "J'aime", color: '#1877f2' },
    { type: 'LOVE', emoji: '❤️', label: "J'adore", color: '#f33e58' },
    { type: 'HAHA', emoji: '😂', label: 'Haha', color: '#f7b125' },
    { type: 'WOW', emoji: '😮', label: 'Wow', color: '#f7b125' },
    { type: 'SAD', emoji: '😢', label: 'Triste', color: '#f7b125' },
    { type: 'ANGRY', emoji: '😡', label: 'Grrr', color: '#e9710f' },
  ];

  selectReaction(post: any, reaction: any): void {
    post.showReactions = false;

    const previousType = post.myReaction;
    const previousCount = post.totalReactions || 0;

    if (!reaction || reaction.type === previousType) {
      // Toggle off
      post.myReaction = null;
      post.totalReactions = Math.max(0, previousCount - 1);
    } else {
      post.myReaction = reaction.type;
      post.totalReactions = previousType ? previousCount : previousCount + 1;
    }

    // Animation
    post.reactionAnimating = true;
    setTimeout(() => { post.reactionAnimating = false; this.cdr.detectChanges(); }, 300);
    this.cdr.detectChanges();

    const type = post.myReaction || previousType;
    this.communityService.react(post.id, type).subscribe({
      next: (res) => {
        post.totalReactions = res.totalCount;
        post.reactionCounts = res.counts;
        this.cdr.detectChanges();
      },
      error: () => {
        post.myReaction = previousType;
        post.totalReactions = previousCount;
        this.showToast('Erreur lors de la réaction');
        this.cdr.detectChanges();
      }
    });
  }

  scheduleHideReactions(post: any): void {
    post.hideReactionTimer = setTimeout(() => {
      post.showReactions = false;
      this.cdr.detectChanges();
    }, 300);
  }

  cancelHideReactions(post: any): void {
    if (post.hideReactionTimer) {
      clearTimeout(post.hideReactionTimer);
      post.hideReactionTimer = null;
    }
  }

  getReactionEmoji(type: string): string {
    return this.reactions.find(r => r.type === type)?.emoji || '👍';
  }

  getReactionLabel(type: string): string {
    return this.reactions.find(r => r.type === type)?.label || "J'aime";
  }

  getReactionColor(type: string): string {
    return this.reactions.find(r => r.type === type)?.color || 'var(--color-text-secondary)';
  }

  ////////////////////////
  // Getter pour filtrer
  get filteredModalUsers(): any[] {
    if (!this.activeReactionFilter) return this.modalReactionUsers;
    return this.modalReactionUsers.filter(u => u.reactionType === this.activeReactionFilter);
  }

  // Méthodes
  openReactionsModal(post: any): void {
    this.showReactionsModal = true;
    this.activeReactionFilter = null;
    this.loadingModalReactions = true;
    this.currentModalPostId = post.id;
    this.modalReactionUsers = [];

    this.communityService.getReactionUsers(post.id).subscribe({
      next: (users) => {
        this.modalReactionUsers = users || [];
        this.loadingModalReactions = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loadingModalReactions = false;
        this.cdr.detectChanges();
      }
    });
  }

  closeReactionsModal(): void {
    this.showReactionsModal = false;
    this.modalReactionUsers = [];
    this.activeReactionFilter = null;
    this.currentModalPostId = null;
  }

  filterReactionModal(type: string | null): void {
    this.activeReactionFilter = type;
  }

  getModalReactionTypes(): { type: string; emoji: string; count: number }[] {
    const map = new Map<string, number>();
    this.modalReactionUsers.forEach(u => {
      map.set(u.reactionType, (map.get(u.reactionType) || 0) + 1);
    });
    return Array.from(map.entries()).map(([type, count]) => ({
      type,
      emoji: this.getReactionEmoji(type),
      count
    }));
  }

  getInitials(name: string): string {
    if (!name?.trim()) return '?';
    const parts = name.trim().split(' ').filter(n => n.length > 0);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  // ── Team community mode methods ──────────────────────────────────────────

  initTeamMode(): void {
    const userId = Number(localStorage.getItem('user_id') || 0);
    this.teamCurrentUserId = userId;
    const name = localStorage.getItem('user_name') || '';
    this.teamCurrentUserInitials = this.getInitials(name);

    this.teamService.getTeamById(this.teamId!).subscribe({
      next: (team) => { this.teamName = team.name || ''; this.cdr.detectChanges(); },
      error: () => {}
    });

    this.loadTeamPosts(true);
  }

  loadTeamPosts(reset: boolean): void {
    if (!this.teamId) return;
    if (reset) {
      this.teamPage = 0;
      this.teamIsLastPage = false;
      this.teamPosts = [];
      this.loadingTeamPosts = true;
      this.teamErrorBanner = null;
    } else {
      this.loadingMoreTeamPosts = true;
    }

    this.communityService.getTeamPosts(this.teamId, this.teamPage).subscribe({
      next: (page) => {
        const mapped = page.content.map(d => this.makePostState(d));
        if (reset) {
          this.teamPosts = mapped;
          this.loadingTeamPosts = false;
        } else {
          this.teamPosts = [...this.teamPosts, ...mapped];
          this.loadingMoreTeamPosts = false;
        }
        this.teamIsLastPage = page.last;
        this.teamPage++;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loadingTeamPosts = false;
        this.loadingMoreTeamPosts = false;
        const status = (err as any)?.status;
        this.teamErrorBanner = status === 403
          ? 'Vous devez être membre de cette équipe pour accéder à la communauté.'
          : 'Impossible de charger les posts. Vérifiez votre connexion.';
        this.cdr.detectChanges();
      }
    });
  }

  private makePostState(data: TeamPostResponse): TeamPostState {
    return { data, showComments: false, comments: [], loadingComments: false, newCommentText: '', submittingComment: false };
  }

  goBackToTeam(): void {
    this.router.navigate(['/app/team', this.teamId]);
  }

  onTeamPostInput(event: Event): void {
    this.newTeamPostContent = (event.target as HTMLTextAreaElement).value;
  }

  onTeamImageSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.newTeamPostImage = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      this.newTeamPostImagePreview = e.target?.result as string;
      this.cdr.detectChanges();
    };
    reader.readAsDataURL(file);
  }

  removeTeamPostImage(): void {
    this.newTeamPostImage = null;
    this.newTeamPostImagePreview = null;
  }

  submitTeamPost(): void {
    const content = this.newTeamPostContent.trim();
    if (!content || !this.teamId || this.submittingTeamPost) return;
    this.submittingTeamPost = true;
    this.teamPostError = null;

    this.communityService.createTeamPost(this.teamId, content).subscribe({
      next: (post) => {
        if (this.newTeamPostImage) {
          this.communityService.uploadTeamPostImage(post.id, this.newTeamPostImage).subscribe({
            next: (updated) => {
              this.teamPosts.unshift(this.makePostState(updated));
              this.finishPostSubmit();
            },
            error: () => {
              this.teamPosts.unshift(this.makePostState(post));
              this.finishPostSubmit();
            }
          });
        } else {
          this.teamPosts.unshift(this.makePostState(post));
          this.finishPostSubmit();
        }
      },
      error: (err) => {
        this.submittingTeamPost = false;
        this.teamPostError = (err as any)?.error?.message || 'Erreur lors de la publication.';
        this.cdr.detectChanges();
      }
    });
  }

  private finishPostSubmit(): void {
    this.newTeamPostContent = '';
    this.newTeamPostImage = null;
    this.newTeamPostImagePreview = null;
    this.submittingTeamPost = false;
    this.cdr.detectChanges();
  }

  confirmDeleteTeamPost(post: TeamPostState): void {
    if (!confirm('Supprimer ce post ?')) return;
    this.communityService.deleteTeamPost(post.data.id).subscribe({
      next: () => {
        this.teamPosts = this.teamPosts.filter(p => p !== post);
        this.cdr.detectChanges();
      },
      error: () => this.showToast('Impossible de supprimer le post.')
    });
  }

  toggleTeamLike(post: TeamPostState): void {
    const wasLiked = post.data.likedByCurrentUser;
    post.data.likedByCurrentUser = !wasLiked;
    post.data.likeCount += wasLiked ? -1 : 1;
    this.cdr.detectChanges();

    const req = wasLiked
      ? this.communityService.unlikeTeamPost(post.data.id)
      : this.communityService.likeTeamPost(post.data.id);

    req.subscribe({
      next: (updated) => { post.data = updated; this.cdr.detectChanges(); },
      error: () => {
        post.data.likedByCurrentUser = wasLiked;
        post.data.likeCount += wasLiked ? 1 : -1;
        this.cdr.detectChanges();
      }
    });
  }

  toggleTeamComments(post: TeamPostState): void {
    post.showComments = !post.showComments;
    if (post.showComments && post.comments.length === 0) {
      post.loadingComments = true;
      this.communityService.getTeamPostComments(post.data.id).subscribe({
        next: (comments) => { post.comments = comments; post.loadingComments = false; this.cdr.detectChanges(); },
        error: () => { post.loadingComments = false; this.cdr.detectChanges(); }
      });
    }
  }

  submitTeamComment(post: TeamPostState): void {
    const text = post.newCommentText.trim();
    if (!text || post.submittingComment) return;
    post.submittingComment = true;

    this.communityService.addTeamPostComment(post.data.id, text).subscribe({
      next: (comment) => {
        post.comments.push(comment);
        post.data.commentCount++;
        post.newCommentText = '';
        post.submittingComment = false;
        this.cdr.detectChanges();
      },
      error: () => { post.submittingComment = false; this.cdr.detectChanges(); }
    });
  }

  confirmDeleteTeamComment(post: TeamPostState, comment: TeamCommentResponse): void {
    if (!confirm('Supprimer ce commentaire ?')) return;
    this.communityService.deleteTeamPostComment(comment.id).subscribe({
      next: () => {
        post.comments = post.comments.filter(c => c !== comment);
        post.data.commentCount = Math.max(0, post.data.commentCount - 1);
        this.cdr.detectChanges();
      },
      error: () => this.showToast('Impossible de supprimer le commentaire.')
    });
  }

  trackTeamPost(_: number, post: TeamPostState): number {
    return post.data.id;
  }

  getFullUrl(url: string): string {
    if (!url) return '';
    if (url.startsWith('/uploads/')) return environment.wsUrl + url;
    return url;
  }

  openFullscreen(url: string): void {
    this.fullscreenImageUrl = url;
  }

  closeFullscreen(): void {
    this.fullscreenImageUrl = null;
  }
}
