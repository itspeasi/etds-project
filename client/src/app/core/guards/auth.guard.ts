import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../features/auth/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true;
  }

  return router.createUrlTree(['/auth/login']);
};

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const user = authService.currentUser();

  if (!authService.isLoggedIn() || !user) {
    return router.createUrlTree(['/auth/login']);
  }

  const expectedRoles = route.data['roles'] as Array<string>;

  if (expectedRoles && expectedRoles.includes(user.userType)) {
    return true;
  }

  // Redirect to home if logged in but unauthorized for this route
  alert('You do not have permission to view this page.');
  return router.createUrlTree(['/']);
};