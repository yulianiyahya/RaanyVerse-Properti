import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const welcomeGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = localStorage.getItem('auth_token');
  const hasSeenOnboarding = localStorage.getItem('has_seen_onboarding');

  if (token) {
    // User is already logged in, redirect directly to tenant home screen
    router.navigate(['/beranda-tenant']);
    return false;
  }

  if (hasSeenOnboarding === 'true') {
    // User has seen onboarding but is logged out, redirect directly to login
    router.navigate(['/login']);
    return false;
  }

  // Allow displaying the onboarding screen for new users
  return true;
};
