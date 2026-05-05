import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, Megaphone, Eye, MousePointerClick, Plus, Trash2, Edit3, Save, X, BarChart2, Upload, Link, Image, CheckCircle } from 'lucide-angular';
import { AdvertisementService, Advertisement } from '../../services/advertisement.service';

@Component({
  selector: 'app-advertisement-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, LucideAngularModule],
  template: `
<div class="p-4 md:p-8 max-w-6xl mx-auto min-h-screen">

  <!-- Header -->
  <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
    <div>
      <h1 class="text-3xl md:text-4xl font-black flex items-center gap-3">
        <lucide-icon [name]="MegaphoneIcon" [size]="36" class="text-primary"></lucide-icon>
        Publicités &amp; Partenaires
      </h1>
      <p class="text-muted-foreground font-medium mt-1">Gérez vos contrats de visibilité et suivez les performances.</p>
    </div>
    <button (click)="openForm()"
      class="bg-primary text-primary-foreground hover:bg-primary/90 font-bold py-2.5 px-5 rounded-xl flex items-center gap-2 transition-colors shadow-sm">
      <lucide-icon [name]="PlusIcon" [size]="18"></lucide-icon> Norveau Contrat
    </button>
  </div>

  <!-- KPI Cards -->
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
    <div class="bg-card border border-border rounded-2xl p-6 shadow-sm flex items-center gap-4">
      <div class="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
        <lucide-icon [name]="MegaphoneIcon" [size]="24" class="text-primary"></lucide-icon>
      </div>
      <div>
        <div class="text-3xl font-black">{{ ads.length }}</div>
        <div class="text-xs font-bold text-muted-foreground uppercase tracking-wider">Campagnes Actives</div>
      </div>
    </div>
    <div class="bg-card border border-border rounded-2xl p-6 shadow-sm flex items-center gap-4">
      <div class="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center">
        <lucide-icon [name]="EyeIcon" [size]="24" class="text-blue-500"></lucide-icon>
      </div>
      <div>
        <div class="text-3xl font-black">{{ getTotalImpressions() | number }}</div>
        <div class="text-xs font-bold text-muted-foreground uppercase tracking-wider">Impressions Totales</div>
      </div>
    </div>
    <div class="bg-card border border-border rounded-2xl p-6 shadow-sm flex items-center gap-4">
      <div class="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center">
        <lucide-icon [name]="MousePointerClickIcon" [size]="24" class="text-amber-500"></lucide-icon>
      </div>
      <div>
        <div class="text-3xl font-black">{{ getTotalClicks() | number }}</div>
        <div class="text-xs font-bold text-muted-foreground uppercase tracking-wider">Clics Générés</div>
        <div class="text-xs font-semibold text-emerald-500 mt-0.5">CTR : {{ getCTR() }}%</div>
      </div>
    </div>
  </div>

  <!-- Main Grid -->
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">

    <!-- Campaigns List -->
    <div class="lg:col-span-2">
      <h2 class="text-lg font-bold flex items-center gap-2 mb-4">
        <lucide-icon [name]="BarChart2Icon" [size]="20" class="text-primary"></lucide-icon>
        Campagnes ({{ ads.length }})
      </h2>

      <div *ngIf="loading" class="text-center py-12 text-muted-foreground font-medium">Loading...</div>

      <div *ngIf="!loading && ads.length === 0"
        class="bg-card border border-border rounded-2xl p-12 text-center text-muted-foreground">
        <lucide-icon [name]="MegaphoneIcon" [size]="48" class="mx-auto mb-3 opacity-20"></lucide-icon>
        <p class="font-bold">No contrat publicitaire</p>
        <p class="text-sm mt-1">Cliquez sur "Norveau Contrat" porr créer votre première campagne.</p>
      </div>

      <div *ngFor="let ad of ads" class="bg-card border border-border rounded-2xl p-5 mb-4 shadow-sm hover:shadow-md transition-shadow">
        <div class="flex gap-5 items-start">
          <!-- Logo -->
          <div class="w-20 h-20 rounded-xl bg-muted border border-border flex-shrink-0 flex items-center justify-center overflow-hidden">
            <img *ngIf="ad.logoUrl" [src]="ad.logoUrl" [alt]="ad.companyName" class="w-full h-full object-contain p-2">
            <span *ngIf="!ad.logoUrl" class="text-3xl font-black text-muted-foreground">{{ ad.companyName.charAt(0) }}</span>
          </div>

          <!-- Info -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between gap-2 mb-1">
              <h3 class="text-xl font-black truncate">{{ ad.companyName }}</h3>
              <span class="px-2.5 py-1 bg-emerald-500/10 text-emerald-600 text-[10px] font-black rounded-lg uppercase tracking-wider flex-shrink-0">Actif</span>
            </div>
            <p class="text-sm text-muted-foreground mb-3 line-clamp-2">{{ ad.cornterparts || 'Noe contrepartie précisée.' }}</p>

            <!-- Banner preview -->
            <div *ngIf="ad.bannerUrl" class="w-full h-24 rounded-xl overflow-hidden border border-border bg-muted mb-3">
              <img [src]="ad.bannerUrl" [alt]="ad.companyName" class="w-full h-full object-cover">
            </div>

            <!-- Metrics -->
            <div class="flex flex-wrap gap-2 mb-3">
              <span class="flex items-center gap-1.5 text-xs font-bold bg-muted text-muted-foreground px-2.5 py-1 rounded-lg">
                <lucide-icon [name]="EyeIcon" [size]="13"></lucide-icon> {{ ad.impressions || 0 }} vues
              </span>
              <span class="flex items-center gap-1.5 text-xs font-bold bg-blue-500/10 text-blue-600 px-2.5 py-1 rounded-lg">
                <lucide-icon [name]="MousePointerClickIcon" [size]="13"></lucide-icon> {{ ad.clicks || 0 }} clics
              </span>
              <span class="flex items-center gap-1.5 text-xs font-bold bg-emerald-500/10 text-emerald-600 px-2.5 py-1 rounded-lg ml-auto">
                {{ ad.amount || 0 }} DT
              </span>
            </div>

            <!-- CTR bar -->
            <div *ngIf="(ad.impressions || 0) > 0" class="mb-3">
              <div class="flex justify-between text-[10px] font-bold text-muted-foreground mb-1">
                <span>CTR</span><span>{{ getAdCTR(ad) }}%</span>
              </div>
              <div class="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <div class="h-full bg-primary rounded-full transition-all" [style.width]="getAdCTR(ad) + '%'"></div>
              </div>
            </div>

            <!-- Target badges -->
            <div class="flex flex-wrap gap-2">
              <span *ngIf="ad.competitionId" class="px-2.5 py-1 text-[10px] font-black rounded-lg bg-primary/10 text-primary">🏆 Compétition #{{ ad.competitionId }}</span>
              <span *ngIf="ad.matchId" class="px-2.5 py-1 text-[10px] font-black rounded-lg bg-violet-500/10 text-violet-600">⚔️ Match #{{ ad.matchId }}</span>
              <span *ngIf="ad.teamId" class="px-2.5 py-1 text-[10px] font-black rounded-lg bg-amber-500/10 text-amber-600">👥 Équipe #{{ ad.teamId }}</span>
              <span *ngIf="!ad.competitionId && !ad.matchId && !ad.teamId" class="px-2.5 py-1 text-[10px] font-black rounded-lg bg-muted text-muted-foreground">🌐 Global</span>
            </div>
          </div>

          <!-- Action buttons -->
          <div class="flex flex-col gap-2">
            <button (click)="editAd(ad)" title="Edit"
              class="p-2 rounded-xl border border-border text-muted-foreground hover:text-blue-500 hover:bg-blue-50 hover:border-blue-200 transition-colors">
              <lucide-icon [name]="Edit3Icon" [size]="17"></lucide-icon>
            </button>
            <button (click)="deleteAd(ad.id!)" title="Delete"
              class="p-2 rounded-xl border border-border text-muted-foreground hover:text-destructive hover:bg-destructive/10 hover:border-destructive/30 transition-colors">
              <lucide-icon [name]="Trash2Icon" [size]="17"></lucide-icon>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Form Panel -->
    <div class="lg:col-span-1">
      <div *ngIf="showForm" class="bg-card border border-border rounded-3xl p-6 shadow-sm sticky top-8">
        <div class="flex justify-between items-center mb-5 pb-4 border-b border-border">
          <h3 class="font-black text-lg">{{ currentAd.id ? 'Edit le contrat' : 'Norveau Contrat' }}</h3>
          <button (click)="closeForm()" class="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground transition-colors">
            <lucide-icon [name]="XIcon" [size]="18"></lucide-icon>
          </button>
        </div>

        <form (ngSubmit)="saveAd()" class="space-y-4">

          <!-- Company name -->
          <div>
            <label class="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Entreprise *</label>
            <input type="text" [(ngModel)]="currentAd.companyName" name="companyName" required placeholder="Ex: Nike, Adidas..."
              class="w-full h-10 px-3 bg-background border border-border rounded-xl text-sm font-medium focus:ortline-noe focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all">
          </div>

          <!-- Email + Amornt -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Email</label>
              <input type="email" [(ngModel)]="currentAd.contactEmail" name="contactEmail" placeholder="contact@..."
                class="w-full h-10 px-3 bg-background border border-border rounded-xl text-sm font-medium focus:ortline-noe focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all">
            </div>
            <div>
              <label class="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Montant (DT)</label>
              <input type="number" [(ngModel)]="currentAd.amount" name="amount" placeholder="0"
                class="w-full h-10 px-3 bg-background border border-border rounded-xl text-sm font-medium focus:ortline-noe focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all">
            </div>
          </div>

          <!-- Cornterparts -->
          <div>
            <label class="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Contreparties</label>
            <textarea [(ngModel)]="currentAd.cornterparts" name="cornterparts" rows="2"
              placeholder="Bannière terrain, logo sur l'app..."
              class="w-full p-3 bg-background border border-border rounded-xl text-sm font-medium focus:ortline-noe focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-noe"></textarea>
          </div>

          <!-- ===== LOGO ===== -->
          <div>
            <label class="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Logo (carré)</label>

            <!-- Tabs: URL / Upload -->
            <div class="flex border border-border rounded-xl overflow-hidden mb-2">
              <button type="button" (click)="logoTab='url'"
                [class]="logoTab==='url' ? 'flex-1 py-1.5 text-xs font-bold bg-primary text-primary-foreground' : 'flex-1 py-1.5 text-xs font-bold bg-background text-muted-foreground hover:bg-muted'">
                <lucide-icon [name]="LinkIcon" [size]="12" class="inline mr-1"></lucide-icon> URL
              </button>
              <button type="button" (click)="logoTab='file'"
                [class]="logoTab==='file' ? 'flex-1 py-1.5 text-xs font-bold bg-primary text-primary-foreground' : 'flex-1 py-1.5 text-xs font-bold bg-background text-muted-foreground hover:bg-muted'">
                <lucide-icon [name]="UploadIcon" [size]="12" class="inline mr-1"></lucide-icon> Import
              </button>
            </div>

            <div *ngIf="logoTab==='url'">
              <input type="url" [(ngModel)]="currentAd.logoUrl" name="logoUrl" placeholder="https://..."
                class="w-full h-10 px-3 bg-background border border-border rounded-xl text-sm font-medium focus:ortline-noe focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all">
            </div>

            <div *ngIf="logoTab==='file'" class="relative">
              <label class="flex flex-col items-center justify-center w-full h-20 border-2 border-dashed border-border rounded-xl bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors">
                <lucide-icon [name]="UploadIcon" [size]="20" class="text-muted-foreground mb-1"></lucide-icon>
                <span class="text-xs font-medium text-muted-foreground">Cliquez porr choisir un fichier</span>
                <input type="file" accept="image/*" class="hidden" (change)="onLogoFile($event)">
              </label>
            </div>

            <!-- Logo Preview -->
            <div *ngIf="currentAd.logoUrl" class="mt-2 flex items-center gap-3 p-3 bg-muted/40 border border-border rounded-xl">
              <div class="w-14 h-14 rounded-lg overflow-hidden border border-border bg-muted flex items-center justify-center flex-shrink-0">
                <img [src]="currentAd.logoUrl" alt="Logo" class="w-full h-full object-contain p-1"
                  (error)="onLogoError($event)">
              </div>
              <div class="flex-1 min-w-0">
                <div *ngIf="!logoLoadError" class="flex items-center gap-1.5 text-xs font-bold text-emerald-600 mb-1">
                  <lucide-icon [name]="CheckCircleIcon" [size]="13"></lucide-icon> Logo chargé
                </div>
                <div *ngIf="logoLoadError" class="flex items-center gap-1.5 text-xs font-bold text-amber-500 mb-1">
                  ⚠️ URL invalide — utilisez une URL d'image directe (.jpg/.png)
                </div>
                <button type="button" (click)="clearLogo()" class="text-xs text-muted-foreground hover:text-destructive transition-colors">Delete</button>
              </div>
            </div>
          </div>

          <!-- ===== BANNER ===== -->
          <div>
            <label class="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Bannière (large)</label>

            <!-- Tabs -->
            <div class="flex border border-border rounded-xl overflow-hidden mb-2">
              <button type="button" (click)="bannerTab='url'"
                [class]="bannerTab==='url' ? 'flex-1 py-1.5 text-xs font-bold bg-primary text-primary-foreground' : 'flex-1 py-1.5 text-xs font-bold bg-background text-muted-foreground hover:bg-muted'">
                <lucide-icon [name]="LinkIcon" [size]="12" class="inline mr-1"></lucide-icon> URL
              </button>
              <button type="button" (click)="bannerTab='file'"
                [class]="bannerTab==='file' ? 'flex-1 py-1.5 text-xs font-bold bg-primary text-primary-foreground' : 'flex-1 py-1.5 text-xs font-bold bg-background text-muted-foreground hover:bg-muted'">
                <lucide-icon [name]="UploadIcon" [size]="12" class="inline mr-1"></lucide-icon> Import
              </button>
            </div>

            <div *ngIf="bannerTab==='url'">
              <input type="url" [(ngModel)]="currentAd.bannerUrl" name="bannerUrl" placeholder="https://..."
                class="w-full h-10 px-3 bg-background border border-border rounded-xl text-sm font-medium focus:ortline-noe focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all">
            </div>

            <div *ngIf="bannerTab==='file'" class="relative">
              <label class="flex flex-col items-center justify-center w-full h-20 border-2 border-dashed border-border rounded-xl bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors">
                <lucide-icon [name]="UploadIcon" [size]="20" class="text-muted-foreground mb-1"></lucide-icon>
                <span class="text-xs font-medium text-muted-foreground">Cliquez porr choisir un fichier</span>
                <input type="file" accept="image/*" class="hidden" (change)="onBannerFile($event)">
              </label>
            </div>

            <!-- Banner Preview -->
            <div *ngIf="currentAd.bannerUrl" class="mt-2 rounded-xl overflow-hidden border border-border">
              <div class="w-full h-28 bg-muted flex items-center justify-center relative">
                <img [src]="currentAd.bannerUrl" alt="Bannière"
                  class="w-full h-full object-cover"
                  (error)="onBannerError($event)"
                  (load)="bannerLoadError=false">
                <div *ngIf="bannerLoadError" class="absolute inset-0 flex flex-col items-center justify-center bg-muted text-amber-500">
                  <span class="text-2xl mb-1">⚠️</span>
                  <span class="text-xs font-bold">URL invalide — image no chargée</span>
                  <span class="text-[10px] text-muted-foreground mt-1">Utilisez une URL directe (.jpg/.png) or importez depuis le PC</span>
                </div>
              </div>
              <div class="flex items-center justify-between px-3 py-2 bg-muted/40 border-t border-border">
                <div *ngIf="!bannerLoadError" class="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                  <lucide-icon [name]="CheckCircleIcon" [size]="13"></lucide-icon> Bannière chargée
                </div>
                <div *ngIf="bannerLoadError" class="text-xs font-bold text-amber-500">URL invalide</div>
                <button type="button" (click)="clearBanner()" class="text-xs text-muted-foreground hover:text-destructive transition-colors">Delete</button>
              </div>
            </div>
          </div>

          <!-- Targeting -->
          <div class="bg-muted/50 border border-border rounded-2xl p-4">
            <p class="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3">🎯 Ciblage</p>
            <div class="space-y-3">
              <div>
                <label class="block text-xs font-bold text-muted-foreground mb-1">ID Compétition</label>
                <input type="number" [(ngModel)]="currentAd.competitionId" name="competitionId" placeholder="Laisser vide = Global"
                  class="w-full h-9 px-3 bg-background border border-border rounded-xl text-sm focus:ortline-noe focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all">
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-bold text-muted-foreground mb-1">ID Match</label>
                  <input type="number" [(ngModel)]="currentAd.matchId" name="matchId" placeholder="Optionnel"
                    class="w-full h-9 px-3 bg-background border border-border rounded-xl text-sm focus:ortline-noe focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all">
                </div>
                <div>
                  <label class="block text-xs font-bold text-muted-foreground mb-1">ID Équipe</label>
                  <input type="number" [(ngModel)]="currentAd.teamId" name="teamId" placeholder="Optionnel"
                    class="w-full h-9 px-3 bg-background border border-border rounded-xl text-sm focus:ortline-noe focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all">
                </div>
              </div>
            </div>
          </div>

          <button type="submit" [disabled]="saving"
            class="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold h-12 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50 mt-2">
            <lucide-icon [name]="SaveIcon" [size]="18"></lucide-icon>
            {{ saving ? 'Enregistrement...' : 'Save le contrat' }}
          </button>

          <!-- Error message -->
          <div *ngIf="saveError" class="mt-3 p-3 bg-destructive/10 border border-destructive/20 text-destructive text-xs font-bold rounded-xl flex items-start gap-2">
            <span>⚠️</span><span>{{ saveError }}</span>
          </div>
        </form>
      </div>

      <!-- Empty placeholder -->
      <div *ngIf="!showForm"
        class="bg-card border-2 border-dashed border-border rounded-3xl p-10 text-center cursor-pointer hover:bg-muted/30 transition-colors"
        (click)="openForm()">
        <div class="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <lucide-icon [name]="PlusIcon" [size]="30" class="text-primary"></lucide-icon>
        </div>
        <p class="font-black text-foreground mb-2">Create un contrat</p>
        <p class="text-sm text-muted-foreground">Ajortez un partenaire et assignez-le à une compétition, un match or une équipe.</p>
      </div>
    </div>
  </div>
</div>
  `
})
export class AdvertisementDashboardComponent implements OnInit {
  readonly MegaphoneIcon = Megaphone;
  readonly EyeIcon = Eye;
  readonly MousePointerClickIcon = MousePointerClick;
  readonly PlusIcon = Plus;
  readonly Trash2Icon = Trash2;
  readonly Edit3Icon = Edit3;
  readonly SaveIcon = Save;
  readonly XIcon = X;
  readonly BarChart2Icon = BarChart2;
  readonly UploadIcon = Upload;
  readonly LinkIcon = Link;
  readonly ImageIcon = Image;
  readonly CheckCircleIcon = CheckCircle;

