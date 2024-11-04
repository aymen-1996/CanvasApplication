import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Donnees } from '../models/donnees';

@Injectable({
  providedIn: 'root'
})
export class BlocksService {

  constructor(private http: HttpClient) {}

  getBlocksByCanvasId(canvasId: number): Observable<any> {
    const url = `${environment.backendHost}/block/canvasid/${canvasId}`;
    return this.http.get<any>(url);
  }

  getBlockById(blockId: number): Observable<any> {
    const url = `${environment.backendHost}/block/${blockId}`;
    return this.http.get(url).pipe(
      map((response: any) => {
        console.log('Response from backend:', response.idBlock);
        return response.idBlock;
      }),
      catchError((error) => {
        console.error('Error fetching block by ID:', error);
        throw error;
      })
    );
  }
  
  

  createDonnees(idBloc: number, createDonneesDto: any): Observable<any> {
    const url = `${environment.backendHost}/donnees/${idBloc}`;
    return this.http.post<any>(url, createDonneesDto);
  }


  getByBloc(idBloc: number): Observable<any> {
    const url = `${environment.backendHost}/donnees/donne/${idBloc}`;
    return this.http.get<any>(url);
  }

  updateDonnee(id: number, updateDonneesDto: any): Observable<any> {
    const url = `${environment.backendHost}/donnees/${id}`;
    return this.http.patch<any>(url, updateDonneesDto);
  }

  getAll(): Observable<any> {
    return this.http.get<any>(`${environment.backendHost}/donnees`);
  }

  getDonneeById(id: number): Observable<any> {
    const url = `${environment.backendHost}/donnees/${id}`; 
    return this.http.get(url);
  }

  deleteDonnees(id: number): Observable<void> {
    const url = `${environment.backendHost}/donnees/${id}`;
    return this.http.delete<void>(url);
  }


  getRoleByUserIdAndCanvasId(userId: number, canvasId: number): Observable<any> {
    const url = `${environment.backendHost}/projet/role/${userId}/${canvasId}/role`;
    return this.http.get<any>(url);
  }
  inviteUser(idProjet: number, idCanvas: number, emailUser: string, role: string, idUserSendInvite: number): Observable<any> {
    const body = {
        emailUser,
        role,
        idUserSendInvite, 
    };

    return this.http.post(`${environment.backendHost}/invite/${idProjet}/${idCanvas}/${idUserSendInvite}`, body);
}




  getProjetByUserIdAndCanvasId(userId: number, canvasId: number): Observable<any> {
    const url = `${environment.backendHost}/projet/${userId}/${canvasId}/projet`;
    return this.http.get<any>(url);
  }
}
