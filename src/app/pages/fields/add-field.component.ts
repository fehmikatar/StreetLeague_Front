import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, MapPin, Save, ArrowLeft, Search } from 'lucide-angular';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

declare const L: any;

@Component({
  selector: 'app-add-field',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, LucideAngularModule],
  template: `
    <div class="min-h-screen bg-background p-4 md:p-6">
      <div class="max-w-3xl mx-auto">
        <div class="flex items-center gap-4 mb-8">
          <a routerLink="/app/fields" class="p-2 bg-card border border-border rounded-xl hover:bg-muted transition-all">
            <lucide-icon [img]="ArrowLeftIcon" class="w-5 h-5"></lucide-icon>
          </a>
          <div>
            <h1 class="mb-1">Ajouter un Terrain</h1>
            <p class="text-muted-foreground">Référencez votre espace sportif</p>
          </div>
        </div>

        <div class="bg-card rounded-2xl p-8 border border-border">
          <form (ngSubmit)="submit()" class="space-y-6">

            <!-- Nom + Type -->
            <div class="grid md:grid-cols-2 gap-6">
              <div>
                <label class="block mb-2 font-semibold">Nom du terrain</label>
                <input [(ngModel)]="name" name="name" type="text"
                  placeholder="Terrain Parc Central"
                  class="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all" />
              </div>
              <div>
                <label class="block mb-2 font-semibold">Type de sport</label>
                <select [(ngModel)]="type" name="type"
                  class="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all">
                  <option *ngFor="let t of sportTypes" [value]="t">{{ t }}</option>
                </select>
              </div>
            </div>

            <!-- Adresse avec Leaflet -->
            <div>
              <label class="block mb-2 font-semibold">Adresse</label>

              <!-- Barre de recherche -->
              <div class="relative mb-3">
                <lucide-icon [img]="SearchIcon" class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground z-10"></lucide-icon>
                <input
                  [(ngModel)]="addressSearch"
                  name="addressSearch"
                  type="text"
                  placeholder="Rechercher une adresse..."
                  (input)="onSearchInput()"
                  (blur)="hideResultsDelayed()"
                  class="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                />
                <!-- Résultats de recherche -->
                <div *ngIf="searchResults.length > 0 && showResults"
                  class="absolute top-full left-0 right-0 bg-card border border-border rounded-lg mt-1 z-50 shadow-lg max-h-48 overflow-y-auto">
                  <div *ngFor="let result of searchResults"
                    (mousedown)="selectSearchResult(result)"
                    class="px-4 py-3 hover:bg-muted cursor-pointer border-b border-border last:border-0">
                    <div class="font-medium text-sm">{{ result.display_name.split(',')[0] }}</div>
                    <div class="text-xs text-muted-foreground">{{ result.display_name.split(',').slice(1, 3).join(',') }}</div>
                  </div>
                </div>
              </div>

              <!-- Carte Leaflet -->
              <div class="relative rounded-xl overflow-hidden border border-border" style="height: 300px;">
                <div id="leaflet-map" style="width: 100%; height: 100%;"></div>
              </div>

              <p class="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                <lucide-icon [img]="MapPinIcon" class="w-3 h-3"></lucide-icon>
                Cliquez sur la carte ou déplacez le marqueur pour ajuster la position
              </p>

              <!-- Coordonnées -->
              <div class="flex gap-3 mt-3" *ngIf="lat !== null && lng !== null">
                <span class="text-xs bg-muted px-3 py-1 rounded-full font-mono text-muted-foreground">
                  Lat: {{ lat | number:'1.5-5' }}
                </span>
                <span class="text-xs bg-muted px-3 py-1 rounded-full font-mono text-muted-foreground">
                  Lng: {{ lng | number:'1.5-5' }}
                </span>
              </div>
            </div>

            <!-- Prix + Capacité -->
            <div class="grid md:grid-cols-2 gap-6">
              <div>
                <label class="block mb-2 font-semibold">Prix par heure (€)</label>
                <input [(ngModel)]="price" name="price" type="number" placeholder="50"
                  class="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all" />
              </div>
              <div>
                <label class="block mb-2 font-semibold">Capacité (joueurs)</label>
                <input [(ngModel)]="capacity" name="capacity" type="number" placeholder="22"
                  class="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all" />
              </div>
            </div>

            <!-- Description -->
            <div>
              <label class="block mb-2 font-semibold">Description</label>
              <textarea [(ngModel)]="description" name="description" rows="4"
                placeholder="Décrivez votre terrain..."
                class="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all resize-none">
              </textarea>
            </div>

            <div *ngIf="saved" class="bg-primary/10 border border-primary/20 rounded-xl p-4 text-primary font-semibold">
              ✓ Terrain ajouté avec succès !
            </div>

            <button type="submit"
              class="w-full py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/30 flex items-center justify-center gap-2">
              <lucide-icon [img]="SaveIcon" class="w-5 h-5"></lucide-icon>
              Enregistrer le terrain
            </button>

          </form>
        </div>
      </div>
    </div>
  `,
})
export class AddFieldComponent implements AfterViewInit, OnDestroy {
  readonly ArrowLeftIcon = ArrowLeft;
  readonly MapPinIcon = MapPin;
  readonly SaveIcon = Save;
  readonly SearchIcon = Search;

