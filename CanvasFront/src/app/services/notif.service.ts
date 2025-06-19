import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Notification } from '../models/notification'; // Assurez-vous d'importer votre modèle de notification
import { io } from 'socket.io-client';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class NotifService {
  private socket: any;
  private apiUrl = 'https://api.chouaibi.shop';

  constructor( private http:HttpClient) {
   
    this.socket = io(this.apiUrl);
  }

  getLiveNotifications(userId: number): Observable<Notification[]> {
    const existingNotifications$ = this.http.get<Notification[]>(`${environment.backendHost}/notifications/${userId}/notif`);
  
    return new Observable<Notification[]>(observer => {
      let allNotifications: Notification[] = [];
  
      existingNotifications$.subscribe(existingNotifications => {
        allNotifications = existingNotifications.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
        observer.next(allNotifications);
      });
  
      this.socket.on('notificationCreated', (notification: Notification) => {
        if (notification.userId === userId) {
          allNotifications = [notification, ...allNotifications]
            .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
          observer.next(allNotifications);
        }
      });
  
      return () => {
        this.socket.off('notificationCreated');
      };
    });
  }
  

  markAsRead(userId: number): Observable<void> {
    return this.http.patch<void>(`${environment.backendHost}/notifications/read/${userId}`, {});
  }
}  
