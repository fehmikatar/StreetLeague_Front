import {
  Component, OnInit, OnDestroy,
  ChangeDetectionStrategy, ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { WebRtcCallService, IncomingCallData } from '../../services/webrtc-call.service';

@Component({
  selector: 'app-incoming-call',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
<div *ngIf="call" class="incoming-wrapper">
  <div class="incoming-card">

    <!-- Pulse avatar -->
    <div class="caller-avatar">
      <div class="pulse-ring"></div>
      <div class="pulse-ring delay"></div>
      <span class="initials">{{ initials }}</span>
    </div>

    <p class="caller-name">{{ call.fromUserName }}</p>
    <p class="call-type-label">
      {{ call.callType === 'video' ? '📹 Incoming video call' : '📞 Incoming audio call' }}
    </p>

    <!-- Actions -->
    <div class="action-row">
      <button class="btn-reject" (click)="reject()">
        <span>📵</span>
        <span>Decline</span>
      </button>
      <button class="btn-accept" (click)="accept()">
        <span>{{ call.callType === 'video' ? '📹' : '📞' }}</span>
        <span>Accept</span>
      </button>
    </div>
  </div>
</div>
  `,
  styles: [`
    .incoming-wrapper {
      position: fixed; bottom: 24px; right: 24px; z-index: 9950;
      animation: slideIn .3s cubic-bezier(.34,1.56,.64,1);
    }
    @keyframes slideIn {
      from { transform: translateY(120px); opacity: 0; }
      to   { transform: translateY(0);     opacity: 1; }
    }

    .incoming-card {
      background: #1a1f2e;
      border: 1px solid rgba(99,102,241,.4);
      border-radius: 20px;
      padding: 24px 28px;
      display: flex; flex-direction: column;
      align-items: center; gap: 10px;
      min-width: 260px;
      box-shadow: 0 24px 48px rgba(0,0,0,.6), 0 0 0 1px rgba(99,102,241,.2);
      backdrop-filter: blur(12px);
    }

    .caller-avatar {
      position: relative;
      width: 80px; height: 80px;
      display: flex; align-items: center; justify-content: center;
      margin-bottom: 4px;
    }
    .pulse-ring {
      position: absolute; inset: 0;
      border-radius: 50%;
      border: 2px solid rgba(99,102,241,.5);
      animation: ripple 1.6s ease-out infinite;
    }
    .pulse-ring.delay { animation-delay: .8s; }
    @keyframes ripple {
      0%   { transform: scale(1);   opacity: .7; }
      100% { transform: scale(1.8); opacity: 0; }
    }
    .initials {
      width: 64px; height: 64px; border-radius: 50%;
      background: linear-gradient(135deg,#6366f1,#8b5cf6);
      display: flex; align-items: center; justify-content: center;
      font-size: 1.5rem; font-weight: 700; color: #fff;
      position: relative; z-index: 1;
    }

    .caller-name {
      font-size: 1.1rem; font-weight: 700; color: #fff; margin: 0;
      text-align: center;
    }
    .call-type-label {
      font-size: .82rem; color: rgba(255,255,255,.55); margin: 0;
    }

    .action-row {
      display: flex; gap: 16px; margin-top: 8px;
    }
    button {
      border: none; cursor: pointer; border-radius: 14px;
      padding: 10px 22px;
      display: flex; align-items: center; gap: 8px;
      font-size: .9rem; font-weight: 600;
      transition: transform .15s, filter .15s;
    }
    button:hover { transform: scale(1.05); filter: brightness(1.1); }
    .btn-reject { background: #dc2626; color: #fff; }
    .btn-accept { background: #22c55e; color: #fff; }
  `]
})
export class IncomingCallComponent implements OnInit, OnDestroy {
  call: IncomingCallData | null = null;
  private subs: Subscription[] = [];
  private ringtoneInterval: any;

  constructor(private rtc: WebRtcCallService, private cdr: ChangeDetectorRef) {}

  get initials(): string {
    return this.call?.fromUserName?.substring(0, 2).toUpperCase() ?? '??';
  }

  ngOnInit(): void {
    this.subs.push(
      this.rtc.incomingCall$.subscribe(data => {
        this.call = data;
        this.cdr.markForCheck();
        this.startRingtone();
      }),
      this.rtc.callState$.subscribe(state => {
        if (state === 'idle' || state === 'connected') {
          this.stopRingtone();
          this.call = null;
          this.cdr.markForCheck();
        }
      })
    );
  }

  async accept(): Promise<void> {
    if (!this.call) return;
    const incoming = this.call;
    this.call = null;
    this.cdr.markForCheck();
    await this.rtc.acceptCall(incoming);
  }

  reject(): void {
    if (!this.call) return;
    this.rtc.rejectCall(this.call);
    this.call = null;
    this.cdr.markForCheck();
  }

  private startRingtone(): void {
    this.stopRingtone(); // Safety
    this.playRingToneStep();
    this.ringtoneInterval = setInterval(() => this.playRingToneStep(), 2000);
  }

  private stopRingtone(): void {
    if (this.ringtoneInterval) {
      clearInterval(this.ringtoneInterval);
      this.ringtoneInterval = null;
    }
  }

  private playRingToneStep(): void {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      if (ctx.state === 'suspended') ctx.resume();
      
      const now = ctx.currentTime;
      
      // Melody: C5, E5, G5, C6 (Arpeggio style)
      const notes = [523.25, 659.25, 783.99, 1046.50];
      
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'sine'; // Softer, more musical sound
        osc.frequency.setValueAtTime(freq, now + i * 0.15);
        
        gain.gain.setValueAtTime(0, now + i * 0.15);
        gain.gain.linearRampToValueAtTime(0.15, now + i * 0.15 + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.15 + 0.6);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(now + i * 0.15);
        osc.stop(now + i * 0.15 + 0.6);
      });
      
      // Close context after melody
      setTimeout(() => ctx.close(), 2500);
    } catch (err) {
      console.warn('Audio context blocked or failed', err);
    }
  }

  ngOnDestroy(): void { 
    this.stopRingtone();
    this.subs.forEach(s => s.unsubscribe()); 
  }
}
