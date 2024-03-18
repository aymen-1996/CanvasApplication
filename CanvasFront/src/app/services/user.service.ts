import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient) { }



  signup(body :any){
  return this.http.post(`${environment.backendHost}/user/signup`,body)
  }

  getUserPhotoUrl(userId: number): Observable<Blob> {
    const url = `${environment.backendHost}/user/${userId}/photo`;
  
    return this.http.get(url, { responseType: 'blob' });
  }

  updateUser(id: number, updateUserDto: any): Observable<any> {
    const url = `${environment.backendHost}/user/${id}`; 
    return this.http.patch<any>(url, updateUserDto);
  }
  
  getUser(id: number): Observable<any> {
    const url = `${environment.backendHost}/user/${id}/user`; // Modifier l'URL selon votre API
    return this.http.get<any>(url);
  }


  updatePhoto(userId: number, file: File): Observable<any> {
    const formData: FormData = new FormData();
    formData.append('file', file, file.name);

    const url = `${environment.backendHost}/user/${userId}/updatephoto`; // Modifier l'URL selon votre API
    return this.http.put<any>(url, formData);
  }
}
