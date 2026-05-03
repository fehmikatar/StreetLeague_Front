import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { LucideAngularModule, ArrowLeft, Loader2, Send, Wifi, WifiOff, Users, MessagesSquare, Clock3, ChevronsUp, Phone, Video } from 'lucide-angular';
import { ChatHistoryMessage, ChatHistoryPage, ChatService, TeamChatMessage } from '../services/chat.service';
import { Team, TeamMember, TeamService } from '../services/team.service';
import { WebRtcCallService } from '../services/webrtc-call.service';
import { environment } from '../../environments/environment';

interface TeamChatUiMessage {
  id: string;
  type: string;
  senderId?: number;
  senderName: string;
  content: string;
  transcript?: string;
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
                <h1 class="text-2xl font-bold">{{ chatTitle }}</h1>
                <p class="text-sm text-muted-foreground">{{ chatSubtitle }}</p>
              </div>

              <div class="flex items-center gap-2 text-xs font-semibold flex-wrap">
                <span class="inline-flex items-center gap-1 rounded-full px-2.5 py-1"
                      [ngClass]="connected ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300' : 'bg-red-500/15 text-red-700 dark:text-red-300'">
                  <lucide-icon [name]="connected ? WifiIcon : WifiOffIcon" [size]="13"></lucide-icon>
                  {{ connected ? 'Connected' : 'Disconnected' }}
                </span>
                <span class="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-muted-foreground" *ngIf="!isPrivateChat">
                  <lucide-icon [name]="UsersIcon" [size]="13"></lucide-icon>
                  {{ onlineMembersCount || team?.members?.length || 0 }} online
                </span>
                <span class="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-muted-foreground" *ngIf="isPrivateChat">
                  <lucide-icon [name]="PhoneIcon" [size]="13"></lucide-icon>
                  {{ callSignalingConnected ? 'Direct calls ready' : 'Connecting calls...' }}
                </span>
                <span *ngIf="typingUsers.length > 0" class="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-1 text-amber-700 dark:text-amber-300">
                  <lucide-icon [name]="MessagesSquareIcon" [size]="13"></lucide-icon>
                  {{ typingUsers.join(', ') }} typing...
                </span>
                <span *ngIf="unreadCount > 0" class="inline-flex items-center gap-1 rounded-full bg-blue-500/15 px-2.5 py-1 text-blue-700 dark:text-blue-300">
                  {{ unreadCount }} new
                </span>

                <!-- ── Call Buttons ─────────────────────────────────────── -->
                <button
                   *ngIf="canStartPrivateCall"
                   (click)="startAudioCall()"
                   [disabled]="!callSignalingConnected"
                   title="Audio call"
                   class="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-1 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer">
                  <lucide-icon [name]="PhoneIcon" [size]="13"></lucide-icon>
                  Audio
                </button>
                <button
                   *ngIf="canStartPrivateCall"
                   (click)="startVideoCall()"
                   [disabled]="!callSignalingConnected"
                   title="Video call"
                   class="inline-flex items-center gap-1 rounded-full bg-violet-500/15 px-2.5 py-1 text-violet-700 dark:text-violet-300 hover:bg-violet-500/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer">
                  <lucide-icon [name]="VideoIcon" [size]="13"></lucide-icon>
                  Video
                </button>
                <button
                  *ngIf="canStartPrivateCall"
                  (click)="toggleCallHistory()"
                  class="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-muted-foreground hover:bg-muted/70 transition-colors">
                  <lucide-icon [name]="Clock3Icon" [size]="13"></lucide-icon>
                  History
                </button>
              </div>
            </div>

