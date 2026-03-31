import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Plus, Edit, Trash2, DownloadCloud, UploadCloud, AlertTriangle, X, Save, ArrowLeft } from 'lucide-angular';
import { ProductService, Product, ProductRequest, Category } from '../services/product.service';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-products',
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
               <h1 class="text-3xl font-bold">Inventaire & Produits</h1>
               <p class="text-muted-foreground">Gérez votre catalogue de vente</p>
             </div>
          </div>
          <div class="flex gap-3">
             <button (click)="exportInventory()" class="hidden md:flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-xl font-medium hover:bg-muted transition-colors">
                <lucide-icon [name]="DownloadCloudIcon" [size]="18"></lucide-icon> Exporter CSV
             </button>
             <button (click)="fileInput.click()" class="hidden md:flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-xl font-medium hover:bg-muted transition-colors">
                <lucide-icon [name]="UploadCloudIcon" [size]="18"></lucide-icon> ImporterCSV
             </button>
             <input type="file" #fileInput (change)="importInventory($event)" accept=".csv" class="hidden">
             
             <button (click)="openCreateModal()" class="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 hover:shadow-lg transition-all">
                <lucide-icon [name]="PlusIcon" [size]="18"></lucide-icon> Nouveau Produit
             </button>
          </div>
        </div>

        <!-- Low Stock Alerts -->
        <div *ngIf="lowStockProducts.length > 0" class="mb-8 p-4 bg-destructive/10 border-l-4 border-destructive rounded-r-xl flex items-start gap-4">
           <lucide-icon [name]="AlertTriangleIcon" [size]="24" class="text-destructive shrink-0 mt-1"></lucide-icon>
           <div>
              <h3 class="font-bold text-destructive">Attention ! {{ lowStockProducts.length }} produit(s) en stock faible</h3>
              <p class="text-sm text-destructive/80 mb-2">Pensez à réapprovisionner ces articles.</p>
              <div class="flex flex-wrap gap-2">
                 <span *ngFor="let p of lowStockProducts" class="text-xs bg-background/50 px-2 py-1 rounded-md text-destructive font-medium border border-destructive/20">
                    {{ p.nom }} (Reste: {{ p.stock }})
                 </span>
              </div>
           </div>
        </div>

        <!-- Filter & Search -->
        <div class="bg-card border border-border rounded-2xl p-4 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
           <input type="text" [(ngModel)]="searchKeyword" (keyup.enter)="loadProducts()" placeholder="Chercher un produit..." class="w-full md:w-96 h-11 px-4 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary">
           <button (click)="loadProducts()" class="w-full md:w-auto px-6 h-11 bg-muted font-bold rounded-xl hover:bg-muted/70">Rechercher</button>
        </div>

        <!-- Product Table -->
        <div class="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
           <div class="overflow-x-auto">
              <table class="w-full text-sm text-left">
                 <thead class="bg-muted/50 border-b border-border">
                    <tr>
                       <th class="px-6 py-4 font-semibold text-muted-foreground w-16">ID</th>
                       <th class="px-6 py-4 font-semibold text-muted-foreground">Produit</th>
                       <th class="px-6 py-4 font-semibold text-muted-foreground">Catégorie</th>
                       <th class="px-6 py-4 font-semibold text-muted-foreground">Prix</th>
                       <th class="px-6 py-4 font-semibold text-muted-foreground">Stock</th>
                       <th class="px-6 py-4 font-semibold text-muted-foreground text-right">Actions</th>
                    </tr>
                 </thead>
                 <tbody class="divide-y divide-border/50">
                    <tr *ngIf="loading" class="bg-background">
                       <td colspan="6" class="px-6 py-12 text-center text-muted-foreground">Chargement des données...</td>
                    </tr>
                    <tr *ngIf="!loading && products.length === 0" class="bg-background">
                       <td colspan="6" class="px-6 py-12 text-center text-muted-foreground">Aucun produit trouvé.</td>
                    </tr>
                    <tr *ngFor="let p of products" class="bg-background hover:bg-muted/20 transition-colors">
                       <td class="px-6 py-4 font-mono text-muted-foreground">{{ p.id }}</td>
                       <td class="px-6 py-4">
                          <div class="flex items-center gap-3">
                             <div class="w-10 h-10 rounded-lg bg-card border border-border flex items-center justify-center overflow-hidden">
                                <img *ngIf="p.images && p.images.length > 0" [src]="p.images[0]" class="w-full h-full object-cover">
                                <span *ngIf="!p.images || p.images.length === 0">🛒</span>
                             </div>
                             <div class="font-bold">{{ p.nom }}</div>
                          </div>
                       </td>
                       <td class="px-6 py-4 text-muted-foreground">{{ p.category?.nom || p.category?.name || 'N/A' }}</td>
                       <td class="px-6 py-4 font-bold">{{ p.prix }} €</td>
                       <td class="px-6 py-4">
                          <span [class.text-destructive]="p.stock < 10" [class.font-bold]="p.stock < 10">{{ p.stock }}</span>
                       </td>
                       <td class="px-6 py-4 text-right">
                          <button (click)="openEditModal(p)" class="p-2 text-muted-foreground hover:text-primary transition-colors hover:bg-primary/10 rounded-lg"><lucide-icon [name]="EditIcon" [size]="18"></lucide-icon></button>
                          <button (click)="deleteProduct(p.id)" class="p-2 text-muted-foreground hover:text-destructive transition-colors hover:bg-destructive/10 rounded-lg ml-1"><lucide-icon [name]="Trash2Icon" [size]="18"></lucide-icon></button>
                       </td>
                    </tr>
                 </tbody>
              </table>
           </div>
           <!-- Pagination -->
           <div class="px-6 py-4 border-t border-border bg-muted/20 flex items-center justify-between">
              <span class="text-sm text-muted-foreground">Page {{ currentPage + 1 }} sur {{ totalPages }} ({{ totalElements }} produits)</span>
              <div class="flex gap-2">
                 <button (click)="prevPage()" [disabled]="currentPage === 0" class="px-3 py-1.5 bg-card border border-border rounded-lg text-sm hover:bg-background disabled:opacity-50 font-medium">Précédent</button>
                 <button (click)="nextPage()" [disabled]="currentPage >= totalPages - 1" class="px-3 py-1.5 bg-card border border-border rounded-lg text-sm hover:bg-background disabled:opacity-50 font-medium">Suivant</button>
              </div>
           </div>
        </div>

      </div>
    </div>

    <!-- Modal Form (Create / Edit) -->
    <div *ngIf="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-background/80 backdrop-blur-sm" (click)="closeModal()"></div>
      <div class="relative bg-card border border-border shadow-2xl rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
         
         <!-- Modal Header -->
         <div class="px-6 py-4 border-b border-border flex items-center justify-between sticky top-0 bg-card rounded-t-2xl z-10">
            <h2 class="text-xl font-bold">{{ isEditing ? 'Modifier' : 'Ajouter' }} un Produit</h2>
            <button (click)="closeModal()" class="p-2 hover:bg-muted rounded-full transition-colors"><lucide-icon [name]="XIcon" [size]="20"></lucide-icon></button>
         </div>

         <!-- Modal Body -->
         <div class="p-6 overflow-y-auto flex-1 hide-scrollbar">
            <form class="space-y-6">
               <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div class="space-y-2">
                     <label class="text-sm font-semibold">Nom du produit <span class="text-destructive">*</span></label>
                     <input type="text" [(ngModel)]="currentFormData.nom" name="nom" class="w-full h-11 px-3 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary">
                  </div>
                  <div class="space-y-2">
                     <label class="text-sm font-semibold">Catégorie <span class="text-destructive">*</span></label>
                     <select [(ngModel)]="currentFormData.categoryId" name="cat" class="w-full h-11 px-3 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary">
                        <option [ngValue]="null">Sélectionner...</option>
                        <option *ngFor="let c of categories" [ngValue]="c.id">{{ c.nom || c.name }}</option>
                     </select>
                  </div>
               </div>

               <div class="space-y-2">
                  <label class="text-sm font-semibold">Description</label>
                  <textarea [(ngModel)]="currentFormData.description" name="desc" rows="4" class="w-full p-3 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary"></textarea>
               </div>

               <div class="grid grid-cols-2 gap-4">
                  <div class="space-y-2">
                     <label class="text-sm font-semibold">Prix (€) <span class="text-destructive">*</span></label>
                     <input type="number" [(ngModel)]="currentFormData.prix" name="prix" step="0.01" class="w-full h-11 px-3 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary">
                  </div>
                  <div class="space-y-2">
                     <label class="text-sm font-semibold">Stock Initial <span class="text-destructive">*</span></label>
                     <input type="number" [(ngModel)]="currentFormData.stock" name="stock" class="w-full h-11 px-3 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary">
                  </div>
               </div>

               <div class="space-y-2">
                  <label class="text-sm font-semibold">Image URL principale</label>
                  <input type="text" [(ngModel)]="currentFormImageUrl" name="imgUrl" placeholder="https://..." class="w-full h-11 px-3 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary">
                  <p class="text-xs text-muted-foreground">Fournissez une adresse web (URL) d'image pour représenter l'article.</p>
               </div>
            </form>
         </div>

         <!-- Modal Footer -->
         <div class="px-6 py-4 border-t border-border bg-muted/20 flex justify-end gap-3 rounded-b-2xl">
            <button (click)="closeModal()" class="px-5 py-2.5 font-bold hover:bg-muted rounded-xl transition-colors">Annuler</button>
            <button (click)="saveProduct()" [disabled]="saving" class="px-5 py-2.5 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-all flex items-center gap-2">
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
  `,
  styles: [`
    .hide-scrollbar::-webkit-scrollbar { display: none; }
    .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
  `]
})
export class AdminProductsComponent implements OnInit {
  readonly PlusIcon = Plus;
  readonly EditIcon = Edit;
  readonly Trash2Icon = Trash2;
  readonly DownloadCloudIcon = DownloadCloud;
  readonly UploadCloudIcon = UploadCloud;
  readonly AlertTriangleIcon = AlertTriangle;
  readonly XIcon = X;
  readonly SaveIcon = Save;
  readonly ArrowLeftIcon = ArrowLeft;

  products: Product[] = [];
  categories: Category[] = [];
  lowStockProducts: Product[] = [];
  
  loading = false;
  saving = false;
  
  // Pagination & Search
  currentPage = 0;
  totalPages = 1;
  totalElements = 0;
  searchKeyword = '';

  // Modal State
  isModalOpen = false;
  isEditing = false;
  editingId: number | null = null;
  currentFormImageUrl = '';
  currentFormData: ProductRequest = {
    nom: '',
    description: '',
    prix: 0,
    stock: 0,
    categoryId: 0,
    images: []
  };

  toast: string | null = null;

  @ViewChild('fileInput') fileInput!: ElementRef;

  constructor(public router: Router, private productService: ProductService) {}

  ngOnInit() {
    this.loadCategories();
    this.loadProducts();
    this.loadLowStock();
  }

  loadCategories() {
    this.productService.getCategories().subscribe(res => this.categories = res);
  }

  loadProducts() {
    this.loading = true;
    this.productService.searchProducts({ keyword: this.searchKeyword }, this.currentPage, 15).subscribe({
      next: (res: any) => {
        this.products = res.content || [];
        this.totalPages = res.totalPages || 1;
        this.totalElements = res.totalElements || this.products.length;
        this.loading = false;
      },
      error: () => {
         this.loading = false;
      }
    });
  }

  loadLowStock() {
    this.productService.getLowStockProducts(10).subscribe({
      next: (res) => this.lowStockProducts = res || [],
      error: () => {}
    });
  }

  nextPage() {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loadProducts();
    }
  }

  prevPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadProducts();
    }
  }

  openCreateModal() {
    this.isEditing = false;
    this.editingId = null;
    this.currentFormData = { nom: '', description: '', prix: 0, stock: 0, categoryId: this.categories.length > 0 ? (this.categories[0].id || 0) : 0, images: [] };
    this.currentFormImageUrl = '';
    this.isModalOpen = true;
  }

  openEditModal(p: Product) {
    this.isEditing = true;
    this.editingId = p.id;
    this.currentFormData = {
      nom: p.nom,
      description: p.description,
      prix: p.prix,
      stock: p.stock,
      categoryId: p.category?.id || 0,
      images: p.images || []
    };
    this.currentFormImageUrl = (p.images && p.images.length > 0) ? p.images[0] : '';
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  saveProduct() {
    if (!this.currentFormData.nom || this.currentFormData.prix <= 0) {
       alert("Le nom et le prix sont obligatoires !");
       return;
    }

    if (this.currentFormImageUrl) {
       this.currentFormData.images = [this.currentFormImageUrl];
    } else {
       this.currentFormData.images = [];
    }

    this.saving = true;

    if (this.isEditing && this.editingId) {
       this.productService.updateProduct(this.editingId, this.currentFormData).subscribe({
          next: () => {
             this.showToast('Produit modifié avec succès !');
             this.finishSave();
          },
          error: () => { this.saving = false; alert("Erreur serveur lors de la modification"); }
       });
    } else {
       this.productService.createProduct(this.currentFormData).subscribe({
          next: () => {
             this.showToast('Produit créé avec succès !');
             this.finishSave();
          },
          error: () => { this.saving = false; alert("Erreur serveur lors de la création"); }
       });
    }
  }

  finishSave() {
    this.saving = false;
    this.closeModal();
    this.loadProducts();
    this.loadLowStock();
  }

  deleteProduct(id: number) {
    if (confirm("Êtes-vous sûr de vouloir supprimer définitivement ce produit ?")) {
       this.productService.deleteProduct(id).subscribe({
          next: () => {
             this.showToast('Produit supprimé.');
             this.loadProducts();
          },
          error: () => alert("Erreur lors de la suppression.")
       });
    }
  }

  importInventory(event: any) {
    const file = event.target.files[0];
    if (file) {
       this.productService.bulkImportProducts(file).subscribe({
          next: () => {
             this.showToast("Importation réussie !");
             this.loadProducts();
          },
          error: () => alert("Erreur lors de l'import. Assurez-vous que le CSV est au bon format.")
       });
    }
    // reset input
    if (this.fileInput) this.fileInput.nativeElement.value = '';
  }

  exportInventory() {
    this.productService.bulkExportProducts().subscribe(blob => {
       const url = window.URL.createObjectURL(blob);
       const a = document.createElement('a');
       a.href = url;
       a.download = 'export_produits.csv';
       document.body.appendChild(a);
       a.click();
       document.body.removeChild(a);
       window.URL.revokeObjectURL(url);
    });
  }

  showToast(msg: string) {
    this.toast = msg;
    setTimeout(() => this.toast = null, 3000);
  }
}
