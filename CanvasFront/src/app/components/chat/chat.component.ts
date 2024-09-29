import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, interval, map, of, Subscription, switchMap } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { ChatService } from 'src/app/services/chat.service';
import { ProjetService } from 'src/app/services/projet.service';
import { UserService } from 'src/app/services/user.service';
import { environment } from 'src/environments/environment';
import { PopupAcceptedComponent } from '../popup/popup-accepted/popup-accepted.component';

interface ChatMessage {
  username: string;
  message: string;
  messageType: string;
  senderId: number;
  imageUrl?: string | null; // Propriété optionnelle pour les images
  userPhotoUrl?: any; // Propriété optionnelle pour la photo de l'utilisateur
}

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent {
  private socket!: Socket;
  messages: ChatMessage[] = []; 
  username: string = ''; 
  message: string = '';
  selectedImage: File | null = null; 
  userId!: any; 
  userPhotoUrl: any; 
  recipientId: number = 2; 
  senderId: number = 44; 
  addProjectModal: boolean = false;

  pendingInvites: any[] = [];
  pendingInvitesCount: number = 0;
  pollSubscription!: Subscription;
  selectedProjectId: string | null = null; 
  userPhotoUrl1!: SafeUrl | string; 
  refreshSideBarProject: boolean = false;
  showFirst: boolean = true;

  showPopup =false;
  constructor(private projectService: ProjetService ,private router: Router,private activatedRoute:ActivatedRoute ,private dialogue: MatDialog ,private http: HttpClient,private sanitizer: DomSanitizer, private userService: UserService, private chatService: ChatService) {}

  ngOnInit(): void {
    // Récupérer le nom d'utilisateur depuis localStorage
    this.userId = JSON.parse(localStorage.getItem('currentUser') || '{}');
    this.username = this.userId.user.prenomUser;
  
    // Connexion au serveur WebSocket
    this.socket = io('http://localhost:3000');
  
    this.socket.on('message', (data: { 
      content: string; 
      senderId: string; 
      recipientId: number; 
      sentAt: string; 
      messageType: string; 
      imageUrl?: string | null; 
    }) => {
      console.log('Message reçu:', data);
    
      const senderId = parseInt(data.senderId, 10);
    
      this.userService.getUser(senderId).subscribe(user => {
        const username = user.prenomUser;
        
        this.getUserPhoto(senderId); 
    
        if (data.messageType === 'image') {
          const imageUrl = `http://localhost:3000/upload/image/${data.imageUrl?.replace('./uploads/', '')}`;
          this.messages.push({
            username: username,
            message: '',
            messageType: 'image',
            senderId: senderId,
            imageUrl: imageUrl,
            userPhotoUrl: null
          });
        } else {
          const formattedMessage = `${data.content}`;
          this.messages.push({
            username: username,
            message: formattedMessage,
            messageType: 'text',
            senderId: senderId,
            imageUrl: null,
            userPhotoUrl: null
          });
        }
    
        console.log('Messages après ajout:', this.messages);
        this.scrollToBottom();
      }, error => {
        console.error('Erreur lors de la récupération du nom d\'utilisateur:', error);
      });
    });
    


    this.activatedRoute.data.subscribe((data: any) => {
      const title = data.title || 'Titre par défaut';
      document.title = `Canvas | ${title}`;
    });
    this.getUserPhoto1()
    this.loadMessages();

   
    this.pollSubscription = interval(1000)
    .pipe(
      switchMap(() => this.getPendingInvites())
    )
    .subscribe(
      (response) => {
        this.pendingInvites = response.pendingInvites;
        this.pendingInvitesCount = this.pendingInvites.length;
      },
      (error) => {
        console.error('Une erreur s\'est produite :', error);
      }
    );
    
  this.getPendingInvites().subscribe(
    (response: { pendingInvites: any[]; }) => {
      this.pendingInvites = response.pendingInvites;
      this.pendingInvitesCount = this.pendingInvites.length;

    },
    (error: any) => {
      console.error('Une erreur s\'est produite :', error);
    }
    
  );
    this.getPendingInvites()
  }
  
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedImage = input.files[0]; 
    }
  }

  send(): void {
    const senderId = this.userId.user.idUser;

    this.userService.getUser(senderId).subscribe(user => {
        const username = user.prenomUser;

        if (this.message) {
            const messageData = { 
                username: username, 
                message: this.message,  
                messageType: 'text', 
                senderId: senderId, 
                recipientId: this.recipientId 
            };

            this.socket.emit('message', messageData);
            this.message = '';
        } else if (this.selectedImage) {
            const formData = new FormData();
            formData.append('file', this.selectedImage);
            formData.append('username', username);
            formData.append('senderId', senderId.toString());
            formData.append('recipientId', this.recipientId.toString());

            this.userService.uploadImage(formData).subscribe(response => {
                const imageUrl = `http://localhost:3000/upload/image/${response.filename}`;

                this.messages.push({ 
                    username: username, 
                    message: '',
                    messageType: 'image',
                    senderId: senderId,
                    imageUrl: imageUrl 
                });
                this.selectedImage = null; 
            });
        }
    }, error => {
       
    });
}


