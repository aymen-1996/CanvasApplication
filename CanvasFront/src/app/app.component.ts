import { Component, HostListener } from '@angular/core';
import { AuthService } from './services/auth.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

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

    if (idUser) {
      this.http.post(`${environment.backendHost}/auth/update-status-en-ligne`, { idUser }).subscribe({
        next: (response) => console.log('Statut mis à jour: en ligne', response),
        error: (error) => console.error('Erreur lors de la mise à jour du statut: en ligne', error)
      });
    }
  }
}
