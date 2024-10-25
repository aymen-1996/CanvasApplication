import { HttpClient } from '@angular/common/http';
import { Component, HostListener } from '@angular/core';
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
import { AuthService } from 'src/app/services/auth.service';
import { NotifService } from 'src/app/services/notif.service';
import { Notification } from 'src/app/models/notification'; 

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
  showPendingInvitesDropdown: boolean = false;
  showDropdown: boolean = false;
  projectProgress: { [key: number]: number } = {};
projectIdToDelete: number | null = null;
notifications: Notification[] = [];
isDropdownVisible = false;
unreadNotificationCount = 0;
showEmojiPicker: boolean = false;
emojis: string[] = [
  '😀', '😁', '😂', '🤣', '😃', '😄', '😅', '😆', '😉', '😊','😍', '😘', '😋', '😎', '🤓', '🤔', '😏', '😒', '😔', '😕',
  '😲', '😧', '😬', '😪', '😵', '🤯', '🥵','😡', '😠', '😇','🤥','🙃', '😘', '🥰', '🤓', '😎', '🧐', '🤩', '🥳', '😰', '🥶',
  '🤗', '🤢', '🥴', '🤐', '😴', '🤮', '🤒','🥱', '🤕', '🤑', '🤗','😱', '😈', '👿', '👻', '💀','☠' ,'👽', '🤖', '🎃', '👋', '👏',
  '👍', '👎', '✌️', '🤝', '🙏', '💪', '👐', '👀', '💫', '✨','🌈', '🌟', '🌹', '🌺', '🌼', '🌻', '🌸', '🌴', '🌍','🤡','👅',
  '🎉', '🎊', '🎈', '💌', '💖', '💗', '💓', '💞', '💕', '💘','🧡', '💛', '💚', '💙', '💜', '🤍', '🤎', '🖤', '💔', '❤️',
  '🌊', '🍔', '🍕', '🍣', '🍦', '🍩', '🍪', '🍉', '🍌', '🍓','💻', '🖥️', '🖱️', '⌨️', '📱', '🕹️', '🧩', '🔧', '🔌', '⚙️',
  '🗂️', '📁', '🗄️', '📊', '💾', '🌐', '🔍', '⚡','🍑', '🍒',  '💋','👄','💍', '💃', '🕺', '👙', '👠', '💩', '🤲', '👏', '👍','🖕','💄',
  '⛈','🌤','🌥','🌦','🌧','🌨','🌩','☂','☔','❄','☃','⛄','☄','💧','🌊','🌚','🌛','🌜','☀','🌘'
];
isRecording: boolean = false;
mediaRecorder!: MediaRecorder;
audioChunks: Blob[] = [];
recordingTime: number = 0;
recordingInterval: any;
projectImages: { [key: number]: string } = {}; 

  constructor(private projectService: ProjetService ,private notifService :NotifService,private authService:AuthService,private router: Router,private activatedRoute:ActivatedRoute ,private dialogue: MatDialog ,private http: HttpClient,private sanitizer: DomSanitizer, private userService: UserService, private chatService: ChatService) {}

  ngOnInit(): void {
    this.userId = JSON.parse(localStorage.getItem('currentUser') || '{}');
    this.GetNotif()
    this.username = this.userId.user.prenomUser;
    this.senderId = this.userId.user.idUser; 
    this.socket = io('http://localhost:3000');
    this.activatedRoute.data.subscribe((data: any) => {
      const title = data.title || 'Titre par défaut';
      document.title = `Canvas | ${title}`;
    });
    this.getUserPhoto1()
    this.getUsersByInvitations()
    this.getPendingInvites()
    this.listenForNewInvites();

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

  GetNotif() {
    this.notifService.getLiveNotifications(this.userId.user.idUser)
      .subscribe((newNotifications: Notification[]) => {
        newNotifications.forEach((notification) => {
          const exists = this.notifications.some(existingNotification => existingNotification.id === notification.id);
          
          if (!exists) {
            this.notifications.push(notification);
          }
        });
        
        this.notifications.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  
        this.unreadNotificationCount = this.notifications.filter(notification => !notification.isRead).length;
      });
  }
  
  
  markNotificationsAsRead(): void {
    this.notifService.markAsRead(this.userId.user.idUser).subscribe(() => {
      console.log('All notifications marked as read');
      this.notifications.forEach(notification => notification.isRead = true);
      this.GetNotif()
    });
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
            user.filePath = messages[index] ? messages[index].filePath : null;
            console.log("file user" ,  user.filePath)
            user.etat = messages[index] ? messages[index].etat : 'true';
            this.getUserPhoto2(user.idUser);
            this.getLastMessage(user.idUser, this.userId.user.idUser);
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

send(audioBlob?: Blob): void {
  const senderId = this.userId.user.idUser;

  this.userService.getUser(senderId).subscribe(user => {
      const username = user.prenomUser;

      if (this.message) {
          const messageData = { 
              username: username, 
              message: this.message,  
              messageType: 'text', 
              senderId: senderId, 
              recipientId: this.userselect
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
      } else if (audioBlob) {
          const formData = new FormData();
          formData.append('file', audioBlob, 'recording.mp3');
          formData.append('username', username);
          formData.append('senderId', senderId.toString());
          formData.append('recipientId', this.userselect.toString());

          this.userService.uploadImage(formData).subscribe(response => {
              const audioUrl = `http://localhost:3000/upload/image/${response.filename}`;

              this.messages.push({ 
                  username: username, 
                  message: '',
                  messageType: 'audio',
                  senderId: senderId,
                  imageUrl: audioUrl
              });
          }, error => {
              console.error('Erreur lors de l\'envoi de l\'audio:', error);
          });
      }
  }, error => {
      console.error('Erreur lors de la récupération du nom d\'utilisateur:', error);
  });
}

toggleRecording() {
  if (this.isRecording) {
    this.stopRecording();
  } else {
    this.startRecording();
  }
}

async startRecording() {
  this.isRecording = true;
  this.recordingTime = 0;
  this.audioChunks = [];

  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  this.mediaRecorder = new MediaRecorder(stream);

  this.mediaRecorder.ondataavailable = (event) => {
    this.audioChunks.push(event.data);
  };

  this.mediaRecorder.start();
  
  this.recordingInterval = setInterval(() => {
    this.recordingTime++;
  }, 1000);
}

stopRecording() {
  this.isRecording = false;
  this.mediaRecorder.stop();

  clearInterval(this.recordingInterval);

  this.mediaRecorder.onstop = () => {
      const audioBlob = new Blob(this.audioChunks, { type: 'audio/mpeg' });

      this.send(audioBlob);
  };
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



timeSince(date: Date | string): string {

  if (typeof date === 'string') {
      date = new Date(date);
  }

  if (isNaN(date.getTime())) {
      return 'Date invalide';
  }

  const now = new Date();
  let seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  const inFuture = seconds < 0;
  seconds = Math.abs(seconds); 

  let interval = Math.floor(seconds / 31536000);
  if (interval >= 1) return inFuture ? `en ligne il ya : ${interval} an${interval > 1 ? 's' : ''}` : `il y a ${interval} an${interval > 1 ? 's' : ''}`;

  interval = Math.floor(seconds / 2592000);
  if (interval >= 1) return inFuture ? `en ligne il ya : ${interval} mois` : `il y a ${interval} mois`;

  interval = Math.floor(seconds / 86400);
  if (interval >= 1) {
      seconds -= interval * 86400;
      const hours = Math.floor(seconds / 3600);
      return inFuture 
          ? `en ligne il ya : ${interval} jour${interval > 1 ? 's' : ''}${hours > 0 ? ` et ${hours} heure${hours > 1 ? 's' : ''}` : ''}`
          : `il y a ${interval} jour${interval > 1 ? 's' : ''}${hours > 0 ? ` et ${hours} heure${hours > 1 ? 's' : ''}` : ''}`;
  }

  interval = Math.floor(seconds / 3600);
  if (interval >= 1) {
      seconds -= interval * 3600;
      const minutes = Math.floor(seconds / 60);
      return inFuture 
          ? `en ligne il ya : ${interval} heure${interval > 1 ? 's' : ''}${minutes > 0 ? ` et ${minutes} minute${minutes > 1 ? 's' : ''}` : ''}`
          : `il y a ${interval} heure${interval > 1 ? 's' : ''}${minutes > 0 ? ` et ${minutes} minute${minutes > 1 ? 's' : ''}` : ''}`;
  }

  interval = Math.floor(seconds / 60);
  if (interval >= 1) {
      seconds -= interval * 60;
      return inFuture 
          ? `en ligne il ya : ${interval} minute${interval > 1 ? 's' : ''}${seconds > 0 ? ` et ${seconds} seconde${seconds > 1 ? 's' : ''}` : ''}`
          : `il y a ${interval} minute${interval > 1 ? 's' : ''}${seconds > 0 ? ` et ${seconds} seconde${seconds > 1 ? 's' : ''}` : ''}`;
  }

  return inFuture ? `en ligne il ya : ${seconds} seconde${seconds > 1 ? 's' : ''}` : `il y a ${seconds} seconde${seconds > 1 ? 's' : ''}`;
}







getUserPhoto(select: number): void {
  this.userPhotoUrl = this.userService.getUserPhotoUrl1(select);

  if (!this.userPhotoUrl) {
    console.error('URL de la photo de l\'utilisateur est invalide');
  }
}

getUserPhoto2(userId: number): void { 
  const imageUrl = this.userService.getUserPhotoUrl1(userId);
  console.log("Image URL:", imageUrl);
  
  const user = this.users.find(u => u.idUser === userId);
  
  if (user) {
    user.imageUser = imageUrl;  
    console.log("User photo assigned:", imageUrl); 

  } else {
    console.error('User not found:', userId);
  }
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

togglePendingInvitesDropdown() {
  this.showPendingInvitesDropdown = !this.showPendingInvitesDropdown;
  this.isDropdownVisible = false
  this.showDropdown = false
}

toggleDropdown() {
  this.showDropdown = !this.showDropdown;
  this.showPendingInvitesDropdown = false
  this.isDropdownVisible = false
}

@HostListener('document:click', ['$event'])
onClickOutside(event: MouseEvent): void {
  const target = event.target as HTMLElement;

  const button = document.querySelector('.btn-light') as HTMLElement;
  const emojiPicker = document.querySelector('.css-1oknx5t1') as HTMLElement;

  const buttonDropdown = document.querySelector('.css-w5qhhs') as HTMLElement;
  const dropdownMenu = document.querySelector('.popover-container') as HTMLElement;
  const pendingButton = document.querySelector('.css-tfolz5') as HTMLElement;
  const dropdown1Menu = document.querySelector('.css-tfolz51') as HTMLElement;

  const clickedInsideEmojiPicker = emojiPicker && emojiPicker.contains(target);
  const clickedInsideButtonEmoji = button && button.contains(target);

  const clickedInsideDropdownMenu = dropdownMenu && dropdownMenu.contains(target);
  const clickedInsideDropdown1Menu = dropdown1Menu && dropdown1Menu.contains(target);
  const clickedInsideButtonDropdown = (buttonDropdown && buttonDropdown.contains(target)) || 
                                      (pendingButton && pendingButton.contains(target));

  if (this.showEmojiPicker && !clickedInsideButtonEmoji && !clickedInsideEmojiPicker) {
    this.showEmojiPicker = false;
  }

  if (!clickedInsideButtonDropdown && !clickedInsideDropdownMenu && !clickedInsideDropdown1Menu) {
    this.showDropdown = false;
    this.showPendingInvitesDropdown = false;
    this.isDropdownVisible = false;
  }
}

toggleDropdown1(): void {

  this.isDropdownVisible = !this.isDropdownVisible;
  this.showDropdown = false
  this.showPendingInvitesDropdown = false
  if (this.isDropdownVisible) {
    setTimeout(() => {
      this.markNotificationsAsRead();
    }, 2000); 
  }
}


logout() {
  this.authService.logout().subscribe({
      next: (response) => {
          console.log("logout", response.message); 
      },
      error: (err) => {
          console.error('Logout error:', err);
      },
  });
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





getPendingInvites(): void {
  this.projectService.getPendingInvites(this.userId.user.idUser).subscribe(
    (response) => {
      this.pendingInvites = response.pendingInvites;
      this.pendingInvitesCount = this.pendingInvites.length;

      this.pendingInvites.forEach((invite) => {
        this.loadImage(invite.projet.idProjet);
   });

      console.log("Pending invites:", this.pendingInvites);
    },
    (error) => {
      console.error('Erreur lors de la récupération des invitations :', error);
    }
  );
}


listenForNewInvites(): void {
  this.projectService.listenForNewInvites().subscribe(
    (data) => {
      this.getPendingInvites();
    },
    (error) => {
      console.error('Erreur lors de l\'écoute des nouvelles invitations :', error);
    }
  );
}


openPopup1(idInvite: number, invite: any): void {
  const dialogRef = this.dialogue.open(PopupAcceptedComponent, {
    width: '600px',
    data: {
      nomUser: invite.projet.user.nomUser,
      projetName: invite.projet.nomProjet,
      canvasName: invite.canvas.nomCanvas,
      idInvite,
    },
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

        this.getPendingInvites()
        this.listenForNewInvites();
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
        this.getPendingInvites()
        this.listenForNewInvites();
      },
      (error) => {
        console.error('Failed to update invitation state:', error);
      }
    );
}

toggleEmojiPicker() {
  this.showEmojiPicker = !this.showEmojiPicker;
}

addEmoji(emoji: string) {
  this.message += emoji;
}

loadImage(projectId: number): void {
  this.projectService.loadImageForProject(projectId).subscribe(response => {
      this.projectImages[projectId] = response.imageUrl;
  }, error => {
      console.error('Error loading image:', error);
  });
}
}

