import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { BookingService } from './booking.service';
import { WebSocketService } from './websocket.service';
import { environment } from '../../environments/environment';

describe('BookingService', () => {
    let service: BookingService;
    let httpTestingController: HttpTestingController;
    let mockWebSocketService: any;

    beforeEach(() => {
        // Mock du WebSocketService pour éviter d'instancier de vraies connexions
        mockWebSocketService = {
            showNotification: jasmine.createSpy('showNotification')
        };

        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                BookingService,
                { provide: WebSocketService, useValue: mockWebSocketService }
            ]
        });

        service = TestBed.inject(BookingService);
        httpTestingController = TestBed.inject(HttpTestingController);

        // Au démarrage, le service charge automatiquement loadFields, loadStaticNotifications, et loadMyReservations
        // On purge ces requêtes initiales pour ne pas polluer les tests
        const reqFields = httpTestingController.match(`${environment.apiUrl}/sport-spaces`);
        if (reqFields.length > 0) reqFields[0].flush([]);

        // Si l'utilisateur est present, un appel est fait. Mock au cas ou.
        const reqReservations = httpTestingController.match((req) => req.url.includes('/bookings/user/'));
        if (reqReservations.length > 0) reqReservations[0].flush([]);
    });

    afterEach(() => {
        // Vérifier qu'il n'y a plus aucune requête HTTP en attente
        httpTestingController.verify();
    });

    it('devrait être créé', () => {
        expect(service).toBeTruthy();
    });

    // --- TEST : Gestion des Terrains (SportSpaces) ---
    describe('Gestion des Terrains (SportSpaces)', () => {
        it('devrait récupérer une liste de terrains', () => {
            const mockFields = [
                { id: 1, name: 'Terrain Central', location: 'Paris', type: 'Football', pricePerHour: 50, available: true }
            ];

            // On appelle refresh pour déclencher spécifiquement loadFields
            service.refreshFields();

            const req = httpTestingController.expectOne(`${environment.apiUrl}/sport-spaces`);
            expect(req.request.method).toEqual('GET');
            
            // On répond avec mock
            req.flush(mockFields);

            // On vérifie que le BehaviorSubject a bien émis les nouvelles données
            service.fields$.subscribe(fields => {
                expect(fields.length).toBe(1);
                expect(fields[0].name).toBe('Terrain Central');
                expect(fields[0].price).toBe(50);
            });
        });
    });

    // --- TEST : Booking (Réservations) ---
    describe('Réservations', () => {
        it('devrait annuler une réservation', () => {
            const resId = 5;

            // Appel de cancel
            service.cancelReservation(resId).subscribe(response => {
                expect(response.status).toBe('ok');
            });

            // On s'attend à une requête PATCH
            const req = httpTestingController.expectOne(`${environment.apiUrl}/bookings/${resId}/cancel`);
            expect(req.request.method).toEqual('PATCH');
            req.flush({ status: 'ok' });
        });
    });

    // --- TEST : Feedbacks ---
    describe('Feedbacks', () => {
        it('devrait poster un nouveau feedback et émettre une notification', () => {
            const feedbackMock = {
                userId: '1',
                fieldId: '2',
                reservationId: 10,
                rating: 5,
                comment: 'Excellent terrain !',
                fieldName: 'Terrain A'
            };

            service.saveFieldFeedback(feedbackMock).subscribe(fb => {
                expect(fb.rating).toBe(5);
                expect(fb.comment).toBe('Excellent terrain !');
            });

            const req = httpTestingController.expectOne(`${environment.apiUrl}/feedbacks`);
            expect(req.request.method).toEqual('POST');
            
            // Simuler ce que le Backend renvoie
            req.flush({
                id: 100,
                userId: 1,
                sportSpaceId: 2,
                bookingId: 10,
                rating: 5,
                comment: 'Excellent terrain !'
            });

            // Une autre requête vers sport-spaces est déclenchée par refreshFields après un feedback
            const reqRefresh = httpTestingController.expectOne(`${environment.apiUrl}/sport-spaces`);
            reqRefresh.flush([]);

            // Vérifier que la notification websocket a été appelée
            expect(mockWebSocketService.showNotification).toHaveBeenCalled();
        });
        it('devrait récupérer les feedbacks d\'un terrain (getFieldFeedbacks)', () => {
            const mockFeedbacks = [
                { id: 1, sportSpaceId: 2, rating: 5, comment: 'Génial' }
            ];
            
            service.getFieldFeedbacks('2').subscribe(fb => {
                expect(fb.length).toBe(1);
                expect(fb[0].comment).toBe('Génial');
            });

            const req = httpTestingController.expectOne(`${environment.apiUrl}/feedbacks/sport-space/2`);
            expect(req.request.method).toEqual('GET');
            req.flush(mockFeedbacks);
        });

        it('devrait récupérer les feedbacks créés par un utilisateur (getUserFieldFeedbacks)', () => {
            const mockFeedbacks = [
                { id: 2, userId: 5, rating: 4, comment: 'Pas mal' }
            ];
            
            service.getUserFieldFeedbacks('5').subscribe(fb => {
                expect(fb.length).toBe(1);
                expect(fb[0].rating).toBe(4);
            });

            const req = httpTestingController.expectOne(`${environment.apiUrl}/feedbacks/user/5`);
            expect(req.request.method).toEqual('GET');
            req.flush(mockFeedbacks);
        });
    });
});
