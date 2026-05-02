import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactionType, REACTION_EMOJIS } from '../../models/reaction-type.enum';
import { UserReaction } from '../../models/reaction.model';

@Component({
  selector: 'app-reactions-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-overlay" (click)="close()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>Reactions</h3>
          <button class="close-btn" (click)="close()">✕</button>
        </div>

        <div class="reaction-tabs">
          <button 
            class="tab"
            [class.active]="selectedFilter === 'all'"
            (click)="filterByReaction('all')">
            All {{ totalCount }}
          </button>
          <button 
            *ngFor="let summary of reactionSummaries"
            class="tab"
            [class.active]="selectedFilter === summary.reactionType"
            (click)="filterByReaction(summary.reactionType)">
            {{ summary.emoji }} {{ summary.count }}
          </button>
        </div>

        <div class="users-list">
          <div *ngFor="let user of filteredUsers" class="user-item">
            <img 
              [src]="user.profileImage || 'assets/default-avatar.png'" 
              [alt]="user.name"
              class="user-avatar">
            <span class="user-name">{{ user.name }}</span>
            <span class="user-reaction">{{ getEmoji(user.reactionType) }}</span>
          </div>

          <div *ngIf="filteredUsers.length === 0" class="no-users">
            No reactions yet
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
    }

    .modal-content {
      background: white;
      border-radius: 12px;
      width: 90%;
      max-width: 500px;
      max-height: 70vh;
      display: flex;
      flex-direction: column;
      box-shadow: 0 8px 32px rgba(0,0,0,0.2);
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      border-bottom: 1px solid #e4e6eb;
    }

    .modal-header h3 {
      margin: 0;
      font-size: 20px;
      font-weight: 700;
    }

    .close-btn {
      border: none;
      background: #f0f2f5;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      font-size: 20px;
      cursor: pointer;
    }

    .close-btn:hover {
      background: #e4e6eb;
    }

    .reaction-tabs {
      display: flex;
      gap: 8px;
      padding: 12px 20px;
      border-bottom: 1px solid #e4e6eb;
      overflow-x: auto;
    }

    .tab {
      border: none;
      background: transparent;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      white-space: nowrap;
    }

    .tab:hover {
      background: #f0f2f5;
    }

    .tab.active {
      background: #e7f3ff;
      color: #1877f2;
    }

    .users-list {
      overflow-y: auto;
      padding: 12px 20px;
      flex: 1;
    }

    .user-item {
      display: flex;
      align-items: center;
      padding: 8px;
      border-radius: 8px;
      cursor: pointer;
    }

    .user-item:hover {
      background: #f0f2f5;
    }

    .user-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      object-fit: cover;
      margin-right: 12px;
    }

    .user-name {
      flex: 1;
      font-weight: 600;
    }

    .user-reaction {
      font-size: 20px;
    }

    .no-users {
      text-align: center;
      padding: 40px 20px;
      color: #65676b;
    }
  `]
})
export class ReactionsModalComponent implements OnInit {
  @Input() users: UserReaction[] = [];
  @Input() reactionSummaries: any[] = [];
  @Output() closeModal = new EventEmitter<void>();

  selectedFilter: ReactionType | 'all' = 'all';
  filteredUsers: UserReaction[] = [];
  totalCount = 0;

  ngOnInit() {
    this.filteredUsers = this.users;
    this.totalCount = this.users.length;
  }

  filterByReaction(reactionType: ReactionType | 'all') {
    this.selectedFilter = reactionType;
    this.filteredUsers = reactionType === 'all' 
      ? this.users 
      : this.users.filter(u => u.reactionType === reactionType);
  }

  getEmoji(reactionType: ReactionType): string {
    return REACTION_EMOJIS[reactionType];
  }

  close() {
    this.closeModal.emit();
  }
}