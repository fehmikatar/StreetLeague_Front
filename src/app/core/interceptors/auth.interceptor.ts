import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const token = localStorage.getItem('auth_token');
    const isPublicFeedbackSummary = req.url.includes('/api/feedbacks/summary');

    if (token && !req.url.includes('/api/auth/') && !isPublicFeedbackSummary) {
        const clonedReq = req.clone({
            headers: req.headers.set('Authorization', `Bearer ${token}`)
        });
        return next(clonedReq);
    }

    return next(req);
};
