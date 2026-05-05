import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { LucideAngularModule, Tags, Plus, Pencil, Trash2, Loader2, RefreshCcw, X, CircleAlert, ArrowLeft, Save, Edit } from 'lucide-angular';
import { Category, CategoryPayload, ProductService } from '../services/product.service';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, RouterModule],
  template: `
    <div class="min-h-screen bg-background p-4 md:p-6">
      <div class="max-w-7xl mx-auto pb-20">
        
        <!-- Header -->
        <div class="flex items-center justify-between mb-8">
          <div class="flex items-center gap-4">
             <button (click)="router.navigate(['/app/admin'])" class="p-2 hover:bg-muted rounded-full transition-colors">
                <lucide-icon [name]="ArrowLeftIcon" [size]="24"></lucide-icon>
             </button>
             <div>
               <h1 class="text-3xl font-bold">Catégories de Sponsors</h1>
               <p class="text-muted-foreground">Gérez les catégories de votre boutique / sponsors</p>
             </div>
          </div>
          <div class="flex gap-3">
             <button (click)="loadCategories()" class="inline-flex items-center gap-2 rounded-xl border border-border bg-muted px-4 py-2 hover:bg-muted/70 transition-all">
                <lucide-icon [name]="RefreshCcwIcon" [size]="16"></lucide-icon> Refresh
             </button>
             <button *ngIf="isAdmin" (click)="openCreateModal()" class="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 hover:shadow-lg transition-all">
                <lucide-icon [name]="PlusIcon" [size]="18"></lucide-icon> Nouvelle Catégorie
             </button>
          </div>
        </div>

        <div *ngIf="!isAdmin" class="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-300">
          Accès refusé. Le rôle Admin est requis.
        </div>

        <div *ngIf="errorBanner" class="mb-6 flex items-center justify-between gap-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-300">
          <span>{{ errorBanner }}</span>
          <button (click)="loadCategories()" class="inline-flex items-center gap-1 rounded-lg bg-red-500/20 px-3 py-1.5 hover:bg-red-500/30">
            <lucide-icon [name]="RefreshCcwIcon" [size]="14"></lucide-icon> Réessayer
          </button>
        </div>

        <!-- Categories List -->
        <div class="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
           <div class="overflow-x-auto">
              <table class="w-full text-sm text-left">
                 <thead class="bg-muted/50 border-b border-border">
                    <tr>
                       <th class="px-6 py-4 font-semibold text-muted-foreground w-16">ID</th>
                       <th class="px-6 py-4 font-semibold text-muted-foreground">Nom</th>
                       <th class="px-6 py-4 font-semibold text-muted-foreground">Description</th>
                       <th class="px-6 py-4 font-semibold text-muted-foreground text-center">Capacité</th>
                       <th class="px-6 py-4 font-semibold text-muted-foreground text-right">Actions</th>
                    </tr>
                 </thead>
                 <tbody class="divide-y divide-border/50">
                    <tr *ngIf="loading" class="bg-background">
                       <td colspan="5" class="px-6 py-12 text-center text-muted-foreground">
                          <div class="flex flex-col items-center gap-2">
                             <lucide-icon [name]="Loader2Icon" [size]="32" class="animate-spin text-primary"></lucide-icon>
                             <span>Chargement des catégories...</span>
                          </div>
                       </td>
                    </tr>
                    <tr *ngIf="!loading && categories.length === 0 && !errorBanner" class="bg-background">
                       <td colspan="5" class="px-6 py-12 text-center text-muted-foreground">
                          <lucide-icon [name]="TagsIcon" [size]="40" class="mx-auto mb-3 opacity-50"></lucide-icon>
                          <p class="text-lg font-semibold">Aucune catégorie trouvée</p>
                          <p>Créez votre première catégorie pour organiser vos sponsors.</p>
                       </td>
                    </tr>
                    <tr *ngFor="let c of categories" class="bg-background hover:bg-muted/20 transition-colors">
                       <td class="px-6 py-4 font-mono text-muted-foreground">{{ c.id }}</td>
                       <td class="px-6 py-4 font-bold">{{ c.nom || c.name }}</td>
                       <td class="px-6 py-4 text-muted-foreground">{{ c.description || 'N/A' }}</td>
                       <td class="px-6 py-4 text-center font-medium">{{ c.capacity || 'N/A' }}</td>
                       <td class="px-6 py-4 text-right">
                          <div *ngIf="isAdmin" class="flex justify-end gap-1">
                             <button (click)="openEditModal(c)" [disabled]="isProcessing(c.id)" class="p-2 text-muted-foreground hover:text-primary transition-colors hover:bg-primary/10 rounded-lg">
                                <lucide-icon [name]="EditIcon" [size]="18"></lucide-icon>
                             </button>
                             <button (click)="deleteCategory(c)" [disabled]="isProcessing(c.id)" class="p-2 text-muted-foreground hover:text-destructive transition-colors hover:bg-destructive/10 rounded-lg">
                                <lucide-icon [name]="Trash2Icon" [size]="18"></lucide-icon>
                             </button>
                          </div>
                       </td>
                    </tr>
                 </tbody>
              </table>
           </div>
        </div>
      </div>
    </div>

    <!-- Modal Form (Create / Edit) -->
    <div *ngIf="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-background/80 backdrop-blur-sm" (click)="closeModal()"></div>
      <div class="relative bg-card border border-border shadow-2xl rounded-2xl w-full max-w-lg flex flex-col animate-in fade-in zoom-in-95 duration-200">
         
         <!-- Modal Header -->
         <div class="px-6 py-4 border-b border-border flex items-center justify-between">
            <h2 class="text-xl font-bold">{{ isEditing ? 'Modifier' : 'Ajouter' }} une Catégorie</h2>
            <button (click)="closeModal()" class="p-2 hover:bg-muted rounded-full transition-colors"><lucide-icon [name]="XIcon" [size]="20"></lucide-icon></button>
         </div>

         <!-- Modal Body -->
         <div class="p-6">
            <form class="space-y-4">
               <div class="space-y-2">
                  <label class="text-sm font-semibold">Nom de la catégorie <span class="text-destructive">*</span></label>
                  <input type="text" [(ngModel)]="currentFormData.nom" name="nom" class="w-full h-11 px-3 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary">
               </div>

               <div class="space-y-2">
                  <label class="text-sm font-semibold">Description</label>
                  <textarea [(ngModel)]="currentFormData.description" name="desc" rows="4" class="w-full p-3 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary"></textarea>
               </div>

               <div class="space-y-2">
                  <label class="text-sm font-semibold">Capacité <span class="text-destructive">*</span></label>
                  <input type="number" [(ngModel)]="currentFormData.capacity" name="capacity" class="w-full h-11 px-3 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary">
               </div>
            </form>
         </div>

         <!-- Modal Footer -->
         <div class="px-6 py-4 border-t border-border bg-muted/20 flex justify-end gap-3 rounded-b-2xl">
            <button (click)="closeModal()" class="px-5 py-2.5 font-bold hover:bg-muted rounded-xl transition-colors">Annuler</button>
            <button (click)="saveCategory()" [disabled]="saving || !currentFormData.nom" class="px-5 py-2.5 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-all flex items-center gap-2">
               <lucide-icon *ngIf="saving" [name]="Loader2Icon" [size]="18" class="animate-spin"></lucide-icon>
               <lucide-icon *ngIf="!saving" [name]="SaveIcon" [size]="18"></lucide-icon>
               {{ saving ? 'Enregistrement...' : 'Enregistrer' }}
            </button>
         </div>
      </div>
    </div>

    <!-- Toast -->
    <div *ngIf="toast" class="fixed bottom-6 right-6 bg-card border border-border rounded-xl px-4 py-3 shadow-xl text-sm font-medium z-[60] flex items-center gap-2">
       <div class="h-6 w-6 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center font-bold">✓</div>
       {{ toast }}
    </div>

    <div *ngIf="toastError" class="fixed bottom-24 right-6 z-50 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-700 dark:text-red-300 shadow-xl">
        <lucide-icon [name]="CircleAlertIcon" [size]="16"></lucide-icon>
        {{ toastError }}
    </div>
  `
})
export class AdminCategoriesComponent implements OnInit {
  readonly TagsIcon = Tags;
  readonly PlusIcon = Plus;
  readonly EditIcon = Edit;
  readonly PencilIcon = Pencil;
  readonly Trash2Icon = Trash2;
  readonly Loader2Icon = Loader2;
  readonly RefreshCcwIcon = RefreshCcw;
  readonly XIcon = X;
  readonly CircleAlertIcon = CircleAlert;
  readonly SaveIcon = Save;
  readonly ArrowLeftIcon = ArrowLeft;

