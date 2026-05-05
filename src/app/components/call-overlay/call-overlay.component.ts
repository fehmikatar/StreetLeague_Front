import {
  Component, OnInit, OnDestroy, ChangeDetectionStrategy,
  ChangeDetectorRef, ElementRef, ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { WebRtcCallService, CallState, CallType } from '../../services/webrtc-call.service';

@Component({
  selector: 'app-call-overlay',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
<div *ngIf="visible"
     class="call-overlay"
     [class.audio-only]="callType === 'audio'">

  <!-- Remote video (background) -->
  <video #remoteVideo
         autoplay playsinline
         class="remote-video"
         [class.hidden]="callType === 'audio'">
  </video>

  <!-- Audio-only placeholder -->
  <div *ngIf="callType === 'audio'" class="audio-avatar">
    <div class="avatar-ring">
      <div class="avatar-initials">{{ remoteInitials }}</div>
    </div>
    <p class="remote-name">{{ remoteName }}</p>
    <p class="call-status-text">{{ stateLabel }}</p>
  </div>

  <!-- Local video (PiP) -->
  <video *ngIf="callType === 'video'"
         #localVideo
         autoplay playsinline muted
         class="local-video">
  </video>

  <!-- Dedicated audio element for reliable sound -->
  <audio #remoteAudio autoplay playsinline class="hidden"></audio>

  <!-- Duration -->
  <div class="duration-badge">{{ formatDuration(rtc.callDuration$ | async) }}</div>

  <!-- Controls -->
  <div class="controls-bar">
    <!-- Mute -->
    <button class="ctrl-btn" [class.active]="isMuted" (click)="toggleMute()" title="Mute">
      <span>{{ isMuted ? '🔇' : '🎙️' }}</span>
    </button>

    <!-- Camera (video only) -->
    <button *ngIf="callType === 'video'"
            class="ctrl-btn" [class.active]="isCameraOff"
            (click)="toggleCamera()" title="Camera">
      <span>{{ isCameraOff ? '📷' : '📹' }}</span>
    </button>

    <!-- Hang up -->
    <button class="ctrl-btn hangup" (click)="hangUp()" title="End call">
      <span>📵</span>
    </button>
  </div>
</div>
  `,
  styles: [`
    .call-overlay {
      position: fixed; inset: 0; z-index: 9900;
      background: #0d1117;
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      animation: fadeIn .25s ease;
    }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

    .remote-video {
      position: absolute; inset: 0;
      width: 100%; height: 100%;
      object-fit: cover; opacity: .95;
    }

    .audio-avatar {
      display: flex; flex-direction: column;
      align-items: center; gap: 16px; z-index: 1;
    }
    .avatar-ring {
      width: 140px; height: 140px; border-radius: 50%;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 0 0 12px rgba(99,102,241,.2), 0 0 0 24px rgba(99,102,241,.1);
      animation: pulse 2s ease-in-out infinite;
    }
    @keyframes pulse {
      0%, 100% { box-shadow: 0 0 0 12px rgba(99,102,241,.2), 0 0 0 24px rgba(99,102,241,.1); }
      50%       { box-shadow: 0 0 0 16px rgba(99,102,241,.3), 0 0 0 32px rgba(99,102,241,.1); }
    }
    .avatar-initials {
      font-size: 3rem; font-weight: 700; color: #fff;
    }
    .remote-name { color: #fff; font-size: 1.5rem; font-weight: 600; margin: 0; }
    .call-status-text { color: rgba(255,255,255,.6); font-size: .9rem; margin: 0; }

    .local-video {
      position: absolute; bottom: 90px; right: 16px;
      width: 140px; height: 105px; object-fit: cover;
      border-radius: 12px; border: 2px solid rgba(255,255,255,.25);
      z-index: 2; background: #1a1f2e;
    }

    .duration-badge {
      position: absolute; top: 16px;
      background: rgba(255,255,255,.1);
      color: #fff; font-size: .85rem; font-weight: 600;
      padding: 4px 14px; border-radius: 999px;
      backdrop-filter: blur(8px); z-index: 3;
    }

    .controls-bar {
      position: absolute; bottom: 32px;
      display: flex; gap: 16px; z-index: 3;
    }
    .ctrl-btn {
      width: 60px; height: 60px; border-radius: 50%; border: none;
      background: rgba(255,255,255,.15); cursor: pointer;
      font-size: 1.6rem; display: flex; align-items: center; justify-content: center;
      transition: background .2s, transform .15s;
      backdrop-filter: blur(8px);
    }
    .ctrl-btn:hover { background: rgba(255,255,255,.25); transform: scale(1.08); }
    .ctrl-btn.active { background: rgba(239,68,68,.35); }
    .ctrl-btn.hangup { background: #dc2626; }
    .ctrl-btn.hangup:hover { background: #b91c1c; }
  `]
})
export class CallOverlayComponent implements OnInit, OnDestroy {
  @ViewChild('remoteVideo')
  set remoteVideoRef(ref: ElementRef<HTMLVideoElement> | undefined) {
    this.remoteVideoEl = ref?.nativeElement;
    this.syncMediaElements();
  }

  @ViewChild('localVideo')
  set localVideoRef(ref: ElementRef<HTMLVideoElement> | undefined) {
    this.localVideoEl = ref?.nativeElement;
    this.syncMediaElements();
  }

  @ViewChild('remoteAudio')
  set remoteAudioRef(ref: ElementRef<HTMLAudioElement> | undefined) {
    this.remoteAudioEl = ref?.nativeElement;
    this.syncMediaElements();
  }

  visible = false;
  callType: CallType = 'audio';
  isMuted = false;
  isCameraOff = false;
  duration = 0;
  callState: CallState = 'idle';
  remoteName = '';

  private subs: Subscription[] = [];
  private remoteVideoEl?: HTMLVideoElement;
  private localVideoEl?: HTMLVideoElement;
  private remoteAudioEl?: HTMLAudioElement;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;

  constructor(public rtc: WebRtcCallService, private cdr: ChangeDetectorRef) {}

  get visible_(): boolean {
    return ['calling', 'ringing', 'connected'].includes(this.callState);
  }

  get remoteInitials(): string {
    return this.remoteName ? this.remoteName.substring(0, 2).toUpperCase() : '??';
  }

  get stateLabel(): string {
    if (this.callState === 'calling') return 'Calling…';
    if (this.callState === 'ringing') return 'Incoming…';
    if (this.callState === 'connected') return 'Connected';
    return '';
  }

  formatDuration(value: number | null): string {
    const totalSeconds = value || 0;
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  get durationLabel(): string {
    return this.formatDuration(this.duration);
  }

  ngOnInit(): void {
    this.subs.push(
      this.rtc.callState$.subscribe(state => {
        this.callState = state;
        this.visible = ['calling', 'connected'].includes(state);
        this.cdr.markForCheck();
      }),
      this.rtc.callType$.subscribe(type => {
        this.callType = type;
        this.cdr.markForCheck();
      }),
      this.rtc.isMuted$.subscribe(v => { this.isMuted = v; this.cdr.markForCheck(); }),
      this.rtc.isCameraOff$.subscribe(v => { this.isCameraOff = v; this.cdr.markForCheck(); }),
      this.rtc.callDuration$.subscribe(v => { this.duration = v; this.cdr.markForCheck(); }),
      this.rtc.remoteParticipant$.subscribe(p => { 
        this.remoteName = p?.userName || 'Team Member'; 
        this.cdr.markForCheck(); 
      }),
      this.rtc.remoteStream$.subscribe(stream => {
        this.remoteStream = stream;
        this.syncMediaElements();
        this.cdr.markForCheck();
      }),
      this.rtc.localStream$.subscribe(stream => {
        this.localStream = stream;
        this.syncMediaElements();
        this.cdr.markForCheck();
      })
    );
  }

  toggleMute(): void { this.rtc.toggleMute(); }
  toggleCamera(): void { this.rtc.toggleCamera(); }
  hangUp(): void { this.rtc.endCall(); }

  private syncMediaElements(): void {
    this.attachStream(this.remoteVideoEl, this.remoteStream);
    this.attachStream(this.remoteAudioEl, this.remoteStream);
    this.attachStream(this.localVideoEl, this.localStream);
  }

  private attachStream(element: HTMLMediaElement | undefined, stream: MediaStream | null): void {
    if (!element) {
      return;
    }

    if (element.srcObject !== stream) {
      element.srcObject = stream;
    }

    if (stream) {
      void element.play().catch(() => undefined);
    }
  }

  ngOnDestroy(): void { this.subs.forEach(s => s.unsubscribe()); }
}
