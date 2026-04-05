import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class PendingChangesService {
    private pendingChangesSubject = new Subject<void>();
    private profileComponent: any = null;

    // Signal when logout is about to happen
    public beforeLogout$ = this.pendingChangesSubject.asObservable();

    /**
     * Register the profile component so we can call auto-save before logout
     */
    registerProfileComponent(component: any): void {
        this.profileComponent = component;
    }

    /**
     * Unregister the profile component when it's destroyed
     */
    unregisterProfileComponent(): void {
        this.profileComponent = null;
    }

    /**
     * Notify that logout is starting - allows components to save pending changes
     */
    notifyBeforeLogout(): void {
        if (this.profileComponent && typeof this.profileComponent.autoSaveIfNeeded === 'function') {
            this.profileComponent.autoSaveIfNeeded();
        }
        this.pendingChangesSubject.next();
    }

    /**
     * Check if there are pending profile changes
     */
    hasUnsavedChanges(): boolean {
        return this.profileComponent ? this.profileComponent.hasUnsavedChanges : false;
    }
}
