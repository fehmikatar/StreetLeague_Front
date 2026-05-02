import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Trophy, MapPin, Calendar, Users, Swords, ChevronRight, ChevronLeft, ArrowLeft, Loader2, AlertCircle, X, RefreshCw, MoveRight } from 'lucide-angular';
import { CompetitionService, CompetitionRequest, CompetitionFormat, CompetitionStatus } from '../../services/competition.service';
import { TeamService } from '../../services/team.service';
import { RegistrationService, RegistrationStatus } from '../../services/registration.service';
import { BookingService, Field } from '../../services/booking.service';
import { forkJoin, of, throwError } from 'rxjs';
import { switchMap, catchError, finalize } from 'rxjs/operators';

interface WizardTeam {
  id?: number;
  name: string;
  level: string; // Used as ELO
  city: string;
  size: number;
}

@Component({
  selector: 'app-competition-form',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, LucideAngularModule],
  template: `
    <div class="bg-slate-50 min-h-screen py-8">
      <div class="max-w-4xl mx-auto px-4 md:px-8">
        
        <!-- Top Navigation -->
        <button (click)="goBack()" class="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-medium transition-colors mb-6">
          <lucide-icon [name]="ArrowLeftIcon" [size]="18"></lucide-icon> Cancel
        </button>

        <h1 class="text-3xl font-black text-slate-900 mb-2">{{ isEditMode ? 'Edit Competition' : 'Create a Competition' }}</h1>
        <p class="text-slate-500 mb-8">{{ isEditMode ? 'Update your competition information.' : 'Configure the settings of your new tournament.' }}</p>

        <!-- Stepper -->
        <div class="flex gap-2 mb-8 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
          <button (click)="goToStep(1)" class="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm transition-all whitespace-nowrap"
                  [ngClass]="activeStep === 1 ? 'bg-slate-100 text-slate-900 shadow-sm' : 'text-slate-500 hover:bg-slate-50'">
            <span class="w-6 h-6 rounded-full flex items-center justify-center text-xs" [ngClass]="activeStep === 1 ? 'bg-primary text-white' : 'bg-slate-200 text-slate-600'">1</span> Info
          </button>
          <button (click)="goToStep(2)" [disabled]="!isStep1Valid()" class="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm transition-all whitespace-nowrap disabled:opacity-50"
                  [ngClass]="activeStep === 2 ? 'bg-slate-100 text-slate-900 shadow-sm' : 'text-slate-500 hover:bg-slate-50'">
            <span class="w-6 h-6 rounded-full flex items-center justify-center text-xs" [ngClass]="activeStep === 2 ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-600'">2</span> Teams
          </button>
          <button (click)="goToStep(3)" [disabled]="teams.length < 4" class="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm transition-all whitespace-nowrap disabled:opacity-50"
                  [ngClass]="activeStep === 3 ? 'bg-slate-100 text-slate-900 shadow-sm' : 'text-slate-500 hover:bg-slate-50'">
            <span class="w-6 h-6 rounded-full flex items-center justify-center text-xs" [ngClass]="activeStep === 3 ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-600'">3</span> Draw
          </button>
          <button (click)="goToStep(4)" [disabled]="teams.length < 4" class="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm transition-all whitespace-nowrap disabled:opacity-50"
                  [ngClass]="activeStep === 4 ? 'bg-slate-100 text-slate-900 shadow-sm' : 'text-slate-500 hover:bg-slate-50'">
            <span class="w-6 h-6 rounded-full flex items-center justify-center text-xs" [ngClass]="activeStep === 4 ? 'bg-slate-800 text-white' : 'bg-slate-200 text-slate-600'">4</span> Bracket
          </button>
        </div>

        <!-- Error Banner -->
        <div *ngIf="apiError" class="mb-6 bg-red-50 text-red-600 border border-red-200 p-4 rounded-xl font-medium flex items-center gap-3">
          <lucide-icon [name]="AlertCircleIcon" [size]="20"></lucide-icon> {{ apiError }}
        </div>

        <!-- STEP 1: INFOS -->
        <div *ngIf="activeStep === 1" class="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div class="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm">
            <h3 class="text-xs font-bold text-slate-500 mb-6 uppercase tracking-wider">Competition Information</h3>
            
            <div class="space-y-5">
              <div>
                <label class="block text-sm font-bold text-slate-700 mb-1.5">Event Name</label>
                <input type="text" [(ngModel)]="formData.name" placeholder="ex: StreetLeague Tunis Cup 2025" 
                       class="w-full h-12 px-4 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500">
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-bold text-slate-700 mb-1.5">Start Date</label>
                  <input type="date" [(ngModel)]="formData.startDate" 
                         class="w-full h-12 px-4 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-slate-700">
                </div>
                <div>
                  <label class="block text-sm font-bold text-slate-700 mb-1.5">End Date</label>
                  <input type="date" [(ngModel)]="formData.endDate" 
                         class="w-full h-12 px-4 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-slate-700">
                </div>
              </div>

              <div>
                <label class="block text-sm font-bold text-slate-700 mb-1.5">Location (City / District)</label>
                <input type="text" [(ngModel)]="formData.location" placeholder="ex: Central Field, Tunis" 
                       class="w-full h-12 px-4 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500">
              </div>

              <!-- Terrain official selector -->
              <div class="mt-4">
                <label class="block text-sm font-bold text-slate-700 mb-2">Link to Official Terrain (Sport Space)</label>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button *ngFor="let field of availableFields" (click)="selectField(field)"
                          class="flex items-center gap-3 p-3 border rounded-xl transition-all text-left"
                          [ngClass]="formData.sportSpaceId === +field.id ? 'border-blue-500 bg-blue-50 shadow-sm' : 'border-slate-200 hover:border-slate-300 bg-white'">
                    <div class="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-xl">🏟️</div>
                    <div class="overflow-hidden">
                      <div class="font-bold text-xs text-slate-900 truncate">{{ field.name }}</div>
                      <div class="text-[10px] text-slate-500 truncate">{{ field.location }}</div>
                    </div>
                    <div *ngIf="formData.sportSpaceId === +field.id" class="ml-auto text-blue-500">
                      <lucide-icon [name]="RefreshCwIcon" [size]="14"></lucide-icon>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm">
            <h3 class="text-xs font-bold text-slate-500 mb-4 uppercase tracking-wider">Sport</h3>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
              <button *ngFor="let s of sports" (click)="formData.sportType = s.id"
                      class="flex flex-col items-center justify-center p-4 border rounded-xl transition-all"
                      [ngClass]="formData.sportType === s.id ? 'border-slate-800 bg-slate-50 shadow-sm' : 'border-slate-200 hover:border-slate-300 bg-white'">
                <span class="text-2xl mb-2">{{ s.icon }}</span>
                <span class="font-bold text-xs text-slate-800">{{ s.name }}</span>
              </button>
            </div>
          </div>

          <div class="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm">
            <h3 class="text-xs font-bold text-slate-500 mb-4 uppercase tracking-wider">Competition Format</h3>
            <div class="grid grid-cols-1 gap-4 max-w-sm">
              <button (click)="formData.format = CompetitionFormat.KNOCKOUT"
                      class="flex flex-col items-center justify-center p-5 border rounded-2xl transition-all border-slate-800 bg-slate-50 shadow-sm">
                <span class="text-2xl mb-2">🏆</span>
                <span class="font-bold text-sm text-slate-900">Direct Elimination</span>
                <span class="text-[10px] text-slate-500 mt-1">Loser eliminated each round</span>
              </button>
            </div>
          </div>

          <button (click)="goToStep(2)" [disabled]="!isStep1Valid()" 
                  class="w-full bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-300 font-bold py-4 rounded-2xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
            Next — Add teams <lucide-icon [name]="MoveRightIcon" [size]="18"></lucide-icon>
          </button>
        </div>

        <!-- STEP 2: TEAMS -->
        <div *ngIf="activeStep === 2" class="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div class="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <h3 class="text-xs font-bold text-slate-500 mb-4 uppercase tracking-wider">Add a Team / Participant</h3>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Name</label>
                <input type="text" [(ngModel)]="newTeam.name" placeholder="ex: Street Lions" class="w-full h-10 px-3 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-emerald-500">
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">ELO Score (level)</label>
                <input type="number" [(ngModel)]="newTeam.level" placeholder="1000" class="w-full h-10 px-3 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-emerald-500">
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">City</label>
                <input type="text" [(ngModel)]="newTeam.city" placeholder="ex: Tunis" class="w-full h-10 px-3 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-emerald-500">
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Team Size</label>
                <input type="number" [(ngModel)]="newTeam.size" placeholder="11" class="w-full h-10 px-3 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-emerald-500">
              </div>
            </div>
            <button (click)="addTeam()" [disabled]="!newTeam.name || !newTeam.level" class="w-full bg-[#1e9c4c] hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-colors">
              + Add Team
            </button>
          </div>

          <div class="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <h3 class="text-xs font-bold text-slate-500 mb-4 uppercase tracking-wider">Registered Teams ({{teams.length}})</h3>
            
            <div class="space-y-2 mb-6">
              <div *ngFor="let t of teams; let i = index" class="flex items-center justify-between p-3 bg-[#f8f6f0] border border-slate-200 rounded-xl">
                <div class="flex items-center gap-3">
                  <div class="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-black">{{ i+1 }}</div>
                  <span class="font-bold text-slate-900 text-sm">{{ t.name }}</span>
                </div>
                <div class="flex items-center gap-4">
                  <span class="text-xs text-slate-500">{{ t.city }}</span>
                  <span class="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded-md">ELO {{ t.level }}</span>
                  <button (click)="removeTeam(i)" class="text-slate-400 hover:text-red-500 transition-colors"><lucide-icon [name]="XIcon" [size]="18"></lucide-icon></button>
                </div>
              </div>
              
              <div *ngIf="teams.length === 0" class="text-center py-8 text-slate-400 text-sm">
                No teams added.
              </div>
            </div>
          </div>

          <div class="flex gap-4">
            <button (click)="goToStep(1)" class="w-1/3 bg-white hover:bg-slate-50 text-slate-600 border border-slate-300 font-bold py-4 rounded-2xl transition-colors">Back</button>
            <button (click)="goToStep(3)" [disabled]="teams.length < 4" class="w-2/3 bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-2xl transition-colors disabled:opacity-50 flex justify-center items-center gap-2 shadow-lg shadow-slate-900/20">
              Continue to Draw <lucide-icon [name]="MoveRightIcon" [size]="18"></lucide-icon>
            </button>
          </div>
          <p *ngIf="teams.length < 4 && teams.length > 0" class="text-red-500 text-xs font-bold text-center">You must add at least 4 teams to continue.</p>
        </div>

        <!-- STEP 3: DRAW -->
        <div *ngIf="activeStep === 3" class="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div class="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <h3 class="text-xs font-bold text-slate-500 mb-4 uppercase tracking-wider">Draw Method</h3>
            <div class="grid grid-cols-1 gap-4 max-w-sm">
              <button class="flex flex-col items-center justify-center p-5 border rounded-2xl transition-all border-slate-800 bg-slate-50 shadow-sm"
                      (click)="setDrawMethod('ELO')">
                <span class="text-2xl mb-2">📊</span>
                <span class="font-bold text-sm text-slate-900">By ELO Level</span>
                <span class="text-[10px] text-slate-500 mt-1 text-center">Best teams face off in the final</span>
              </button>
            </div>
          </div>

          <div class="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <h3 class="text-xs font-bold text-slate-500 mb-4 uppercase tracking-wider">Seeds (Before Draw)</h3>
            
            <div class="space-y-2 mb-6">
              <div *ngFor="let t of getSortedTeams(); let i = index" class="flex items-center justify-between p-3 bg-[#f8f6f0] border border-slate-200 rounded-xl">
                <div class="flex items-center gap-3">
                  <div class="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-black">{{ i+1 }}</div>
                  <span class="font-bold text-slate-900 text-sm">{{ t.name }}</span>
                  <span *ngIf="i < 2" class="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-md">Seed {{i+1}}</span>
                </div>
                <div class="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded-md">ELO {{ t.level }}</div>
              </div>
            </div>

            <button (click)="shuffleTeams()" class="w-full bg-[#1e293b] hover:bg-slate-900 text-white font-bold py-4 rounded-xl transition-colors flex justify-center items-center gap-2 shadow-md">
              Relaunch Draw
            </button>
          </div>

          <div class="flex gap-4">
            <button (click)="goToStep(2)" class="w-1/3 bg-white hover:bg-slate-50 text-slate-600 border border-slate-300 font-bold py-4 rounded-2xl transition-colors">Back</button>
            <button (click)="goToStep(4)" class="w-2/3 bg-white hover:bg-slate-50 text-slate-900 border border-slate-300 font-bold py-4 rounded-2xl transition-colors flex justify-center items-center gap-2">
              View Bracket <lucide-icon [name]="MoveRightIcon" [size]="18"></lucide-icon>
            </button>
          </div>
        </div>

        <!-- STEP 4: BRACKET & SAVE -->
        <div *ngIf="activeStep === 4" class="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <!-- Summary -->
          <div class="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div class="bg-[#f8f6f0] p-4 rounded-xl border border-slate-100">
                <div class="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Event</div>
                <div class="font-bold text-slate-900 truncate">{{ formData.name }}</div>
              </div>
              <div class="bg-[#f8f6f0] p-4 rounded-xl border border-slate-100">
                <div class="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Sport</div>
                <div class="font-bold text-slate-900 flex items-center gap-2"><span class="text-blue-500">⚽</span> {{ getSportName() }}</div>
              </div>
              <div class="bg-[#f8f6f0] p-4 rounded-xl border border-slate-100">
                <div class="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Format</div>
                <div class="font-bold text-slate-900">Elimination</div>
              </div>
              <div class="bg-[#f8f6f0] p-4 rounded-xl border border-slate-100">
                <div class="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Teams</div>
                <div class="font-bold text-slate-900">{{ teams.length }} participants</div>
              </div>
            </div>
          </div>

          <!-- Bracket Preview -->
          <div class="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm overflow-x-auto">
            <h3 class="text-xs font-bold text-slate-500 mb-6 uppercase tracking-wider">Bracket — Draw</h3>
            
            <div class="min-w-[600px] flex gap-8 pb-4">
              <!-- Column 1 (Quart) -->
              <div class="flex-1 space-y-4">
                <div class="text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 pb-2 mb-4">Quarter-final</div>
                
                <div *ngFor="let m of previewMatches" class="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm text-sm">
                  <div class="px-3 py-2 border-b border-slate-100 flex items-center gap-3">
                    <span class="text-[10px] font-bold bg-slate-100 text-slate-600 rounded px-1.5 py-0.5 w-5 text-center">{{ getSeed(m.home) }}</span>
                    <span class="font-bold text-slate-900">{{ m.home }}</span>
                  </div>
                  <div class="px-3 py-2 flex items-center gap-3">
                    <span class="text-[10px] font-bold bg-slate-100 text-slate-600 rounded px-1.5 py-0.5 w-5 text-center">{{ getSeed(m.away) }}</span>
                    <span class="font-bold text-slate-900">{{ m.away }}</span>
                  </div>
                </div>
              </div>

              <!-- Column 2 (Demi) -->
              <div class="flex-1 space-y-4 flex flex-col justify-around">
                <div class="text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 pb-2 mb-4">Semi-final</div>
                
                <div class="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm opacity-70 text-sm">
                  <div class="px-3 py-2 border-b border-slate-100 flex items-center gap-3 italic"><span class="text-[10px] font-bold bg-slate-50 text-slate-400 rounded px-1.5 py-0.5 w-5 text-center">?</span> <span class="text-slate-600">TBD</span></div>
                  <div class="px-3 py-2 flex items-center gap-3 italic"><span class="text-[10px] font-bold bg-slate-50 text-slate-400 rounded px-1.5 py-0.5 w-5 text-center">?</span> <span class="text-slate-600">BYE</span></div>
                </div>
                <div class="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm opacity-70 text-sm">
                  <div class="px-3 py-2 border-b border-slate-100 flex items-center gap-3 italic"><span class="text-[10px] font-bold bg-slate-50 text-slate-400 rounded px-1.5 py-0.5 w-5 text-center">?</span> <span class="text-slate-600">TBD</span></div>
                  <div class="px-3 py-2 flex items-center gap-3 italic"><span class="text-[10px] font-bold bg-slate-50 text-slate-400 rounded px-1.5 py-0.5 w-5 text-center">?</span> <span class="text-slate-600">BYE</span></div>
                </div>
              </div>

              <!-- Column 3 (Finale) -->
              <div class="flex-1 space-y-4 flex flex-col justify-center">
                <div class="text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 pb-2 mb-4">Final</div>
                
                <div class="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm opacity-70 text-sm">
                  <div class="px-3 py-2 border-b border-slate-100 flex items-center gap-3 italic"><span class="text-[10px] font-bold bg-slate-50 text-slate-400 rounded px-1.5 py-0.5 w-5 text-center">?</span> <span class="text-slate-600">TBD</span></div>
                  <div class="px-3 py-2 flex items-center gap-3 italic"><span class="text-[10px] font-bold bg-slate-50 text-slate-400 rounded px-1.5 py-0.5 w-5 text-center">?</span> <span class="text-slate-600">BYE</span></div>
                </div>
              </div>
            </div>
          </div>

          <div class="flex gap-4">
            <button (click)="goToStep(3)" class="w-1/3 bg-white hover:bg-slate-50 text-slate-600 border border-slate-300 font-bold py-4 rounded-2xl transition-colors flex justify-center items-center gap-2">
               Back
            </button>
            <button (click)="submitAll()" [disabled]="submitting" class="w-2/3 bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-2xl transition-colors disabled:opacity-50 flex justify-center items-center gap-2 shadow-xl shadow-slate-200">
              <lucide-icon *ngIf="submitting" [name]="Loader2Icon" [size]="18" class="animate-spin"></lucide-icon>
              {{ submitting ? 'Saving...' : (isEditMode ? 'Update Competition' : 'Create Competition') }}
            </button>
          </div>
          
          <!-- New: Terrain Link Button -->
          <button (click)="linkTerrain()" class="w-full mt-4 bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 font-bold py-4 rounded-2xl transition-colors flex justify-center items-center gap-2">
            <lucide-icon [name]="MapPinIcon" [size]="18" class="text-blue-500"></lucide-icon>
            Focus on the Field
          </button>
        </div>

      </div>
    </div>
  `
})
export class CompetitionFormComponent implements OnInit {
  readonly ArrowLeftIcon = ArrowLeft;
  readonly TrophyIcon = Trophy;
  readonly CalendarIcon = Calendar;
  readonly UsersIcon = Users;
  readonly SwordsIcon = Swords;
  readonly AlertCircleIcon = AlertCircle;
  readonly Loader2Icon = Loader2;
  readonly XIcon = X;
  readonly RefreshCwIcon = RefreshCw;
  readonly MoveRightIcon = MoveRight;
  readonly MapPinIcon = MapPin;
  readonly CompetitionFormat = CompetitionFormat;