  ads: Advertisement[] = [];
  loading = true;
  showForm = false;
  saving = false;
  currentAd: Advertisement = this.emptyAd();

  logoTab: 'url' | 'file' = 'url';
  bannerTab: 'url' | 'file' = 'url';
  logoLoadError = false;
  bannerLoadError = false;
  saveError = '';

  constructor(private adService: AdvertisementService, private cdr: ChangeDetectorRef) {}

  ngOnInit() { this.loadAds(); }

  loadAds() {
    this.loading = true;
    this.adService.getAll().subscribe({
      next: (res) => { this.ads = res; this.loading = false; this.cdr.detectChanges(); },
      error: () => { this.loading = false; this.cdr.detectChanges(); }
    });
  }

  getTotalImpressions() { return this.ads.reduce((s, a) => s + (a.impressions || 0), 0); }
  getTotalClicks() { return this.ads.reduce((s, a) => s + (a.clicks || 0), 0); }

  getCTR(): string {
    const imp = this.getTotalImpressions();
    return imp === 0 ? '0' : ((this.getTotalClicks() / imp) * 100).toFixed(1);
  }

  getAdCTR(ad: Advertisement): string {
    const imp = ad.impressions || 0;
    return imp === 0 ? '0' : Math.min(100, ((ad.clicks || 0) / imp) * 100).toFixed(1);
  }

