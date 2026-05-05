import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoyaltyService } from '../../services/loyalty.service';
import { LoyaltyProgram, LoyaltyTier } from '../../models/loyalty.model';
import { LucideAngularModule, Shield, Trophy, Coins, Plus, Trash2 } from 'lucide-angular';
import { toast } from 'ngx-sonner';

@Component({
  selector: 'app-admin-loyalty',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './admin-loyalty.component.html',
  styles: [`
    .dialog-overlay { background-color: rgba(0, 0, 0, 0.5); }
  `]
})
export class AdminLoyaltyComponent implements OnInit {
  loyaltyService = inject(LoyaltyService);

  // Icons
  ShieldIcon = Shield;
  TrophyIcon = Trophy;
  CoinsIcon = Coins;
  PlusIcon = Plus;
  TrashIcon = Trash2;

  programs = signal<LoyaltyProgram[]>([]);
  tiers = signal<LoyaltyTier[]>([]);
  selectedProgramId = signal<number | null>(null);

  activeTab = signal<'programs' | 'tiers' | 'points'>('programs');

  isProgramDialogOpen = signal(false);
  programForm: LoyaltyProgram = { name: '', description: '', pointsPerCurrencyUnit: 10 };

  isTierDialogOpen = signal(false);
  tierForm: LoyaltyTier = { programId: 0, name: '', minPoints: 0, multiplier: 1 };

  addPointsForm = { userId: '', points: '', reason: '' };

  ngOnInit() {
    this.fetchPrograms();
  }

  fetchPrograms() {
    this.loyaltyService.getAllPrograms().subscribe({
      next: (data) => {
        this.programs.set(data);
        if (data.length > 0 && !this.selectedProgramId()) {
          this.selectedProgramId.set(data[0].id!);
          this.fetchTiers(data[0].id!);
        }
      },
      error: (err) => console.error('Failed to fetch programs', err)
    });
  }

  fetchTiers(programId: number) {
    this.loyaltyService.getTiersByProgram(programId).subscribe({
      next: (data) => this.tiers.set(data),
      error: (err) => console.error('Failed to fetch tiers', err)
    });
  }

  selectProgram(id: number) {
    this.selectedProgramId.set(id);
    this.fetchTiers(id);
  }

  handleCreateProgram() {
    this.loyaltyService.createProgram(this.programForm).subscribe({
      next: () => {
        this.isProgramDialogOpen.set(false);
        this.programForm = { name: '', description: '', pointsPerCurrencyUnit: 10 };
        this.fetchPrograms();
        toast.success('Program created successfully!');
      },
      error: (err) => {
        console.error("Failed to create program", err);
        toast.error(err.message || 'Error creating program');
      }
    });
  }

  handleDeleteProgram(id: number) {
    if(!confirm("Are yor sure yor want to delete this program?")) return;
    this.loyaltyService.deleteProgram(id).subscribe({
      next: () => {
        this.fetchPrograms();
        if (this.selectedProgramId() === id) {
          this.selectedProgramId.set(null);
          this.tiers.set([]);
        }
        toast.success('Program deleted successfully!');
      },
      error: (err) => {
        console.error("Failed to delete program", err);
        toast.error(err.message || 'Error deleting program');
      }
    });
  }

  handleCreateTier() {
    const pId = this.selectedProgramId();
    if (!pId) return;
    
    const payload = { ...this.tierForm, programId: pId };
    this.loyaltyService.createTier(payload).subscribe({
      next: () => {
        this.isTierDialogOpen.set(false);
        this.tierForm = { programId: 0, name: '', minPoints: 0, multiplier: 1 };
        this.fetchTiers(pId);
        toast.success('Tier created successfully!');
      },
      error: (err) => {
        console.error("Failed to create tier", err);
        toast.error(err.message || 'Error creating tier');
      }
    });
  }

  handleDeleteTier(id: number) {
    if(!confirm("Are yor sure yor want to delete this tier?")) return;
    this.loyaltyService.deleteTier(id).subscribe({
      next: () => {
        const pId = this.selectedProgramId();
        if (pId) this.fetchTiers(pId);
        toast.success('Tier deleted successfully!');
      },
      error: (err) => {
        console.error("Failed to delete tier", err);
        toast.error(err.message || 'Error deleting tier');
      }
    });
  }

  handleAddPoints() {
    this.loyaltyService.addPoints({
      userId: parseInt(this.addPointsForm.userId),
      points: parseInt(this.addPointsForm.points),
      reason: this.addPointsForm.reason
    }).subscribe({
      next: () => {
        this.addPointsForm = { userId: '', points: '', reason: '' };
        toast.success("Points added successfully!");
      },
      error: (err) => {
        console.error("Failed to add points", err);
        toast.error("Error adding points.");
      }
    });
  }
}
