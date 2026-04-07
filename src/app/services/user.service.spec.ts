import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { UserService } from './user.service';
import { ApiService } from './api.service';
import { environment } from '../../environments/environment';

describe('UserService', () => {
    let service: UserService;
    let httpTestingController: HttpTestingController;

    // Mock ApiService
    const mockApiService = {
        base: `${environment.apiUrl}`
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                UserService,
                { provide: ApiService, useValue: mockApiService }
            ]
        });

        service = TestBed.inject(UserService);
        httpTestingController = TestBed.inject(HttpTestingController);

        // Spy sur localStorage pour ne pas affecter le vrai localStorage du navigateur pendant les tests
        spyOn(localStorage, 'getItem').and.callFake((key: string) => {
            if (key === 'user_id') return '1';
            if (key === 'auth_token') return 'fake-token-123';
            return null;
        });
        spyOn(localStorage, 'setItem').and.callFake(() => {});
    });

    afterEach(() => {
        httpTestingController.verify();
    });

    it('devrait être créé', () => {
        expect(service).toBeTruthy();
    });

    describe('Profil Utilisateur (getUserProfile)', () => {
        it('devrait récupérer le profil de l\'utilisateur connecté', () => {
            const mockProfile = { firstName: 'Fehmi', lastName: 'Katar', email: 'test@test.com' };

            service.getUserProfile().subscribe(profile => {
                expect(profile.firstName).toBe('Fehmi');
                expect(profile.email).toBe('test@test.com');
            });

            // "1" provient du mock de localStorage.getItem('user_id')
            const req = httpTestingController.expectOne(`${environment.apiUrl}/users/1`);
            expect(req.request.method).toEqual('GET');
            
            req.flush(mockProfile);
        });
    });

    describe('Mise à jour du profil (updateUserProfile)', () => {
        it('devrait essayer de mettre à jour le profil avec PATCH', () => {
            const updateData = { firstName: 'Fehmi', lastName: 'Katar', email: 'updated@test.com', phone: '12345678', password: 'pwd' };

            service.updateUserProfile(updateData).subscribe(res => {
                expect(res.email).toBe('updated@test.com');
            });

            const req = httpTestingController.expectOne(`${environment.apiUrl}/users/1`);
            expect(req.request.method).toEqual('PATCH');
            
            req.flush({ ...updateData });
        });

        it('devrait faire un fallback sur PUT si PATCH échoue avec 405', () => {
            const updateData = { firstName: 'Fehmi', lastName: 'Katar' };

            service.updateUserProfile(updateData).subscribe(res => {
                expect(res.lastName).toBe('Katar');
            });

            // 1ère requête: PATCH (qui va échouer)
            const reqPatch = httpTestingController.expectOne(`${environment.apiUrl}/users/1`);
            expect(reqPatch.request.method).toEqual('PATCH');
            reqPatch.flush('Method not allowed', { status: 405, statusText: 'Method Not Allowed' });

            // 2ème requête: PUT (le fallback)
            const reqPut = httpTestingController.expectOne(`${environment.apiUrl}/users/1`);
            expect(reqPut.request.method).toEqual('PUT');
            reqPut.flush({ ...updateData });
        });
    });

    describe('Photo de Profil (uploadProfileImage)', () => {
        it('devrait envoyer un FormData contenant l\'image', () => {
            // Créer un fichier fictif
            const blob = new Blob([''], { type: 'image/png' }) as any;
            blob['lastModifiedDate'] = '';
            blob['name'] = 'avatar.png';
            const fakeFile = blob as File;

            service.uploadProfileImage(fakeFile).subscribe();

            const req = httpTestingController.expectOne(`${environment.apiUrl}/users/1/profile-image`);
            expect(req.request.method).toEqual('POST');
            
            // Vérifier que le corps est de type FormData et contient le userId
            expect(req.request.body instanceof FormData).toBeTrue();
            expect((req.request.body as FormData).get('userId')).toBe('1');
            
            req.flush({ status: 'Image uploaded' });
        });
    });
});
