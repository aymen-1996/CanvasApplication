import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, ElementRef, HostListener, ViewChild } from '@angular/core';
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
import { format, isToday, isYesterday, formatDistanceToNow, subDays, isWithinInterval, startOfDay, subWeeks, differenceInCalendarDays, differenceInMinutes } from 'date-fns';
import { fr } from 'date-fns/locale'; 

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
iconsVisibleMap: { [key: string]: boolean } = {};
emojisVisibleMap: { [key: number]: boolean } = {};
selectedMessageId: number | null = null;
isEditing: { [key: string]: boolean } = {};
newMessageContent: string = '';
originalMessageContent: string = '';
currentType: string = 'emoji';
newReaction: string = ''; 
reactionListe:any
isSocketCall: boolean = false;

gifs: string[] = [
'assets/emojigif/Tunisia.gif','assets/emojigif/Palestine.gif','assets/emojigif/joy.gif','assets/emojigif/smile.gif','assets/emojigif/grin.gif','assets/emojigif/grin-sweat.gif','assets/emojigif/rofl.gif','assets/emojigif/wink.gif',
'assets/emojigif/kissing.gif','assets/emojigif/kissing-closed-eyes.gif','assets/emojigif/kiss-heart.gif','assets/emojigif/heart-eyes.gif','assets/emojigif/heart-face.gif','assets/emojigif/starstruck.gif',
'assets/emojigif/partying-face.gif','assets/emojigif/melting.gif','assets/emojigif/down-face.gif','assets/emojigif/slightly-happy.gif','assets/emojigif/smirk.gif','assets/emojigif/drool.gif','assets/emojigif/yum.gif',
'assets/emojigif/woozy.gif','assets/emojigif/grimmacing.gif','assets/emojigif/expressional.gif','assets/emojigif/mouth-none.gif','assets/emojigif/shy.gif','assets/emojigif/Cry.gif','assets/emojigif/cry2.gif','assets/emojigif/pleading.gif',
'assets/emojigif/happy-cry.gif','assets/emojigif/exhale.gif','assets/emojigif/Rage.gif','assets/emojigif/cursing.gif','assets/emojigif/sad.gif','assets/emojigif/sweat.gif','assets/emojigif/silence.gif','assets/emojigif/yawn.gif','assets/emojigif/dizzy-face.gif',
'assets/emojigif/liar.gif','assets/emojigif/hot-face.gif','assets/emojigif/cold-face.gif'
];
emojis: string[] = [
  '😀', '😁', '😂', '🤣', '😃', '😄', '😅', '😆', '😉','😜', '😊','😍', '😘', '😋', '😎', '🤓', '🤔', '😏', '😒', '😔', '😕','🙄',
  '😲', '😧', '😬', '😪', '😵', '🤯', '🥵','😡', '😠', '😇','🤥','🙃', '😘', '🥰', '🤓', '😎', '🧐', '🤩', '🥳', '😰','🤧','🥶',
  '🤗', '🤢', '🥴', '🤐', '😴', '🤮', '🤒','🥱', '🤕', '🤑', '🤗','😱', '😈', '👿', '👻', '💀','☠' ,'👽', '🤖', '🎃', '👋', '👏',
  '👍', '👎', '✌️', '🤝', '🙏', '💪', '👐', '👀', '💫', '✨','🌈', '🌟', '🌹', '🌺', '🌼', '🌻', '🌸', '🌴', '🌍','🤡','👅',
  '🎉', '🎊', '🎈','🎁','🎀','🎄','🧨' ,'💌', '💖', '💗', '💓','❤️‍🔥','💝','❤️‍🩹' ,'💞', '💕', '💘','🧡', '💛', '💚', '💙', '💜', '🤍', '🤎', '🖤', '💔', '❤️',
  '🌊', '🍔', '🍕', '🍣', '🍦', '🍩', '🍪', '🍉', '🍌', '🍓','💻', '🖥️', '🖱️', '⌨️', '📱', '🕹️', '🧩', '🔧', '🔌', '⚙️',
  '🗂️', '📁', '🗄️', '📊', '💾', '🌐', '🔍', '⚡','🍑', '🍒',  '💋','👄','💍', '💃', '🕺', '👙', '👠', '💩', '🤲', '👏', '👍','🖕','💄',
  '⛈','🌤','🌥','🌦','🌧','🌨','🌩','☂','☔','❄','☃','⛄','☄','💧','🌊','🌚','🌛','🌜','☀','🌘','🎖️','🏆','🥇','🥈','🥉','🎲',


];
isRecording: boolean = false;
mediaRecorder!: MediaRecorder;
audioChunks: Blob[] = [];
recordingTime: number = 0;
recordingInterval: any;
projectImages: { [key: number]: string } = {}; 
reactions: any = {}; 