            <!-- Call History View -->
            <div *ngIf="showCallHistory && canStartPrivateCall" class="mt-4 rounded-xl border border-border bg-muted/20 p-4 max-h-60 overflow-y-auto">
              <div class="flex items-center justify-between mb-3">
                <h3 class="text-sm font-bold">Recent Calls</h3>
                <button (click)="showCallHistory = false" class="text-xs text-muted-foreground hover:underline">Close</button>
              </div>
              <div *ngIf="callRecords.length === 0" class="text-center py-4 text-sm text-muted-foreground">
                No call history yet.
              </div>
              <div class="space-y-2">
                <div *ngFor="let call of callRecords" class="flex items-center justify-between rounded-lg bg-card p-3 border border-border/50">
                  <div class="flex items-center gap-3">
                    <div class="flex h-8 w-8 items-center justify-center rounded-full" 
                         [ngClass]="call.status === 'MISSED' ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'">
                      <lucide-icon [name]="call.callType === 'VIDEO' ? VideoIcon : PhoneIcon" [size]="14"></lucide-icon>
                    </div>
                    <div>
                      <div class="text-sm font-semibold">
                        {{ call.callerId == currentUserId ? 'Outgoing to ' + call.calleeName : 'Incoming from ' + call.callerName }}
                      </div>
                      <div class="text-xs text-muted-foreground">
                        {{ call.startedAt | date:'MMM d, HH:mm' }} • {{ formatCallStatus(call) }}
                      </div>
                    </div>
                  </div>
                  <div *ngIf="call.durationSeconds" class="text-xs font-mono text-muted-foreground">
                    {{ formatDuration(call.durationSeconds) }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Member picker popup -->
            <div *ngIf="showMemberPicker" class="mt-3 rounded-xl border border-border bg-muted/30 p-3">
              <p class="text-xs font-semibold text-muted-foreground mb-2">Choose a member to call:</p>
              <div class="flex flex-wrap gap-2">
                <button *ngFor="let m of onlineMembers"
                  (click)="callMember(m)"
                  class="rounded-full bg-card border border-border px-3 py-1.5 text-sm hover:bg-muted transition-colors">
                  {{ m.userName }}
                </button>
              </div>
              <button (click)="showMemberPicker = false" class="mt-2 text-xs text-muted-foreground hover:underline">Cancel</button>
            </div>
          </section>

          <section *ngIf="!isPrivateChat" class="rounded-2xl border border-border bg-card overflow-hidden">
            <div class="border-b border-border px-4 py-3 text-sm font-semibold">
              Team Members
            </div>

            <div class="grid gap-3 p-4 md:grid-cols-2">
              <div *ngFor="let member of groupChatMembers"
                   class="rounded-xl border border-border bg-muted/10 p-3 transition-colors hover:bg-muted/20">
                <div class="flex items-center gap-3">
                  <img *ngIf="getMemberProfileUrl(member)"
                       [src]="getMemberProfileUrl(member)"
                       [alt]="getMemberDisplayName(member)"
                       class="h-10 w-10 rounded-full object-cover border border-border">
                  <div *ngIf="!getMemberProfileUrl(member)"
                       class="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
                    {{ getMemberInitials(member) }}
                  </div>

                  <div class="min-w-0 flex-1">
                    <div class="truncate text-sm font-semibold">
                      {{ getMemberDisplayName(member) }}
                    </div>
                    <div class="text-xs text-muted-foreground">
                      {{ isCurrentUserMemberEntry(member) ? 'You' : (isMemberOnline(member) ? 'Online' : 'Offline') }}
                    </div>
                  </div>
                </div>

                <div class="mt-3 flex items-center gap-2">
                  <button
                    (click)="openPrivateConversation(member)"
                    [disabled]="isCurrentUserMemberEntry(member)"
                    class="inline-flex items-center gap-1 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20 disabled:cursor-not-allowed disabled:opacity-40">
                    Chat
                  </button>
                   <button
                     (click)="startGroupMemberCall(member, 'audio')"
                     [disabled]="isCurrentUserMemberEntry(member) || !callSignalingConnected"
                     class="inline-flex items-center gap-1 rounded-lg bg-emerald-500/15 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-500/25 disabled:cursor-not-allowed disabled:opacity-40 dark:text-emerald-300">
                    <lucide-icon [name]="PhoneIcon" [size]="12"></lucide-icon>
                    Audio
                  </button>
                   <button
                     (click)="startGroupMemberCall(member, 'video')"
                     [disabled]="isCurrentUserMemberEntry(member) || !callSignalingConnected"
                     class="inline-flex items-center gap-1 rounded-lg bg-violet-500/15 px-3 py-1.5 text-xs font-semibold text-violet-700 hover:bg-violet-500/25 disabled:cursor-not-allowed disabled:opacity-40 dark:text-violet-300">
                    <lucide-icon [name]="VideoIcon" [size]="12"></lucide-icon>
                    Video
                  </button>
                </div>
              </div>
            </div>
          </section>


          <section class="rounded-2xl border border-border bg-card overflow-hidden relative">
            <div class="border-b border-border px-4 py-3 text-xs text-muted-foreground">
              {{ isPrivateChat ? 'Messages in this private room are visible only to the two selected members.' : 'Messages are broadcast in real time to all connected members of this team.' }}
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
     class="flex items-end gap-2"
     [ngClass]="message.mine ? 'justify-end' : 'justify-start'">

  <ng-container *ngIf="!message.mine">
    <img *ngIf="getMessageAvatarUrl(message)"
         [src]="getMessageAvatarUrl(message)"
         [alt]="message.senderName"
         class="h-9 w-9 rounded-full object-cover border border-border self-start">
    <div *ngIf="!getMessageAvatarUrl(message)"
         class="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-[11px] font-bold text-muted-foreground self-start">
      {{ getMessageInitials(message) }}
    </div>
  </ng-container>

  <div class="rounded-xl border px-3 py-2"
       [ngClass]="message.mine ? 'ml-auto max-w-[85%] border-primary/30 bg-primary/10' : 'mr-auto max-w-[85%] border-border bg-muted/20'">

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

<!-- 🎵 Audio / Transcription -->
<div *ngIf="isAudioUrl(message.content)" class="text-sm">
  <div class="flex flex-col gap-2 p-2 rounded-lg bg-muted/30">
    
    <!-- Bouton de bascule (Design Pro) -->
    <div *ngIf="message.transcript" class="flex justify-between items-center mb-1">
      <span class="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Message Vocal</span>
      <button (click)="showTranscripts[message.id] = !showTranscripts[message.id]" 
              class="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-all text-[10px] font-bold uppercase">
        <span *ngIf="!showTranscripts[message.id]">✨ Convertir en Texte</span>
        <span *ngIf="showTranscripts[message.id]">🎧 Écouter l'Audio</span>
      </button>
    </div>

    <!-- Vue Audio -->
    <div *ngIf="!showTranscripts[message.id]" class="flex items-center gap-2 animate-in fade-in duration-300">
      <span class="text-lg">🎤</span>
      <audio controls class="flex-1 h-8">
        <source [src]="getFullUrl(message.content)" type="audio/webm">
        <source [src]="getFullUrl(message.content)" type="audio/mpeg">
        Your browser does not support audio playback.
      </audio>
    </div>

    <!-- Vue Texte (Transcription) -->
    <div *ngIf="message.transcript && showTranscripts[message.id]" 
         class="px-3 py-3 rounded-xl bg-primary/10 border border-primary/20 italic text-sm text-foreground leading-relaxed animate-in zoom-in-95 duration-300 shadow-inner">
      <div class="flex items-center gap-2 mb-2 opacity-50">
        <span class="text-xs">📝</span>
        <span class="text-[9px] font-black uppercase tracking-tighter">Transcription IA</span>
      </div>
      "{{ message.transcript }}"
    </div>
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

  <ng-container *ngIf="message.mine">
    <img *ngIf="getMessageAvatarUrl(message)"
         [src]="getMessageAvatarUrl(message)"
         [alt]="message.senderName"
         class="h-9 w-9 rounded-full object-cover border border-border self-start">
    <div *ngIf="!getMessageAvatarUrl(message)"
         class="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary self-start">
      {{ getMessageInitials(message) }}
    </div>
  </ng-container>
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
    <div *ngIf="currentTranscript" class="px-2 py-1 bg-white/10 rounded-lg text-xs italic opacity-80 max-w-full truncate">
      "{{ currentTranscript }}..."
    </div>
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
  readonly PhoneIcon = Phone;
  readonly VideoIcon = Video;

  loading = true;
  connected = false;
  sending = false;
  errorBanner: string | null = null;
  loadingHistory = false;

  teamId = 0;
  roomId = '';
  team: Team | null = null;
  isPrivateChat = false;
  privateChatMemberId: number | null = null;
  privateConversationMember: TeamMember | null = null;
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

  // Transcription vocale
  currentTranscript = '';
  private recognition: any;
  public isTranscriptionActive = false;
  showTranscripts: { [key: string]: boolean } = {}; // Pour basculer entre audio et texte

  showMemberPicker = false;
  onlineMembers: { userId: string; userName: string }[] = [];
  showCallHistory = false;
  callRecords: any[] = [];
  callSignalingConnected = false;

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
    private chatService: ChatService,
    private webRtcCallService: WebRtcCallService,
    private cdr: ChangeDetectorRef
  ) { }

