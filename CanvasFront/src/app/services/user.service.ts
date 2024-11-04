import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, switchMap, tap, timer } from 'rxjs';
import { environment } from 'src/environments/environment';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private usersSubject = new BehaviorSubject<User[]>([]);

  users$ = this.usersSubject.asObservable();

  constructor(private http: HttpClient) { }



  signup(body :any){
  return this.http.post(`${environment.backendHost}/user/signup`,body)
  }

  getUserPhotoUrl(userId: number): Observable<Blob> {
    const url = `${environment.backendHost}/user/${userId}/photo`;
  
    return this.http.get(url, { responseType: 'blob' });
  }

  getUserPhotoUrl1(userId: number): string {
    return `${environment.backendHost}/user/${userId}/photo`;
}

updateUser(id: number, updateUserDto: any): Observable<any> {
  const url = `${environment.backendHost}/user/${id}`; 
  return this.http.patch<any>(url, updateUserDto);
}

uploadCv(idUser: number, cvFile: File): Observable<any> {
  const formData = new FormData();
  formData.append('cv', cvFile);

  return this.http.post<{ message: string; cvName: string }>(
    `${environment.backendHost}/user/${idUser}/cv`, formData
  );
}

  getUser(id: number): Observable<any> {
    const url = `${environment.backendHost}/user/${id}/user`;
    return this.http.get<any>(url);
  }


  updatePhoto(userId: number, file: File): Observable<any> {
    const formData: FormData = new FormData();
    formData.append('file', file, file.name);

    const url = `${environment.backendHost}/user/${userId}/updatephoto`;
    return this.http.post<any>(url, formData);
  }


  uploadImage(formData: FormData): Observable<any> {
    return this.http.post(`${environment.backendHost}/upload/image`, formData);
  }

  getUsersByInvitations(idUser: number, nomUser?: string): Observable<User[]> {
    const params = nomUser ? { params: { nomUser } } : {};
  
    return this.http.get<User[]>(`${environment.backendHost}/user/invitations/${idUser}`, params).pipe(
      tap((data: User[]) => {
        this.usersSubject.next(data);
      })
    );
  }
  
  getUsersByEmail(email: string, idUserToExclude: number): Observable<User[]> {
    return this.http.get<User[]>(`${environment.backendHost}/user/filterUser/email/${idUserToExclude}?emailUser=${email}`);
  }
  
  getUserProgress(userId: number): Observable<number> {
    return this.http.get<number>(`${environment.backendHost}/user/${userId}/progress`);
  }

  getUserCV(userId: any): Observable<Blob> {
    return this.http.get(`${environment.backendHost}/user/file/${userId}`, { responseType: 'blob' }) as Observable<Blob>;
  }
  
}
