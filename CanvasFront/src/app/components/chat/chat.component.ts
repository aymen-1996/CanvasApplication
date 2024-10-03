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
import { User } from 'src/app/models/user';
import { ChatMessage } from 'src/app/models/ChatMessage';

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
  recipientId: number = 45; 
  senderId!: number
  addProjectModal: boolean = false;

  pendingInvites: any[] = [];
  pendingInvitesCount: number = 0;
  pollSubscription!: Subscription;
  selectedProjectId: string | null = null; 
  userPhotoUrl1!: SafeUrl | string; 
  refreshSideBarProject: boolean = false;
  showFirst: boolean = true;
  users: User[] = [];
  user:any
  iduser:any
  showPopup =false;
  lastMessage:any
  searchTerm: string = ''; 
  userselect!: any;  
  constructor(private projectService: ProjetService ,private router: Router,private activatedRoute:ActivatedRoute ,private dialogue: MatDialog ,private http: HttpClient,private sanitizer: DomSanitizer, private userService: UserService, private chatService: ChatService) {}

  ngOnInit(): void {
    this.userId = JSON.parse(localStorage.getItem('currentUser') || '{}');
    this.username = this.userId.user.prenomUser;
    this.senderId = this.userId.user.idUser; 
    this.socket = io('http://localhost:3000');
  
    this.activatedRoute.data.subscribe((data: any) => {
      const title = data.title || 'Titre par défaut';
      document.title = `Canvas | ${title}`;
    });
    this.getUserPhoto1()
    this.getUsersByInvitations()



   
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

    this.socket.on('message',
      (data: { 
     content: string; 
     senderId: string; 
     recipientId: number; 
     sentAt: string;
     messageType: string; 
     imageUrl?: string | null; 
   }) => {
     console.log('Message reçu:', data);
     this.getUsersByInvitations();

     const senderId = parseInt(data.senderId, 10);
   
     this.userService.getUser(senderId).subscribe(user => {
       const username = user.prenomUser;
   
       const formattedMessage = {
         username: username,
         message: data.messageType === 'image' ? '' : data.content,
         messageType: data.messageType,
         senderId: senderId,
         imageUrl: data.messageType === 'image' ? `http://localhost:3000/upload/image/${data.imageUrl?.replace('./uploads/', '')}` : null,
         timestamp: data.sentAt
       };
   
       this.messages.push(formattedMessage);
       console.log('Messages après ajout:', this.messages);
       this.scrollToBottom();
     }, error => {
       console.error('Erreur lors de la récupération du nom d\'utilisateur:', error);
     });
   });
  }
  
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedImage = input.files[0]; 
    }
  }


//liste user selon invitation
getUsersByInvitations(): void {
  this.userService.getUsersByInvitations(this.userId.user.idUser, this.searchTerm).subscribe(
    (data: User[]) => {
      this.users = data;
      const messageRequests = this.users.map(user =>
        
        this.chatService.getLastMessage(user.idUser, this.userId.user.idUser)
      );

     
      forkJoin(messageRequests).subscribe(
        (messages: any[]) => {
          this.users.forEach((user, index) => {
            user.lastMessage = messages[index] ? messages[index].content : '';
            user.etat = messages[index] ? messages[index].etat : 'true';
            this.getUserPhoto2(user.idUser);
            this.getLastMessage(user.idUser, this.userId.user.idUser)
          });
        },
        (error) => {
          console.error('Error fetching last messages:', error);
        }
      );
    },
    (error) => {
      console.error('Erreur lors du chargement des utilisateurs', error);
    }
  );
}

//update etat msg
onMarkAllAsRead(userId: number) {
  this.chatService.markMessagesAsReadByUser(userId).subscribe({
    next: (response) => {
      this.getUsersByInvitations()
      console.log('All messages marked as read for user:', response);
    },
    error: (error) => {
      console.error('Error marking all messages as read for user:', error);
    }
  });
}


//detecte user
selectUser(user: User): void {
  this.userselect = user.idUser;
  this.iduser = user.idUser;
  this.getUserPhoto(this.userselect);
  this.loadMessages(this.userId.user.idUser, this.userselect);
  this.onMarkAllAsRead(this.userselect);

  console.log("Utilisateur sélectionné:", this.userselect);
  this.getById(this.userselect);
}

onSearchChange(): void {
    this.getUsersByInvitations();
}

//dernier msg envoyer
getLastMessage(senderId:any ,recipientId:any ): void {
  this.chatService.getLastMessage(senderId, recipientId).subscribe(
    (message) => {
      this.lastMessage = message;
      console.log("user lest msg " ,this.lastMessage)
    },
    (error) => {
      console.error('Error fetching last message:', error);
    }
  );
}

getById(userid: number): void {
  this.userService.getUser(userid).subscribe(
    (data) => {
      this.user = data; 
      console.log('User data:', this.user);
    },
    (error) => {
      console.error('Erreur lors de la récupération de l\'utilisateur:', error);
    }
  );
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
                recipientId:  this.userselect
            };

            this.socket.emit('message', messageData);
            this.message = '';
        } else if (this.selectedImage) {
            const formData = new FormData();
            formData.append('file', this.selectedImage);
            formData.append('username', username);
            formData.append('senderId', senderId.toString());
            formData.append('recipientId', this.userselect.toString());

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
loadMessages(senderId: any, recipientId: any): void {
  this.chatService.getMessagesBetweenUsers(senderId, recipientId).subscribe(
    (data) => {
      this.messages = data.map((msg: { senderId: any; content: any; filePath: string | null; sentAt: string }) => {
        const messageType = msg.filePath ? 'image' : 'text'; 
        return {
          senderId: msg.senderId,
          message: msg.content, 
          messageType: messageType,
          imageUrl: msg.filePath ? `http://localhost:3000/upload/image/${msg.filePath.replace('./uploads/', '')}` : null,
          timestamp: new Date(msg.sentAt).toLocaleString()
        };
      });

      console.log("Mes messages après traitement:", this.messages); 

      this.messages.forEach((msg) => {
        this.userService.getUser(msg.senderId).subscribe(user => {
          msg.username = user.prenomUser; 
          console.log("Nom d'utilisateur pour le message:", msg.username); 
        }, error => {
          console.error('Erreur lors de la récupération du nom d\'utilisateur:', error);
        });
      });

      this.scrollToBottom();
    },
    (error) => {
      console.error('Erreur lors de la récupération des messages', error);
    }
  );
}


getUserPhoto(select:number): void {
  this.userService.getUserPhotoUrl(select).subscribe(
    (res: Blob) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        this.userPhotoUrl = this.sanitizer.bypassSecurityTrustUrl(reader.result as string);
      };
      reader.readAsDataURL(res);
    },
    error => {
      console.error('Error getting user photo:', error);
    }
  );
}

getUserPhoto2(userId: number): void {
  this.userService.getUserPhotoUrl(userId).subscribe(
    (res: Blob) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const user = this.users.find(u => u.idUser === userId);
        if (user) {
          user.imageUser = this.sanitizer.bypassSecurityTrustUrl(reader.result as string);
        }
      };
      reader.readAsDataURL(res);
    },
    error => {
      console.error('Error getting user photo:', error);
    }
  );
}

scrollToBottom(): void {
  const chatHistory = document.querySelector('.chat-history'); 
  if (chatHistory) {
    setTimeout(() => {
      chatHistory.scrollTop = chatHistory.scrollHeight; 
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }, 0);
  }
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