  get canSendMessage(): boolean {
    return this.connected && !this.sending && this.draftMessage.trim().length > 0;
  }

  get chatTitle(): string {
    if (this.isPrivateChat) {
      return this.privateConversationMember
        ? this.getMemberDisplayName(this.privateConversationMember)
        : 'Private Conversation';
    }

    return this.team?.name ? `${this.team.name} Chatroom` : `Team #${this.teamId} Chatroom`;
  }

  get chatSubtitle(): string {
    if (this.isPrivateChat) {
      return 'Private conversation between two members of the same team.';
    }

    return 'Group chat shared by all approved members of this team.';
  }

  get canStartPrivateCall(): boolean {
    return this.isPrivateChat && !!this.privateConversationMember;
  }

  get isPrivateMemberOnline(): boolean {
    if (!this.isPrivateChat || !this.privateConversationMember) {
      return false;
    }

    const privateMemberId = this.getMemberUserId(this.privateConversationMember);
    return this.onlineMembers.some((member) => Number(member.userId) === privateMemberId);
  }

  get groupChatMembers(): TeamMember[] {
    return this.isPrivateChat ? [] : (this.team?.members || []);
  }

  ngOnInit(): void {
    this.teamId = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isFinite(this.teamId) || this.teamId <= 0) {
      this.errorBanner = 'Invalid team id.';
      return;
    }

