import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const guestGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = localStorage.getItem('auth_token');

  if (token) {
    // User sudah login, redirect ke beranda
    router.navigate(['/beranda-tenant']);
    return false;
  }

  return true;
};
