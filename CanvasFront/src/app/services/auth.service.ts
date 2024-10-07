import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, catchError, map, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { User } from '../models/user';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject!: BehaviorSubject<User>;
  public currentUser!: Observable<User>;

  constructor(private http: HttpClient ,  private router: Router) {

    this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('currentUser') as string));
    this.currentUser = this.currentUserSubject.asObservable();
   }

  public get currentUserValue(): User {
    return this.currentUserSubject.value;
  }

  login(emailUser: string, passwordUser: string): Observable<any> {
    const body = { emailUser, passwordUser };
  
    return this.http.post(`${environment.backendHost}/auth/login`, body).pipe(
      map((user: any) => {
    
          localStorage.setItem('currentUser', JSON.stringify(user));
          this.currentUserSubject.next(user);
          return user; 
        
      }),
      catchError((error) => {
        console.error('Login error:', error);
        throw error;
      })
    );
  }
  
  



  getStoredUser(): User | null {
    return JSON.parse(localStorage.getItem('currentUser') as string);
  }
  
  getStoredUserId():any | null {
    const storedValue = localStorage.getItem('currentUser');
    if (storedValue) {
      const parsedValue = JSON.parse(storedValue);
      return { idUser: parsedValue.user.idUser };
    }
    return null;
  }
  
  getToken(): string {
    const storedUser = this.getStoredUser();
    return storedUser?.jwt ?? '';
  }

  verifyToken(token: string): Observable<{ isValid: boolean }> {
    const endpoint = `${environment.backendHost}/auth/verify-token/${token}`;
    return this.http.get<{ isValid: boolean }>(endpoint);
  }


  //Envoyer lien
  PasswordReset(email: string): Observable<any> {
    const body = { email };
    return this.http.post(`${environment.backendHost}/auth/request`, body);
  }


  verifyResetToken(resetToken: string): Observable<any> {
    return this.http.get<any>(`${environment.backendHost}/user/${resetToken}`);
  }

  validateResetToken(resetToken: string): Observable<any> {
    return this.http.post<any>(`${environment.backendHost}/auth/validate-reset-token/${resetToken}`, {});
  }

  resetPassword(resetToken: string, newpwd: string, comfpwd: string): Observable<any> {
    const url = `${environment.backendHost}/user/${resetToken}/change-password`;

    return this.http.put(url, { newpwd, comfpwd });
  }

  logout(): Observable<any> {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const idUser = currentUser?.user?.idUser;
    console.log("userid", idUser)
        return this.http.post(`${environment.backendHost}/auth/logout`, { idUser }).pipe(
        tap(() => {
            localStorage.clear();
            this.router.navigateByUrl('/login');
        })
    );
}

}
