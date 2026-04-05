import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { UserService } from '../../services/user.service';

@Injectable({ providedIn: 'root' })
export class ProfileResolver implements Resolve<any> {
    constructor(private userService: UserService) {}

    resolve(route: ActivatedRouteSnapshot): Observable<any> {
        // Check if there are saved changes in localStorage first
        const savedChangesStr = localStorage.getItem('userProfilePendingChanges');
        const currentUserId = localStorage.getItem('user_id');

        if (savedChangesStr && currentUserId) {
            try {
                const saved = JSON.parse(savedChangesStr);
                if (saved.userId === currentUserId) {
                    console.log('📝 Resolver: Changements sauvegardés trouvés, utilisation de localStorage');
                    // Return saved changes as observable
                    return of(saved.profile);
                }
            } catch (e) {
                console.error('Erreur lors de la lecture des changements sauvegardés:', e);
            }
        }

        // Otherwise load from server
        console.log('📥 Resolver: Chargement du profil depuis le serveur');
        return this.userService.getUserProfile();
    }
}
