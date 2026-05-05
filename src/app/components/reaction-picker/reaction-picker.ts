import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactionType, REACTION_EMOJIS } from '../../models/reaction-type.enum';

@Component({
  selector: 'app-reaction-picker',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="reaction-picker">
      <button 
        *ngFor="let reaction of reactions"
        (click)="selectReaction(reaction.type)"
        class="reaction-button"
        [title]="reaction.type">
        <span class="reaction-emoji">{{ reaction.emoji }}</span>
      </button>
    </div>
  `,
  styles: [`
    .reaction-picker {
      display: flex;
      gap: 4px;
      padding: 8px;
      background: white;
      border-radius: 24px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      position: absolute;
      bottom: 100%;
      left: 0;
      margin-bottom: 8px;
      z-index: 1000;
      animation: slideUp 0.2s ease-out;
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .reaction-button {
      border: none;
      background: transparent;
      cursor: pointer;
      padding: 6px;
      border-radius: 50%;
      transition: transform 0.15s, background 0.15s;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .reaction-button:hover {
      background: #f0f2f5;
      transform: scale(1.4);
    }

    .reaction-emoji {
      font-size: 24px;
    }
  `]
})
export class ReactionPickerComponent {
  @Output() reactionSelected = new EventEmitter<ReactionType>();

  reactions = Object.keys(ReactionType).map(key => ({
    type: ReactionType[key as keyof typeof ReactionType],
    emoji: REACTION_EMOJIS[ReactionType[key as keyof typeof ReactionType]]
  }));

  selectReaction(type: ReactionType) {
    this.reactionSelected.emit(type);
  }
}