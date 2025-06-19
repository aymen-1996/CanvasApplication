import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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

  constructor(private http: HttpClient) {
    this.socket = io('https://api.chouaibi.shop');

       this.listenToUpdatedMessage();
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

  deleteMessage(messageId: number, userId: number): Observable<void> {
    return this.http.delete<void>(`${environment.backendHost}/chat/${messageId}/${userId}`);
  }
  listenToDeleteMessage(): Observable<{ messageId: number, userId: number }> {
    return new Observable((observer) => {
      this.socket.on('messageDeleted', (data: { messageId: number, userId: number }) => {
        observer.next(data); 
      });
  
      return () => {
        this.socket.off('messageDeleted');
      };
    });
  }
  


  updateMessage(id: number, content: string): Observable<any> {
    return this.http.put(`${environment.backendHost}/chat/${id}`, { content });
  }


  listenToUpdatedMessage(): Observable<any> {
    return new Observable((observer) => {
      this.socket.on('messageUpdated', (updatedMessage: any) => {
        observer.next(updatedMessage); 
      });

      return () => {
        this.socket.off('messageUpdated');
      };
    });
  }



  updateMessageCount(count: number) {
    this.messageCountSubject.next(count);
  }


  createOrUpdateReaction(idUser: number, idMessage: number, newReaction: string): Observable<any> {
    const url = `${environment.backendHost}/reactions/${idUser}/${idMessage}`;
    const body = { newReaction };
    return this.http.post(url, body);
  }

  getReactionsByMessageId(idMessage: number): Observable<any> {
    return this.http.get<any>(`${environment.backendHost}/reactions/${idMessage}`);
  }


  getUnreadMessagesCount(senderId: number, recipientId: number): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${environment.backendHost}/chat/unread-messages/count/${senderId}/${recipientId}`);
  }
}
