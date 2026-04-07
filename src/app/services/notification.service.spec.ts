import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { NotificationService } from './notification.service';
import { ApiService } from './api.service';

describe('NotificationService', () => {
    let service: NotificationService;
    let httpTestingController: HttpTestingController;
    let mockApiService: any;

    beforeEach(() => {
        mockApiService = {
            base: 'http://localhost:8080/api'
        };

        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                NotificationService,
                { provide: ApiService, useValue: mockApiService }
            ]
        });

        service = TestBed.inject(NotificationService);
        httpTestingController = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpTestingController.verify();
    });

    it('devrait être créé', () => {
        expect(service).toBeTruthy();
    });

    describe('Consultation des Notifications (GET)', () => {
        it('devrait récupérer toutes les notifications d\'un utilisateur (getByUserId)', () => {
            const mockNotifs = [
                { id: 1, message: 'Match ce soir', read: false },
                { id: 2, message: 'Nouvelle réservation', read: true }
            ];

            service.getByUserId(10).subscribe(notifs => {
                expect(notifs.length).toBe(2);
                expect(notifs[0].message).toBe('Match ce soir');
            });

            const req = httpTestingController.expectOne('http://localhost:8080/api/notifications/user/10');
            expect(req.request.method).toBe('GET');
            req.flush(mockNotifs);
        });

        it('devrait récupérer uniquement les notifications non lues (getUnread)', () => {
            const mockNotifs = [
                { id: 1, message: 'Nouvelle note', read: false }
            ];

            service.getUnread(10).subscribe(notifs => {
                expect(notifs.length).toBe(1);
                expect(notifs[0].read).toBe(false);
            });

            const req = httpTestingController.expectOne('http://localhost:8080/api/notifications/user/10/unread');
            expect(req.request.method).toBe('GET');
            req.flush(mockNotifs);
        });
    });

    describe('Modifications (PATCH / DELETE)', () => {
        it('devrait marquer une notification comme lue (markAsRead)', () => {
            service.markAsRead(5).subscribe();

            const req = httpTestingController.expectOne('http://localhost:8080/api/notifications/5/mark-as-read');
            expect(req.request.method).toBe('PATCH');
            req.flush({});
        });

        it('devrait supprimer une notification (delete)', () => {
            service.delete(3).subscribe();

            const req = httpTestingController.expectOne('http://localhost:8080/api/notifications/3');
            expect(req.request.method).toBe('DELETE');
            req.flush({});
        });
    });
});
