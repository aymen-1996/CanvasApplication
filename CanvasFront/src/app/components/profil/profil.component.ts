import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Observable, Subscription, interval, switchMap } from 'rxjs';
import { PopupAcceptedComponent } from '../popup/popup-accepted/popup-accepted.component';
import { environment } from 'src/environments/environment';
import { ProjetService } from 'src/app/services/projet.service';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from 'src/app/services/user.service';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { FormBuilder, FormGroup } from '@angular/forms';
import { io, Socket } from 'socket.io-client';
import { NotifService } from 'src/app/services/notif.service';
import { Notification } from 'src/app/models/notification'; 
import { AuthService } from 'src/app/services/auth.service';
import { CommentaireService } from 'src/app/services/commentaire.service';
import * as alertify from 'alertifyjs';

interface City {
  name: string
}
@Component({
  selector: 'app-profil',
  templateUrl: './profil.component.html',
  styleUrls: ['./profil.component.css']
})
export class ProfilComponent {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  governorates : City[] | any;
  selectedFile: File | null = null; 
  addProjectModal: boolean = false;
  showPendingInvitesDropdown: boolean = false;
  showDropdown: boolean = false;
  successMessage:any;

  pendingInvites: any[] = [];
  pendingInvitesCount: number = 0;
  pollSubscription!: Subscription;
  selectedProjectId: string | null = null; 
  userPhotoUrl!: SafeUrl | string; 
  refreshSideBarProject: boolean = false;
  showFirst: boolean = true;
  users:any
  userForm!: FormGroup;
  userDetails: any = {};
  projectImages: { [key: number]: string } = {}; 
  userPhotoUrl1!: SafeUrl | string; 
  private socket!: Socket;
  notifications: Notification[] = [];
    isDropdownVisible = false;
  unreadNotificationCount = 0;
  progress: any; 
  cvFile: File | null = null;
  cvFileName: string = '';
  isCvVisible: boolean = true;
  constructor(private formBuilder: FormBuilder,private sanitizer: DomSanitizer,private authService:AuthService,private notifService :NotifService ,private activatedRoute :ActivatedRoute,private dialogue: MatDialog ,private http: HttpClient,private sanitilzer: DomSanitizer,private userService:UserService ,private router: Router,private projectService: ProjetService , private commentaireService:CommentaireService){
    alertify.set('notifier', 'position', 'top-right'); 


    this.governorates = [
      { name: 'Tunis' },
      { name: 'Ariana' },
      { name: 'Ben Arous' },
      { name: 'Manouba' },
      { name: 'Nabeul' },
      { name: 'Zaghouan' },
      { name: 'Bizerte' },
      { name: 'Beja' },
      { name: 'Jendouba' },
      { name: 'Kef' },
      { name: 'Siliana' },
      { name: 'Kairouan' },
      { name: 'Kasserine' },
      { name: 'Sidi Bouzid' },
      { name: 'Sfax' },
      { name: 'Gabes' },
      { name: 'Medenine' },
      { name: 'Tataouine' }
    ];
  }
  ngOnInit(): void {
    this.activatedRoute.data.subscribe((data: any) => {
      
      const title = data.title || 'Titre par défaut';
      document.title = `Canvas | ${title}`;
    });

    this.users = JSON.parse(localStorage.getItem('currentUser') as string);
    this.socket = io('http://localhost:3000');

    this.getUserPhoto()
    this.getPendingInvites();
    this.listenForNewInvites();
    this.getUserProgress();
    this.GetNotif()
    this.userForm = this.formBuilder.group({
      nomUser: [''],
      prenomUser: [''],
      emailUser: [''],
      gov: [''],
      datenaissance: [''],
      adresse: [''],
      education: [''],
      qualification: [''],
      imageUser: [''],
      genre: [''],
      cv: [''],
     
    });
  
    this.getUserDetails()

  }

  showSuccessMessage(message: string) {
    alertify.success(message);

    setTimeout(() => {
      alertify.dismissAll();
    }, 4000);
  }
  UpdateProfil(): void {
    const updateUserDto = this.userForm.value;
  
    this.userService.updateUser(this.users.user.idUser, updateUserDto).subscribe(
      updatedUser => {
        console.log('Profil utilisateur mis à jour avec succès :', updatedUser);
  
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        
        if (currentUser && currentUser.user) {
          currentUser.user.nomUser = updatedUser.nomUser || currentUser.user.nomUser;
          currentUser.user.prenomUser = updatedUser.prenomUser || currentUser.user.prenomUser;
          
          localStorage.setItem('currentUser', JSON.stringify(currentUser));
        }
  
        this.getUserDetails();
        this.getUserProgress();
  
        this.showSuccessMessage('Profil utilisateur mis à jour avec succès.');
      },
      error => {
        console.error('Une erreur s\'est produite lors de la mise à jour du profil utilisateur :', error);
      }
    );
  }
  
  
  
