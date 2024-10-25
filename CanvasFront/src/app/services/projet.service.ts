import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject, catchError, map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { project } from '../models/project';
import { User } from '../models/user';
import { io, Socket } from 'socket.io-client';
import { SocketService } from './socket.service';

@Injectable({
  providedIn: 'root'
})
export class ProjetService {
  private projectUpdatedSource = new BehaviorSubject<boolean>(false);
  projectUpdated$ = this.projectUpdatedSource.asObservable();
  private canvasUpdatedSource = new BehaviorSubject<boolean>(false);
  canvasUpdated$ = this.canvasUpdatedSource.asObservable();
  private refreshSubject = new BehaviorSubject<boolean>(false);
  constructor(private http: HttpClient , private socketService:SocketService) {


   }


  getallProjectByUser(id:number):Observable<project[]>{
    return this.http.get<{ projects: project[] }>(`${environment.backendHost}/projet/${id}`).pipe(
      map(response => response.projects) // Extract projects array from response object
    );
  }

 
  loadImageForProject(projectId: number): Observable<{ imageUrl: string }> {
    return this.http.get<{ imageUrl: string }>(
      `${environment.backendHost}/projet/image/${projectId}/im`
    );
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

  updateInviteState(userId: number, inviteId: number): Observable<{ success: boolean, message: string, invite: any, project: project, user: User }> {
    const url = `${environment.backendHost}/projet/invites/${userId}/${inviteId}/updateState`;
    return this.http.put<{ success: boolean, message: string, invite: any, project: project, user: User }>(url, {});
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


getProjectByCanvasAndUser(nomCanvas: string, userId: number): Observable<any> {
  const url = `${environment.backendHost}/invite/project-by-canvas/${nomCanvas}/${userId}`;
  return this.http.get<any>(url);
}

getPendingInvites(userId: number): Observable<any> {
  return this.http.get(`${environment.backendHost}/projet/invites/${userId}/etat`);
}

listenForNewInvites(): Observable<any> {
  return this.socketService.listenForNewInvites();
}

updateProjectImage(projectId: number, image: File): Observable<any> {
  const formData = new FormData();
  formData.append('image', image, image.name);
  
  return this.http.put(`${environment.backendHost}/projet/${projectId}/image`, formData, {
    headers: new HttpHeaders({
    })
  });
}

}