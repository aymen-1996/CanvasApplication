import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CommentaireService {

  constructor(private http: HttpClient) {}
  createCommentaire(idUser: number, idCanvas: number, contenu: string, file: File | null): Observable<any> {
    const formData = new FormData();
    formData.append('contenu', contenu);

    if (file) {
        formData.append('file', file, file.name);
    }

    return this.http.post(`${environment.backendHost}/commentaire/create/${idUser}/${idCanvas}`, formData);
}


  getCommentaires( idCanvas: number): Observable<any[]> {
    return this.http.get<any[]>(`${environment.backendHost}/commentaire/${idCanvas}`);
  }

  countCommentaires( idCanvas: number): Observable<number> {
    return this.http.get<number>(`${environment.backendHost}/commentaire/${idCanvas}/count`);
  }

  getFile(fileName: string): Observable<Blob> {
    return this.http.get(`${environment.backendHost}/commentaire/file/${fileName}`, {
      responseType: 'blob',
    });
  }
}