  onFileChange(event: any): void {
    this.cvFile = event.target.files[0];
    if (this.cvFile) {
      this.onUpload();
    }
  }

  onUpload(): void {
    if (this.cvFile) {
      this.userService.uploadCv(this.users.user.idUser, this.cvFile).subscribe({
        next: (response) => {
          this.getUserDetails();
          this.getUserProgress();
          this.isCvVisible = true;
          alert('CV uploaded successfully!');
          console.log('CV uploaded successfully:', response);
        },
        error: (err) => {
          console.error('Error uploading CV:', err);
        }
      });
    }
  }
  
  
  
  toggleUploadCv() {
    this.isCvVisible = !this.isCvVisible;
}
extractFileName(fileName: string): string {
  const parts = fileName.split('_');
  return parts.length > 1 ? parts.slice(1).join('_') : fileName;
}

  getUserDetails(): void {
    this.userService.getUser(this.users.user.idUser).subscribe(
      (user: any) => {
        this.userDetails = user; 
        console.log('Détails de l\'utilisateur récupérés avec succès :', this.userDetails);
  
        this.userForm.patchValue({
          nomUser: this.userDetails.nomUser,
          prenomUser: this.userDetails.prenomUser,
          emailUser: this.userDetails.emailUser,
          gov: this.userDetails.gov,
          datenaissance: this.userDetails.datenaissance,
          adresse: this.userDetails.adresse,
          education: this.userDetails.education,
          qualification: this.userDetails.qualification,
          imageUser:this.userDetails.imageUser,
          genre: this.userDetails.genre,
          cv:this.userDetails.cv
        });
      },
      error => {
        console.error('Une erreur s\'est produite lors de la récupération des détails de l\'utilisateur :', error);
      }
    );
  }
  getUserProgress(): void {
    this.userService.getUserProgress(this.users.user.idUser).subscribe(
      (progress) => {
        this.progress = progress;
        this.getProgressColor()
        console.log("progresse", this.progress)
      },
      (error) => {
        console.error('Erreur lors de la récupération de la progression:', error);
      }
    );
  }

  getProgressColor(): string {
    if (this.progress <= 25) {
        return 'rgb(255, 0, 0)'; 
    } else if (this.progress <= 50) {
        return 'rgb(214, 47, 47)';
    } else if (this.progress <= 75) {
        return 'rgb(245, 103, 67)'; 
    } else if (this.progress <= 95) {
        return 'rgb(79, 240, 146)';
    } else if (this.progress <= 100) {
        return 'rgb(0, 128, 0)'; 
    } else {
        return 'rgb(0, 0, 0)'; 
    }
}


  openFileInput(): void {
    const fileInput = this.fileInput.nativeElement as HTMLInputElement;
    fileInput.click();
}

onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = () => {
            this.userPhotoUrl = reader.result as string;
        };
        reader.readAsDataURL(file);

        this.updatePhoto(file);
    }
}

updatePhoto(file: File): void {
  this.userService.updatePhoto(this.users.user.idUser, file).subscribe(
      response => {
          console.log('Photo de profil mise à jour avec succès :', response);
          alert('Photo de profil mise à jour avec succès!');

          this.getUserPhoto()
          this.getUserProgress()
1      },
      error => {
          console.error('Une erreur s\'est produite lors de la mise à jour de la photo de profil :', error);
      }
  );
}

openCV() {
  this.userService.getUserCV(this.users.user.idUser).subscribe({
    next: (blob: Blob) => {
      const blobUrl = window.URL.createObjectURL(blob);
      window.open(blobUrl);
      setTimeout(() => {
        window.URL.revokeObjectURL(blobUrl);
      }, 100);
    },
    error: (err) => {
      console.error('Erreur lors de l\'ouverture du CV:', err);
    },
  });
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

  
  const clickedInsideDropdownMenu = dropdownMenu && dropdownMenu.contains(target);
  const clickedInsideDropdown1Menu = dropdown1Menu && dropdown1Menu.contains(target);
  const clickedInsideButtonDropdown = (buttonDropdown && buttonDropdown.contains(target)) || 
                                      (pendingButton && pendingButton.contains(target));


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


loadImage(projectId: number): void {
  this.projectService.loadImageForProject(projectId).subscribe(response => {
      this.projectImages[projectId] = response.imageUrl;
  }, error => {
      console.error('Error loading image:', error);
  });
}
}

