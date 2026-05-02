import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { LucideAngularModule, ArrowLeft, Loader2, Send, Wifi, WifiOff, Users, MessagesSquare, Clock3, ChevronsUp } from 'lucide-angular';
import { ChatHistoryMessage, ChatHistoryPage, ChatService, TeamChatMessage } from '../services/chat.service';
import { Team, TeamService } from '../services/team.service';
import { environment } from '../../environments/environment';

interface TeamChatUiMessage {
  id: string;
  type: string;
  senderName: string;
  content: string;
  timestamp: string;
  mine: boolean;
}

@Component({
  selector: 'app-team-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, LucideAngularModule],
  template: `
    <div class="min-h-screen bg-background p-4 md:p-6">
      <div class="mx-auto flex max-w-5xl flex-col gap-4">
        <button (click)="goBack()" class="inline-flex w-fit items-center gap-2 rounded-xl bg-muted px-3 py-2 text-sm hover:bg-muted/70 transition-colors">
          <lucide-icon [name]="ArrowLeftIcon" [size]="16"></lucide-icon>
          Back to team details
        </button>

<!-- Skeleton UI - Plus fluide, pas de spinner -->
<div *ngIf="!team && !errorBanner" class="grid gap-4 animate-pulse">
  <div class="h-24 rounded-2xl bg-muted/20"></div>
  <div class="h-96 rounded-2xl bg-muted/20"></div>
</div>

        <div *ngIf="errorBanner && !loading" class="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-300">
          {{ errorBanner }}
        </div>

        <div *ngIf="!loading && !errorBanner" class="grid gap-4">
          <section class="rounded-2xl border border-border bg-card p-4 md:p-6">
            <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 class="text-2xl font-bold">{{ team?.name || ('Team #' + teamId) }} Chatroom</h1>
                <p class="text-sm text-muted-foreground">Only approved team members can access this room.</p>
              </div>

              <div class="flex items-center gap-2 text-xs font-semibold">
                <span class="inline-flex items-center gap-1 rounded-full px-2.5 py-1"
                      [ngClass]="connected ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300' : 'bg-red-500/15 text-red-700 dark:text-red-300'">
                  <lucide-icon [name]="connected ? WifiIcon : WifiOffIcon" [size]="13"></lucide-icon>
                  {{ connected ? 'Connected' : 'Disconnected' }}
                </span>
                <span class="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-muted-foreground">
                  <lucide-icon [name]="UsersIcon" [size]="13"></lucide-icon>
                  {{ onlineMembersCount || team?.members?.length || 0 }} online
                </span>
                <span *ngIf="typingUsers.length > 0" class="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-1 text-amber-700 dark:text-amber-300">
                  <lucide-icon [name]="MessagesSquareIcon" [size]="13"></lucide-icon>
                  {{ typingUsers.join(', ') }} typing...
                </span>
                <span *ngIf="unreadCount > 0" class="inline-flex items-center gap-1 rounded-full bg-blue-500/15 px-2.5 py-1 text-blue-700 dark:text-blue-300">
                  {{ unreadCount }} new
                </span>
              </div>
            </div>
          </section>

          <section class="rounded-2xl border border-border bg-card overflow-hidden relative">
            <div class="border-b border-border px-4 py-3 text-xs text-muted-foreground">
              Messages are broadcast in real time to connected members of this team.
            </div>

            <div class="h-[52vh] overflow-y-auto p-4 space-y-3" #chatScrollContainer (scroll)="onScrollMessages()">
              <button *ngIf="hasMoreHistory && !loadingHistory" (click)="loadOlderMessages()" class="mx-auto mb-2 inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-muted/70">
                <lucide-icon [name]="ChevronsUpIcon" [size]="13"></lucide-icon>
                Load older messages
              </button>

              <div *ngIf="loadingHistory" class="flex items-center justify-center gap-2 py-2 text-xs text-muted-foreground">
                <lucide-icon [name]="Clock3Icon" [size]="13"></lucide-icon>
                Loading history...
              </div>

              <div *ngIf="messages.length === 0" class="rounded-xl border border-dashed border-border bg-muted/20 p-4 text-sm text-muted-foreground">
                No messages yet. Start the conversation.
              </div>

<div *ngFor="let message of messages"
     class="rounded-xl border px-3 py-2"
     [ngClass]="message.mine ? 'ml-auto max-w-[85%] border-primary/30 bg-primary/10' : 'mr-auto max-w-[85%] border-border bg-muted/20'">
  
  <!-- En-tête du message -->
  <div class="mb-1 flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
    <span class="font-semibold">{{ message.senderName }}</span>
    <span>{{ message.timestamp | date:'shortTime' }}</span>
  </div>
  
<!-- 🖼️ Image -->
<div *ngIf="isImageUrl(message.content)" class="text-sm">
  <img [src]="getFullUrl(message.content)" 
       [alt]="'Image from ' + message.senderName" 
       class="max-w-full max-h-96 rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
       (click)="openImageFullscreen(getFullUrl(message.content))"
       (error)="onImageError($event)">
</div>

<!-- 🎵 Audio -->
<div *ngIf="isAudioUrl(message.content)" class="text-sm">
  <div class="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
    <span class="text-lg">🎤</span>
    <audio controls class="flex-1 h-8">
      <source [src]="getFullUrl(message.content)" type="audio/webm">
      <source [src]="getFullUrl(message.content)" type="audio/mpeg">
      Your browser does not support audio playback.
    </audio>
  </div>
</div>

<!-- 📎 Fichier -->
<div *ngIf="isFileUrl(message.content) && !isImageUrl(message.content) && !isAudioUrl(message.content)" class="text-sm">
  <a [href]="getFullUrl(message.content)" 
     target="_blank" 
     download 
     class="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors">
    <span class="text-lg">📎</span>
    <span class="flex-1 truncate">{{ getFilenameFromUrl(message.content) }}</span>
    <span class="text-xs text-muted-foreground">Download</span>
  </a>
</div>
  
  <!-- 💬 Message texte normal -->
  <div *ngIf="!isFileUrl(message.content)" class="text-sm whitespace-pre-wrap">
    {{ message.content }}
  </div>
</div>
            </div>

            <button
              *ngIf="unreadCount > 0"
              (click)="openUnreadMessages()"
              class="absolute bottom-[74px] left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-lg hover:bg-primary/90"
            >
              {{ unreadCount }} new message{{ unreadCount > 1 ? 's' : '' }}
            </button>

            <div *ngIf="typingUsers.length > 0" class="absolute bottom-[114px] left-4 right-4">
              <div class="mx-auto w-fit rounded-full border border-border bg-card/95 px-3 py-1.5 text-xs text-muted-foreground shadow-lg backdrop-blur">
                {{ typingUsers.join(', ') }} typing...
              </div>
            </div>

<div class="border-t border-border p-3">
  <div class="flex items-end gap-2">
    <!-- 📎 Boutons d'attachement -->
    <div class="flex gap-1">
      <!-- 📷 Photo/Image -->
      <input type="file" #fileInput accept="image/*" (change)="onFileSelected($event, 'IMAGE')" class="hidden">
      <button
        (click)="fileInput.click()"
        [disabled]="!connected || sending || uploadingFile"
        class="inline-flex h-[46px] w-[46px] items-center justify-center rounded-xl border border-border bg-muted hover:bg-muted/70 transition-colors disabled:opacity-60"
        title="Attach image"
      >
        📷
      </button>

      <!-- 📎 Fichier -->
      <input type="file" #documentInput (change)="onFileSelected($event, 'FILE')" class="hidden">
      <button
        (click)="documentInput.click()"
        [disabled]="!connected || sending || uploadingFile"
        class="inline-flex h-[46px] w-[46px] items-center justify-center rounded-xl border border-border bg-muted hover:bg-muted/70 transition-colors disabled:opacity-60"
        title="Attach file"
      >
        📎
      </button>

      <!-- 🎤 Audio -->
      <button
        (click)="toggleVoiceRecording()"
        [disabled]="!connected || sending || uploadingFile"
        class="inline-flex h-[46px] w-[46px] items-center justify-center rounded-xl border border-border transition-colors disabled:opacity-60"
        [ngClass]="isRecording ? 'bg-red-500/20 border-red-500/50 hover:bg-red-500/30' : 'bg-muted hover:bg-muted/70'"
        title="Record voice message"
      >
        {{ isRecording ? '⏹️' : '🎤' }}
      </button>
    </div>

    <!-- ✍️ Zone de texte -->
    <textarea
      [(ngModel)]="draftMessage"
      (ngModelChange)="onDraftChanged()"
      (keydown.enter)="handleEnter($any($event))"
      rows="2"
      placeholder="Write a message"
      [disabled]="!connected || sending || uploadingFile"
      class="min-h-[46px] flex-1 resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60"
    ></textarea>

    <!-- 📤 Bouton d'envoi -->
    <button
      (click)="sendMessage()"
      [disabled]="!canSendMessage && !uploadingFile"
      class="inline-flex h-[46px] items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
    >
      <lucide-icon [name]="uploadingFile ? Loader2Icon : SendIcon" [size]="14" [class.animate-spin]="uploadingFile"></lucide-icon>
      {{ uploadingFile ? 'Uploading...' : 'Send' }}
    </button>
  </div>

  <!-- 📋 Preview de fichier sélectionné -->
  <div *ngIf="selectedFile" class="mt-2 flex items-center gap-2 rounded-xl border border-border bg-muted/20 px-3 py-2 text-sm">
    <span class="flex-1 truncate">{{ selectedFile.name }} ({{ formatFileSize(selectedFile.size) }})</span>
    <button (click)="cancelFileSelection()" class="text-red-500 hover:text-red-700 font-bold">✕</button>
  </div>

  <!-- ⏺️ Indicateur d'enregistrement vocal -->
  <div *ngIf="isRecording" class="mt-2 flex items-center gap-2 rounded-xl border border-red-500/50 bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-300">
    <span class="flex h-2 w-2">
      <span class="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-red-400 opacity-75"></span>
      <span class="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
    </span>
    <span class="flex-1">Recording voice message...</span>
    <button (click)="stopRecording()" class="font-semibold hover:underline">Stop & Send</button>
  </div>
</div>
          </section>
        </div>
      </div>
    </div>
  `
})
export class TeamChatComponent implements OnInit, OnDestroy {
  readonly ArrowLeftIcon = ArrowLeft;
  readonly Loader2Icon = Loader2;
  readonly SendIcon = Send;
  readonly WifiIcon = Wifi;
  readonly WifiOffIcon = WifiOff;
  readonly UsersIcon = Users;
  readonly MessagesSquareIcon = MessagesSquare;
  readonly Clock3Icon = Clock3;
  readonly ChevronsUpIcon = ChevronsUp;