@ViewChild('audioPlayer') audioPlayerRef!: ElementRef<HTMLAudioElement>;
  
isPlayingMap: { [key: number]: boolean } = {};
formattedTimeMap: { [key: number]: string } = {};

  constructor(private projectService: ProjetService ,private cdRef: ChangeDetectorRef,private notifService :NotifService,private authService:AuthService,private router: Router,private activatedRoute:ActivatedRoute ,private dialogue: MatDialog ,private http: HttpClient,private sanitizer: DomSanitizer, private userService: UserService, private chatService: ChatService) {}

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

   
    this.socket.on('message', (data: { 
      id:number
      content: string; 
      senderId: string; 
      recipientId: number; 
      sentAt: string;
      messageType: string; 
      filePath?: string | null; 
      reactions:any
    }) => {
      console.log('Message reçu:', data);
      this.getUsersByInvitations();
      const senderId = parseInt(data.senderId, 10);

      this.userService.getUser(senderId).subscribe(user => {
        const username = user.prenomUser;
    
        const formattedMessage = {
          id: data.id, 
          username: username,
          message: data.filePath ? '' : data.content,
          messageType: data.filePath ? 'image' : 'text',
          senderId: senderId,
          recipientId: data.recipientId,
          imageUrl: data.filePath ? `http://localhost:3000/upload/image/${data.filePath}` : null,
          timestamp: data.sentAt,
          reactions:data.reactions
        };
    
        this.messages.push(formattedMessage);
        console.log('Messages après ajout:', this.messages);
        this.scrollToBottom();
      }, error => {
        console.error('Erreur lors de la récupération du nom d utilisateur:', error);
      });
  
    });

    this.chatService.listenToDeleteMessage().subscribe(({ messageId, userId }) => {
      this.deleteMessageFromList(messageId);
    
      console.log(`Message ${messageId} deleted by user ${userId}`);
    
      setTimeout(() => {
        this.getUsersByInvitations();
      }, 500);
    });
    

    this.chatService.listenToUpdatedMessage().subscribe((updatedMessage: any) => {
      this.updateMessageInList(updatedMessage);
        this.getUsersByInvitations();

    });

    this.socket.on('reactionUpdated', (updatedReaction: any) => {
      console.log('Mise à jour reçue:', updatedReaction);

      const message = this.messages.find((msg) => msg.id === updatedReaction.idMessage);
      if (message) {
        message.reactions = message.reactions.filter(
          (reaction: { username: any; }) => reaction.username !== updatedReaction.idUser
        ); 
        message.reactions.push({
          reaction: updatedReaction.newReaction,
          username: updatedReaction.idUser,
        });
      }
      this.getUsersByInvitations()
      this.isSocketCall = true;
      this.loadMessages(this.userId.user.idUser, this.userselect, false);

    });

  }

  calculateMarginTop(reactionsCount: number, reactionsLength: number): string {
    if (reactionsLength === 2 && reactionsCount === null) {
      return '-135px';
    } else if (reactionsLength === 1 && reactionsCount === null) {
      return '-101px';
    } else if (reactionsCount === 2 && reactionsLength === 2) {
      return '-140px';
    }else {
      return '-140px';
    }  
  }
  
  
  
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedImage = input.files[0]; 
  
      input.value = ''; 
    }
  }
  
  selectedReaction:any

  toggleReactionMenu(msgId: any): void {
    if (this.selectedReaction === msgId) {
      this.selectedReaction = null;
    } else {
      this.loadReactions(msgId)
 this.selectedReaction = msgId;
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
        this.chatService.getLastMessage(user.idUser, this.userId.user.idUser),
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
      this.updateMessageInList(message);

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
    },
    (error) => {
      console.error('Erreur lors de la récupération de l\'utilisateur:', error);
    }
  );
}

