import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, MapPin, Calendar, Clock, Save, ArrowLeft } from 'lucide-angular';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

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
            <h1 class="mb-1">Add a Field</h1>
            <p class="text-muted-foreground">List your sports space</p>
          </div>
        </div>
        <div class="bg-card rounded-2xl p-8 border border-border">
          <form (ngSubmit)="submit()" class="space-y-6">
            <div class="grid md:grid-cols-2 gap-6">
              <div>
                <label class="block mb-2 font-semibold">Field Name</label>
                <input [(ngModel)]="name" name="name" type="text" placeholder="Central Park Field" class="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all" />
              </div>
              <div>
                <label class="block mb-2 font-semibold">Sport Type</label>
                <select [(ngModel)]="type" name="type" class="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all">
                  <option *ngFor="let t of sportTypes" [value]="t">{{ t }}</option>
                </select>
              </div>
            </div>
            <div>
              <label class="block mb-2 font-semibold">Address</label>
              <div class="relative">
                <lucide-icon [img]="MapPinIcon" class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground"></lucide-icon>
                <input [(ngModel)]="address" name="address" type="text" placeholder="123 Sport Street, Paris" class="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all" />
              </div>
            </div>
            <div class="grid md:grid-cols-2 gap-6">
              <div>
                <label class="block mb-2 font-semibold">Price per hour ($)</label>
                <input [(ngModel)]="price" name="price" type="number" placeholder="50" class="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all" />
              </div>
              <div>
                <label class="block mb-2 font-semibold">Capacity (players)</label>
                <input [(ngModel)]="capacity" name="capacity" type="number" placeholder="22" class="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all" />
              </div>
            </div>
            <div>
              <label class="block mb-2 font-semibold">Description</label>
              <textarea [(ngModel)]="description" name="description" rows="4" placeholder="Describe your field..." class="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all resize-none"></textarea>
            </div>
            <div *ngIf="saved" class="bg-primary/10 border border-primary/20 rounded-xl p-4 text-primary font-semibold">✓ Field added successfully!</div>
            <button type="submit" class="w-full py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/30 flex items-center justify-center gap-2">
              <lucide-icon [img]="SaveIcon" class="w-5 h-5"></lucide-icon>
              Save Field
            </button>
          </form>
        </div>
      </div>
    </div>
  `,
})
export class AddFieldComponent {
  readonly ArrowLeftIcon = ArrowLeft;
  readonly MapPinIcon = MapPin;
  readonly SaveIcon = Save;

  name = '';
  type = 'Football';
  address = '';
  price = '';
  capacity = '';
  description = '';
  saved = false;
  sportTypes = ['Football', 'Basketball', 'Tennis', 'Multisport', 'Volleyball'];

  constructor(private http: HttpClient, private router: Router) { }

  submit() {
    if (!this.name || !this.address || !this.price || !this.capacity) return;

    const email = localStorage.getItem('user_email');
    if (!email) {
      console.error('No email in local storage');
      return;
    }

    // Fetch user ID first
    this.http.get<any>(`${environment.apiUrl}/users/email/${email}`).subscribe({
      next: (user) => {
        const payload = {
          fieldOwnerId: user.id,
          name: this.name,
          description: this.description || 'New field',
          address: this.address,
          location: this.address, // Basic mapping
          sportType: this.type,
          capacity: parseInt(this.capacity, 10),
          hourlyRate: parseFloat(this.price),
          isAvailable: true
        };

        this.http.post(`${environment.apiUrl}/sport-spaces`, payload).subscribe({
          next: (res) => {
            this.saved = true;
            setTimeout(() => {
              this.saved = false;
              this.router.navigate(['/app/fields']);
            }, 2000);
          },
          error: (err) => {
            console.error('Error creating field', err);
            alert('Error during field creation.');
          }
        });
      },
      error: (err) => {
        console.error('Error fetching user', err);
        alert('Error verifying Manager profile.');
      }
    });
  }
}
