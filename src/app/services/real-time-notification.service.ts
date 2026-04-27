import { Injectable, OnDestroy } from '@angular/core';
import { Client, IMessage } from '@stomp/stompjs';
// @ts-ignore
import SockJS from 'sockjs-client/dist/sockjs';
import { toast } from 'ngx-sonner';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RealTimeNotificationService implements OnDestroy {
  private stompClient: Client | null = null;
  private userId: string | null = null;

  constructor() {
    this.userId = localStorage.getItem('user_id');
    if (this.userId) {
      this.connect();
    }
  }

  private connect() {
    // Construct WS URL by replacing /api with /ws or just using the base
    const wsUrl = environment.apiUrl.replace('/api', '/ws');
    
    // Simplest reliable way to initialize
    const socket = new SockJS(wsUrl);
    this.stompClient = new Client({
      webSocketFactory: () => socket,
      debug: (msg) => console.log('STOMP:', msg),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    this.stompClient.onConnect = (frame) => {
      console.log('Connected to WebSocket');
      this.subscribeToNotifications();
    };

    this.stompClient.onStompError = (frame) => {
      console.error('STOMP error', frame);
    };

    this.stompClient.activate();
  }

  private subscribeToNotifications() {
    if (!this.stompClient || !this.userId) return;

    // Direct user notifications destination
    const destination = `/user/${this.userId}/queue/notifications`;

    this.stompClient.subscribe(destination, (message: IMessage) => {
      const notification = JSON.parse(message.body);
      this.handleNotification(notification);
    });

    // Public notifications destination
    this.stompClient.subscribe('/topic/notifications', (message: IMessage) => {
      const notification = JSON.parse(message.body);
      this.handleNotification(notification);
    });
  }

  private handleNotification(notification: any) {
    console.log('Received notification:', notification);
    
    // Show toast using ngx-sonner
    if (notification.type === 'LOW_STOCK') {
      toast.warning(notification.title || 'Stock Alert', {
        description: notification.message,
        duration: 10000,
        action: {
          label: 'View Wishlist',
          onClick: () => window.location.href = '/app/favorites'
        }
      });
    } else {
      toast.info(notification.title || 'Notification', {
        description: notification.message,
        duration: 5000
      });
    }
  }

  ngOnDestroy() {
    if (this.stompClient) {
      this.stompClient.deactivate();
    }
  }
}
