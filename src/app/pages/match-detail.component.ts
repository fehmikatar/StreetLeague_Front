import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { LucideAngularModule, Trophy, MapPin, Calendar, ArrowLeft, RefreshCw, Info, Loader2, PlayCircle, CheckCircle, XCircle, Award, BarChart2, Star, ChevronRight } from 'lucide-angular';

import { MatchService, MatchResponse, MatchStatus, MatchRatingDto } from '../services/match.service';
import { MatchEventService, MatchEventRequest, MatchEventType, TimelineEventDto, PlayerStatsDto } from '../services/match-event.service';
import { TeamService } from '../services/team.service';

@Component({
  selector: 'app-match-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule, LucideAngularModule],
  template: `
    <div class="fs-wrap">

      <!-- Breadcrumb -->
      <div class="fs-breadcrumb">
        <span (click)="goBack()">⚽ StreetLeague</span>
        <span class="sep">›</span>
        <span>Matches</span>
        <span class="sep">›</span>
        <span *ngIf="match">{{ match.competitionName }}</span>
      </div>

      <!-- Loading -->
      <div *ngIf="loading && !match" class="fs-loading">
        <lucide-icon [name]="Loader2Icon" [size]="36" class="animate-spin"></lucide-icon>
        Loading match...
      </div>

      <ng-container *ngIf="!loading && match">

        <!-- ===== SCOREBOARD ===== -->
        <div class="fs-scoreboard">
          <div class="fs-scoreboard-inner">
            <div class="fs-teams-row">

              <!-- Home Team -->
              <div class="fs-team">
                <div class="fs-team-logo">{{ teamInitials(match.homeTeamName) }}</div>
                <div class="fs-team-name">{{ match.homeTeamName }}</div>
              </div>

              <!-- Score Center -->
              <div class="fs-score-center">
                <div class="fs-score-datetime">{{ formatDate(match.scheduledAt) }}</div>

                <div *ngIf="match.status !== 'SCHEDULED' && match.status !== 'CANCELED'"
                     class="fs-score-value">
                  {{ computedHomeScore }} - {{ computedAwayScore }}
                </div>
                <div *ngIf="match.status === 'SCHEDULED' || match.status === 'CANCELED'"
                     class="fs-score-value scheduled">VS</div>

                <div class="fs-score-status"
                     [class.finished]="match.status === 'FINISHED'"
                     [class.scheduled]="match.status === 'SCHEDULED'"
                     [class.canceled]="match.status === 'CANCELED'">
                  <span *ngIf="match.status === 'LIVE'" style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#e03d3d;animation:pulse 1s infinite;margin-right:5px;vertical-align:middle;"></span>
                  {{ getStatusLabel(match.status) }}
                  <span *ngIf="match.status === 'LIVE'" style="font-weight:900; margin-left:8px; color:#222; font-size:16px;">{{ formatChrono(chronoSeconds) }}</span>
                </div>
                <div class="fs-venue">📍 {{ match.venue }}</div>
              </div>

              <!-- Away Team -->
              <div class="fs-team">
                <div class="fs-team-logo">{{ teamInitials(match.awayTeamName) }}</div>
                <div class="fs-team-name">{{ match.awayTeamName }}</div>
              </div>
            </div>

            <!-- Top Nav -->
            <div class="fs-nav">
              <div class="fs-nav-item" [class.active]="activeNav==='resume'" (click)="setNav('resume')">Match</div>
              <div class="fs-nav-item" [class.active]="activeNav==='ratings'" (click)="setNav('ratings')">Ratings & MVP</div>
            </div>
          </div>
        </div>

        <!-- ===== LIVE AI PREDICTION BAR ===== -->
        <div *ngIf="prediction && match.status !== 'CANCELED'" class="fs-content" style="margin-top:0; padding-top:12px;">
          <div class="fs-stats-card" style="margin-bottom:0; background: linear-gradient(to right, #f8fafc, #eff6ff, #f8fafc); border-color:#bfdbfe;">
            <div style="padding:12px 16px;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                <span style="font-size:12px; font-weight:800; color:#1e40af; display:flex; align-items:center; gap:6px;">
                  <span *ngIf="match.status === 'LIVE'" style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#e03d3d;animation:pulse 1s infinite;"></span>
                  <span *ngIf="match.status === 'FINISHED'" style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#10b981;"></span>
                  <span *ngIf="match.status === 'SCHEDULED'" style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#3b82f6;"></span>
                  🤖 AI - 
                  <ng-container *ngIf="match.status === 'LIVE'">Real-Time Prediction</ng-container>
                  <ng-container *ngIf="match.status === 'FINISHED'">Final Prediction</ng-container>
                  <ng-container *ngIf="match.status === 'SCHEDULED'">Pre-match Prediction</ng-container>
                </span>
                <span style="font-size:11px; font-weight:700; color:#3b82f6;">Confidence: {{ prediction.confidence | number:'1.0-0' }}%</span>
              </div>
              
              <div style="font-size:12px; font-style:italic; color:#475569; margin-bottom:10px; border-left:2px solid #93c5fd; padding-left:8px;">
                {{ prediction.interpretation }}
              </div>

              <div style="display:flex; height:6px; border-radius:3px; overflow:hidden; background:#e2e8f0; width:100%;">
                <div [style.width.%]="prediction.probabilities.HOME_WIN" style="background:#10b981; transition:width 1s;"></div>
                <div [style.width.%]="prediction.probabilities.DRAW" style="background:#fbbf24; transition:width 1s;"></div>
                <div [style.width.%]="prediction.probabilities.AWAY_WIN" style="background:#3b82f6; transition:width 1s;"></div>
              </div>
              <div style="display:flex; justify-content:space-between; font-size:11px; font-weight:800; margin-top:4px; color:#64748b;">
                <span style="color:#059669; width:33%; text-align:left;">{{ match.homeTeamName }} {{ prediction.probabilities.HOME_WIN | number:'1.0-0' }}%</span>
                <span style="color:#d97706; width:33%; text-align:center;">Draw {{ prediction.probabilities.DRAW | number:'1.0-0' }}%</span>
                <span style="color:#2563eb; width:33%; text-align:right;">{{ match.awayTeamName }} {{ prediction.probabilities.AWAY_WIN | number:'1.0-0' }}%</span>
              </div>
            </div>
          </div>
        </div>

        <!-- ===== CONTENT ===== -->
        <div class="fs-content">

          <!-- Admin Panel -->
          <div *ngIf="isOrganizer" class="fs-admin">
            <div class="fs-admin-title">🛠 Organizer Actions</div>
            <div class="fs-admin-actions">
              <button *ngIf="match.status === 'SCHEDULED'" (click)="updateStatus('LIVE')" class="fs-btn fs-btn-red">▶ Start LIVE</button>
              <button *ngIf="match.status === 'LIVE'" (click)="updateStatus('FINISHED')" class="fs-btn fs-btn-green">✔ Finish</button>
              <button *ngIf="match.status !== 'FINISHED' && match.status !== 'CANCELED'" (click)="updateStatus('CANCELED')" class="fs-btn fs-btn-gray">✕ Cancel</button>
            </div>
            <form *ngIf="match.status === 'LIVE'" [formGroup]="eventForm" (ngSubmit)="submitEvent()" class="fs-event-form">
              <select formControlName="type">
                <option value="SCORE">⚽ Goal</option>
                <option value="ASSIST" *ngIf="!isIndividualSport">🅰️ Assist</option>
                <option value="WARNING">🟨 Yellow card</option>
                <option value="EJECTION">🟥 Red card</option>
                <option value="FOUL">🛑 Foul</option>
                <option value="SUBSTITUTION" *ngIf="!isIndividualSport">🔄 substitution</option>
                <option value="TIMEOUT">⏱️ Timeout</option>
              </select>
              <select formControlName="teamId">
                <option [value]="match.homeTeamId">{{ match.homeTeamName }}</option>
                <option [value]="match.awayTeamId">{{ match.awayTeamName }}</option>
              </select>
              <input type="number" formControlName="minute" placeholder="Min'" style="width:58px;">
              <input type="number" formControlName="playerId" placeholder="Player ID" style="width:90px;">
              <button type="submit" [disabled]="eventForm.invalid || submittingEvent" class="fs-btn fs-btn-red">Add</button>
            </form>
            <div *ngIf="errorMsg" class="fs-error">{{ errorMsg }}</div>
          </div>

          <!-- ===== NAV: CORRESPONDRE ===== -->
          <ng-container *ngIf="activeNav === 'resume'">
            <!-- Sub-tabs -->
            <div class="fs-subtabs">
              <div class="fs-subtab" [class.active]="activeSubTab==='timeline'" (click)="setSubTab('timeline')">Summary</div>
              <div class="fs-subtab" [class.active]="activeSubTab==='stats'" (click)="setSubTab('stats')">Player Stats</div>
              <div class="fs-subtab" [class.active]="activeSubTab==='ratings'" (click)="setSubTab('ratings')">Ratings & MVP</div>
            </div>

            <!-- TIMELINE -->
            <ng-container *ngIf="activeSubTab === 'timeline'">
              <div *ngIf="timeline.length === 0 && !loadingTab" class="fs-stats-card">
                <div class="fs-empty">No events recorded for this match.</div>
              </div>

              <!-- Group by half -->
              <ng-container *ngIf="timeline.length > 0">
                <!-- 1st Half -->
                <ng-container *ngIf="firstHalf.length > 0">
                  <div class="fs-section-header">
                    <span>1st Half</span>
                    <span>{{ firstHalfScore }}</span>
                  </div>
                  <div class="fs-timeline-card">
                    <div *ngFor="let ev of firstHalf" class="fs-event-row">
                      <!-- Home side -->
                      <div class="fs-event-home">
                        <ng-container *ngIf="isHomeTeam(ev)">
                          <div>
                            <div class="fs-player-name">
                              <span *ngIf="ev.description" class="fs-assist-name">({{ ev.description }}) </span>
                              Player #{{ ev.playerId }}
                              <span *ngIf="ev.type === 'SCORE'" class="fs-score-snap"> {{ ev.homeScoreSnapshot }} - {{ ev.awayScoreSnapshot }}</span>
                            </div>
                            <div class="fs-event-desc">{{ getEventDesc(ev.type) }}</div>
                          </div>
                          <span [innerHTML]="getEventIcon(ev.type)"></span>
                        </ng-container>
                      </div>
                      <!-- Minute -->
                      <div class="fs-event-minute">{{ ev.minute }}'</div>
                      <!-- Away side -->
                      <div class="fs-event-away">
                        <ng-container *ngIf="!isHomeTeam(ev)">
                          <span [innerHTML]="getEventIcon(ev.type)"></span>
                          <div>
                            <div class="fs-player-name">
                              Player #{{ ev.playerId }}
                              <span *ngIf="ev.type === 'SCORE'" class="fs-score-snap"> {{ ev.homeScoreSnapshot }} - {{ ev.awayScoreSnapshot }}</span>
                            </div>
                            <div class="fs-event-desc">
                              <span *ngIf="ev.description" class="fs-assist-name">({{ ev.description }}) </span>
                              {{ getEventDesc(ev.type) }}
                            </div>
                          </div>
                        </ng-container>
                      </div>
                    </div>
                  </div>
                </ng-container>

                <!-- 2nd Half -->
                <ng-container *ngIf="secondHalf.length > 0">
                  <div class="fs-section-header">
                    <span>2nd Half</span>
                    <span>{{ secondHalfScore }}</span>
                  </div>
                  <div class="fs-timeline-card">
                    <div *ngFor="let ev of secondHalf" class="fs-event-row">
                      <div class="fs-event-home">
                        <ng-container *ngIf="isHomeTeam(ev)">
                          <div>
                            <div class="fs-player-name">
                              <span *ngIf="ev.description" class="fs-assist-name">({{ ev.description }}) </span>
                              Player #{{ ev.playerId }}
                              <span *ngIf="ev.type === 'SCORE'" class="fs-score-snap"> {{ ev.homeScoreSnapshot }} - {{ ev.awayScoreSnapshot }}</span>
                            </div>
                            <div class="fs-event-desc">{{ getEventDesc(ev.type) }}</div>
                          </div>
                          <span [innerHTML]="getEventIcon(ev.type)"></span>
                        </ng-container>
                      </div>
                      <div class="fs-event-minute">{{ ev.minute }}'</div>
                      <div class="fs-event-away">
                        <ng-container *ngIf="!isHomeTeam(ev)">
                          <span [innerHTML]="getEventIcon(ev.type)"></span>
                          <div>
                            <div class="fs-player-name">
                              Player #{{ ev.playerId }}
                              <span *ngIf="ev.type === 'SCORE'" class="fs-score-snap"> {{ ev.homeScoreSnapshot }} - {{ ev.awayScoreSnapshot }}</span>
                            </div>
                            <div class="fs-event-desc">
                              <span *ngIf="ev.description" class="fs-assist-name">({{ ev.description }}) </span>
                              {{ getEventDesc(ev.type) }}
                            </div>
                          </div>
                        </ng-container>
                      </div>
                    </div>
                  </div>
                </ng-container>

                <!-- Commentaire footer -->
                <div class="fs-section-header" style="border-radius:6px; border-bottom:1px solid #e0e0e0;">
                  <span>Commentary</span>
                </div>
              </ng-container>
            </ng-container>

            <!-- STATS JOUEURS -->
            <ng-container *ngIf="activeSubTab === 'stats'">
              <div *ngIf="!playerStats && !loadingTab" class="fs-stats-card">
                <div class="fs-empty">No statistics available for this match.</div>
              </div>
              <div *ngIf="playerStats" class="fs-stats-card">
                <table class="fs-stats-table">
                  <thead>
                    <tr>
                      <th>Player</th>
                      <th>Rating</th>
                      <th>⚽</th>
                      <th>🅰️</th>
                      <th>🟨</th>
                      <th>🟥</th>
                      <th>Fouls</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let p of playerStats.allPlayers">
                      <td>{{ p.teamName }} — #{{ p.playerId }}</td>
                      <td [style.color]="p.ejected ? '#e03d3d' : '#333'" style="font-weight:700;">{{ p.rating }}/5</td>
                      <td>{{ p.goals }}</td>
                      <td>{{ p.assists }}</td>
                      <td style="color:#f1c40f;font-weight:700;">{{ p.yellowCards }}</td>
                      <td style="color:#e03d3d;font-weight:700;">{{ p.redCards }}</td>
                      <td>{{ p.fouls }}</td>
                    </tr>
                    <tr *ngIf="playerStats.allPlayers.length === 0">
                      <td colspan="7" style="text-align:center;color:#aaa;">No players.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </ng-container>

            <!-- RATINGS -->
            <ng-container *ngIf="activeSubTab === 'ratings'">
              <div *ngIf="!rating && !loadingTab" class="fs-rating-card">
                <div class="fs-empty">Finish the match to see final ratings.</div>
              </div>
              <div *ngIf="rating" class="fs-rating-card">
                <div class="fs-mvp-banner">
                  <div>
                    <div class="fs-mvp-label">🏆 MVP Team</div>
                    <div class="fs-mvp-name">{{ rating.mvpTeamName }}</div>
                  </div>
                  <span style="font-size:36px;">🥇</span>
                </div>
                <div class="fs-grade-grid">
                  <div class="fs-grade-box">
                    <div class="fs-grade-team">{{ rating.homeRating.teamName }}</div>
                    <div class="fs-grade-score" [ngClass]="getGradeClass(rating.homeRating.grade)">{{ rating.homeRating.grade }}</div>
                    <div style="font-size:12px;color:#888;margin-bottom:10px;">{{ rating.homeRating.score }}/10</div>
                    <div class="fs-grade-row"><span>Offensive (35%)</span><span>{{ rating.homeRating.breakdown.offensive }}/10</span></div>
                    <div class="fs-grade-row"><span>Defensive (25%)</span><span>{{ rating.homeRating.breakdown.defensive }}/10</span></div>
                    <div class="fs-grade-row"><span>Shooting (20%)</span><span>{{ rating.homeRating.breakdown.shooting }}/10</span></div>
                    <div class="fs-grade-row"><span>Discipline (10%)</span><span>{{ rating.homeRating.breakdown.discipline }}/10</span></div>
                    <div class="fs-grade-row"><span>Momentum (10%)</span><span>{{ rating.homeRating.breakdown.momentum }}/10</span></div>
                  </div>
                  <div class="fs-grade-box">
                    <div class="fs-grade-team">{{ rating.awayRating.teamName }}</div>
                    <div class="fs-grade-score" [ngClass]="getGradeClass(rating.awayRating.grade)">{{ rating.awayRating.grade }}</div>
                    <div style="font-size:12px;color:#888;margin-bottom:10px;">{{ rating.awayRating.score }}/10</div>
                    <div class="fs-grade-row"><span>Offensive (35%)</span><span>{{ rating.awayRating.breakdown.offensive }}/10</span></div>
                    <div class="fs-grade-row"><span>Defensive (25%)</span><span>{{ rating.awayRating.breakdown.defensive }}/10</span></div>
                    <div class="fs-grade-row"><span>Shooting (20%)</span><span>{{ rating.awayRating.breakdown.shooting }}/10</span></div>
                    <div class="fs-grade-row"><span>Discipline (10%)</span><span>{{ rating.awayRating.breakdown.discipline }}/10</span></div>
                    <div class="fs-grade-row"><span>Momentum (10%)</span><span>{{ rating.awayRating.breakdown.momentum }}/10</span></div>
                  </div>
                </div>
              </div>
            </ng-container>
          </ng-container>

          <!-- ===== NAV: STATISTIQUES ===== -->
          <ng-container *ngIf="activeNav === 'stats'">
            <div class="fs-stats-card" style="margin-top:12px;">
              <div class="fs-empty">Team statistics — coming soon.</div>
            </div>
          </ng-container>

          <!-- ===== NAV: RATINGS ===== -->
          <ng-container *ngIf="activeNav === 'ratings'">
            <div style="margin-top:12px;">
              <div *ngIf="!rating" class="fs-rating-card">
                <div class="fs-empty">Finish the match to see ratings.</div>
              </div>
              <div *ngIf="rating" class="fs-rating-card">
                <div class="fs-mvp-banner">
                  <div>
                    <div class="fs-mvp-label">🏆 MVP Team</div>
                    <div class="fs-mvp-name">{{ rating.mvpTeamName }}</div>
                  </div>
                  <span style="font-size:36px;">🥇</span>
                </div>
              </div>
            </div>
          </ng-container>

          <!-- Toast -->
          <div *ngIf="toastMessage" class="fs-toast">
            <lucide-icon [name]="InfoIcon" [size]="18"></lucide-icon>
            <span>{{ toastMessage }}</span>
          </div>

        </div><!-- /fs-content -->
      </ng-container>
    </div>
  `,
  styles: [`
    :host { display: block; font-family: 'Inter', sans-serif; }

    .fs-wrap { background: #f5f5f5; min-height: 100vh; }

    /* Breadcrumb */
    .fs-breadcrumb { background:#fff; border-bottom:1px solid #e5e5e5; padding:8px 16px; display:flex; align-items:center; gap:6px; font-size:12px; font-weight:600; color:#666; text-transform:uppercase; letter-spacing:.5px; }
    .fs-breadcrumb span { cursor:pointer; }
    .fs-breadcrumb span:hover { color:#e03d3d; }
    .fs-breadcrumb .sep { color:#bbb; }

    /* Scoreboard */
    .fs-scoreboard { background:#fff; border-bottom:1px solid #e5e5e5; padding:20px 24px 0; }
    .fs-scoreboard-inner { max-width:900px; margin:0 auto; }
    .fs-teams-row { display:flex; align-items:center; justify-content:space-between; gap:12px; padding-bottom:20px; }
    .fs-team { display:flex; flex-direction:column; align-items:center; gap:10px; flex:1; }
    .fs-team-logo { width:72px; height:72px; background:#f0f0f0; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:28px; font-weight:900; color:#555; border:2px solid #e8e8e8; }
    .fs-team-name { font-size:15px; font-weight:700; color:#222; text-align:center; }
    .fs-score-center { display:flex; flex-direction:column; align-items:center; gap:6px; }
    .fs-score-datetime { font-size:12px; color:#888; font-weight:500; }
    .fs-score-value { font-size:52px; font-weight:900; color:#e03d3d; letter-spacing:-2px; line-height:1; }
    .fs-score-value.scheduled { font-size:32px; color:#aaa; }
    .fs-score-status { font-size:13px; font-weight:700; color:#e03d3d; text-transform:uppercase; letter-spacing:.5px; }
    .fs-score-status.finished { color:#27ae60; }
    .fs-score-status.scheduled { color:#888; }
    .fs-score-status.canceled { color:#c0392b; }
    .fs-venue { font-size:11px; color:#aaa; text-align:center; margin-top:2px; }

    /* Nav tabs (top level) */
    .fs-nav { border-bottom:2px solid #e5e5e5; display:flex; gap:0; overflow-x:auto; background:#fff; }
    .fs-nav-item { padding:12px 18px; font-size:12px; font-weight:700; color:#666; cursor:pointer; border-bottom:2px solid transparent; margin-bottom:-2px; white-space:nowrap; text-transform:uppercase; letter-spacing:.4px; transition:color .15s; }
    .fs-nav-item:hover { color:#e03d3d; }
    .fs-nav-item.active { color:#e03d3d; border-bottom-color:#e03d3d; }

    /* Sub tabs */
    .fs-subtabs { background:#fff; border-bottom:1px solid #e5e5e5; display:flex; gap:0; overflow-x:auto; padding:0 8px; }
    .fs-subtab { padding:10px 14px; font-size:11px; font-weight:700; color:#777; cursor:pointer; border-bottom:2px solid transparent; margin-bottom:-1px; white-space:nowrap; text-transform:uppercase; letter-spacing:.4px; transition:all .15s; }
    .fs-subtab:hover { color:#333; }
    .fs-subtab.active { background:#e03d3d; color:#fff; border-radius:6px 6px 0 0; }

    /* Content area */
    .fs-content { max-width:900px; margin:16px auto; padding:0 12px; }

    /* Admin panel */
    .fs-admin { background:#fff; border:1px solid #e5e5e5; border-radius:8px; padding:14px 18px; margin-bottom:12px; }
    .fs-admin-title { font-size:12px; font-weight:700; color:#555; text-transform:uppercase; letter-spacing:.5px; margin-bottom:10px; }
    .fs-admin-actions { display:flex; flex-wrap:wrap; gap:8px; margin-bottom:12px; }
    .fs-btn { padding:7px 16px; border-radius:6px; font-size:12px; font-weight:700; cursor:pointer; border:none; transition:opacity .15s; }
    .fs-btn:hover { opacity:.85; }
    .fs-btn-red { background:#e03d3d; color:#fff; }
    .fs-btn-green { background:#27ae60; color:#fff; }
    .fs-btn-gray { background:#eee; color:#555; }
    .fs-event-form { display:flex; flex-wrap:wrap; gap:8px; align-items:center; background:#f8f8f8; padding:12px; border-radius:8px; border:1px solid #eee; }
    .fs-event-form select, .fs-event-form input { height:34px; padding:0 10px; border:1px solid #ddd; border-radius:6px; font-size:12px; font-weight:600; background:#fff; }
    .fs-error { color:#e03d3d; font-size:12px; font-weight:600; margin-top:6px; }

    /* Timeline section */
    .fs-section-header { background:#f0f0f0; padding:10px 16px; font-size:11px; font-weight:700; color:#555; text-transform:uppercase; letter-spacing:.5px; display:flex; justify-content:space-between; border-radius:6px 6px 0 0; border:1px solid #e0e0e0; border-bottom:none; }
    .fs-timeline-card { background:#fff; border:1px solid #e0e0e0; border-radius:0 0 6px 6px; overflow:hidden; margin-bottom:12px; }

    /* Each event row — home left, away right */
    .fs-event-row { display:grid; grid-template-columns:1fr 48px 1fr; align-items:center; padding:10px 16px; border-bottom:1px solid #f0f0f0; min-height:44px; }
    .fs-event-row:last-child { border-bottom:none; }
    .fs-event-home { display:flex; align-items:center; justify-content:flex-end; gap:8px; text-align:right; font-size:13px; }
    .fs-event-away { display:flex; align-items:center; justify-content:flex-start; gap:8px; text-align:left; font-size:13px; }
    .fs-event-minute { font-size:12px; font-weight:700; color:#888; text-align:center; }
    .fs-player-name { font-weight:700; color:#222; }
    .fs-event-desc { font-size:12px; color:#888; }
    .fs-card-yellow { display:inline-block; width:12px; height:16px; background:#f1c40f; border-radius:2px; }
    .fs-card-red { display:inline-block; width:12px; height:16px; background:#e03d3d; border-radius:2px; }
    .fs-goal-icon { font-size:16px; }
    .fs-score-snap { font-size:13px; font-weight:900; color:#222; }
    .fs-assist-name { font-size:11px; color:#888; }

    /* Stats table */
    .fs-stats-card { background:#fff; border:1px solid #e0e0e0; border-radius:8px; overflow:hidden; margin-bottom:12px; }
    .fs-stats-table { width:100%; border-collapse:collapse; font-size:13px; }
    .fs-stats-table th { background:#f5f5f5; padding:10px 14px; font-size:11px; font-weight:700; color:#777; text-transform:uppercase; letter-spacing:.4px; border-bottom:1px solid #e5e5e5; text-align:center; }
    .fs-stats-table th:first-child { text-align:left; }
    .fs-stats-table td { padding:10px 14px; border-bottom:1px solid #f5f5f5; color:#333; text-align:center; }
    .fs-stats-table td:first-child { text-align:left; font-weight:600; }
    .fs-stats-table tr:last-child td { border-bottom:none; }

    /* Ratings */
    .fs-rating-card { background:#fff; border:1px solid #e0e0e0; border-radius:8px; padding:18px; margin-bottom:12px; }
    .fs-mvp-banner { background:linear-gradient(135deg,#f39c12,#e67e22); border-radius:8px; padding:14px 18px; color:#fff; display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; }
    .fs-mvp-label { font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.5px; opacity:.8; }
    .fs-mvp-name { font-size:18px; font-weight:900; }
    .fs-grade-grid { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
    .fs-grade-box { border:1px solid #e5e5e5; border-radius:8px; padding:14px; }
    .fs-grade-team { font-size:14px; font-weight:700; margin-bottom:10px; color:#333; }
    .fs-grade-score { font-size:32px; font-weight:900; }
    .fs-grade-A { color:#27ae60; }
    .fs-grade-B { color:#2980b9; }
    .fs-grade-C { color:#f39c12; }
    .fs-grade-D { color:#e03d3d; }
    .fs-grade-row { display:flex; justify-content:space-between; font-size:12px; padding:4px 0; border-bottom:1px solid #f5f5f5; }
    .fs-grade-row:last-child { border-bottom:none; }
    .fs-grade-row span:first-child { color:#888; }
    .fs-grade-row span:last-child { font-weight:700; }

    /* Empty state */
    .fs-empty { text-align:center; padding:32px; color:#aaa; font-size:13px; font-weight:600; }

    /* Loading */
    .fs-loading { display:flex; flex-direction:column; align-items:center; justify-content:center; padding:60px; gap:12px; color:#aaa; font-weight:600; font-size:14px; }

    /* Toast */
    .fs-toast { position:fixed; bottom:24px; right:24px; background:#333; color:#fff; padding:12px 20px; border-radius:12px; display:flex; align-items:center; gap:10px; font-size:13px; font-weight:600; box-shadow:0 10px 25px rgba(0,0,0,0.2); z-index:1000; animation:slideUp 0.3s ease; }
    @keyframes slideUp { from { transform:translateY(20px); opacity:0; } to { transform:translateY(0); opacity:1; } }
  `]
})
export class MatchDetailComponent implements OnInit, OnDestroy {
  readonly ArrowLeftIcon = ArrowLeft; readonly TrophyIcon = Trophy; readonly MapPinIcon = MapPin; readonly CalendarIcon = Calendar;
  readonly Loader2Icon = Loader2; readonly PlayCircleIcon = PlayCircle; readonly CheckCircleIcon = CheckCircle; readonly XCircleIcon = XCircle;
  readonly InfoIcon = Info; readonly RefreshCwIcon = RefreshCw; readonly UsersIcon = BarChart2;
  readonly StarIcon = Star; readonly AwardIcon = Award; readonly ChevronRightIcon = ChevronRight;

