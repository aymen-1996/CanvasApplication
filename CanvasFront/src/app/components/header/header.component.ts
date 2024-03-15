import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
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

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  projects!:project[];
  userId!:number
  users:any
  pendingInvites: any[] = [];
  pendingInvitesCount: number = 0;
  pollSubscription!: Subscription;
  projectImages: { [key: number]: string } = {}; 

  @Input() showFirstDiv: boolean = true;
  @Output() showFirstDivChange: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Input() showFirstDiv2: boolean = true;
  @Output() showFirstDiv2Change: EventEmitter<boolean> = new EventEmitter<boolean>();

  selectedProjectId: string | null = null; 
  userPhotoUrl!: SafeUrl | string; 

  constructor(private http: HttpClient,private sanitizer: DomSanitizer,private dialogue: MatDialog ,private userService:UserService ,private projectService: ProjetService,private authService:AuthService,private router: Router ) {
  }
  ngOnInit(): void {
    this.users = JSON.parse(localStorage.getItem('currentUser') as string);
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
    this.getAllProjectByUser()
    this.getUserPhoto()

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
  getProjectName(projectId: any): string {
    const project = this.projects.find(project => project.idProjet === projectId);
    return project ? project.nomProjet : 'Projet inconnu';
}
  
  navigateToProject(projectId: number) {
    this.router.navigate(['/canvas', projectId]);
    if (this.router.url.includes('/canvas')) {
      window.location.reload();
    }
  }
  getAllProjectByUser(){
    const userIdObject = this.authService.getStoredUserId();
    if (userIdObject !== null && userIdObject.idUser) {
      this.userId = userIdObject.idUser;
      console.log(this.userId);
      
      this.projectService.getallProjectByUser(this.userId).subscribe((response : project[]) => {
        console.log(response);
        this.projects=response

        console.log("mmmmmmzzzzzzzzz",this.projects)


        this.projects.forEach(project => {
          this.loadImage(project.idProjet);
        });
      });
    
    } else {
      console.error('Error: Unable to retrieve userId.');
    }
}
loadImage(projectId: number) {
  this.projectService.getImageForProject(projectId).subscribe(blob => {
    const imageUrl = URL.createObjectURL(blob);
    this.projectImages[projectId] = imageUrl;
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

showDropdown: boolean = false;

toggleDropdown() {
  this.showDropdown = !this.showDropdown;
}

logout() {
  localStorage.removeItem('currentUser');

  this.router.navigateByUrl('/login')
}




showPendingInvitesDropdown: boolean = false;

togglePendingInvitesDropdown() {
  this.showPendingInvitesDropdown = !this.showPendingInvitesDropdown;
}


openPopup(idInvite: number): void {
  const confirmationMessage = 'Êtes-vous sûr de vouloir supprimer cette Post-it ?';
  const dialogRef = this.dialogue.open(PopupAcceptedComponent, {
    width: '600px',
    data: { confirmationMessage, idInvite },
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