    const memberIdParam = Number(this.route.snapshot.paramMap.get('memberId'));
    if (Number.isFinite(memberIdParam) && memberIdParam > 0) {
      this.isPrivateChat = true;
      this.privateChatMemberId = memberIdParam;
    }

    this.roomId = this.isPrivateChat ? '' : `team_${this.teamId}`;
    this.currentUserId = this.parseCurrentUserId();
    this.currentUserName = this.getCurrentUserName();

    this.loading = false;
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
    this.router.navigate(['/app', 'team', this.teamId]);
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
    
    this.chatService.sendMessage(this.roomId, content);

    this.draftMessage = '';
    this.sending = false;
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
    this.chatService.sendTyping(this.roomId, content.length > 0);

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
    this.errorBanner = null;

    this.teamService.getTeamMembers(this.teamId).subscribe({
      next: (members) => {
        this.team = { id: this.teamId, members } as Team;

        if (!this.isCurrentUserTeamMember(this.team)) {
          this.errorBanner = 'Only approved team members can access this chatroom.';
          return;
        }

        if (this.isPrivateChat) {
          const privateMember = this.findTeamMemberById(this.privateChatMemberId);
          if (!privateMember) {
            this.errorBanner = 'The selected member was not found in this team.';
            return;
          }

          const privateMemberUserId = this.getMemberUserId(privateMember);
          if (!privateMemberUserId || privateMemberUserId === this.currentUserId) {
            this.errorBanner = 'A private conversation must target another member of the same team.';
            return;
          }

          this.privateConversationMember = privateMember;
          this.chatService.createPrivateRoom(this.teamId, privateMemberUserId).subscribe({
            next: (room) => {
              this.roomId = room.roomId;
              this.connectAndJoinRoom();
            },
            error: () => {
              this.errorBanner = 'Unable to open this private conversation right now.';
            }
          });
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
    const callSignalSub = this.webRtcCallService.signalingConnected$.subscribe((connected) => {
      this.callSignalingConnected = connected;
      this.cdr.markForCheck();
    });
    this.subscriptions.push(callSignalSub);

    this.subscriptions.push(
      this.chatService.connected$.subscribe(connected => {
        if (connected) {
          const client = this.chatService.getStompClient();
          this.webRtcCallService.connectOwnStomp(
            String(this.currentUserId || 0),
            this.currentUserName,
            client
          );
        }
      })
    );

    if (!this.chatService.isConnected()) {
      this.chatService.connect(this.currentUserName);
    }

    const connectedSub = this.chatService.connected$.subscribe((connected) => {
      this.connected = connected;
      if (connected) {
        this.chatService.joinRoom(this.roomId);
      }
      this.cdr.markForCheck();
    });

    const messagesSub = this.chatService.roomMessages$.subscribe((message) => {
      const wasNearBottom = this.isNearBottom();
      const uiMessage = this.mapIncomingMessage(message);
      if (!uiMessage) {
        return;
      }

      if (!this.knownMessageIds.has(uiMessage.id)) {
        this.pushUiMessage(uiMessage);

        if (uiMessage.mine || (this.windowFocused && wasNearBottom)) {
          this.scrollToBottomSoon();
          this.resetUnreadCount();
        } else {
          this.unreadCount += 1;
        }
        this.cdr.markForCheck();
      }
    });

    const historySub = this.chatService.roomHistory$.subscribe((page) => {
      this.mergeHistoryPage(page, false);
      this.cdr.markForCheck();
    });

    const typingSub = this.chatService.roomTypingUsers$.subscribe((users) => {
      this.typingUsers = (users || []).filter((user) => user && user !== this.currentUserName);
      this.cdr.markForCheck();
    });

    const membersListSub = this.chatService.roomMembers$.subscribe((members: any[]) => {
      const myId = String(this.currentUserId || '');
      this.onlineMembers = (members || [])
        .filter((m: any) => String(m.userId || m.id) !== myId)
        .map((m: any) => ({
          userId: String(m.userId || m.id),
          userName: m.userName || m.name || 'Member'
        }));
      this.cdr.markForCheck();
    });

    const membersSub = this.chatService.roomMembersCount$.subscribe((count) => {
      this.onlineMembersCount = Number(count || 0);
      this.cdr.markForCheck();
    });

    const errorsSub = this.chatService.roomErrors$.subscribe((error) => {
      if (!error?.message) {
        return;
      }

      if (error.code === 'WS_HANDSHAKE_FORBIDDEN' || error.code === 'WS_HANDSHAKE_ERROR') {
        this.errorBanner = 'WebSocket handshake blocked by backend (403). Verify backend CORS/security allows /ws and /ws-chat.';
      } else if (error.status === 403) {
        this.errorBanner = 'Only approved team members can access this chatroom.';
      } else {
        this.errorBanner = error.message;
      }
      this.cdr.markForCheck();
    });

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
      this.cdr.markForCheck();
    });

    this.subscriptions.push(
      connectedSub,
      messagesSub,
      historySub,
      typingSub,
      membersSub,
      membersListSub,
      errorsSub,
      presenceSub
    );

    this.chatService.connect(this.currentUserName);

    this.loading = false;
    this.scrollToBottomSoon();
  }

  private isCurrentUserTeamMember(team: Team): boolean {
    const userId = this.currentUserId;
    if (!userId || !Array.isArray(team.members)) {
      return false;
    }

    return team.members.some((member: any) => (member.userId || member.id) === userId);
  }

  private parseCurrentUserId(): number | null {
    const raw = localStorage.getItem('user_id');
    const parsed = Number(raw);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }

  private getCurrentUserName(): string {
    const stored = localStorage.getItem('user_name')?.trim();
    if (stored) return stored;

    const email = localStorage.getItem('user_email')?.trim();
    if (email) return email;

    return 'Member';
  }

  private findTeamMemberById(memberId: number | null): TeamMember | null {
    if (!memberId || !Array.isArray(this.team?.members)) {
      return null;
    }

    return (this.team?.members || []).find((member: any) => Number(member.userId || member.id || 0) === memberId) || null;
  }

  private getMemberUserId(member: TeamMember | null | undefined): number {
    return Number((member as any)?.userId || (member as any)?.id || 0);
  }

  getMemberDisplayName(member: TeamMember | null | undefined): string {
    if (!member) return 'Member';

    const firstName = String((member as any).firstName || '').trim();
    const lastName = String((member as any).lastName || '').trim();
    const fullName = `${firstName} ${lastName}`.trim();
    return fullName || String((member as any).email || 'Member');
  }

  getMemberInitials(member: TeamMember | null | undefined): string {
    return this.getMemberDisplayName(member).substring(0, 2).toUpperCase();
  }

  getMemberProfileUrl(member: TeamMember | null | undefined): string {
    const rawUrl = String((member as any)?.profileImageUrl || '').trim();
    return rawUrl ? this.getFullUrl(rawUrl) : '';
  }

  getMessageAvatarUrl(message: TeamChatUiMessage): string {
    const member = this.findTeamMemberById(message.senderId ?? null);
    return this.getMemberProfileUrl(member);
  }

  getMessageInitials(message: TeamChatUiMessage): string {
    const name = message.senderName || 'Member';
    return name.substring(0, 2).toUpperCase();
  }

  isCurrentUserMemberEntry(member: TeamMember | null | undefined): boolean {
    return !!this.currentUserId && this.getMemberUserId(member) === this.currentUserId;
  }

  isMemberOnline(member: TeamMember | null | undefined): boolean {
    const memberUserId = this.getMemberUserId(member);
    return memberUserId > 0 && this.onlineMembers.some((onlineMember) => Number(onlineMember.userId) === memberUserId);
  }

  openPrivateConversation(member: TeamMember): void {
    const memberUserId = this.getMemberUserId(member);
    if (!memberUserId || this.isCurrentUserMemberEntry(member)) {
      return;
    }

    this.router.navigate(['/app', 'team', this.teamId, 'chat', 'private', memberUserId]);
  }

  startGroupMemberCall(member: TeamMember, callType: 'audio' | 'video'): void {
    if (this.isCurrentUserMemberEntry(member)) return;

    if (!this.callSignalingConnected) {
      this.errorBanner = 'The call service is still connecting. Please try again in a moment.';
      setTimeout(() => { this.errorBanner = ''; this.cdr.markForCheck(); }, 4000);
      return;
    }

    const memberUserId = this.getMemberUserId(member);
    const memberName = this.getMemberDisplayName(member);
    const type = callType === 'audio' ? 'audio' : 'video';

    this.chatService.createPrivateRoom(this.teamId, memberUserId).subscribe({
      next: (room) => {
        this.webRtcCallService.startCall({
          userId: String(memberUserId),
          userName: memberName,
          avatarUrl: this.getMemberProfileUrl(member)
        }, type, room.roomId).catch((error: any) => {
          console.error('[Call] Failed to start:', error);
          this.errorBanner = error?.message || 'Could not start the call right now.';
          this.cdr.markForCheck();
          setTimeout(() => { this.errorBanner = ''; this.cdr.markForCheck(); }, 5000);
        });
      },
      error: (err) => {
        console.error('[Call] Failed to create room:', err);
        this.errorBanner = 'Could not create a private room for the call.';
        this.cdr.markForCheck();
      }
    });
  }

  private mapIncomingMessage(message: TeamChatMessage): TeamChatUiMessage | null {
    const incomingRoomId = typeof message.roomId === 'string' ? message.roomId : undefined;
    if (incomingRoomId && incomingRoomId !== this.roomId) return null;

    const content = typeof message.content === 'string' ? message.content : '';
    if (!content) return null;

    const senderName = typeof message.senderName === 'string' && message.senderName.trim().length > 0 ? message.senderName : 'Member';
    const senderId = Number(message.senderId);
    const mine = Number.isFinite(senderId) && !!this.currentUserId && senderId === this.currentUserId;
    const transcript = typeof message.transcript === 'string' && message.transcript.trim().length > 0 ? message.transcript : undefined;
    
    const rawId = (message as any).id;
    const id = rawId ? String(rawId) : `${message.type || 'MESSAGE'}:${message.roomId || this.roomId}:${message.senderId || 'unknown'}:${content}:${message.timestamp || ''}`;

    return {
      id,
      type: message.type || 'MESSAGE',
      senderId: Number.isFinite(senderId) ? senderId : undefined,
      senderName,
      content,
      transcript,
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
      if (page?.hasMore === false) this.hasMoreHistory = false;
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
    if (!content) return null;

    const senderId = Number(message.senderId);
    const mine = Number.isFinite(senderId) && !!this.currentUserId && senderId === this.currentUserId;
    const id = `${message.id ?? message.createdAt ?? message.timestamp ?? content}`;
    const transcript = typeof message.transcript === 'string' && message.transcript.trim().length > 0 ? message.transcript : undefined;

    return {
      id,
      type: message.type || 'MESSAGE',
      senderId: Number.isFinite(senderId) ? senderId : undefined,
      senderName: message.senderName || 'Member',
      content,
      transcript,
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
    this.chatService.sendTyping(this.roomId, false);
    if (this.typingStopHandle) {
      clearTimeout(this.typingStopHandle);
      this.typingStopHandle = null;
    }
  }

  private isNearBottom(): boolean {
    const container = this.chatScrollContainer?.nativeElement;
    if (!container) return true;

    const threshold = 56;
    return container.scrollHeight - container.scrollTop - container.clientHeight <= threshold;
  }

  private scrollToBottomSoon(): void {
    setTimeout(() => {
      const container = this.chatScrollContainer?.nativeElement;
      if (container) container.scrollTop = container.scrollHeight;
    }, 0);
  }

  private resetUnreadCount(): void {
    this.unreadCount = 0;
  }

  onFileSelected(event: Event, type: 'IMAGE' | 'FILE'): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('File too large. Maximum size is 10MB.');
      return;
    }

    this.selectedFile = file;
    this.uploadAndSendFile(file, type);
    input.value = '';
  }

  uploadAndSendFile(file: File, type: 'IMAGE' | 'FILE'): void {
    if (!this.connected) return;

    this.uploadingFile = true;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('roomId', this.roomId);

    this.chatService.uploadFile(formData).subscribe({
      next: (response: any) => {
        const fileUrl = response.fileUrl || response.url;
        this.chatService.sendMessage(this.roomId, fileUrl);
        this.selectedFile = null;
        this.uploadingFile = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Upload failed:', err);
        alert('Failed to upload file. Please try again.');
        this.selectedFile = null;
        this.uploadingFile = false;
        this.cdr.markForCheck();
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

  toggleVoiceRecording(): void {
    if (this.isRecording) {
      this.stopRecording();
    } else {
      this.currentTranscript = '';
      this.startRecording();
      this.initTranscription();
    }
  }

  private initTranscription(): void {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    this.recognition = new SpeechRecognition();
    this.recognition.lang = 'fr-FR';
    this.recognition.interimResults = true;
    this.recognition.continuous = true;

    this.recognition.onresult = (event: any) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) transcript += event.results[i][0].transcript;
      }
      if (transcript) {
        this.currentTranscript = transcript;
        this.cdr.markForCheck();
      }
    };

    try {
      this.recognition.start();
      this.isTranscriptionActive = true;
    } catch (e) {
      console.error('Failed to start recognition:', e);
    }
  }

  async startRecording(): Promise<void> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream);
      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (event) => this.audioChunks.push(event.data);
      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        const audioFile = new File([audioBlob], `voice-${Date.now()}.webm`, { type: 'audio/webm' });
        this.uploadAndSendVoice(audioFile, this.currentTranscript.trim());
        stream.getTracks().forEach(track => track.stop());
      };

