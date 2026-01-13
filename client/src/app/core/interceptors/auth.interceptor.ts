import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../../features/auth/auth.service';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  let request = req;

  // Clone request and attach token
  if (token) {
    request = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Unauthorized - Token likely expired or invalid
        alert('Your session has expired. Please login again.');
        authService.logout();
      } else if (error.status === 403) {
        // Forbidden - User doesn't have permission
        alert('You are not authorized to perform this action.');
      } else if (error.status === 0) {
        // Network error
        console.error('Network Error:', error);
        alert('Cannot connect to server. Please check your internet connection.');
      }
      
      return throwError(() => error);
    })
  );
};