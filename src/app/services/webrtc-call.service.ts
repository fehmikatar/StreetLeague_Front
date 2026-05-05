import { Injectable, OnDestroy, NgZone } from '@angular/core';
import { BehaviorSubject, Subject, Subscription, filter, firstValueFrom, take, timeout } from 'rxjs';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { environment } from '../../environments/environment';

export type CallState = 'idle' | 'calling' | 'ringing' | 'connected' | 'ended';
export type CallType = 'audio' | 'video';

export interface CallParticipant {
  userId: string;
  userName: string;
  avatarUrl?: string;
}

export interface IncomingCallData {
  fromUserId: string;
  fromUserName: string;
  callType: CallType;
  roomId: string;
}

/** ICE/STUN servers — public Google STUN, sufficient for LAN/demo */
const ICE_SERVERS: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
];

@Injectable({ providedIn: 'root' })
export class WebRtcCallService implements OnDestroy {
  // ── State ─────────────────────────────────────────────────────────────────
  private readonly _callState = new BehaviorSubject<CallState>('idle');
  readonly callState$ = this._callState.asObservable();

  private readonly _callType = new BehaviorSubject<CallType>('audio');
  readonly callType$ = this._callType.asObservable();

  private readonly _signalingConnected = new BehaviorSubject<boolean>(false);
  readonly signalingConnected$ = this._signalingConnected.asObservable();

  private readonly _incomingCall = new Subject<IncomingCallData>();
  readonly incomingCall$ = this._incomingCall.asObservable();

  private readonly _remoteStream = new BehaviorSubject<MediaStream | null>(null);
  readonly remoteStream$ = this._remoteStream.asObservable();

  private readonly _localStream = new BehaviorSubject<MediaStream | null>(null);
  readonly localStream$ = this._localStream.asObservable();

  private readonly _remoteParticipant = new BehaviorSubject<CallParticipant | null>(null);
  readonly remoteParticipant$ = this._remoteParticipant.asObservable();

  private readonly _callDuration = new BehaviorSubject<number>(0);
  readonly callDuration$ = this._callDuration.asObservable();

  private readonly _isMuted = new BehaviorSubject<boolean>(false);
  readonly isMuted$ = this._isMuted.asObservable();

  private readonly _isCameraOff = new BehaviorSubject<boolean>(false);
  readonly isCameraOff$ = this._isCameraOff.asObservable();

  // ── Private ───────────────────────────────────────────────────────────────
  private stompClient: Client | null = null;
  private callSubscription: StompSubscription | null = null;
  private pc: RTCPeerConnection | null = null;
  private localMedia: MediaStream | null = null;
  private durationTimer: ReturnType<typeof setInterval> | null = null;
  private currentCallType: CallType = 'audio';
  private myUserId = '';
  private myUserName = '';
  private remoteUserId = '';
  private currentRoomId = '';
  /** true = we initiated the call */
  private isCaller = false;
  /** ICE candidates queued before remote description is set */
  private pendingIceCandidates: RTCIceCandidateInit[] = [];
  /** SDP offer queued until the callee explicitly accepts the call */
  private pendingOffer: RTCSessionDescriptionInit | null = null;

  // ─────────────────────────────────────────────────────────────────────────

  constructor(private ngZone: NgZone) { }

  isSignalingConnected(): boolean {
    return this._signalingConnected.value;
  }

  /** Must be called once on app init (or from ChatService) */
  init(stompClient: Client, userId: string, userName: string): void {
    this.myUserId = String(userId);
    this.myUserName = userName;
    this.syncCurrentUserContext();
    this.stompClient = stompClient;
    this._signalingConnected.next(stompClient.connected);
    this.subscribeToCallQueue();
  }

