import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
    const router = inject(Router);
    const token = localStorage.getItem('auth_token');

    if (token) {
        return true;
    }

    // Navigate to login page with extras
    return router.createUrlTree(['/auth/login'], { queryParams: { returnUrl: state.url } });
};