  categories: Category[] = [];
  loading = false;
  saving = false;
  isModalOpen = false;
  isEditing = false;
  editingId: number | null = null;
  processingIds = new Set<number>();

  toast: string | null = null;
  toastError: string | null = null;
  errorBanner: string | null = null;

  currentFormData: Category = { nom: '', description: '', capacity: undefined };
  currentRole = (localStorage.getItem('user_type') || '').toUpperCase();

  constructor(public router: Router, private productService: ProductService, private cdr: ChangeDetectorRef) {}

  get isAdmin(): boolean {
    return this.currentRole === 'ROLE_ADMIN' || this.currentRole === 'ADMIN';
  }

  ngOnInit(): void {
    if (!this.isAdmin) {
      this.loading = false;
      return;
    }
    this.loadCategories();
  }

  loadCategories(): void {
    if (!this.isAdmin) return;
    this.loading = true;
    this.errorBanner = null;

    this.productService.getCategories().subscribe({
      next: (res) => {
        this.categories = res || [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        this.errorBanner = this.toReadableError(err);
        this.showErrorToast(this.errorBanner);
        this.cdr.detectChanges();
      }
    });
  }

  isProcessing(categoryId?: number): boolean {
    if (!categoryId) return false;
    return this.processingIds.has(categoryId);
  }

  openCreateModal() {
    this.isEditing = false;
    this.editingId = null;
    this.currentFormData = { nom: '', description: '', capacity: undefined };
    this.isModalOpen = true;
  }

  openEditModal(c: Category) {
    this.isEditing = true;
    this.editingId = c.id || null;
    this.currentFormData = { ...c, nom: c.nom || c.name };
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.saving = false;
  }

  saveCategory() {
    if (!this.currentFormData.nom) {
       alert("Le nom est obligatoire !");
       return;
    }

    if (this.currentFormData.capacity !== undefined && this.currentFormData.capacity !== null && this.currentFormData.capacity <= 0) {
       alert("La capacité doit être supérieure à zéro !");
       return;
    }

    this.saving = true;
    this.currentFormData.name = this.currentFormData.nom;

    const request$ = (this.isEditing && this.editingId)
      ? this.productService.updateCategory(this.editingId, this.currentFormData as CategoryPayload)
      : this.productService.createCategory(this.currentFormData as CategoryPayload);

    request$.subscribe({
      next: () => {
        this.saving = false;
        this.isModalOpen = false;
        this.showToast(this.isEditing ? 'Catégorie modifiée avec succès.' : 'Catégorie créée avec succès.');
        this.loadCategories();
      },
      error: (err) => {
        this.saving = false;
        this.showErrorToast(this.toReadableError(err));
        this.cdr.detectChanges();
      }
    });
  }

  deleteCategory(category: Category): void {
    const id = category.id;
    if (!id) return;

    const label = category.nom || category.name || `#${id}`;
    if (!confirm(`Voulez-vous vraiment supprimer la catégorie "${label}" ?`)) return;

    this.processingIds.add(id);
    this.productService.deleteCategory(id).subscribe({
      next: () => {
        this.processingIds.delete(id);
        this.showToast('Catégorie supprimée.');
        this.loadCategories();
      },
      error: (err) => {
        this.processingIds.delete(id);
        this.showErrorToast(this.toReadableError(err));
        this.cdr.detectChanges();
      }
    });
  }

  private toReadableError(error: unknown): string {
    const httpError = error as HttpErrorResponse;
    const rawServerError = httpError?.error;
    const serverMessage = (
      typeof rawServerError === 'string'
        ? rawServerError
        : rawServerError?.message || rawServerError?.error || httpError?.message || ''
    ).toString().trim();
    const lowerMessage = serverMessage.toLowerCase();

    if (httpError?.status === 401) return 'Session expirée. Veuillez vous reconnecter.';
    if (httpError?.status === 403) return 'Accès refusé. Rôle Admin requis.';
    if (httpError?.status === 400) {
      if (lowerMessage.includes('constraint') || lowerMessage.includes('used')) return 'Impossible de supprimer cette catégorie car elle est liée à des produits.';
      return serverMessage || 'La requête a été rejetée par le serveur.';
    }
    if (httpError?.status === 409) return 'Cette catégorie existe déjà.';
    return serverMessage || 'Une erreur inattendue est survenue.';
  }

  private showToast(message: string): void {
    this.toast = message;
    setTimeout(() => { this.toast = null; this.cdr.detectChanges(); }, 3000);
  }

  private showErrorToast(message: string): void {
    this.toastError = message;
    setTimeout(() => { this.toastError = null; this.cdr.detectChanges(); }, 3500);
  }
}
