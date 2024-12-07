import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, Subscription, interval, switchMap } from 'rxjs';
import { project } from 'src/app/models/project';
import { User } from 'src/app/models/user';
import { AuthService } from 'src/app/services/auth.service';
import { ProjetService } from 'src/app/services/projet.service';
import { UserService } from 'src/app/services/user.service';
import { environment } from 'src/environments/environment';
import { PopupAcceptedComponent } from '../popup/popup-accepted/popup-accepted.component';
import { ChatService } from 'src/app/services/chat.service';
import { NotifService } from 'src/app/services/notif.service';
import { Notification } from 'src/app/models/notification'; 
import { io, Socket } from 'socket.io-client';
import { ToastrService } from 'ngx-toastr';
interface BlockData {
  block: any; // Remplacez 'any' par le type approprié pour votre bloc
  donnees: any[]; // Remplacez 'any' par le type approprié pour vos données
}
@Component({
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.scss']
})
export class ProjectComponent implements OnInit{


  @ViewChild('fileInput') fileInput:ElementRef |undefined;


  addProjectModal: boolean = false;

  pendingInvites: any[] = [];
  pendingInvitesCount: number = 0;
  pollSubscription!: Subscription;
  selectedProjectId: string | null = null; 
  userPhotoUrl!: SafeUrl | string; 
  refreshSideBarProject: boolean = false;
  showFirst: boolean = true;

  showPopup =false;
  projects:project[] = [];
userId!:number
userproject!:User 
  imageUrl: any;
  projectImages: { [key: number]: string } = {}; 
  sanitizer: any;
  projectForm!: FormGroup;
  showPopupdelte=false
  defaultImage = 'assets/project.jpg';
  selectedImage: File | null = null;
  users:any
   intervalId: any; 
  messageCount: number = 0;
projectProgress: { [key: number]: number } = {};
projectIdToDelete: number | null = null;
notifications: Notification[] = [];
isDropdownVisible = false;
unreadNotificationCount = 0;
showPendingInvitesDropdown: boolean = false;
showDropdown: boolean = false;
private socket!: Socket;
selectedFile: File | null = null;
user:any
searchQuery:  any;
isSearchVisible: boolean = false; 
  constructor(private activatedRoute:ActivatedRoute ,private chatService:ChatService , private notifService:NotifService ,private dialogue: MatDialog ,private http: HttpClient,private sanitilzer: DomSanitizer,private userService:UserService ,private router: Router,private fb:FormBuilder ,
    private projectService: ProjetService ,private authService:AuthService){}
   ngOnInit(): void {

    this.users = JSON.parse(localStorage.getItem('currentUser') as string);

    this.GetNotif()
    this.getUserById()
    this.socket = io('http://localhost:3000');
    
    this.socket.on('message', () => {
      this.getMessageCount();
    });
    
    
      
    this.activatedRoute.data.subscribe((data: any) => {
      const title = data.title || 'Titre par défaut';
      document.title = `Canvas | ${title}`;
    });
    this.getUserPhoto()
    this.projectService.projectUpdated$.subscribe(() => {
      this.getAllProjectByUser();
    });
   
    this.getPendingInvites()
    this.listenForNewInvites();

    this.projectForm = this.fb.group({
      nomProjet: [''],
      image: [null]
    });
    this.getAllProjectByUser();
    this.getMessageCount()

  }
  onShowFirstChange(value: boolean) {
    this.showFirst = value;
  }

  openCreate(){
  this.showPopup=!this.showPopup;
  console.log(this.showPopup)
  }