  /** Connect a new STOMP client if not already sharing one with ChatService */
  connectOwnStomp(userId: string, userName: string, existingClient?: Client | null): void {
    this.myUserId = String(userId);
    this.myUserName = userName;
    this.syncCurrentUserContext();

    if (existingClient) {
      if (this.stompClient && this.stompClient !== existingClient && this.stompClient.active) {
        console.log('[WebRTC] Deactivating previous standalone STOMP client to use shared one');
        this.stompClient.deactivate();
      }
      console.log('[WebRTC] Using shared STOMP client from ChatService');
      this.stompClient = existingClient;
      this.subscribeToCallQueue();
      this._signalingConnected.next(true);
      return;
    }

    if (this.stompClient?.active) {
      this._signalingConnected.next(this.stompClient.connected);
      this.subscribeToCallQueue();
      return;
    }
    const token = localStorage.getItem('auth_token') || '';
    const wsBase = environment.wsUrl || 'http://localhost:8085';
    this.stompClient = new Client({
      webSocketFactory: () => new SockJS(`${wsBase}/ws`),
      connectHeaders: { username: userName, ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      reconnectDelay: 5000,
      onConnect: () => {
        this._signalingConnected.next(true);
        this.subscribeToCallQueue();
      },
      onDisconnect: () => {
        this._signalingConnected.next(false);
      },
      onWebSocketClose: () => {
        this._signalingConnected.next(false);
      },
      onWebSocketError: () => {
        this._signalingConnected.next(false);
      },
      onStompError: () => {
        this._signalingConnected.next(false);
      },
    });
    this.stompClient.activate();
  }

  // ── Initiate call ─────────────────────────────────────────────────────────

  async startCall(toUser: CallParticipant, callType: CallType, roomId: string): Promise<void> {
    if (this._callState.value !== 'idle') return;
    this.syncCurrentUserContext();
    await this.ensureSignalingConnection();
    this.isCaller = true;
    this.remoteUserId = toUser.userId;
    this.currentCallType = callType;
    this._callType.next(callType);
    this.currentRoomId = roomId;

    this._callState.next('calling');
    this._remoteParticipant.next(toUser);

    // Acquire local media
    await this.acquireLocalMedia(callType);

    // Send invite
    this.publish('/app/call.invite', {
      toUserId: toUser.userId,
      fromUserId: this.myUserId,
      fromUserName: this.myUserName,
      callType,
      roomId,
    });

    await this.createPeerConnection();
  }

  // ── Accept / Reject ───────────────────────────────────────────────────────

  async acceptCall(incoming: IncomingCallData): Promise<void> {
    this.syncCurrentUserContext();
    this.isCaller = false;
    this.remoteUserId = incoming.fromUserId;
    this.currentCallType = incoming.callType;
    this._callType.next(incoming.callType);
    this.currentRoomId = incoming.roomId;

    this._callState.next('connected');
    this._remoteParticipant.next({
      userId: incoming.fromUserId,
      userName: incoming.fromUserName
    });
    await this.acquireLocalMedia(incoming.callType);

    if (this.pendingOffer) {
      await this.handleRemoteOffer(this.pendingOffer);
      this.pendingOffer = null;
      return;
    }

    await this.createPeerConnection();
  }

  rejectCall(incoming: IncomingCallData): void {
    this.syncCurrentUserContext();
    this.publish('/app/call.reject', {
      toUserId: incoming.fromUserId,
      fromUserId: this.myUserId,
      fromUserName: this.myUserName,
      roomId: incoming.roomId,
    });
  }

  // ── End call ──────────────────────────────────────────────────────────────

  endCall(): void {
    this.syncCurrentUserContext();
    if (this.remoteUserId) {
      this.publish('/app/call.end', {
        toUserId: this.remoteUserId,
        fromUserId: this.myUserId,
        roomId: this.currentRoomId,
      });
    }
    this.cleanup();
  }

  // ── Controls ──────────────────────────────────────────────────────────────

  toggleMute(): void {
    const track = this.localMedia?.getAudioTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      this._isMuted.next(!track.enabled);
    }
  }