  name = '';
  type = 'Football';
  address = '';
  addressSearch = '';
  price = '';
  capacity = '';
  description = '';
  saved = false;
  lat: number | null = null;
  lng: number | null = null;

  searchResults: any[] = [];
  showResults = false;
  private searchTimeout: any;
  private map: any;
  private marker: any;

  sportTypes = ['Football', 'Basketball', 'Tennis', 'Multisport', 'Volleyball'];

  constructor(private http: HttpClient, private router: Router) {}

  ngAfterViewInit(): void {
    this.loadLeaflet().then(() => this.initMap());
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
    clearTimeout(this.searchTimeout);
  }

  private loadLeaflet(): Promise<void> {
    return new Promise((resolve) => {
      // Load CSS
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css';
        document.head.appendChild(link);
      }

      // Load JS
      if (typeof L !== 'undefined') {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js';
      script.onload = () => resolve();
      document.head.appendChild(script);
    });
  }

  private initMap(): void {
    const defaultLat = 36.7372;
    const defaultLng = 3.0865;

    this.map = L.map('leaflet-map').setView([defaultLat, defaultLng], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    const greenIcon = L.divIcon({
      html: `<div style="width:28px;height:36px;">
        <svg viewBox="0 0 28 36" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M14 0C6.268 0 0 6.268 0 14c0 9.333 14 22 14 22s14-12.667 14-22C28 6.268 21.732 0 14 0z" fill="#16a34a"/>
          <circle cx="14" cy="14" r="6" fill="white"/>
        </svg>
      </div>`,
      className: '',
      iconSize: [28, 36],
      iconAnchor: [14, 36]
    });

    this.marker = L.marker([defaultLat, defaultLng], {
      draggable: true,
      icon: greenIcon
    }).addTo(this.map);

    this.updateCoords(defaultLat, defaultLng);
    this.reverseGeocode(defaultLat, defaultLng);

    this.map.on('click', (e: any) => {
      const { lat, lng } = e.latlng;
      this.marker.setLatLng([lat, lng]);
      this.updateCoords(lat, lng);
      this.reverseGeocode(lat, lng);
    });

    this.marker.on('dragend', () => {
      const { lat, lng } = this.marker.getLatLng();
      this.updateCoords(lat, lng);
      this.reverseGeocode(lat, lng);
    });
  }

  private updateCoords(lat: number, lng: number): void {
    this.lat = lat;
    this.lng = lng;
  }

  private reverseGeocode(lat: number, lng: number): void {
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
      .then(r => r.json())
      .then(data => {
        if (data?.display_name) {
          this.addressSearch = data.display_name;
          this.address = data.display_name;
        }
      })
      .catch(() => {});
  }

  onSearchInput(): void {
    this.showResults = true;
    clearTimeout(this.searchTimeout);
    const val = this.addressSearch;
    if (!val || val.length < 3) {
      this.searchResults = [];
      return;
    }
    this.searchTimeout = setTimeout(() => {
      fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(val)}&limit=5`)
        .then(r => r.json())
        .then(results => {
          this.searchResults = results;
        })
        .catch(() => {});
    }, 400);
  }

  selectSearchResult(result: any): void {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    this.map.setView([lat, lng], 15);
    this.marker.setLatLng([lat, lng]);
    this.updateCoords(lat, lng);
    this.addressSearch = result.display_name;
    this.address = result.display_name;
    this.searchResults = [];
    this.showResults = false;
  }

  hideResultsDelayed(): void {
    setTimeout(() => { this.showResults = false; }, 200);
  }

  submit(): void {
    if (!this.name || !this.address || !this.price || !this.capacity) return;

    const email = localStorage.getItem('user_email');
    if (!email) {
      console.error('No email in local storage');
      return;
    }

    this.http.get<any>(`${environment.apiUrl}/users/email/${email}`).subscribe({
      next: (user) => {
        const payload = {
          fieldOwnerId: user.id,
          name: this.name,
          description: this.description || 'Nouveau terrain',
          address: this.address,
          location: this.lat && this.lng
            ? `${this.lat.toFixed(6)},${this.lng.toFixed(6)}`
            : this.address,
          sportType: this.type,
          capacity: parseInt(this.capacity, 10),
          hourlyRate: parseFloat(this.price),
          isAvailable: true
        };

        this.http.post(`${environment.apiUrl}/sport-spaces`, payload).subscribe({
          next: () => {
            this.saved = true;
            setTimeout(() => {
              this.saved = false;
              this.router.navigate(['/app/fields']);
            }, 2000);
          },
          error: (err) => {
            console.error('Error creating field', err);
            alert('Erreur lors de la création du terrain.');
          }
        });
      },
      error: (err) => {
        console.error('Error fetching user', err);
        alert('Erreur lors de la vérification du profil Gérant.');
      }
    });
  }
}