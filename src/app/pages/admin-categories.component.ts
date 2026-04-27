import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Plus, Edit, Trash2, ArrowLeft, X, Save } from 'lucide-angular';
import { ProductService, Category } from '../services/product.service';
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
             <button (click)="openCreateModal()" class="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 hover:shadow-lg transition-all">
                <lucide-icon [name]="PlusIcon" [size]="18"></lucide-icon> Nouvelle Catégorie
             </button>
          </div>
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
                       <td colspan="5" class="px-6 py-12 text-center text-muted-foreground">Chargement des données...</td>
                    </tr>
                    <tr *ngIf="!loading && categories.length === 0" class="bg-background">
                       <td colspan="5" class="px-6 py-12 text-center text-muted-foreground">Aucune catégorie trouvée.</td>
                    </tr>
                    <tr *ngFor="let c of categories" class="bg-background hover:bg-muted/20 transition-colors">
                       <td class="px-6 py-4 font-mono text-muted-foreground">{{ c.id }}</td>
                       <td class="px-6 py-4 font-bold">{{ c.nom || c.name }}</td>
                       <td class="px-6 py-4 text-muted-foreground">{{ c.description || 'N/A' }}</td>
                       <td class="px-6 py-4 text-center font-medium">{{ c.capacity || 'N/A' }}</td>
                       <td class="px-6 py-4 text-right">
                          <button (click)="openEditModal(c)" class="p-2 text-muted-foreground hover:text-primary transition-colors hover:bg-primary/10 rounded-lg"><lucide-icon [name]="EditIcon" [size]="18"></lucide-icon></button>
                          <button (click)="deleteCategory(c.id!)" class="p-2 text-muted-foreground hover:text-destructive transition-colors hover:bg-destructive/10 rounded-lg ml-1"><lucide-icon [name]="Trash2Icon" [size]="18"></lucide-icon></button>
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
            <button (click)="saveCategory()" [disabled]="saving" class="px-5 py-2.5 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-all flex items-center gap-2">
               <lucide-icon [name]="SaveIcon" [size]="18"></lucide-icon> {{ saving ? 'Enregistrement...' : 'Enregistrer' }}
            </button>
         </div>

      </div>
    </div>

    <!-- Toast -->
    <div *ngIf="toast" class="fixed bottom-6 right-6 bg-card border border-border rounded-xl px-4 py-3 shadow-xl text-sm font-medium z-[60] flex items-center gap-2">
       <div class="h-6 w-6 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center font-bold">✓</div>
       {{ toast }}
    </div>
  `
})
export class AdminCategoriesComponent implements OnInit {
  readonly PlusIcon = Plus;
  readonly EditIcon = Edit;
  readonly Trash2Icon = Trash2;
  readonly XIcon = X;
  readonly SaveIcon = Save;
  readonly ArrowLeftIcon = ArrowLeft;

  categories: Category[] = [];
  loading = false;
  saving = false;
  
  isModalOpen = false;
  isEditing = false;
  editingId: number | null = null;
  currentFormData: Category = { nom: '', description: '', capacity: undefined };

  toast: string | null = null;

  constructor(public router: Router, private productService: ProductService) {}

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.loading = true;
    this.productService.getCategories().subscribe({
      next: (res) => {
        this.categories = res || [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  openCreateModal() {
    this.isEditing = false;
    this.editingId = null;
    this.currentFormData = { nom: '', description: '', capacity: undefined };
    this.isModalOpen = true;
  }

  openEditModal(c: Category) {
    this.isEditing = true;
    this.editingId = c.id!;
    this.currentFormData = { ...c };
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  saveCategory() {
    if (!this.currentFormData.nom) {
       alert("Le nom est obligatoire !");
       return;
    }

    if (this.currentFormData.capacity === undefined || this.currentFormData.capacity === null || this.currentFormData.capacity <= 0) {
       alert("La capacité est obligatoire et doit être supérieure à zéro !");
       return;
    }

    this.saving = true;

    // Use nom to populate name just in case backend expects name instead.
    this.currentFormData.name = this.currentFormData.nom;

    if (this.isEditing && this.editingId) {
       this.productService.updateCategory(this.editingId, this.currentFormData).subscribe({
          next: () => {
             this.showToast('Catégorie modifiée avec succès !');
             this.finishSave();
          },
          error: (err) => { this.saving = false; console.error(err); alert("Erreur serveur lors de la modification"); }
       });
    } else {
       this.productService.createCategory(this.currentFormData).subscribe({
          next: () => {
             this.showToast('Catégorie créée avec succès !');
             this.finishSave();
          },
          error: (err) => { this.saving = false; console.error(err); alert("Erreur serveur lors de la création"); }
       });
    }
  }

  finishSave() {
    this.saving = false;
    this.closeModal();
    this.loadCategories();
  }

  deleteCategory(id: number) {
    if (confirm("Êtes-vous sûr de vouloir supprimer définitivement cette catégorie ? (Les produits associés pourraient être affectés)")) {
       this.productService.deleteCategory(id).subscribe({
          next: () => {
             this.showToast('Catégorie supprimée.');
             this.loadCategories();
          },
          error: (err) => { console.error(err); alert("Erreur lors de la suppression.") }
       });
    }
  }

  showToast(msg: string) {
    this.toast = msg;
    setTimeout(() => this.toast = null, 3000);
  }
}