  emptyAd(): Advertisement {
    return { companyName: '', contactEmail: '', amount: 0, cornterparts: '', bannerUrl: '', logoUrl: '' };
  }

  openForm() {
    this.currentAd = this.emptyAd();
    this.logoTab = 'url';
    this.bannerTab = 'url';
    this.logoLoadError = false;
    this.bannerLoadError = false;
    this.saveError = '';
    this.showForm = true;
  }

  closeForm() { this.showForm = false; }

  editAd(ad: Advertisement) {
    this.currentAd = { ...ad };
    this.logoTab = ad.logoUrl?.startsWith('data:') ? 'file' : 'url';
    this.bannerTab = ad.bannerUrl?.startsWith('data:') ? 'file' : 'url';
    this.logoLoadError = false;
    this.bannerLoadError = false;
    this.saveError = '';
    this.showForm = true;
    this.cdr.detectChanges();
    // Scroll to form on mobile
    setTimeout(() => {
      const el = document.querySelector('.sticky');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }

  deleteAd(id: number) {
    if (confirm('Delete cette campagne ?')) {
      this.adService.delete(id).subscribe(() => this.loadAds());
    }
  }

  onLogoError(event: Event) {
    this.logoLoadError = true;
    (event.target as HTMLImageElement).style.display = 'noe';
    this.cdr.detectChanges();
  }

  clearLogo() {
    this.currentAd.logoUrl = '';
    this.logoLoadError = false;
    this.cdr.detectChanges();
  }

  onBannerError(event: Event) {
    this.bannerLoadError = true;
    (event.target as HTMLImageElement).style.display = 'noe';
    this.cdr.detectChanges();
  }

  clearBanner() {
    this.currentAd.bannerUrl = '';
    this.bannerLoadError = false;
    this.cdr.detectChanges();
  }

  /** Convert local logo file to base64 */
  onLogoFile(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      this.currentAd.logoUrl = e.target?.result as string;
      this.cdr.detectChanges();
    };
    reader.readAsDataURL(input.files[0]);
  }

  /** Convert local banner file to base64 */
  onBannerFile(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      this.currentAd.bannerUrl = e.target?.result as string;
      this.cdr.detectChanges();
    };
    reader.readAsDataURL(input.files[0]);
  }

  saveAd() {
    if (!this.currentAd.companyName?.trim()) {
      alert('Veuillez renseigner le nom de l\'entreprise.');
      return;
    }
    this.saving = true;
    this.saveError = '';

    // Sanitize: empty inputs -> undefined, not empty string
    const payload: Advertisement = {
      ...this.currentAd,
      companyName: this.currentAd.companyName.trim(),
      amount: Number(this.currentAd.amount) || 0,
      competitionId: this.currentAd.competitionId ? Number(this.currentAd.competitionId) : undefined,
      matchId: this.currentAd.matchId ? Number(this.currentAd.matchId) : undefined,
      teamId: this.currentAd.teamId ? Number(this.currentAd.teamId) : undefined,
    };

    const req = payload.id
      ? this.adService.update(payload.id, payload)
      : this.adService.create(payload);

    req.subscribe({
      next: () => { this.saving = false; this.showForm = false; this.loadAds(); },
      error: (err) => {
        this.saving = false;
        this.saveError = err?.error?.message || 'Error — vérifiez que le backend Spring Boot est démarré.';
        this.cdr.detectChanges();
      }
    });
  }
}