  activeStep = 1;
  submitting = false;
  apiError: string | null = null;
  userId = 1; // Default organizer

  sports = [
    { id: 'football', name: 'Football', icon: '⚽' },
    { id: 'basketball', name: 'Basketball', icon: '🏀' },
    { id: 'volleyball', name: 'Volleyball', icon: '🏐' },
    { id: 'tennis', name: 'Tennis', icon: '🎾' },
    { id: 'rugby', name: 'Rugby', icon: '🏉' },
    { id: 'handball', name: 'Handball', icon: '🏃' },
    { id: 'swimming', name: 'Swimming', icon: '🏊' },
    { id: 'other', name: 'Other', icon: '🏅' }
  ];

  formData: CompetitionRequest = {
    name: '',
    description: 'Tournament generated via Assistant.',
    rules: '',
    format: CompetitionFormat.KNOCKOUT,
    status: CompetitionStatus.DRAFT, // Will be set to ONGOING when created
    startDate: '',
    endDate: '',
    location: '',
    sportType: 'football',
    isIndividualSport: false,
    organizerId: 1
  };

  isEditMode = false;
  editId: number | null = null;

  // Step 2 Teams
  teams: WizardTeam[] = [];
  newTeam: WizardTeam = { name: '', level: '', city: '', size: 11 };
  drawMethod: string = 'ELO';