loadMessages(): void {
  this.chatService.getMessagesBetweenUsers(this.senderId, this.recipientId).subscribe(
    (data: any) => {
      const userNames: { [key: number]: string } = {}; 

      const messageObservables = data.map((msg: any) => {
        const senderId = msg.senderId;

        if (!userNames[senderId]) {
          return this.userService.getUser(senderId).pipe(
            map(user => {
              userNames[senderId] = user.prenomUser; 
            })
          );
        } else {
          return of(null);
        }
      });

      forkJoin(messageObservables).subscribe(() => {
        this.messages = data.map((msg: any) => ({
          username: userNames[msg.senderId] || 'Unknown User',
          message: msg.content,
          messageType: msg.filePath ? 'image' : 'text',
          imageUrl: msg.filePath ? `http://localhost:3000/upload/image/${msg.filePath.replace('./uploads/', '')}` : null,
          senderId: msg.senderId,
          sentAt: msg.sentAt,
          userPhotoUrl: null 
        }));

        this.loadUserPhotos();

        console.log('Messages récupérés:', this.messages);
        this.scrollToBottom(); 
      });
      
    },
    (error) => {
      console.error('Erreur lors de la récupération des messages:', error);
    }
  );
}


  
getUserPhoto(userId: number): void {
  this.userService.getUserPhotoUrl(userId).subscribe(
    (res: Blob) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const photoUrl = this.sanitizer.bypassSecurityTrustUrl(reader.result as string);
        this.updateUserPhoto(userId, photoUrl); 
      };
      reader.readAsDataURL(res);
    },
    error => {
      console.error('Error getting user photo:', error);
    }
  );
}

private updateUserPhoto(userId: number, photoUrl: any): void {
  this.messages = this.messages.map(msg => {
    if (msg.senderId === userId) {
      return { ...msg, userPhotoUrl: photoUrl };
    }
    return msg;
  });
}
private loadUserPhotos(): void {
  const photoObservables = this.messages.map(msg => 
    this.userService.getUserPhotoUrl(msg.senderId).pipe(
      map(photoBlob => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const photoUrl = this.sanitizer.bypassSecurityTrustUrl(reader.result as string);
          this.updateUserPhoto(msg.senderId, photoUrl); 
        };
        reader.readAsDataURL(photoBlob);
      })
    )
  );

  forkJoin(photoObservables).subscribe();
}

  scrollToBottom(): void {
    const messagesContainer = document.querySelector('.messages-container') as HTMLElement;
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }




  //partie header
showPendingInvitesDropdown: boolean = false;

togglePendingInvitesDropdown() {
  this.showPendingInvitesDropdown = !this.showPendingInvitesDropdown;
}

showDropdown: boolean = false;

toggleDropdown() {
  this.showDropdown = !this.showDropdown;
}

logout() {
  localStorage.removeItem('currentUser');

  this.router.navigateByUrl('/login')
}

getUserPhoto1(): void {
  this.userService.getUserPhotoUrl(this.userId.user.idUser).subscribe(
    (res: Blob) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        this.userPhotoUrl1 = this.sanitizer.bypassSecurityTrustUrl(reader.result as string);
      };
      reader.readAsDataURL(res);
    },
    error => {
      console.error('Error getting user photo:', error);
    }
  );
}




getPendingInvites() {
  return this.http.get<any>(`${environment.backendHost}/projet/invites/${this.userId.user.idUser}/etat`);
}



openPopup1(idInvite: number): void {
  const confirmationMessage = 'Êtes-vous sûr de vouloir supprimer cette Post-it ?';
  const dialogRef = this.dialogue.open(PopupAcceptedComponent, {
    width: '600px',
    data: { confirmationMessage, idInvite },
  });

  dialogRef.afterClosed().subscribe((result) => {
    if (result && result.action === 'delete') {
      console.log('Suppression confirmée');
      this.delete(idInvite, this.userId.user.idUser);
    } else if (result && result.action === 'accept') {
      console.log('Accepter');
      this.updateInviteState(this.userId.user.idUser, idInvite);
    } else {
      console.log('Opération annulée');
    }
  });
}



updateInviteState(userId: number, idInvite: number): void {
  this.projectService.updateInviteState(userId, idInvite)
    .subscribe(
      (response) => {
        console.log('Invitation state updated successfully:', response);

        this.pendingInvites = this.pendingInvites.filter(invite => invite.id !== idInvite);
        this.pendingInvitesCount = this.pendingInvites.length;
        this.projectService.updateProject(); 
        this.projectService.updateCanvas(); 

        setTimeout(() => {
          this.getPendingInvites().subscribe(
            (response: { pendingInvites: any[]; }) => {
              this.pendingInvites = response.pendingInvites;
              this.pendingInvitesCount = this.pendingInvites.length;
            },
            (error: any) => {
              console.error('Une erreur s\'est produite :', error);
            }
          );
        }, 100); 
      },
      (error) => {
        console.error('Failed to update invitation state:', error);
      }
    );
}

delete(idInvite: number,userId: number): void {
  this.projectService.deleteInviteByIdAndUserId(idInvite,userId )
    .subscribe(
      (response) => {
        this.pendingInvites = this.pendingInvites.filter(invite => invite.id !== idInvite);
        this.pendingInvitesCount = this.pendingInvites.length;
        setTimeout(() => {
          this.getPendingInvites().subscribe(
            (response: { pendingInvites: any[]; }) => {
              this.pendingInvites = response.pendingInvites;
              this.pendingInvitesCount = this.pendingInvites.length;
            },
            (error: any) => {
              console.error('Une erreur s\'est produite :', error);
            }
          );
        }, 100); 
      },
      (error) => {
        console.error('Failed to update invitation state:', error);
      }
    );
}
}
