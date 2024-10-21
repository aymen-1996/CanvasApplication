import { Component, HostListener } from '@angular/core';
import { AuthService } from './services/auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'CanvasFront';
  constructor(private http: HttpClient) {}

   @HostListener('window:beforeunload', ['$event'])
  unloadHandler(event: any) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const idUser = currentUser?.user?.idUser;
    if (idUser) {
      this.http.post(`${environment.backendHost}/auth/update-status`, { idUser }).subscribe({
        next: (response) => console.log('Statut mis à jour avant fermeture de l\'onglet', response),
        error: (error) => console.error('Erreur lors de la mise à jour du statut avant fermeture', error)
      });
    }
  }

  @HostListener('window:load', ['$event'])
  onLoadHandler(event: any) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const idUser = currentUser?.user?.idUser;
    const token = currentUser?.token; 

    if (idUser && token) {
      this.verifyToken(token).subscribe({
        next: (result) => {
          if (result.isValid) {
            const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
            this.http.post(`${environment.backendHost}/auth/update-status-en-ligne`, { idUser }, { headers }).subscribe({
              next: (response) => console.log('Statut mis à jour: en ligne', response),
              error: (error) => console.error('Erreur lors de la mise à jour du statut: en ligne', error)
            });
          } else {
            console.error('Token invalide');
          }
        },
        error: (error) => console.error('Erreur lors de la vérification du token', error)
      });
    } else {
      console.error('Utilisateur non trouvé ou JWT manquant');
    }
  }

  verifyToken(token: string): Observable<{ isValid: boolean }> {
    const endpoint = `${environment.backendHost}/auth/verify-token/${token}`;
    return this.http.get<{ isValid: boolean }>(endpoint);
  }
}
