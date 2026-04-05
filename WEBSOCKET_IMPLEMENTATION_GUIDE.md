# Guide d'implémentation WebSocket pour les notifications de réservation

## 📋 Vue d'ensemble

Ce guide explique l'implémentation du système de notifications en temps réel via WebSocket pour les réservations dans l'application StreetLeague.

## ✅ Ce qui a été fait côté Frontend

### 1. **Installation de socket.io-client**
```bash
npm install socket.io-client
```

### 2. **Création du WebSocketService** (`src/app/services/websocket.service.ts`)

Le service gère:
- La connexion WebSocket au serveur
- L'émission et la réception des notifications
- La gestion de l'état de connexion
- Le stockage des notifications

**Fonctionnalités principales:**
- `sendReservationNotification()` - Envoyer une notification de réservation
- `sendCancellationNotification()` - Envoyer une notification d'annulation
- `sendNotification()` - Envoyer une notification générique
- `notifications$` Observable - Flux des notifications
- `connectionStatus$` Observable - État de la connexion

### 3. **Intégration dans BookingService**

Le `BookingService` a été modifié pour:
- Injecter le `WebSocketService`
- Appeler `sendReservationNotification()` lors de la création d'une réservation
- Envoyer les informations de la réservation via WebSocket

### 4. **Composant d'affichage des notifications**

Créé: `src/app/components/websocket-notifications/websocket-notifications.component.ts`

Affiche les notifications en temps réel avec:
- Indicateur de connexion WebSocket
- Notifications animées
- Support de plusieurs types (réservation, annulation, mise à jour, message)

### 5. **Configuration de l'environnement**

Ajouté dans `src/environments/environment.ts`:
```typescript
export const environment = {
    production: false,
    apiUrl: 'http://localhost:8085/api',
    wsUrl: 'http://localhost:8085'
};
```

## 🔧 Configuration Backend requise

### Socket.io Installation

Votre backend Node.js doit avoir socket.io installé:

```bash
npm install socket.io express cors
```

### Configuration du serveur Socket.io

Exemple avec Express:

```typescript
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: 'http://localhost:4200', // URL de votre app Angular
        methods: ['GET', 'POST']
    },
    transports: ['websocket', 'polling']
});

// Événements WebSocket
io.on('connection', (socket) => {
    console.log('Utilisateur connecté:', socket.id);

    // Rejoindre la room de l'utilisateur
    socket.on('join-user-room', (data) => {
        const userRoom = `user-${data.userId}`;
        socket.join(userRoom);
        console.log(`Utilisateur ${data.userId} a rejoint sa room`);
    });

    // Recevoir une notification de réservation
    socket.on('send-reservation-notification', (data) => {
        console.log('Notification de réservation:', data);
        
        // Émettre à l'utilisateur concerné ou à tous
        io.to(`user-${data.userId}`).emit('reservation-created', data);
        
        // Optionnel: Émettre à tous les utilisateurs connectés
        io.emit('reservation-created', data);
    });

    // Recevoir une notification d'annulation
    socket.on('send-cancellation-notification', (data) => {
        console.log('Notification d\'annulation:', data);
        io.to(`user-${data.userId}`).emit('reservation-cancelled', data);
    });

    // Recevoir une notification générique
    socket.on('send-notification', (data) => {
        console.log('Notification générique:', data);
        io.to(`user-${data.userId}`).emit('notification', data);
    });

    socket.on('disconnect', () => {
        console.log('Utilisateur déconnecté:', socket.id);
    });
});

// Lancer le serveur
const port = process.env.PORT || 8085;
httpServer.listen(port, () => {
    console.log(`Serveur WebSocket écoute sur le port ${port}`);
});
```

## 🎯 Utilisation dans un composant

### 1. Importer et afficher le composant de notifications

Dans votre `app.component.ts`:

```typescript
import { WebSocketNotificationsComponent } from './components/websocket-notifications/websocket-notifications.component';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [
        WebSocketNotificationsComponent,
        // ... autres imports
    ],
    template: `
        <app-websocket-notifications></app-websocket-notifications>
        <!-- Votre contenu -->
    `
})
export class AppComponent {}
```

