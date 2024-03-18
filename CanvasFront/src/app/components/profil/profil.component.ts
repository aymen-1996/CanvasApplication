import { Component, ElementRef, ViewChild } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Subscription, interval, switchMap } from 'rxjs';
import { PopupAcceptedComponent } from '../popup/popup-accepted/popup-accepted.component';
import { environment } from 'src/environments/environment';
import { ProjetService } from 'src/app/services/projet.service';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from 'src/app/services/user.service';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { FormBuilder, FormGroup } from '@angular/forms';
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
  successMessage: string = '';

  pendingInvites: any[] = [];
  pendingInvitesCount: number = 0;
  pollSubscription!: Subscription;
  selectedProjectId: string | null = null; 
  userPhotoUrl!: SafeUrl | string; 
  refreshSideBarProject: boolean = false;
  showFirst: boolean = true;
  users:any
  userForm!: FormGroup;
  userDetails:any
  constructor(private formBuilder: FormBuilder,private activatedRoute :ActivatedRoute,private dialogue: MatDialog ,private http: HttpClient,private sanitilzer: DomSanitizer,private userService:UserService ,private router: Router,private projectService: ProjetService){

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
    this.getUserPhoto()
  
   
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
    this.getPendingInvites();
  

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
     
    });
  
    this.getUserDetails()

  }
 

  UpdateProfil(): void {
    const updateUserDto = this.userForm.value;
  
    this.userService.updateUser(this.users.user.idUser, updateUserDto).subscribe(
      updatedUser => {
        console.log('Profil utilisateur mis à jour avec succès :', updatedUser);
        this.getUserDetails()
        this.successMessage = 'Profil utilisateur mis à jour avec succès.';
      },
      error => {
        console.error('Une erreur s\'est produite lors de la mise à jour du profil utilisateur :', error);
      }
    );
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
        });
      },
      error => {
        console.error('Une erreur s\'est produite lors de la récupération des détails de l\'utilisateur :', error);
      }
    );
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
      },
      error => {
          console.error('Une erreur s\'est produite lors de la mise à jour de la photo de profil :', error);
      }
  );
}

  



//partie header

togglePendingInvitesDropdown() {
  this.showPendingInvitesDropdown = !this.showPendingInvitesDropdown;
}


toggleDropdown() {
  this.showDropdown = !this.showDropdown;
}

logout() {
  localStorage.removeItem('currentUser');

  this.router.navigateByUrl('/login')
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




getPendingInvites() {
  return this.http.get<any>(`${environment.backendHost}/projet/invites/${this.users.user.idUser}/etat`);
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

