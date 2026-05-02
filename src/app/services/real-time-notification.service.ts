import { Injectable, OnDestroy } from '@angular/core';
import { Client, IMessage } from '@stomp/stompjs';
import { Subject } from 'rxjs';
import SockJS from 'sockjs-client';
import { toast } from 'ngx-sonner';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RealTimeNotificationService implements OnDestroy {
  private stompClient: Client | null = null;
  private userId: string | null = null;
  private messageSubject = new Subject<any>();

  public messages$ = this.messageSubject.asObservable();

  constructor() {
    this.userId = localStorage.getItem('user_id');
    if (this.userId || localStorage.getItem('auth_token')) {
      this.connect();
    }
  }

  private connect(): void {
    const wsBaseUrl = environment.wsUrl || environment.apiUrl.replace(/\/api$/, '');
    const wsUrl = `${wsBaseUrl}/ws`;

    this.stompClient = new Client({
      webSocketFactory: () => new SockJS(wsUrl) as WebSocket,
      debug: () => {},
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    this.stompClient.onConnect = () => {
      this.subscribeToNotifications();
    };

    this.stompClient.onStompError = (frame) => {
      console.error('STOMP error', frame);
    };

    this.stompClient.activate();
  }

  private subscribeToNotifications(): void {
    if (!this.stompClient) {
      return;
    }

    const destinations = ['/user/queue/notifications', '/topic/notifications', '/topic/orders'];

    if (this.userId) {
      destinations.push(`/user/${this.userId}/queue/notifications`);
    }

    destinations.forEach((destination) => {
      this.stompClient?.subscribe(destination, (message: IMessage) => {
        const notification = JSON.parse(message.body);
        this.handleNotification(notification);
      });
    });
  }

  private handleNotification(notification: any): void {
    this.messageSubject.next(notification);

    if (notification.type === 'LOW_STOCK') {
      toast.warning(notification.title || 'Stock Alert', {
        description: notification.message,
        duration: 10000,
        action: {
          label: 'View Wishlist',
          onClick: () => {
            window.location.href = '/app/favorites';
          }
        }
      });
      return;
    }

    toast.info(notification.title || 'Notification', {
      description: notification.message,
      duration: 5000
    });
  }

  ngOnDestroy(): void {
    if (this.stompClient) {
      void this.stompClient.deactivate();
    }
  }
}