### 2. Utiliser le service dans un composant de réservation

```typescript
import { WebSocketService } from '../services/websocket.service';
import { BookingService } from '../services/booking.service';

@Component({
    selector: 'app-booking-form',
    // ...
})
export class BookingFormComponent {
    constructor(
        private bookingService: BookingService,
        private webSocketService: WebSocketService
    ) {}

    makeReservation(reservationData: any) {
        this.bookingService.reserveField(reservationData).subscribe({
            next: (result) => {
                console.log('Réservation faite avec succès');
                // Le WebSocket envoie automatiquement la notification via BookingService
            },
            error: (error) => {
                console.error('Erreur lors de la réservation', error);
            }
        });
    }

    // Écouter les notifications WebSocket
    listenToNotifications() {
        this.webSocketService.notifications$.subscribe(notifications => {
            console.log('Nouvelles notifications:', notifications);
        });
    }
}
```

## 🔄 Flux de données complet

```
1. Utilisateur remplit le formulaire de réservation
          ↓
2. BookingService.reserveField() est appelé
          ↓
3. Requête HTTP POST au backend API
          ↓
4. Backend crée la réservation et répond
          ↓
5. Frontend met à jour la liste locale
          ↓
6. WebSocketService.sendReservationNotification() envoie via WebSocket
          ↓
7. Événement 'send-reservation-notification' reçu par le serveur
          ↓
8. Serveur émet 'reservation-created' à l'utilisateur
          ↓
9. Frontend reçoit 'reservation-created' via WebSocket
          ↓
10. Composant WebSocketNotificationsComponent affiche la notification
```

## 🌍 Configuration Production

Pour la production, mettez à jour `src/environments/environment.prod.ts`:

```typescript
export const environment = {
    production: true,
    apiUrl: 'https://api.votredomaine.com/api',
    wsUrl: 'https://api.votredomaine.com'
};
```

## 🚀 Intégration avec d'autres services

### Notifications lors d'annulation de réservation

```typescript
// Dans booking.service.ts
public cancelReservation(reservationId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/bookings/${reservationId}`).pipe(
        tap((result) => {
            // ... logique locale ...
            
            // Envoyer la notification via WebSocket
            const wsNotification: WebSocketNotification = {
                type: 'cancellation',
                title: 'Réservation annulée',
                message: 'Votre réservation a été annulée.',
                fieldName: 'Terrain',
                date: new Date().toISOString().split('T')[0],
                time: new Date().toLocaleTimeString(),
                timestamp: new Date().toISOString()
            };
            this.webSocketService.sendCancellationNotification(wsNotification);
        })
    );
}
```

## 📊 Monitoring et Debugging

### Vérifier l'état de la connexion

```typescript
import { WebSocketService } from './services/websocket.service';

this.webSocketService.connectionStatus$.subscribe(status => {
    console.log('WebSocket connecté:', status);
});
```

### Manuellement envoyer une notification (pour tester)

```typescript
this.webSocketService.sendNotification({
    type: 'message',
    title: 'Test',
    message: 'Ceci est une notification de test',
    fieldName: 'Terrain Test',
    date: '2024-01-01',
    time: '14:00',
    timestamp: new Date().toISOString()
});
```

## ⚠️ Points importants

1. **CORS**: Assurez-vous que votre serveur WebSocket accepte les requêtes de votre domaine
2. **User ID**: L'application utilise le `user_id` du localStorage pour rejoindre une room utilisateur
3. **Reconnexion automatique**: socket.io-client gère automatiquement les reconnexions
4. **Nettoyage**: Le WebSocketService se déconnecte automatiquement lors de la destruction

## 🔐 Sécurité

- Validez toujours les données côté serveur
- Utilisez JWT ou d'autres tokens pour authentifier les connexions WebSocket
- Limitez les messages par utilisateur pour éviter les abus
- Chiffrez les données sensibles si nécessaire

## 📞 Support

Pour toute question ou problème, consultez:
- [Socket.io Documentation](https://socket.io/docs/)
- [Angular HttpClient](https://angular.io/guide/http)
- [RxJS Observables](https://rxjs.dev/)