  loading = true;
  connected = false;
  sending = false;
  errorBanner: string | null = null;
  loadingHistory = false;

  teamId = 0;
  roomId = '';
  team: Team | null = null;
  currentUserId: number | null = null;
  currentUserName = 'Member';
  draftMessage = '';
  unreadCount = 0;
  onlineMembersCount = 0;
  typingUsers: string[] = [];
  hasMoreHistory = true;
  private historyCursor: number | string | null = null;
  uploadingFile = false;
  selectedFile: File | null = null;
  isRecording = false;
  mediaRecorder: MediaRecorder | null = null;
  audioChunks: Blob[] = [];

  messages: TeamChatUiMessage[] = [];
  @ViewChild('chatScrollContainer') private chatScrollContainer?: ElementRef<HTMLDivElement>;

  private readonly subscriptions: Subscription[] = [];
  private windowFocused = true;
  private typingStopHandle: ReturnType<typeof setTimeout> | null = null;
  private readonly knownMessageIds = new Set<string>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private teamService: TeamService,
    private chatService: ChatService
  ) { }

  get canSendMessage(): boolean {
    return this.connected && !this.sending && this.draftMessage.trim().length > 0;
  }

  ngOnInit(): void {
    this.teamId = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isFinite(this.teamId) || this.teamId <= 0) {
      this.errorBanner = 'Invalid team id.';
      return;
    }

    this.roomId = `team_${this.teamId}`;
    this.currentUserId = this.parseCurrentUserId();
    this.currentUserName = this.getCurrentUserName();

    this.loading = false;  // ✅ AJOUTEZ CETTE LIGNE - Désactivez le loading dès le début
    this.loadTeamAndConnect();
  }

  ngOnDestroy(): void {
    if (this.typingStopHandle) {
      clearTimeout(this.typingStopHandle);
      this.typingStopHandle = null;
    }

    this.chatService.leaveRoom();
    this.chatService.disconnect();
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  @HostListener('window:focus')
  onWindowFocus(): void {
    this.windowFocused = true;
    if (this.isNearBottom()) {
      this.resetUnreadCount();
    }
  }

  @HostListener('window:blur')
  onWindowBlur(): void {
    this.windowFocused = false;
  }

  goBack(): void {
    this.router.navigate(['/app/team', this.teamId]);
  }

  handleEnter(event: KeyboardEvent): void {
    if (!event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

 sendMessage(): void {
  const content = this.draftMessage.trim();
  if (!content || !this.connected) {
    return;
  }

  this.sending = true;
  this.stopTyping();
  
  // ✅ Envoyer via WebSocket
  this.chatService.sendTeamMessage(this.teamId, content);

  // ❌ SUPPRIMEZ le pushUiMessage local
  // Le message reviendra via WebSocket

  this.draftMessage = '';
  this.sending = false;
  // scrollToBottomSoon sera fait quand le message arrive
  this.chatService.markRoomRead(this.roomId).subscribe({ error: () => {} });
}

  loadOlderMessages(): void {
    if (!this.roomId || this.loadingHistory || !this.hasMoreHistory) {
      return;
    }

    const oldestId = this.historyCursor ?? this.getOldestMessageId();
    if (!oldestId) {
      this.hasMoreHistory = false;
      return;
    }

    this.loadingHistory = true;
    this.chatService.fetchRoomMessages(this.roomId, 30, oldestId).subscribe({
      next: (page) => {
        this.mergeHistoryPage(page, true);
        this.loadingHistory = false;
      },
      error: () => {
        this.loadingHistory = false;
      }
    });
  }

  onScrollMessages(): void {
    if (this.isNearBottom()) {
      this.resetUnreadCount();
      this.chatService.markRoomRead(this.roomId).subscribe({ error: () => { } });
    }
  }

  onDraftChanged(): void {
    if (!this.connected) {
      return;
    }

    const content = this.draftMessage.trim();
    this.chatService.sendTeamTyping(this.teamId, content.length > 0);

    if (this.typingStopHandle) {
      clearTimeout(this.typingStopHandle);
    }

    this.typingStopHandle = setTimeout(() => this.stopTyping(), 1200);
  }

  openUnreadMessages(): void {
    this.scrollToBottomSoon();
    this.resetUnreadCount();
  }

  private loadTeamAndConnect(): void {
    // ✅ Pas de loading = true
    this.errorBanner = null;

    this.teamService.getTeamMembers(this.teamId).subscribe({
      next: (members) => {
        this.team = { id: this.teamId, members } as Team;

        if (!this.isCurrentUserTeamMember(this.team)) {
          this.errorBanner = 'Only approved team members can access this chatroom.';
          return;
        }

        this.connectAndJoinRoom();
      },
      error: () => {
        this.errorBanner = 'Unable to load this team chatroom right now.';
      }
    });
  }

  private connectAndJoinRoom(): void {
    // 🔌 Gestion de la connexion WebSocket avec auto-reconnect
    const connectedSub = this.chatService.connected$.subscribe((connected) => {
      this.connected = connected;

      if (connected) {
        // ✅ Connecté - Rejoindre la room
        this.chatService.joinTeamRoom(this.teamId);
      } else {
        // ⚠️ Déconnecté - Tentative de reconnexion après 3 secondes
        setTimeout(() => {
          if (!this.connected && this.team) {
            console.log('🔄 Attempting to reconnect...');
            this.chatService.connect(this.currentUserName);
          }
        }, 3000);
      }
    });

    // 💬 Réception des messages en temps réel
    const messagesSub = this.chatService.roomMessages$.subscribe((message) => {
      const wasNearBottom = this.isNearBottom();
      const uiMessage = this.mapIncomingMessage(message);
      if (!uiMessage) {
        return;
      }

      if (!this.knownMessageIds.has(uiMessage.id)) {
        this.pushUiMessage(uiMessage);

        // Auto-scroll et reset unread si conditions remplies
        if (uiMessage.mine || (this.windowFocused && wasNearBottom)) {
          this.scrollToBottomSoon();
          this.resetUnreadCount();
        } else {
          this.unreadCount += 1;
        }
      }
    });

    // 📜 Réception de l'historique des messages
    const historySub = this.chatService.roomHistory$.subscribe((page) => {
      this.mergeHistoryPage(page, false);
    });

    // ⌨️ Indicateur de frappe (typing indicators)
    const typingSub = this.chatService.roomTypingUsers$.subscribe((users) => {
      this.typingUsers = (users || []).filter((user) => user && user !== this.currentUserName);
    });

    // 👥 Nombre de membres en ligne
    const membersSub = this.chatService.roomMembersCount$.subscribe((count) => {
      this.onlineMembersCount = Number(count || 0);
    });

    // ❌ Gestion des erreurs WebSocket
    const errorsSub = this.chatService.roomErrors$.subscribe((error) => {
      if (!error?.message) {
        return;
      }

      if (error.code === 'WS_HANDSHAKE_FORBIDDEN' || error.code === 'WS_HANDSHAKE_ERROR') {
        this.errorBanner = 'WebSocket handshake blocked by backend (403). Verify backend CORS/security allows /ws and /ws-chat.';
        return;
      }

      if (error.status === 403) {
        this.errorBanner = 'Only approved team members can access this chatroom.';
        return;
      }

      this.errorBanner = error.message;
    });

    // 👋 Notifications de présence (joined, left, disconnected)
    const presenceSub = this.chatService.roomPresence$.subscribe((presence) => {
      if (!presence.content) {
        return;
      }

      this.pushUiMessage({
        id: `presence-${Date.now()}`,
        type: presence.type || 'SYSTEM',
        senderName: 'System',
        content: String(presence.content),
        timestamp: presence.timestamp || new Date().toISOString(),
        mine: false
      });
      this.scrollToBottomSoon();
    });

    // 📌 Enregistrer toutes les subscriptions pour cleanup dans ngOnDestroy
    this.subscriptions.push(
      connectedSub,
      messagesSub,
      historySub,
      typingSub,
      membersSub,
      errorsSub,
      presenceSub
    );

    // 🚀 Initier la connexion WebSocket
    this.chatService.connect(this.currentUserName);

    // ✅ Chat prêt - Plus de loading
    this.loading = false;
    this.scrollToBottomSoon();
  }
  private isCurrentUserTeamMember(team: Team): boolean {
    const userId = this.currentUserId;
    if (!userId || !Array.isArray(team.members)) {
      return false;
    }

    return team.members.some((member: any) => member.id === userId);  // ✅ CORRIGÉ
  }
  private parseCurrentUserId(): number | null {
    const raw = localStorage.getItem('user_id');
    const parsed = Number(raw);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }

  private getCurrentUserName(): string {
    const stored = localStorage.getItem('user_name')?.trim();
    if (stored) {
      return stored;
    }

    const email = localStorage.getItem('user_email')?.trim();
    if (email) {
      return email;
    }

    return 'Member';
  }

  private mapIncomingMessage(message: TeamChatMessage): TeamChatUiMessage | null {
    const incomingRoomId = typeof message.roomId === 'string' ? message.roomId : undefined;
    if (incomingRoomId && incomingRoomId !== this.roomId) {
      return null;
    }

    const content = typeof message.content === 'string'
      ? message.content
      : typeof (message as any).raw === 'string'
        ? String((message as any).raw)
        : '';

    if (!content) {
      return null;
    }

    const senderName = typeof message.senderName === 'string' && message.senderName.trim().length > 0
      ? message.senderName
      : 'Member';

    const senderId = Number(message.senderId);
    const mine = Number.isFinite(senderId) && !!this.currentUserId && senderId === this.currentUserId;
    const id = `${message.type || 'MESSAGE'}:${message.roomId || this.roomId}:${message.senderId || 'unknown'}:${content}:${message.timestamp || ''}`;

    return {
      id,
      type: message.type || 'MESSAGE',
      senderName,
      content,
      timestamp: message.timestamp || new Date().toISOString(),
      mine
    };
  }

  private pushUiMessage(message: TeamChatUiMessage): void {
    this.knownMessageIds.add(message.id);
    this.messages = [...this.messages, message].slice(-200);
  }

  private mergeHistoryPage(page: ChatHistoryPage | null | undefined, prepend = false): void {
    const items = Array.isArray(page?.items) ? page!.items : [];
    const mapped = items
      .map((item) => this.mapHistoryMessage(item))
      .filter((item): item is TeamChatUiMessage => !!item && !this.knownMessageIds.has(item.id));

    if (mapped.length === 0) {
      if (page?.hasMore === false) {
        this.hasMoreHistory = false;
      }
      return;
    }

    mapped.forEach((item) => this.knownMessageIds.add(item.id));

    if (prepend) {
      this.messages = [...mapped, ...this.messages].slice(-200);
    } else {
      this.messages = [...this.messages, ...mapped].slice(-200);
    }

    this.historyCursor = page?.lastMessageId ?? this.getOldestMessageId();
    this.hasMoreHistory = page?.hasMore ?? items.length >= 30;

    this.scrollToBottomSoon();
  }

  private mapHistoryMessage(message: ChatHistoryMessage): TeamChatUiMessage | null {
    const content = String(message?.content || '').trim();
    if (!content) {
      return null;
    }

    const senderId = Number(message.senderId);
    const mine = Number.isFinite(senderId) && !!this.currentUserId && senderId === this.currentUserId;
    const id = `${message.id ?? message.createdAt ?? message.timestamp ?? content}`;

    return {
      id,
      type: message.type || 'MESSAGE',
      senderName: message.senderName || 'Member',
      content,
      timestamp: message.createdAt || message.timestamp || new Date().toISOString(),
      mine
    };
  }

  private getOldestMessageId(): number | string | null {
    const first = this.messages.find(m => {
      const id = String(m.id);
      return !id.startsWith('presence-') && !id.startsWith('local-');
    });
    return first ? first.id : null;
  }

  private stopTyping(): void {
    this.chatService.sendTeamTyping(this.teamId, false);
    if (this.typingStopHandle) {
      clearTimeout(this.typingStopHandle);
      this.typingStopHandle = null;
    }
  }

  private isNearBottom(): boolean {
    const container = this.chatScrollContainer?.nativeElement;
    if (!container) {
      return true;
    }

    const threshold = 56;
    return container.scrollHeight - container.scrollTop - container.clientHeight <= threshold;
  }

  private scrollToBottomSoon(): void {
    setTimeout(() => {
      const container = this.chatScrollContainer?.nativeElement;
      if (!container) {
        return;
      }

      container.scrollTop = container.scrollHeight;
    }, 0);
  }

  private resetUnreadCount(): void {
    this.unreadCount = 0;
  }


onFileSelected(event: Event, type: 'IMAGE' | 'FILE'): void {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  
  if (!file) {
    return;
  }

  // Vérification de taille (max 10MB)
  if (file.size > 10 * 1024 * 1024) {
    alert('File too large. Maximum size is 10MB.');
    return;
  }

  this.selectedFile = file;
  this.uploadAndSendFile(file, type);
  
  // Reset input
  input.value = '';
}

uploadAndSendFile(file: File, type: 'IMAGE' | 'FILE'): void {
  if (!this.connected) {
    return;
  }

  this.uploadingFile = true;
  const formData = new FormData();
  formData.append('file', file);
  formData.append('roomId', this.roomId);

  this.chatService.uploadFile(formData).subscribe({
    next: (response: any) => {
      const fileUrl = response.fileUrl || response.url;
      
      // ✅ Envoyer seulement via WebSocket
      this.chatService.sendTeamMessage(this.teamId, fileUrl);
      
      // ✅ Le message arrivera automatiquement via roomMessages$
      // Pas besoin de pushUiMessage ici
      
      this.selectedFile = null;
      this.uploadingFile = false;
      // Pas de scrollToBottomSoon ici - sera fait quand le message arrive
    },
    error: (err) => {
      console.error('Upload failed:', err);
      alert('Failed to upload file. Please try again.');
      this.selectedFile = null;
      this.uploadingFile = false;
    }
  });
}

cancelFileSelection(): void {
  this.selectedFile = null;
}

formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

// Voice recording (basique)
toggleVoiceRecording(): void {
  if (this.isRecording) {
    this.stopRecording();
  } else {
    this.startRecording();
  }
}

async startRecording(): Promise<void> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.mediaRecorder = new MediaRecorder(stream);
    this.audioChunks = [];

    this.mediaRecorder.ondataavailable = (event) => {
      this.audioChunks.push(event.data);
    };

    this.mediaRecorder.onstop = () => {
      const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
      const audioFile = new File([audioBlob], `voice-${Date.now()}.webm`, { type: 'audio/webm' });
      this.uploadAndSendFile(audioFile, 'FILE');
      
      // Arrêter le microphone
      stream.getTracks().forEach(track => track.stop());
    };

    this.mediaRecorder.start();
    this.isRecording = true;
  } catch (err) {
    console.error('Microphone access denied:', err);
    alert('Microphone access is required to record voice messages.');
  }
}

stopRecording(): void {
  if (this.mediaRecorder && this.isRecording) {
    this.mediaRecorder.stop();
    this.isRecording = false;
  }
}
/**
 * Détecte si l'URL est un fichier (commence par /uploads/ ou http)
 */
isFileUrl(content: string): boolean {
  if (!content) return false;
  return content.startsWith('/uploads/') || 
         content.startsWith('http://') || 
         content.startsWith('https://');
}

/**
 * Détecte si l'URL est une image
 */
isImageUrl(url: string): boolean {
  if (!this.isFileUrl(url)) return false;
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'];
  const lowerUrl = url.toLowerCase();
  return imageExtensions.some(ext => lowerUrl.includes(ext));
}

/**
 * Détecte si l'URL est un fichier audio
 */
isAudioUrl(url: string): boolean {
  if (!this.isFileUrl(url)) return false;
  const audioExtensions = ['.webm', '.mp3', '.ogg', '.wav', '.m4a', '.aac'];
  const lowerUrl = url.toLowerCase();
  return audioExtensions.some(ext => lowerUrl.includes(ext));
}

/**
 * Extrait le nom du fichier depuis l'URL
 */
getFilenameFromUrl(url: string): string {
  try {
    const parts = url.split('/');
    const filename = parts[parts.length - 1];
    // Retirer l'UUID si présent
    return filename.length > 50 ? 'Download file' : filename;
  } catch {
    return 'Download file';
  }
}

/**
 * Ouvre l'image en plein écran
 */
openImageFullscreen(imageUrl: string): void {
  window.open(imageUrl, '_blank');
}

/**
 * Gère les erreurs de chargement d'image
 */
onImageError(event: Event): void {
  const img = event.target as HTMLImageElement;
  img.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><text x="50%" y="50%" text-anchor="middle" dy=".3em">❌ Image not found</text></svg>';
}
/**
 * Convertit une URL relative en URL complète vers le backend
 */
getFullUrl(url: string): string {
  if (!url) return '';
  
  // Si l'URL commence par /uploads/, ajouter le backend URL
  if (url.startsWith('/uploads/')) {
    return environment.wsUrl + url;  // ✅ Utilise wsUrl existant
  }
  
  // Si l'URL est déjà complète, la retourner telle quelle
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // Par défaut, retourner l'URL inchangée
  return url;
}

}