  matchId!: number;
  match: MatchResponse | null = null;
  loading = true; errorMsg = ''; userType = ''; pollTimer: any; toastMessage = '';

  eventForm: FormGroup; submittingEvent = false;

  activeNav = 'resume';
  activeSubTab = 'timeline';
  loadingTab = false;

  timeline: TimelineEventDto[] = [];
  playerStats: PlayerStatsDto | null = null;
  rating: MatchRatingDto | null = null;

  teams: any[] = [];
  computedHomeScore = 0;
  computedAwayScore = 0;
  chronoSeconds = 0;
  chronoTimer: any = null;

  constructor(
    private route: ActivatedRoute, private router: Router, private fb: FormBuilder,
    private matchService: MatchService, private matchEventService: MatchEventService,
    private teamService: TeamService, private cdr: ChangeDetectorRef
  ) {
    this.eventForm = this.fb.group({
      type: ['SCORE', Validators.required], minute: ['', [Validators.required, Validators.min(0)]],
      teamId: ['', Validators.required], playerId: ['']
    });
  }

  ngOnInit() {
    this.userType = localStorage.getItem('user_type') || 'ROLE_PLAYER';
    this.route.paramMap.subscribe(p => {
      const id = p.get('id');
      if (id) { this.matchId = +id; this.fetchMatchData(); }
    });
    this.pollTimer = setInterval(() => {
      if (this.match?.status === 'LIVE') this.fetchMatchData(true);
    }, 10000);
  }

