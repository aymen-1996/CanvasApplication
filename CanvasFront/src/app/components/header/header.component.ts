import { Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { project } from 'src/app/models/project';
import { AuthService } from 'src/app/services/auth.service';
import { ProjetService } from 'src/app/services/projet.service';
import { UserService } from 'src/app/services/user.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { MatDialog } from '@angular/material/dialog';
import { PopupAcceptedComponent } from '../popup/popup-accepted/popup-accepted.component';
import { Subscription, interval, switchMap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { CanvasComponent } from '../canvas/canvas.component';
import { NotifService } from 'src/app/services/notif.service';
import { ChatService } from 'src/app/services/chat.service';
import { Notification } from 'src/app/models/notification';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  projects!:project[];
  userId!:number
  users:any
  showDropdown: boolean = false;
  showPendingInvitesDropdown: boolean = false;
  currentProject: any;
  pendingInvites: any[] = [];
  pendingInvitesCount: number = 0;
  pollSubscription!: Subscription;
  projectImages: { [key: number]: string } = {}; 
idBlock:any
  @Input() showFirstDiv: boolean = true;
  @Output() showFirstDivChange: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Input() showFirstDiv2: boolean = true;
  @Output() showFirstDiv2Change: EventEmitter<boolean> = new EventEmitter<boolean>();

  selectedProjectId: string | null = null; 
  userPhotoUrl!: SafeUrl | string; 
  selectedProject:any

  notifications: Notification[] = [];
  isDropdownVisible = false;
  unreadNotificationCount = 0;
  showComments: boolean = false;
  isSliding: boolean = false; 
  messageCount: number = 0;
  intervalId: any; 

  constructor(private canvasComponent:CanvasComponent,private notifService:NotifService,private chatService:ChatService,private activatedRoute: ActivatedRoute,private http: HttpClient,private sanitizer: DomSanitizer,private dialogue: MatDialog ,private userService:UserService ,private projectService: ProjetService,private authService:AuthService,private router: Router ) {
    this.idBlock = this.activatedRoute.snapshot.params['id'];

  }
  ngOnInit(): void {
    this.users = JSON.parse(localStorage.getItem('currentUser') as string);
    this.selectedProject =  localStorage.getItem('selectedProjectId');
    this.GetNotif()
    this.getMessageCount()
    this.intervalId = setInterval(() => {
      this.getMessageCount();
    }, 5000);  
    this.pollSubscription = interval(1000)
    .pipe(
      switchMap(() => this.getPendingInvites())
    )
    .subscribe(
      (response) => {
        this.pendingInvites = response.pendingInvites;
        this.pendingInvitesCount = this.pendingInvites.length;
        this.pendingInvites.forEach(invite => {
          this.loadImage(invite.projet.idProjet);
      });
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
    this.getAllProjectByUser()
    this.getUserPhoto()

  }

   //nombre msg
   getMessageCount() {
    this.chatService.getMessagesCountByRecipientId(this.users.user.idUser).subscribe(
      (count: number) => {
        this.messageCount = count;
        console.log("count" , this.messageCount)
      },
      (error) => {
        console.error('Error fetching message count', error);
      }
    );
  }

GetNotif() {
  this.notifService.getLiveNotifications(this.users.user.idUser)
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
  this.notifService.markAsRead(this.users.user.idUser).subscribe(() => {
    console.log('All notifications marked as read');
    this.notifications.forEach(notification => notification.isRead = true);
    this.GetNotif()
  });
}



  ngOnDestroy() {
    this.pollSubscription.unsubscribe();
  }

  getPendingInvites() {
    return this.http.get<any>(`${environment.backendHost}/projet/invites/${this.users.user.idUser}/etat`);
  }
  toggleDiv() {
    this.showFirstDiv = !this.showFirstDiv;
    this.showFirstDivChange.emit(this.showFirstDiv);
  }
  toggleDivSin() {
    this.showFirstDiv = !this.showFirstDiv;
    this.showFirstDiv2 = !this.showFirstDiv2;
    this.showFirstDiv2Change.emit(this.showFirstDiv2);
  }
  
  onProjectSelect(selectedProject: any): void {
    if (selectedProject && selectedProject.idProjet) {
      this.selectedProjectId = selectedProject.idProjet.toString();
      localStorage.setItem('selectedProjectId', this.selectedProjectId || ``);

      const projectId = Number(this.selectedProjectId);

      if (!isNaN(projectId)) {
        this.canvasComponent.listeCanvases(projectId);
        this.canvasComponent.getProject(projectId);
      } else {
        console.error('Project ID is not a valid number.');
      }
    }
  }


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

  getAllProjectByUser() {
    const userIdObject = this.authService.getStoredUserId();
    if (userIdObject !== null && userIdObject.idUser) {
      this.userId = userIdObject.idUser;
      console.log(this.userId);
      
      this.projectService.getallProjectByUser(this.userId).subscribe((response: project[]) => {
        console.log(response);
        this.projects = response;
  
        console.log("mmmmmmzzzzzzzzz", this.projects);
        
        // Utilisation de find() pour rechercher un projet avec idCanvas égal à this.idBlock
        this.currentProject = this.projects.find(project => project.idProjet === this.selectedProject);
  
        this.projects.forEach(project => {
          this.loadImage(project.idProjet);
        });
      });
    } else {
      console.error('Error: Unable to retrieve userId.');
    }
  }
  
  loadImage(projectId: number): void {
    this.projectService.loadImageForProject(projectId).subscribe(response => {
      this.projectImages[projectId] = response.imageUrl;
    }, error => {
      console.error('Error loading image:', error);
    });
  }
  


getUserPhoto(): void {
  this.userService.getUserPhotoUrl(this.userId).subscribe(
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

@HostListener('document:click', ['$event'])
onDocumentClick(event: MouseEvent) {
  const button = document.querySelector('.css-w5qhhs');
  const dropdownMenu = document.querySelector('.popover-container');
  const pendingButton = document.querySelector('.css-tfolz5');
  const dropdown1Menu = document.querySelector('.css-tfolz51'); 

  const clickedInsideDropdownMenu = dropdownMenu && dropdownMenu.contains(event.target as Node);
  const clickedInsideDropdown1Menu = dropdown1Menu && dropdown1Menu.contains(event.target as Node);

  const clickedInsideButton = (button && button.contains(event.target as Node)) || 
                              (pendingButton && pendingButton.contains(event.target as Node));

  if (!clickedInsideButton && !clickedInsideDropdownMenu && !clickedInsideDropdown1Menu) {
    this.showDropdown = false;
    this.showPendingInvitesDropdown = false;
    this.isDropdownVisible = false;
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



openPopup(idInvite: number, invite: any): void {
  const dialogRef = this.dialogue.open(PopupAcceptedComponent, {
    width: '600px',
    data: {
      nomUser: invite.projet.user.nomUser,
      projetName: invite.projet.nomProjet,
      idInvite,
    },
  });

  dialogRef.afterClosed().subscribe((result) => {
    if (result && result.action === 'delete') {
      console.log('Suppression confirmée');
      this.delete(idInvite, this.users.user.idUser);
    } else if (result && result.action === 'accept') {
      console.log('Accepter');
      this.updateInviteState(this.users.user.idUser, idInvite);
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
        this.getAllProjectByUser()
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