      this.mediaRecorder.start();
      this.isRecording = true;
      this.cdr.markForCheck();
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
    if (this.recognition && this.isTranscriptionActive) {
      this.recognition.stop();
      this.isTranscriptionActive = false;
    }
    this.cdr.markForCheck();
  }

  uploadAndSendVoice(file: File, transcript: string): void {
    if (!this.connected) return;

    this.uploadingFile = true;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('roomId', this.roomId);

    this.chatService.uploadFile(formData).subscribe({
      next: (response: any) => {
        const fileUrl = response.fileUrl || response.url;
        this.chatService.sendMessage(this.roomId, fileUrl, transcript);
        this.uploadingFile = false;
        this.currentTranscript = '';
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Voice upload failed:', err);
        this.uploadingFile = false;
        this.cdr.markForCheck();
      }
    });
  }

  isFileUrl(content: string): boolean {
    if (!content) return false;
    return content.startsWith('/uploads/') || content.startsWith('http://') || content.startsWith('https://');
  }

  isImageUrl(url: string): boolean {
    if (!this.isFileUrl(url)) return false;
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'];
    const lowerUrl = url.toLowerCase();
    return imageExtensions.some(ext => lowerUrl.includes(ext));
  }

  isAudioUrl(url: string): boolean {
    if (!this.isFileUrl(url)) return false;
    const audioExtensions = ['.webm', '.mp3', '.ogg', '.wav', '.m4a', '.aac'];
    const lowerUrl = url.toLowerCase();
    return audioExtensions.some(ext => lowerUrl.includes(ext));
  }

  getFilenameFromUrl(url: string): string {
    try {
      const parts = url.split('/');
      const filename = parts[parts.length - 1];
      return filename.length > 50 ? 'Download file' : filename;
    } catch {
      return 'Download file';
    }
  }

  openImageFullscreen(imageUrl: string): void {
    window.open(imageUrl, '_blank');
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><text x="50%" y="50%" text-anchor="middle" dy=".3em">❌ Image not found</text></svg>';
  }

  getFullUrl(url: string): string {
    if (!url) return '';
    if (url.startsWith('/uploads/')) return environment.wsUrl + url;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return url;
  }

  toggleCallHistory(): void {
    this.showCallHistory = !this.showCallHistory;
    if (this.showCallHistory) this.loadCallHistory();
  }

  loadCallHistory(): void {
    if (!this.roomId) return;
    this.chatService.getCallHistory(this.roomId).subscribe({
      next: (records) => {
        this.callRecords = records;
        this.cdr.markForCheck();
      },
      error: (err) => console.error('Failed to load call history', err)
    });
  }

  formatCallStatus(call: any): string {
    switch (call.status) {
      case 'MISSED': return 'Missed';
      case 'REJECTED': return 'Rejected';
      case 'ENDED': return 'Ended';
      case 'ONGOING': return 'Ongoing';
      default: return 'Initiated';
    }
  }

  formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  startAudioCall(): void {
    this.startTeamCall('audio');
  }

  startVideoCall(): void {
    this.startTeamCall('video');
  }

  private startTeamCall(type: 'audio' | 'video'): void {
    this.pendingCallType = type;
    if (!this.isPrivateChat || !this.privateConversationMember) {
      this.errorBanner = 'Open a private conversation to start an audio or video call.';
      setTimeout(() => { this.errorBanner = null; this.cdr.markForCheck(); }, 4000);
      return;
    }

    if (!this.callSignalingConnected) {
      this.errorBanner = 'The call service is still connecting. Please try again in a moment.';
      setTimeout(() => { this.errorBanner = null; this.cdr.markForCheck(); }, 4000);
      return;
    }

    this.callMember({
      userId: String(this.getMemberUserId(this.privateConversationMember)),
      userName: this.getMemberDisplayName(this.privateConversationMember)
    });
  }

  private pendingCallType: 'audio' | 'video' = 'audio';

  callMember(member: { userId: string; userName: string }): void {
    this.showMemberPicker = false;
    this.webRtcCallService.startCall(member, this.pendingCallType, this.roomId).catch((error: unknown) => {
      this.errorBanner = error instanceof Error && error.message ? error.message : 'Could not start the call right now.';
      this.cdr.markForCheck();
      setTimeout(() => { this.errorBanner = null; this.cdr.markForCheck(); }, 4000);
    });
  }
}
