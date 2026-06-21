import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Token expired atau tidak valid → bersihkan dan redirect ke login
        console.warn('[AuthInterceptor] Token tidak valid (401). Redirect ke login...');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('namaUser');
        localStorage.removeItem('emailUser');
        localStorage.removeItem('user');
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};
