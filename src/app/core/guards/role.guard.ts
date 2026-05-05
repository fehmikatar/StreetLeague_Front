import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { ApiService } from '../../services/api.service';

export const roleGuard: CanActivateFn = (route, state) => {
    const router = inject(Router);
    const apiService = inject(ApiService);
    
    const userRole = apiService.getUserRole();
    const expectedRoles: string[] = route.data['roles'];

    if (!expectedRoles || expectedRoles.length === 0) {
        return true;
    }

    if (userRole && expectedRoles.includes(userRole)) {
        return true;
    }

    // Redirect based on role if unauthorized
    if (userRole === 'ROLE_ADMIN') {
        return router.createUrlTree(['/app/admin/stats']); // Admin fallback
    } else {
        return router.createUrlTree(['/app']); // Player fallback
    }
};