  closeCreate(){
    this.showPopup=false;
  }
  closeDialog(event: MouseEvent) {
  
    if (event.target === event.currentTarget) {
      this.showPopup = false;
    }
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

  getUserById(){
    this.userService.getUser(this.users.user.idUser).subscribe(
      (data) => {
        this.user = data;
      },
      (error) => {
        console.error('Erreur lors de la récupération de l\'utilisateur:', error);
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

  preventClose(event: MouseEvent) {
    event.stopPropagation(); 
  }

  idlogedIn!:any;

  id!: number;

  saveProjectId(projectId: number): void {
    localStorage.setItem('selectedProjectId', projectId.toString());
  }
  
  getLogedInUser():any{
    const user= this.authService.getStoredUser()
    this.idlogedIn=user?.idUser
  }

  getuser(){
    const user =this.authService.getStoredUser();
    if(user){
      this.userproject=user
    }
    console.log(user?.role);
    
  }


  loadImage(projectId: number): void {
    this.projectService.loadImageForProject(projectId).subscribe(response => {
      this.projectImages[projectId] = response.imageUrl;
    }, error => {
      console.error('Error loading image:', error);
    });
  }
onSubmit() {
  if (this.projectForm.valid) {
    const userIdObject = this.authService.getStoredUserId();
    const formData = this.projectForm.value;
    const image = this.projectForm.get('image')?.value;

    this.projectService.createProjectWithImage(userIdObject.idUser, formData.nomProjet, image)
      .subscribe(response => {
        console.log('Project created successfully:', response);
        this.projectForm.reset();
        this.closeCreate();
        this.getAllProjectByUser();
      }, error => {
        console.error('Error creating project:', error);
      });
  } else {
    console.error('Form is invalid.');
  }
}

onFileSelected(event: any) {
  const files = event.target.files;
  if (files && files.length > 0) {
    const file = files[0];
    this.projectForm.get('image')!.setValue(file);
  }
}
getImageSrc(file: File): string {
  if (file) {
    return URL.createObjectURL(file);
  } else {
    return 'assets/project.jpg';
  }
}
onDelete() {
  if (this.projectIdToDelete !== null) {
    this.projectService.deleteProject(this.projectIdToDelete, this.users.user.idUser)
      .subscribe(response => {
        console.log('Project deleted successfully:', response);
        this.projectIdToDelete = null;
        this.showPopupdelte = false;
        this.getAllProjectByUser();
      }, error => {
        console.error('Error deleting project:', error);
        if (error && error.error && error.error.message) {
          alert('Vous n\'a pas la permission de le supprimer ' );
        } else {
          alert('Error deleting project. Please try again later.');
        }
      });

  }
}


openDelete(projectId: number){
 this.showPopupdelte=!this.showPopupdelte
 this.projectIdToDelete = projectId;
}

closeDeletePopup() {
  this.showPopupdelte = false;
}

getAllProjectByUser(): void {
  const userIdObject = this.authService.getStoredUserId();

  if (!userIdObject || !userIdObject.idUser) {
    console.info('User is not logged in. Skipping project load.');
    return;
  }

  this.userId = userIdObject.idUser;
  this.projectService.getallProjectByUser(this.userId, this.searchQuery).subscribe(
    (response: any[]) => {
      this.projects = response || [];  

      const selectedProjectId = localStorage.getItem('selectedProjectId');
      if (selectedProjectId === null && this.projects.length > 0) {
        this.saveProjectId(this.projects[0].idProjet);
      }


      this.projects.forEach((project) => {
        this.loadImage(project.idProjet);
        this.getInvitesByUserId(project.idProjet);
      });
    },
    (error) => {
      console.error('Error loading projects:', error);
      this.projects = []; 
    }
  );
}

// visibilité de la saisie de recherche
toggleSearchVisibility(): void {
  this.isSearchVisible = !this.isSearchVisible;
  if (!this.isSearchVisible) {
    this.searchQuery = ''; 
    this.getAllProjectByUser();
  }
}

onSearchChange(): void {
  this.getAllProjectByUser();
}



getInvitesByUserId(projId: number): void {
  this.projectService.getInvitesByUserId(projId)
      .subscribe(
          progressPercentage => {
              this.projectProgress[projId] = progressPercentage;

          },
          error => {
              console.error('Error fetching progress percentage:', error);
          }
      );
}

//update image projet
updateImage(projectId: number): void {
  if (this.selectedFile) {
    this.projectService.updateProjectImage(projectId, this.selectedFile).subscribe({
      next: (response) => {
        console.log('Image mise à jour avec succès', response);
        this.projectImages[projectId] = response.imageUrl; 

        this.loadImage(response.idProjet);
        alert('Image changée avec succès!');

      },
      error: (err) => {
        console.error('Erreur lors de la mise à jour de l\'image', err);
        
        alert('Erreur lors du changement d\'image');
      }
    });
  } else {
    console.error('Aucun fichier sélectionné');

    alert('Veuillez sélectionner une image.');
  }
}

onFileSelected1(event: any, projectId: number): void {
  this.selectedFile = event.target.files[0];
  this.updateImage
  (projectId);
}
//grandire image projet
enlargeImage(event: MouseEvent): void {
  const img = event.target as HTMLElement;
  img.style.transform = 'scale(1.04)';
}

shrinkImage(event: MouseEvent): void {
  const img = event.target as HTMLElement;
  img.style.transform = 'scale(1)';
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

getUserPhoto(): void {
  this.userService.getUserPhotoUrl(this.users.user.idUser).subscribe(
    (res: Blob) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        this.userPhotoUrl = this.sanitilzer.bypassSecurityTrustUrl(reader.result as string);
      };
      reader.readAsDataURL(res);
    },
    error => {
      console.error('Error getting user photo:', error);
    }
  );
}





getPendingInvites(): void {
  this.projectService.getPendingInvites(this.users.user.idUser).subscribe(
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
}







