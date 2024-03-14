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


  
}
