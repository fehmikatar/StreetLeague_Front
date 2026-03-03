import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, MessageCircle, Heart, Share2, TrendingUp, Users, Plus, X } from 'lucide-angular';

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
            <p class="text-muted-foreground">Connectez-vous avec d'autres joueurs</p>
          </div>
          <button (click)="openNewPost()" class="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all">
            <lucide-icon [name]="PlusIcon" [size]="16"></lucide-icon>
            Nouveau post
          </button>
        </div>

        <!-- New Post Modal -->
        <div *ngIf="showNewPostModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div class="bg-card rounded-2xl border border-border p-6 w-full max-w-lg">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-semibold text-foreground">Nouveau Post</h3>
              <button (click)="showNewPostModal = false" class="p-2 hover:bg-muted rounded-lg transition-colors">
                <lucide-icon [name]="XIcon" [size]="18" class="text-muted-foreground"></lucide-icon>
              </button>
            </div>
            <textarea [(ngModel)]="newPostContent" rows="4" placeholder="Partagez quelque chose avec la communauté..."
              class="w-full px-4 py-3 bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground resize-none mb-4"></textarea>
            <div class="flex gap-2 flex-wrap mb-4">
              <button *ngFor="let tag of availableTags" (click)="selectedTag = tag"
                class="px-3 py-1 rounded-full text-sm transition-colors"
                [ngClass]="selectedTag === tag ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-primary/10'">
                {{ tag }}
              </button>
            </div>
            <div class="flex gap-3 justify-end">
              <button (click)="showNewPostModal = false" class="px-4 py-2 bg-muted text-foreground rounded-xl hover:bg-muted/70 transition-colors">Annuler</button>
              <button (click)="submitPost()" class="px-4 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors">Publier</button>
            </div>
          </div>
        </div>

        <div class="grid lg:grid-cols-3 gap-8">
          <!-- Feed -->
          <div class="lg:col-span-2 space-y-6">
            <div *ngFor="let post of posts" class="bg-card rounded-2xl p-6 border border-border">
              <div class="flex items-start gap-4 mb-4">
                <div class="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold">
                  {{ post.author.substring(0, 2).toUpperCase() }}
                </div>
                <div class="flex-1">
                  <div class="font-semibold">{{ post.author }}</div>
                  <div class="text-sm text-muted-foreground">{{ post.time }}</div>
                </div>
                <span class="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-semibold">{{ post.tag }}</span>
              </div>
              <p class="text-foreground mb-4">{{ post.content }}</p>
              <div class="flex items-center gap-6 pt-4 border-t border-border">
                <button (click)="toggleLike(post)" class="flex items-center gap-2 text-sm transition-colors"
                  [ngClass]="post.liked ? 'text-primary' : 'text-muted-foreground hover:text-primary'">
                  <lucide-icon [name]="HeartIcon" [size]="16"></lucide-icon>
                  {{ post.likes }}
                </button>
                <button (click)="toggleComments(post)" class="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                  <lucide-icon [name]="MessageCircleIcon" [size]="16"></lucide-icon>
                  {{ post.comments }}
                </button>
                <button (click)="sharePost(post)" class="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                  <lucide-icon [name]="Share2Icon" [size]="16"></lucide-icon>
                  Partager
                </button>
              </div>
              <!-- Comment box (toggle) -->
              <div *ngIf="post.showComment" class="mt-4 pt-4 border-t border-border">
                <div class="flex gap-2">
                  <input [(ngModel)]="post.commentInput" placeholder="Écrire un commentaire..."
                    class="flex-1 px-3 py-2 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                  <button (click)="addComment(post)" class="px-3 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90 transition-colors">Envoyer</button>
                </div>
              </div>
            </div>
          </div>

          <!-- Sidebar -->
          <div class="space-y-6">
            <div class="bg-card rounded-2xl p-6 border border-border">
              <h3 class="mb-4">Trending Topics</h3>
              <div class="space-y-3">
                <div *ngFor="let topic of trending" class="flex items-center gap-3 cursor-pointer hover:bg-muted p-2 rounded-lg transition-colors" (click)="filterByTag(topic.tag)">
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
            <div class="bg-card rounded-2xl p-6 border border-border">
              <h3 class="mb-4">Joueurs actifs</h3>
              <div class="space-y-3">
                <div *ngFor="let player of activePlayers" class="flex items-center gap-3">
                  <div class="relative">
                    <div class="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold text-sm">
                      {{ player.name.substring(0, 2).toUpperCase() }}
                    </div>
                    <div *ngIf="player.online" class="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-card"></div>
                  </div>
                  <div class="flex-1">
                    <div class="font-semibold text-sm">{{ player.name }}</div>
                    <div class="text-xs text-muted-foreground">{{ player.sport }}</div>
                  </div>
                  <button (click)="followPlayer(player)"
                    class="text-xs px-3 py-1 rounded-full transition-colors"
                    [ngClass]="player.followed ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary'">
                    {{ player.followed ? 'Suivi ✓' : 'Suivre' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Toast -->
      <div *ngIf="toast" class="fixed bottom-6 right-6 bg-card border border-border rounded-xl px-4 py-3 shadow-xl text-sm font-medium text-foreground z-50">
        {{ toast }}
      </div>
    </div>
  `,
})
export class CommunityComponent {
    readonly MessageCircleIcon = MessageCircle;
    readonly HeartIcon = Heart;
    readonly Share2Icon = Share2;
    readonly TrendingUpIcon = TrendingUp;
    readonly UsersIcon = Users;
    readonly PlusIcon = Plus;
    readonly XIcon = X;

    toast: string | null = null;
    showNewPostModal = false;
    newPostContent = '';
    selectedTag = 'Football';
    availableTags = ['Football', 'Basketball', 'Tennis', 'Recrutement', 'Général'];

    posts: any[] = [
        { id: 1, author: 'Alex Rivera', time: 'Il y a 2 heures', content: 'Victoire épique ce soir ! 3-2 contre les Eagles FC. Prêt pour le prochain match 🔥', tag: 'Football', likes: 24, comments: 8, liked: false, showComment: false, commentInput: '' },
        { id: 2, author: 'Morgan Lee', time: 'Il y a 4 heures', content: 'Qui est chaud pour un match de basket ce weekend ? Court Premium dispo samedi à 15h 🏀', tag: 'Basketball', likes: 15, comments: 12, liked: false, showComment: false, commentInput: '' },
        { id: 3, author: 'Jordan Chen', time: 'Hier', content: 'Je cherche des joueurs pour compléter l\'équipe. Niveau intermédiaire, ambiance sympa ! Contact en MP.', tag: 'Recrutement', likes: 8, comments: 5, liked: false, showComment: false, commentInput: '' },
        { id: 4, author: 'Taylor Brooks', time: 'Il y a 2 jours', content: 'PB personnel aujourd\'hui au tennis : 6-2, 6-1. L\'entraînement paye ! 🎾', tag: 'Tennis', likes: 32, comments: 14, liked: true, showComment: false, commentInput: '' },
    ];

    trending = [
        { tag: '#football', posts: 234 },
        { tag: '#basketball', posts: 128 },
        { tag: '#recrutement', posts: 89 },
        { tag: '#tournoi2026', posts: 76 },
        { tag: '#performance', posts: 64 },
    ];

    activePlayers: any[] = [
        { name: 'Alex Rivera', sport: 'Football', online: true, followed: false },
        { name: 'Morgan Lee', sport: 'Basketball', online: true, followed: false },
        { name: 'Casey Kim', sport: 'Tennis', online: false, followed: false },
        { name: 'Sam Taylor', sport: 'Football', online: true, followed: false },
    ];

    toggleLike(post: any) {
        post.liked = !post.liked;
        post.likes += post.liked ? 1 : -1;
    }

    toggleComments(post: any) {
        post.showComment = !post.showComment;
    }

    addComment(post: any) {
        if (!post.commentInput.trim()) return;
        post.comments++;
        post.commentInput = '';
        post.showComment = false;
        this.showToast('Commentaire publié ! 💬');
    }

    sharePost(post: any) {
        this.showToast(`Post de ${post.author} partagé ! 🔗`);
    }

    followPlayer(player: any) {
        player.followed = !player.followed;
        this.showToast(player.followed ? `Vous suivez ${player.name} ✓` : `Vous ne suivez plus ${player.name}`);
    }

    filterByTag(tag: string) {
        this.showToast(`Filtre par ${tag} — bientôt disponible`);
    }

    openNewPost() {
        this.newPostContent = '';
        this.selectedTag = 'Football';
        this.showNewPostModal = true;
    }

    submitPost() {
        if (!this.newPostContent.trim()) return;
        this.posts.unshift({
            id: this.posts.length + 1,
            author: 'Moi',
            time: 'À l\'instant',
            content: this.newPostContent,
            tag: this.selectedTag,
            likes: 0,
            comments: 0,
            liked: false,
            showComment: false,
            commentInput: ''
        });
        this.showNewPostModal = false;
        this.newPostContent = '';
        this.showToast('Post publié avec succès ! 🎉');
    }

    showToast(msg: string) {
        this.toast = msg;
        setTimeout(() => this.toast = null, 3000);
    }
}
