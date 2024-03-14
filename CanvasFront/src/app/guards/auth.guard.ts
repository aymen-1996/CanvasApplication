import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): Observable<boolean> {
    const token = this.authService.getToken();

    if (!token) {
      // No token found, navigate to login
      this.router.navigateByUrl('/login');
      return of(false);
    }

    return this.authService.verifyToken(token).pipe(
      switchMap((result) => {
        if (result && result.isValid) {
          return of(true);
        } else {
          this.router.navigateByUrl('/login');
          return of(false);
        }
      }),
      catchError(() => {
        this.router.navigateByUrl('/login');
        return of(false);
      })
    );
  }
}
