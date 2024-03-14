import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CanvasService {

  constructor(private http: HttpClient) {}

  getCanvases(userId: number, projetId: number): Observable<any> {
    return this.http.get<any>(`${environment.backendHost}/projet/${userId}/${projetId}`);
  }
}
