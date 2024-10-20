import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private socket: Socket;
  private messageCountSubject = new BehaviorSubject<number>(0);
  public messageCount$ = this.messageCountSubject.asObservable();
  private unreadMessageCountSubject = new Subject<number>();

  constructor(private http:HttpClient) {
    this.socket = io('http://localhost:3000'); 
  }

   sendMessage(messageData: {
    username: string;
    message: string;
    file?: File | null; // Permettre l'envoi d'un fichier
    senderId: number;
    recipientId: number;
  }) {
    const formData = new FormData();
    if (messageData.file) {
      formData.append('file', messageData.file, messageData.file.name); // Ajouter le fichier au FormData
    }
    formData.append('username', messageData.username);
    formData.append('message', messageData.message);
    formData.append('senderId', messageData.senderId.toString());
    formData.append('recipientId', messageData.recipientId.toString());

    this.socket.emit('message', formData);
  }

  onMessage(callback: (message: any) => void) {
    this.socket.on('message', callback);
  }


  getMessagesBetweenUsers(senderId: number, recipientId: number): Observable<any> {
    return this.http.get<any>(`${environment.backendHost}/chat/${senderId}/${recipientId}`);
  }

  getMessagesCountByRecipientId(recipientId: number): Observable<number> {
    return this.http.get<number>(`${environment.backendHost}/chat/${recipientId}/message`);
  }


  getLastMessage(senderId: number, recipientId: number): Observable<any> {
    return this.http.get(`${environment.backendHost}/chat/last/${senderId}/${recipientId}`);
  }

  markMessagesAsReadByUser(userId: number) {
    return this.http.put(`${environment.backendHost}/chat/read/${userId}`, {});
  }


  updateMessageCount(count: number) {
    this.messageCountSubject.next(count);
  }
}
