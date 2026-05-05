import { Injectable } from '@angular/core';
import { CanDeactivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';

/**
 * Composant avec changements non sauvegardés
 */
export interface ComponentWithUnsavedChanges {
    hasUnsavedChanges: boolean;
    onProfileFieldChange(): void;
}

@Injectable({
    providedIn: 'root'
})
export class UnsavedChangesGuard implements CanDeactivate<ComponentWithUnsavedChanges> {

    canDeactivate(
        component: ComponentWithUnsavedChanges,
        currentRoute: ActivatedRouteSnapshot,
        currentState: RouterStateSnapshot,
        nextState?: RouterStateSnapshot
    ): Observable<boolean> | Promise<boolean> | boolean {

        if (component && component.hasUnsavedChanges) {
            console.log('⚠️ Changements non sauvegardés détectés - Sauvegarde automatique...');
            
            // Appeler onProfileFieldChange pour sauvegarder les changements dans localStorage
            if (component.onProfileFieldChange) {
                component.onProfileFieldChange();
            }
            
            console.log('💾 Changements sauvegardés avant navigation');
            
            // Toujours permettre la navigation - les changements sont maintenant sauvegardés dans localStorage
            return true;
        }

        return true;
    }
}
