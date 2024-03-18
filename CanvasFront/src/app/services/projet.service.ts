import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject, catchError, map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { project } from '../models/project';

@Injectable({
  providedIn: 'root'
})
export class ProjetService {
  private projectUpdatedSource = new BehaviorSubject<boolean>(false);
  projectUpdated$ = this.projectUpdatedSource.asObservable();
  private canvasUpdatedSource = new BehaviorSubject<boolean>(false);
  canvasUpdated$ = this.canvasUpdatedSource.asObservable();
  private refreshSubject = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient) { }


  getallProjectByUser(id:number):Observable<project[]>{
    return this.http.get<{ projects: project[] }>(`${environment.backendHost}/projet/${id}`).pipe(
      map(response => response.projects) // Extract projects array from response object
    );
  }

 

  getImageForProject(projectId: number): Observable<Blob> {
    return this.http.get(`${environment.backendHost}/projet/image/${projectId}/im`, { responseType: 'blob' });
  }

  createProjectWithImage(userId: number, nomProjet: string, image: File) {
    const formData = new FormData();
    formData.append('nomProjet', nomProjet);
    formData.append('image', image);

    return this.http.post<any>(`${environment.backendHost}/projet/${userId}/create`, formData);
  }

  deleteProject(idproject:number , userId:number):Observable<any> {
    return this.http.delete(`${environment.backendHost}/projet/${idproject}/${userId}`)
  }



  getPendingInvitesByUserId(userId: number): Observable<any> {
    const url = `${environment.backendHost}/projet/invites/${userId}/etat`;
    return this.http.get<any>(url);
  }

  updateInviteState(userId: number, inviteId: number): Observable<{ success: boolean, message: string }> {
    const url = `${environment.backendHost}/projet/invites/${userId}/${inviteId}/updateState`;
    return this.http.put<{ success: boolean, message: string }>(url, {});
  }
  updateProject() {
    this.projectUpdatedSource.next(true);
  }

  updateCanvas() {
    this.canvasUpdatedSource.next(true);
  }

  deleteInviteByIdAndUserId(idInvite: number, idUser: number): Observable<string> {
    const url = `${environment.backendHost}/invite/${idInvite}/${idUser}`;
    return this.http.delete<string>(url);
  }

  getInvitesByUserId(userId: number): Observable<any> {
    return this.http.get<any>(`${environment.backendHost}/projet/progress/${userId}/invites`);
  }

  getProjectsCanvasByUserId(userId: number): Observable<any> {
    return this.http.get<any>(`${environment.backendHost}/projet/proj/${userId}/canvas`);

}
getProjectById(id: number): Observable<any> {
  const url = `${environment.backendHost}/projet/projid/${id}/proj`;
  return this.http.get<any>(url);
}
}