  toggleCamera(): void {
    const track = this.localMedia?.getVideoTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      this._isCameraOff.next(!track.enabled);
    }
  }

  // ── Private: media ────────────────────────────────────────────────────────

  private async acquireLocalMedia(callType: CallType): Promise<void> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: callType === 'video',
      });
      this.localMedia = stream;
      this._localStream.next(stream);
    } catch (err: any) {
      console.error('[WebRTC] getUserMedia failed', err);
      this.cleanup();
      
      let message = 'Could not access media devices.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        message = 'Access to microphone/camera was denied. Please check your browser permissions.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        message = 'Microphone or camera not found. Please ensure they are connected.';
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        message = 'Microphone or camera is already in use by another application.';
      }
      
      throw new Error(message);
    }
  }

  private async createPeerConnection(): Promise<void> {
    if (this.pc) {
      return;
    }

    this.pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });

    // Add local tracks
    this.localMedia?.getTracks().forEach(t => this.pc!.addTrack(t, this.localMedia!));

    // Remote track → remoteStream$
    this.pc.ontrack = (e) => {
      console.log('[WebRTC] Received remote track:', e.track.kind);
      const [stream] = e.streams;
      this._remoteStream.next(stream);
    };

    // ICE candidates → send to remote
    this.pc.onicecandidate = (e) => {
      if (e.candidate) {
        this.publish('/app/call.ice', {
          toUserId: this.remoteUserId,
          fromUserId: this.myUserId,
          candidate: e.candidate.toJSON(),
          roomId: this.currentRoomId,
        });
      }
    };

    this.pc.onconnectionstatechange = () => {
      console.log('[WebRTC] Connection state:', this.pc?.connectionState);
      if (this.pc?.connectionState === 'connected') {
        this._callState.next('connected');
        this.startDurationTimer();
      } else if (['disconnected', 'failed', 'closed'].includes(this.pc?.connectionState ?? '')) {
        this.cleanup();
      }
    };

    if (this.isCaller) {
      // Create offer
      const offer = await this.pc.createOffer();
      await this.pc.setLocalDescription(offer);
      this.publish('/app/call.offer', {
        toUserId: this.remoteUserId,
        fromUserId: this.myUserId,
        sdp: offer,
        roomId: this.currentRoomId,
      });
    }

    // Flush queued ICE candidates
    for (const c of this.pendingIceCandidates) {
      await this.pc.addIceCandidate(new RTCIceCandidate(c));
    }
    this.pendingIceCandidates = [];
  }

  private async handleRemoteOffer(offer: RTCSessionDescriptionInit): Promise<void> {
    await this.createPeerConnection();
    if (!this.pc) {
      return;
    }

    await this.pc.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await this.pc.createAnswer();
    await this.pc.setLocalDescription(answer);
    this.publish('/app/call.answer', {
      toUserId: this.remoteUserId,
      fromUserId: this.myUserId,
      sdp: answer,
      roomId: this.currentRoomId,
    });
    this.startDurationTimer();
  }

  // ── Private: signaling ────────────────────────────────────────────────────

  private subscribeToCallQueue(): void {
    if (!this.stompClient?.connected) return;
    this.callSubscription?.unsubscribe();
    this.callSubscription = this.stompClient.subscribe('/user/queue/call', (msg: IMessage) => {
      this.handleSignal(JSON.parse(msg.body));
    });
  }

  private async ensureSignalingConnection(): Promise<void> {
    this.syncCurrentUserContext();

    if (this.stompClient?.connected) {
      return;
    }

    if (!this.myUserId) {
      throw new Error('Missing authenticated user context for the call service.');
    }

    this.connectOwnStomp(this.myUserId, this.myUserName || 'Member');

    try {
      await firstValueFrom(
        this.signalingConnected$.pipe(
          filter(Boolean),
          take(1),
          timeout(7000)
        )
      );
    } catch {
      throw new Error('The call service could not connect to the server.');
    }
  }

  private async handleSignal(msg: any): Promise<void> {
    const type: string = msg.type;

    switch (type) {
      case 'CALL_INVITE':
        if (this._callState.value === 'idle') {
          // If it's from me, ignore
          if (String(msg.fromUserId || msg.senderId) === this.myUserId) return;

          this._incomingCall.next({
            fromUserId: String(msg.fromUserId || msg.senderId),
            fromUserName: msg.fromUserName || msg.senderName || 'Team Member',
            callType: (msg.callType || 'audio').toLowerCase() as CallType,
            roomId: msg.roomId || '',
          });
          this._remoteParticipant.next({
            userId: String(msg.fromUserId || msg.senderId),
            userName: msg.fromUserName || msg.senderName || 'Team Member'
          });
          this._callState.next('ringing');
        }
        break;

      case 'CALL_OFFER':
        if (!this.isCaller) {
          this.pendingOffer = msg.sdp;
          if (this._callState.value === 'connected' || !!this.localMedia) {
            await this.handleRemoteOffer(msg.sdp);
            this.pendingOffer = null;
          }
        }
        break;

      case 'CALL_ANSWER':
        if (this.isCaller && this.pc) {
          await this.pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
          this._callState.next('connected');
          this.startDurationTimer();
        }
        break;

      case 'CALL_ICE':
        if (this.pc?.remoteDescription) {
          await this.pc.addIceCandidate(new RTCIceCandidate(msg.candidate));
        } else {
          this.pendingIceCandidates.push(msg.candidate);
        }
        break;

      case 'CALL_END':
      case 'CALL_REJECT':
        this.cleanup();
        break;
    }
  }

  // ── Private: helpers ──────────────────────────────────────────────────────

  private publish(destination: string, body: object): void {
    if (!this.stompClient?.connected) return;
    this.stompClient.publish({ destination, body: JSON.stringify(body) });
  }

  private syncCurrentUserContext(): void {
    const storedUserId = localStorage.getItem('user_id');
    const storedUserName = localStorage.getItem('user_name') || localStorage.getItem('user_email');

    if (storedUserId && storedUserId.trim().length > 0) {
      this.myUserId = storedUserId.trim();
    }

    if (storedUserName && storedUserName.trim().length > 0) {
      this.myUserName = storedUserName.trim();
    }
  }

  private startDurationTimer(): void {
    if (this.durationTimer) {
      clearInterval(this.durationTimer);
    }
    console.log('[WebRTC] Starting duration timer...');
    this._callDuration.next(0);
    let seconds = 0;
    this.ngZone.runOutsideAngular(() => {
      this.durationTimer = setInterval(() => {
        this.ngZone.run(() => {
          seconds++;
          this._callDuration.next(seconds);
        });
      }, 1000);
    });
  }

  private cleanup(): void {
    // Stop timer
    if (this.durationTimer) { clearInterval(this.durationTimer); this.durationTimer = null; }

    // Stop local tracks
    this.localMedia?.getTracks().forEach(t => t.stop());
    this.localMedia = null;

    // Close peer connection
    this.pc?.close();
    this.pc = null;

    // Reset state
    this._localStream.next(null);
    this._remoteStream.next(null);
    this._callDuration.next(0);
    this._isMuted.next(false);
    this._isCameraOff.next(false);
    this._callState.next('idle');
    this._callType.next('audio');
    this._remoteParticipant.next(null);
    this.pendingIceCandidates = [];
    this.pendingOffer = null;
    this.remoteUserId = '';
    this.currentRoomId = '';
    this.isCaller = false;
  }

  ngOnDestroy(): void {
    this.endCall();
    this.callSubscription?.unsubscribe();
  }
}