  // Sport Spaces
  availableFields: Field[] = [];

  // Preview Bracket
  previewMatches: {home: string, away: string}[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private competitionService: CompetitionService,
    private teamService: TeamService,
    private registrationService: RegistrationService,
    private bookingService: BookingService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.bookingService.fields$.subscribe(fields => {
      this.availableFields = fields;
    });

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.isEditMode = true;
        this.editId = +id;
        this.competitionService.getCompetitionById(this.editId).subscribe({
          next: (comp: any) => {
            this.formData = comp;
            // Format dates for input type="date"
            if (this.formData.startDate) this.formData.startDate = this.formData.startDate.substring(0, 10);
            if (this.formData.endDate) this.formData.endDate = this.formData.endDate.substring(0, 10);
            
            // Also load teams/registrations
            this.registrationService.getRegistrations(this.editId!).subscribe((regs: any[]) => {
              if (regs && regs.length > 0) {
                const teamRequests = regs.map(r => this.teamService.getById(r.teamId));
                forkJoin(teamRequests).subscribe({
                  next: (teamsData: any[]) => {
                    this.teams = teamsData.map(t => ({
                      id: t.id,
                      name: t.name,
                      level: t.level,
                      city: t.city,
                      size: t.size || 11
                    }));
                    if (this.activeStep === 4) this.generatePreviewBracket();
                    this.cdr.detectChanges();
                  }
                });
              }
            });
            
            this.cdr.detectChanges();
          }
        });
      } else {
        // Set default dates to tomorrow and a week later
        const tmr = new Date(); tmr.setDate(tmr.getDate() + 1);
        const nxt = new Date(); nxt.setDate(nxt.getDate() + 7);
        this.formData.startDate = tmr.toISOString().substring(0, 10);
        this.formData.endDate = nxt.toISOString().substring(0, 10);
      }
    });
  }

  goBack() {
    this.router.navigate(['/app/competitions']);
  }

  goToStep(step: number) {
    if (step === 2 && !this.isStep1Valid()) return;
    if ((step === 3 || step === 4) && this.teams.length < 4) return;
    
    this.activeStep = step;
    this.apiError = null;

    if (step === 4) {
      this.generatePreviewBracket();
    }
  }

  isStep1Valid(): boolean {
    return !!(this.formData.name && this.formData.name.length >= 3 && this.formData.startDate && this.formData.endDate && this.formData.location);
  }

  getSportName() {
    return this.sports.find(s => s.id === this.formData.sportType)?.name || 'Sport';
  }

  // --- Teams Logic ---
  addTeam() {
    if (this.newTeam.name && this.newTeam.level) {
      this.teams.push({ ...this.newTeam });
      this.newTeam = { name: '', level: '', city: '', size: 11 };
    }
  }

  removeTeam(index: number) {
    this.teams.splice(index, 1);
  }

  setDrawMethod(method: string) {
    this.drawMethod = method;
    if (this.activeStep === 4) {
      this.generatePreviewBracket();
    }
  }

  shuffleTeams() {
    if (this.drawMethod === 'RANDOM') {
      // Fisher-Yates shuffle for true random
      for (let i = this.teams.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [this.teams[i], this.teams[j]] = [this.teams[j], this.teams[i]];
      }
    } else {
      // Just visually update
      this.teams = [...this.teams];
    }
    if (this.activeStep === 4) {
      this.generatePreviewBracket();
    }
  }

  getSortedTeams() {
    if (this.drawMethod === 'RANDOM') {
      return [...this.teams]; // Keep whatever current (shuffled) order
    } else if (this.drawMethod === 'SERPENTIN') {
      // Sort by ELO, then distribute 1, 4, 5, 8 ... etc.
      const sorted = [...this.teams].sort((a, b) => parseInt(b.level || '0') - parseInt(a.level || '0'));
      return sorted; // Simplified for UI, real logic in backend
    }
    // Default ELO
    return [...this.teams].sort((a, b) => parseInt(b.level || '0') - parseInt(a.level || '0'));
  }

  getSeed(name: string): number {
    const sorted = this.getSortedTeams();
    const idx = sorted.findIndex(t => t.name === name);
    return idx === -1 ? 0 : idx + 1;
  }

  generatePreviewBracket() {
    // Simple 1st vs Last pairing for preview
    const sorted = this.getSortedTeams();
    this.previewMatches = [];
    const n = sorted.length;
    for (let i = 0; i < Math.floor(n / 2); i++) {
      this.previewMatches.push({
        home: sorted[i].name,
        away: sorted[n - 1 - i].name
      });
    }
  }

  // --- Submission Logic ---
  submitEdit() {
    if (!this.editId) return;
    this.submitting = true;
    this.apiError = null;
    this.competitionService.updateCompetition(this.editId, this.formData).subscribe({
      next: () => {
        this.router.navigate(['/app/competitions']);
      },
      error: (err) => {
        this.apiError = err.error || err.message || "Edit error.";
        this.submitting = false;
        this.cdr.detectChanges();
      }
    });
  }

  submitAll() {
    this.submitting = true;
    this.apiError = null;
    this.formData.status = CompetitionStatus.ONGOING;

    // 1. Filter new vs existing teams
    const newTeams = this.teams.filter(t => !t.id);
    const existingTeams = this.teams.filter(t => !!t.id);

    const teamRequests = newTeams.map(t => this.teamService.create({
      name: t.name,
      level: t.level.toString(),
      city: t.city,
      sport: this.formData.sportType,
      description: 'Added via Modification'
    }, this.userId));

    (teamRequests.length > 0 ? forkJoin(teamRequests) : of([])).pipe(
      catchError(err => {
        return throwError(() => new Error('Error creating new teams: ' + err.message));
      }),
      switchMap((createdTeams: any[]) => {
        const allCurrentTeams = [...existingTeams, ...createdTeams];
        
        // 2. Create or Update Competition
        const compObs = this.isEditMode && this.editId
          ? this.competitionService.updateCompetition(this.editId, this.formData)
          : this.competitionService.createCompetition(this.formData);

        return compObs.pipe(
          switchMap(comp => {
            // 3. Register only NEW teams
            if (createdTeams.length === 0) {
              // If editing and no new teams, we might still want to regenerate draw? 
              // Let's assume yes if they went through the wizard.
              return this.competitionService.generateDrawByLevel(comp.id).pipe(switchMap(() => of(comp.id)));
            }

            const regRequests = createdTeams.map(t => this.registrationService.register({
              competitionId: comp.id,
              teamId: t.id,
              status: RegistrationStatus.CONFIRMED
            }));
            
            return forkJoin(regRequests).pipe(
              switchMap(() => {
                // 4. Generate Draw
                return this.competitionService.generateDrawByLevel(comp.id).pipe(
                  switchMap(() => of(comp.id))
                );
              })
            );
          })
        );
      }),
      finalize(() => {
        this.submitting = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (compId) => {
        this.router.navigate(['/app/competitions']);
      },
      error: (err) => {
        this.apiError = err.error || err.message || "Unknown error. Have you restarted your backend server (Spring Boot)?";
        console.error(err);
      }
    });
  }

  linkTerrain() {
    // Navigate to sport-spaces or show a message
    this.router.navigate(['/app/fields']);
  }

  selectField(field: Field) {
    this.formData.sportSpaceId = +field.id;
    this.formData.location = field.name + ", " + field.location;
    this.cdr.detectChanges();
  }
}