send(item?: string | Blob): void {
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
        this.selectedImage = null; 
      });

    } else if (item instanceof Blob) {
      const formData = new FormData();
      formData.append('file', item, 'recording.mp3');
      formData.append('username', username);
      formData.append('senderId', senderId.toString());
      formData.append('recipientId', this.userselect.toString());

      this.userService.uploadImage(formData).subscribe(response => {
      }, error => {
        console.error('Erreur lors de l\'envoi de l\'audio:', error);
      });

    } else if (item) {
      const messageData = { 
        username: username, 
        message: item,  
        messageType: 'emoji/gif',
        senderId: senderId, 
        recipientId: this.userselect
      };
      this.showEmojiPicker=false
      this.socket.emit('message', messageData);
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

loadReactions(idMessage:any): void {
  this.chatService.getReactionsByMessageId(idMessage)
    .subscribe(
      (reactions) => {
        this.reactionListe = reactions; 
      },
      (error) => {
        console.error('Erreur lors du chargement des réactions:', error);
      }
    );
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
loadMessages(senderId: any, recipientId: any, shouldScroll: boolean = true): void {
  this.userService.getUser(recipientId).subscribe(
    (recipientData) => {
      const recipientName = recipientData.nomUser;

      this.chatService.getMessagesBetweenUsers(senderId, recipientId).subscribe(
        (data) => {
          this.messages = data.map((msg: { 
            id: number;
            senderId: any; 
            recipientId: any; 
            content: any; 
            filePath: string | null; 
            sentAt: string;
            reactions: any[]; 
          }) => {
            const messageType = msg.filePath ? 'image' : 'text';

            const validReactions = (msg.reactions || []).filter(
              (reaction: any) => reaction?.user?.nomUser
            );

            const reactionsCount = validReactions.reduce((acc, reaction: { 
              reaction: string; 
              user: { nomUser: string, idUser: number }; 
            }) => {
              const reactionKey = reaction.reaction;
              if (!acc[reactionKey]) {
                acc[reactionKey] = { reaction: reactionKey, count: 0, users: [] };
              }
              acc[reactionKey].count++;
              acc[reactionKey].users.push(reaction.user.nomUser);
              return acc;
            }, {});

            const reactions = Object.values(reactionsCount).map((reaction: any) => {
              return {
                reaction: reaction.reaction,
                count: reaction.count > 1 ? reaction.count : null,
                users: reaction.users
              };
            });

            return {
              id: msg.id,
              senderId: msg.senderId,
              recipientId: msg.recipientId,
              message: msg.content,
              username: recipientName, 
              messageType: messageType,
              imageUrl: msg.filePath ? `http://localhost:3000/upload/image/${msg.filePath}` : null,
              timestamp: new Date(msg.sentAt).toLocaleString(),
              reactions: reactions 
            };
          });

          if (shouldScroll) {
            this.scrollToBottom();
          }

          console.log("Messages après rechargement:", this.messages);
        },
        (error) => {
          console.error('Erreur lors de la récupération des messages', error);
        }
      );
    },
    (error) => {
      console.error('Erreur lors de la récupération du destinataire', error);
    }
  );
}






isReactionSelected(idMessage: number, reaction: string): boolean {
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  const userId = currentUser?.user?.idUser;

  if (!userId) {
    return false; 
  }

  const message = this.messages.find((msg: any) => msg.id === idMessage);
  console.log('message:', message);

  if (!message || !message.reactions) {
    return false; 
  }

  const isSelected = message.reactions.some((react: any) => react.reaction === reaction && react.users.includes(currentUser.user.nomUser));
  return isSelected;
}





//formatter date de msg
formatDate(timestamp: any): string {
  if (!timestamp) {
    return '';
  }

  const today = new Date();
  const minutesDifference = differenceInMinutes(today, timestamp);
  
  if (minutesDifference < 2) {
    return "À l'instant";
  }

  if (isToday(timestamp)) {
    return `Aujourd'hui à ${format(timestamp, 'HH:mm')}`;
  }

  if (isYesterday(timestamp)) {
    return `Hier à ${format(timestamp, 'HH:mm')}`;
  }

  const daysDifference = differenceInCalendarDays(today, timestamp);

  if (daysDifference <= 7) {
    return `Il y a ${daysDifference} jour${daysDifference > 1 ? 's' : ''} à ${format(timestamp, 'HH:mm')}`;
  }

  if (daysDifference <= 28) {
    const weeksDifference = Math.floor(daysDifference / 7);
    return `Il y a ${weeksDifference === 1 ? '1 semaine' : weeksDifference === 2 ? '2 semaines' : '3 semaines'} à ${format(timestamp, 'HH:mm')}`;
  }

  return format(timestamp, 'd MMMM yyyy', { locale: fr });
}

forceChangeDetection() {
  this.cdRef.detectChanges();
}


extractFileName(fileName: string): string {
  const parts = fileName.split('-');
  return parts.length > 1 ? parts.slice(1).join('-') : fileName;
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

  if (this.selectedMessageId && (this.emojisVisibleMap[this.selectedMessageId] || this.iconsVisibleMap[this.selectedMessageId])) {
    return;
  }

  Object.keys(this.iconsVisibleMap).forEach(key => {
    const msgId = parseInt(key);
    if (this.iconsVisibleMap[msgId] && !target.closest('.ri-emotion-happy-line') && !target.closest('.ri-more-2-fill')) {
      this.iconsVisibleMap[msgId] = false;
    }
  });

  if (!target.closest('.dropdown-menu') && !target.closest('.ri-more-2-fill')) {
    this.selectedMessageId = null;
  }

  Object.keys(this.emojisVisibleMap).forEach(key => {
    const msgId = parseInt(key);
    if (this.emojisVisibleMap[msgId] && !target.closest('.emoji-container1') && !target.closest('.ri-emotion-happy-line')) {
      this.emojisVisibleMap[msgId] = false;
    }
  });

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

imageUrl: string = 'http://localhost:4200/avatar.png';

onError(event: any) {
  this.imageUrl ='http://localhost:4200/avatar.png';
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

//liste invitation
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

// ouvrir popup
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


// accept invite
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
        this.getUsersByInvitations()
      },
      (error) => {
        console.error('Failed to update invitation state:', error);
      }
    );
}

// delte invitaion dans le cas de refus
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

isGif(emoji: string): boolean {
  return typeof emoji === 'string' && emoji.endsWith('.gif');
}

showType(type: string): void {
  this.currentType = type; 
}

loadImage(projectId: number): void {
  this.projectService.loadImageForProject(projectId).subscribe(response => {
      this.projectImages[projectId] = response.imageUrl;
  }, error => {
      console.error('Error loading image:', error);
  });
}

//delete msg
deleteMessage(messageId: number): void {
  this.chatService.deleteMessage(messageId , this.userId.user.idUser).subscribe(
    () => {
      
    },
    (error) => {
      console.error('Erreur lors de la suppression du message:', error);
    }
  );
}

//liste en temp reel selon delete msg
deleteMessageFromList(messageId: number): void {
  const idToDelete = Number(messageId);
  const index = this.messages.findIndex(msg => msg.id === idToDelete);

  if (index !== -1) {
    this.messages.splice(index, 1);
  } else {
  }
}


//copy msg
copyMessage(message: string): void {
  navigator.clipboard.writeText(message)
    .then(() => {
      this.selectedMessageId =null
      console.log('Message copié dans le presse-papiers :', message);
    })
    .catch((error) => {
      console.error('Erreur lors de la copie du message :', error);
    });
}

//ouvrir dropdown icon delte ,copie msg
toggleDropdownicons(id: number) {
  this.selectedMessageId = this.selectedMessageId === id ? null : id;  
  this.emojisVisibleMap[id] = false

}

//ouvrir toggle emoji pour faire reaction pour certain msg
toggleEmojis(msgId: number) {
  this.selectedMessageId =null
  this.emojisVisibleMap[msgId] = !this.emojisVisibleMap[msgId];
}

// affiche icon smile et 3pt de msg
showIcons(msgId: number) {
  Object.keys(this.iconsVisibleMap).forEach(key => {
    const id = parseInt(key);
    if (id !== msgId) { 
      this.iconsVisibleMap[id] = false;    
      this.emojisVisibleMap[id] = false;   
      this.selectedMessageId =null
    }
  });

  this.iconsVisibleMap[msgId] = true;
}


  
// Fonction pour activer le mode édition
editMessage(msg: any): void {
  this.isEditing[msg.id] = true; 
  this.originalMessageContent = msg.message;
  this.selectedMessageId = null;
}

// Update message
updateMessage(messageId: number): void {
  const messageContent = this.newMessageContent.trim();

  const contentToUpdate = messageContent !== '' ? messageContent : this.originalMessageContent;

  if (contentToUpdate.trim() !== '') {
    this.chatService.updateMessage(messageId, contentToUpdate).subscribe(updatedMessage => {
      this.isEditing[messageId] = false;
      console.log('Message updated:', updatedMessage);
    });
  } else {
    console.error('Message content cannot be empty.');
  }
}

updateMessageInList(updatedMessage: any): void {
  if (!updatedMessage || typeof updatedMessage.messageId === 'undefined') {
    return;
  }

  const messageId = Number(updatedMessage.messageId);
  const index = this.messages.findIndex(msg => msg.id === messageId);

  if (index !== -1) {
    this.messages[index].message = updatedMessage.newContent;
  }
}

 
ReactMessage(idMessage: number, reaction: string): void {
  if (reaction) {
    this.chatService.createOrUpdateReaction(this.userId.user.idUser, idMessage, reaction).subscribe(
      (response) => {
        this.emojisVisibleMap[idMessage] =false
        console.log('Réaction enregistrée ou mise à jour avec succès:', response);
      },
      (error) => {
        console.error('Erreur lors de la mise à jour de la réaction:', error);
      }
    );
  } else {
    console.error('Aucune réaction choisie');
  }
}



  //*partie audio bubble*

  //play audio
  togglePlay(idmsg: number) {
    const audioPlayer = document.querySelector(`#audioPlayer_${idmsg}`) as HTMLAudioElement;
    
    if (!audioPlayer) {
      console.error(`L'élément audio avec id ${idmsg} est introuvable`);
      return;
    }
  
    if (!audioPlayer.src) {
      console.error(`Aucune source audio valide pour l'élément avec id ${idmsg}`);
      return;
    }
  
    for (const [key, isPlaying] of Object.entries(this.isPlayingMap)) {
      if (isPlaying && key !== idmsg.toString()) {
        const otherAudioPlayer = document.querySelector(`#audioPlayer_${key}`) as HTMLAudioElement;
        if (otherAudioPlayer) {
          otherAudioPlayer.pause(); 
        }
        this.isPlayingMap[+key] = false;
        this.updatePlayIcon(+key);
      }
    }
  
    if (audioPlayer.paused) {
      audioPlayer.play().catch((error) => {
        console.error('Erreur lors de la lecture audio:', error);
      });
      this.isPlayingMap[idmsg] = true;
    } else {
      audioPlayer.pause();
      this.isPlayingMap[idmsg] = false;
    }
  
    this.updatePlayIcon(idmsg);
  }
  
  //chnage icon si play ou pause audio
  updatePlayIcon(idmsg: number) {
    const playIcon = document.querySelector(`#playIcon_${idmsg}`) as HTMLElement;
    if (playIcon) {
      if (this.isPlayingMap[idmsg]) {
        playIcon.classList.remove('play-icon');
        playIcon.classList.add('pause-icon');
      } else {
        playIcon.classList.remove('pause-icon');
        playIcon.classList.add('play-icon');
      }
    }
  }

  //temp d audio
  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  }
  
  //chnage icon pause si audio ended
  onAudioEnded(idmsg: number) {
    this.isPlayingMap[idmsg] = false;
    this.updatePlayIcon(idmsg);
  }
  
  onTimeUpdate(idmsg: number, currentTime: number) {
    this.formattedTimeMap[idmsg] = this.formatTime(currentTime);
  }
  
  onLoadedData(idmsg: number, audioPlayer: HTMLAudioElement) {
    this.formattedTimeMap[idmsg] = this.formatTime(audioPlayer.currentTime);
  }
  
}