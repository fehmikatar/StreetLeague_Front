import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { LucideAngularModule, Trophy, MapPin, Users, Clock, Calendar, ArrowLeft } from 'lucide-angular';

@Component({
  selector: 'app-match-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  template: `
    <div class="min-h-screen bg-background p-4 md:p-6">
      <div class="max-w-4xl mx-auto">
        <div class="flex items-center gap-4 mb-8">
          <a routerLink="/app/matches" class="p-2 bg-card border border-border rounded-xl hover:bg-muted transition-all">
            <lucide-icon [img]="ArrowLeftIcon" class="w-5 h-5"></lucide-icon>
          </a>
          <h1>Détails du Match</h1>
        </div>
        <div class="bg-card rounded-2xl p-8 border border-border mb-6 text-center">
          <div class="flex items-center justify-center gap-8 mb-6">
            <div class="text-center">
              <div class="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mx-auto mb-3 text-white font-bold text-lg">TS</div>
              <div class="font-bold">Thunder Strikers</div>
              <div class="text-sm text-muted-foreground">Domicile</div>
            </div>
            <div>
              <div class="text-5xl font-bold mb-2">VS</div>
              <div class="text-sm text-muted-foreground">Match #{{ matchId }}</div>
            </div>
            <div class="text-center">
              <div class="w-16 h-16 bg-gradient-to-br from-accent to-primary rounded-2xl flex items-center justify-center mx-auto mb-3 text-white font-bold text-lg">EF</div>
              <div class="font-bold">Eagles FC</div>
              <div class="text-sm text-muted-foreground">Visiteur</div>
            </div>
          </div>
          <div class="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
            <div class="flex items-center gap-1"><lucide-icon [img]="CalendarIcon" class="w-4 h-4"></lucide-icon>10 Fév 2026</div>
            <div class="flex items-center gap-1"><lucide-icon [img]="ClockIcon" class="w-4 h-4"></lucide-icon>18:00</div>
            <div class="flex items-center gap-1"><lucide-icon [img]="MapPinIcon" class="w-4 h-4"></lucide-icon>Terrain Parc Central</div>
            <div class="flex items-center gap-1"><lucide-icon [img]="UsersIcon" class="w-4 h-4"></lucide-icon>22 joueurs</div>
          </div>
        </div>
        <div class="grid md:grid-cols-2 gap-6">
          <div class="bg-card rounded-2xl p-6 border border-border">
            <h3 class="mb-4">Équipe domicile</h3>
            <div class="space-y-3">
              <div *ngFor="let player of homePlayers" class="flex items-center gap-3">
                <div class="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-xs">{{ player.number }}</div>
                <div>
                  <div class="font-semibold text-sm">{{ player.name }}</div>
                  <div class="text-xs text-muted-foreground">{{ player.position }}</div>
                </div>
              </div>
            </div>
          </div>
          <div class="bg-card rounded-2xl p-6 border border-border">
            <h3 class="mb-4">Actions rapides</h3>
            <div *ngIf="notification" class="mb-3 bg-primary/10 border border-primary/20 rounded-xl p-3 text-primary text-sm font-medium">
              {{ notification }}
            </div>
            <div class="space-y-3">
              <button (click)="rejoindre()" class="w-full py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all">Rejoindre le match</button>
              <button (click)="partager()" class="w-full py-3 bg-muted text-foreground rounded-xl hover:bg-muted/70 transition-all">Partager</button>
              <button (click)="desinscrire()" class="w-full py-3 bg-destructive/10 text-destructive rounded-xl hover:bg-destructive/20 transition-all">Se désinscrire</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class MatchDetailComponent implements OnInit {
  readonly ArrowLeftIcon = ArrowLeft;
  readonly CalendarIcon = Calendar;
  readonly ClockIcon = Clock;
  readonly MapPinIcon = MapPin;
  readonly UsersIcon = Users;
  matchId = '';
  notification = '';

  homePlayers = [
    { number: 1, name: 'Alex Rivera', position: 'Forward / Capitaine' },
    { number: 5, name: 'Morgan Lee', position: 'Milieu' },
    { number: 8, name: 'Jordan Chen', position: 'Défenseur' },
    { number: 10, name: 'Taylor Brooks', position: 'Milieu' },
    { number: 1, name: 'Casey Kim', position: 'Gardien' },
  ];

  constructor(private route: ActivatedRoute) { }
  ngOnInit() { this.matchId = this.route.snapshot.paramMap.get('id') || ''; }

  rejoindre() { this.showNotification('⚽ Match rejoint ! À bientôt sur le terrain.'); }
  partager() { this.showNotification('🔗 Lien copié dans le presse-papiers.'); }
  desinscrire() { this.showNotification('❌ Désinscription effectuée.'); }
  private showNotification(msg: string) {
    this.notification = msg;
    setTimeout(() => { this.notification = ''; }, 3000);
  }
}
