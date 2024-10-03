import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private socket: Socket;
  private messageCountSubject = new BehaviorSubject<number>(0);
  public messageCount$ = this.messageCountSubject.asObservable();
  constructor(private http:HttpClient) {
    this.socket = io('http://localhost:3000'); 
  }

  sendMessage(messageData: {
    username: string;
    message: string;
    file?: File | null;
    senderId: number;
    recipientId: number;
    senderIdUser: number;
    recipientIdUser: number;
  }) {
    this.socket.emit('message', messageData);
  }

  onMessage(callback: (message: any) => void) {
    this.socket.on('message', callback);
  }


  getMessagesBetweenUsers(senderId: number, recipientId: number): Observable<any> {
    return this.http.get<any>(`${environment.backendHost}/upload/${senderId}/${recipientId}`);
  }

  getMessagesCountByRecipientId(recipientId: number): Observable<number> {
    return this.http.get<number>(`${environment.backendHost}/user/${recipientId}/message`);
  }


  getLastMessage(senderId: number, recipientId: number): Observable<any> {
    return this.http.get(`${environment.backendHost}/user/last/${senderId}/${recipientId}`);
  }

  markMessagesAsReadByUser(userId: number) {
    return this.http.put(`${environment.backendHost}/user/read/${userId}`, {});
  }
  updateMessageCount(count: number) {
    this.messageCountSubject.next(count);
  }
}
