import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const expectedRoles = route.data['roles'] as Array<string>;
    const userRole = authService.getUserRole();

    if (authService.isLoggedIn() && expectedRoles.includes(userRole)) {
        return true;
    }

    // Redirect to dashboard or unauthorized page if role doesn't match
    router.navigate(['/dashboard']);
    return false;
};