  ngOnDestroy() { 
    if (this.pollTimer) clearInterval(this.pollTimer); 
    if (this.chronoTimer) clearInterval(this.chronoTimer);
  }

  startChrono() {
    if (this.chronoTimer) return;
    this.chronoTimer = setInterval(() => {
      if (this.match?.status === MatchStatus.LIVE) {
        if (this.chronoSeconds < 60) {
          this.chronoSeconds++;
          const currentMin = Math.floor(this.chronoSeconds / 60) + 1;
          this.eventForm.patchValue({ minute: currentMin });
          this.cdr.detectChanges();
        } else {
          this.stopChrono();
          this.autoFinish();
        }
      } else {
        // If match is no longer LIVE (e.g. manually finished or canceled), stop the chrono
        this.stopChrono();
      }
    }, 1000);
  }

  autoFinish() {
    if (!this.match || this.match.status !== MatchStatus.LIVE) return;
    const req: any = { ...this.match, status: MatchStatus.FINISHED };
    this.matchService.updateMatch(this.matchId, req).subscribe({
      next: res => { 
        this.match = res; 
        this.fetchMatchData(); 
        this.showToast('Match finished automatically.');
      }
    });
  }

  formatChrono(totalSeconds: number): string {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  stopChrono() {
    if (this.chronoTimer) {
      clearInterval(this.chronoTimer);
      this.chronoTimer = null;
    }
  }

  get isOrganizer() { return ['ROLE_ADMIN', 'ROLE_FIELD_OWNER', 'admin', 'owner'].includes(this.userType); }
  get isIndividualSport(): boolean { return false; }

  get firstHalf(): TimelineEventDto[] { return this.timeline.filter(e => e.minute <= 45); }
  get secondHalf(): TimelineEventDto[] { return this.timeline.filter(e => e.minute > 45); }

  get firstHalfScore(): string {
    const last = [...this.firstHalf].reverse().find(e => e.homeScoreSnapshot !== undefined);
    return last ? `${last.homeScoreSnapshot} - ${last.awayScoreSnapshot}` : '0 - 0';
  }
  get secondHalfScore(): string {
    const last = [...this.secondHalf].reverse().find(e => e.homeScoreSnapshot !== undefined);
    return last ? `${last.homeScoreSnapshot} - ${last.awayScoreSnapshot}` : this.firstHalfScore;
  }

  fetchMatchData(isPoll = false) {
    if (!isPoll) this.loading = true;
    this.matchService.getMatchById(this.matchId).subscribe({
      next: res => {
        this.match = res;
        this.loadTeamNames();
        this.loadCurrentTab();
        this.loading = false;
        if (this.match.status === MatchStatus.LIVE) {
          // Initialize chrono from the latest event if any
          if (this.chronoSeconds === 0 && this.timeline.length > 0) {
             const lastMin = Math.max(...this.timeline.map(e => e.minute));
             this.chronoSeconds = Math.max(0, (lastMin - 1) * 60);
             this.eventForm.patchValue({ minute: lastMin });
          }
          this.startChrono();
        } else {
          this.stopChrono();
        }
        this.cdr.detectChanges();
      },
      error: () => { this.errorMsg = 'Match not found'; this.loading = false; this.cdr.detectChanges(); }
    });
  }

  loadTeamNames() {
    this.teamService.getAll().subscribe(teams => {
      this.teams = teams;
      if (this.match) {
        const h = teams.find(t => t.id == this.match!.homeTeamId);
        const a = teams.find(t => t.id == this.match!.awayTeamId);
        if (h) this.match.homeTeamName = h.name;
        if (a) this.match.awayTeamName = a.name;
        this.cdr.detectChanges();
      }
    });
  }

  setNav(nav: string) { this.activeNav = nav; }

  setSubTab(tab: string) {
    this.activeSubTab = tab;
    this.loadCurrentTab();
  }

  loadCurrentTab() {
    this.loadingTab = true;
    if (this.activeSubTab === 'timeline') this.loadTimeline();
    else if (this.activeSubTab === 'stats') this.loadStats();
    else if (this.activeSubTab === 'ratings') this.loadRatings();
    else this.loadingTab = false;
  }

  loadTimeline() {
    this.matchEventService.getTimeline(this.matchId).subscribe({
      next: res => {
        this.timeline = res.sort((a, b) => a.minute - b.minute);
        if (this.match) {
          const isGoal = (type: string) => type === 'SCORE' || type === 'GOAL';
          this.computedHomeScore = this.timeline.filter(e => isGoal(e.type) && e.teamId === this.match!.homeTeamId).length;
          this.computedAwayScore = this.timeline.filter(e => isGoal(e.type) && e.teamId === this.match!.awayTeamId).length;
        }
        this.loadingTab = false;
        this.cdr.detectChanges();
        
        // Prédire peu importe le statut du match pour toujours afficher le composant IA
        if (this.match?.status !== 'CANCELED') {
          this.predictMatchForDashboard();
        }
      },
      error: () => { this.loadingTab = false; this.cdr.detectChanges(); }
    });
  }

  prediction: any = null;
  isPredictingLive = false;

  predictMatchForDashboard() {
    if (!this.match || this.isPredictingLive) return;
    this.isPredictingLive = true;

    const isLive = this.match.status === 'LIVE';
    const isFinished = this.match.status === 'FINISHED';

    // Calculer les cartons rouges pour l'IA
    const isRedCard = (type: string) => type === 'EJECTION' || type === 'RED_CARD';
    const homeReds = this.timeline.filter(e => isRedCard(e.type) && e.teamId === this.match!.homeTeamId).length;
    const awayReds = this.timeline.filter(e => isRedCard(e.type) && e.teamId === this.match!.awayTeamId).length;
    
    let currentMin = 0;
    if (isLive) currentMin = Math.floor(this.chronoSeconds / 60) || 1;
    if (isFinished) currentMin = 90;

    // Requete manuelle pour envoyer nos données calculées en temps réel
    const req: any = {
      homeRank: 10, awayRank: 10,
      homeGoalsAvg: 1.5, awayGoalsAvg: 1.5,
      homeConcededAvg: 1.2, awayConcededAvg: 1.2,
      homeWinsLast5: 2, awayWinsLast5: 2,
      homeRatingAvg: 3.0, awayRatingAvg: 3.0,
      isNeutralVenue: 0, competitionFormat: 0,
      
      // Variables Live qui changent tout !
      is_live: isLive || isFinished,
      live_home_goals: this.computedHomeScore,
      live_away_goals: this.computedAwayScore,
      live_home_red_cards: homeReds,
      live_away_red_cards: awayReds,
      live_minute: currentMin
    };

    // On essaie d'abord avec l'ID pour la "vraie" data, et on retombe sur manuelle sinon
    this.matchService.predictManual(req).subscribe({
      next: (res) => {
        this.prediction = res;
        this.isPredictingLive = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isPredictingLive = false;
      }
    });
  }

  loadStats() {
    this.matchEventService.getPlayerStats(this.matchId).subscribe({
      next: res => { this.playerStats = res; this.loadingTab = false; this.cdr.detectChanges(); },
      error: () => { this.loadingTab = false; this.cdr.detectChanges(); }
    });
  }

  loadRatings() {
    if (this.match?.status === 'SCHEDULED' || this.match?.status === 'CANCELED') { this.loadingTab = false; return; }
    this.matchService.getMatchRating(this.matchId).subscribe({
      next: res => { this.rating = res; this.loadingTab = false; this.cdr.detectChanges(); },
      error: () => { this.loadingTab = false; this.cdr.detectChanges(); }
    });
  }

  updateStatus(status: 'LIVE' | 'FINISHED' | 'CANCELED') {
    if (!this.match || !confirm(`Switch to ${status}?`)) return;
    const req: any = { ...this.match, status };
    this.matchService.updateMatch(this.matchId, req).subscribe({
      next: res => { this.match = res; this.fetchMatchData(); }
    });
  }

  submitEvent() {
    if (this.eventForm.invalid) return;
    this.submittingEvent = true; this.errorMsg = '';
    const v = this.eventForm.value;
    const req: MatchEventRequest = {
      matchId: this.matchId, type: v.type, minute: +v.minute,
      teamId: +v.teamId, playerId: v.playerId ? +v.playerId : undefined
    };
    this.matchEventService.logEvent(req).subscribe({
      next: () => { this.submittingEvent = false; this.eventForm.patchValue({ playerId: '' }); this.fetchMatchData(); },
      error: (err) => {
        this.submittingEvent = false;
        this.errorMsg = typeof err.error === 'string' ? err.error : (err.message || 'Error during recording.');
        this.cdr.detectChanges();
      }
    });
  }

  isHomeTeam(ev: TimelineEventDto): boolean { return !!this.match && ev.teamId === this.match.homeTeamId; }

  getStatusLabel(s: MatchStatus | string) {
    if (s === MatchStatus.LIVE || s === 'LIVE') return 'LIVE';
    if (s === MatchStatus.FINISHED || s === 'FINISHED') return 'FINISHED';
    if (s === MatchStatus.CANCELED || s === 'CANCELED') return 'CANCELED';
    return 'SCHEDULED';
  }

  getEventIcon(type: string): string {
    switch (type) {
      case 'SCORE': case 'GOAL': return '⚽';
      case 'WARNING': case 'YELLOW_CARD': return '🟨';
      case 'EJECTION': case 'RED_CARD': return '🟥';
      case 'FOUL': return '🛑';
      case 'ASSIST': return '🅰️';
      case 'SUBSTITUTION': return '🔄';
      case 'TIMEOUT': return '⏱️';
      default: return '•';
    }
  }

  isGoalType(type: string): boolean { return type === 'SCORE' || type === 'GOAL'; }

  getEventDesc(type: string): string {
    const map: any = {
      SCORE: 'Goal', GOAL: 'Goal',
      ASSIST: 'Assist',
      WARNING: 'Yellow card', YELLOW_CARD: 'Yellow card',
      EJECTION: 'Red card', RED_CARD: 'Red card',
      FOUL: 'Foul',
      SUBSTITUTION: 'Substitution',
      TIMEOUT: 'Timeout',
      OTHER: 'Other'
    };
    return map[type] || type;
  }

  getGradeClass(g: string) {
    if (g?.includes('A')) return 'fs-grade-A';
    if (g?.includes('B')) return 'fs-grade-B';
    if (g?.includes('C')) return 'fs-grade-C';
    return 'fs-grade-D';
  }

  formatDate(d: string) {
    try { return new Intl.DateTimeFormat('en-US', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(d)); } catch { return d; }
  }

  teamInitials(name: string): string {
    if (!name) return '?';
    return name.split(' ').map(w => w[0]).join('').substring(0, 3).toUpperCase();
  }

  goBack() { this.router.navigate(['/app/matches']); }

  showToast(msg: string) {
    this.toastMessage = msg;
    setTimeout(() => { this.toastMessage = ''; this.cdr.detectChanges(); }, 3000);
    this.cdr.detectChanges();
  }
}
