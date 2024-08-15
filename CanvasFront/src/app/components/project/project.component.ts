import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, interval, switchMap } from 'rxjs';
import { project } from 'src/app/models/project';
import { User } from 'src/app/models/user';
import { AuthService } from 'src/app/services/auth.service';
import { ProjetService } from 'src/app/services/projet.service';
import { UserService } from 'src/app/services/user.service';
import { environment } from 'src/environments/environment';
import { PopupAcceptedComponent } from '../popup/popup-accepted/popup-accepted.component';
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
  projects!:project[];
userId!:number
userproject!:User 
  imageUrl: any;
  projectImages: { [key: number]: string } = {}; 
  sanitizer: any;
  projectForm!: FormGroup;
  showPopupdelte=false
  defaultImage = 'assets/project.jpg'; // Replace with your default image URL
  selectedImage: File | null = null;
  users:any
projectProgress: { [key: number]: number } = {};
  constructor(private activatedRoute:ActivatedRoute ,private dialogue: MatDialog ,private http: HttpClient,private sanitilzer: DomSanitizer,private userService:UserService ,private router: Router,private fb:FormBuilder ,private projectService: ProjetService ,private authService:AuthService){}
   ngOnInit(): void {

    this.activatedRoute.data.subscribe((data: any) => {
      const title = data.title || 'Titre par défaut';
      document.title = `Canvas | ${title}`;
    });
    this.users = JSON.parse(localStorage.getItem('currentUser') as string);
    this.getUserPhoto()
    this.projectService.projectUpdated$.subscribe(() => {
      this.getAllProjectByUser();
    });
   
    this.pollSubscription = interval(1000)
    .pipe(
      switchMap(() => this.getPendingInvites())
    )
    .subscribe(
      (response) => {
        this.pendingInvites = response.pendingInvites;
        this.pendingInvitesCount = this.pendingInvites.length;
        this.getAllProjectByUser()
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
    this.projectForm = this.fb.group({
      nomProjet: [''],
      image: [null]
    });
    this.getAllProjectByUser();

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



loadImage(projectId: number) {
  this.projectService.getImageForProject(projectId).subscribe(blob => {
    const imageUrl = URL.createObjectURL(blob);
    this.projectImages[projectId] = imageUrl;
  });
}

onSubmit() {
  if (this.projectForm.valid) {
    const userIdObject = this.authService.getStoredUserId();
    const formData = this.projectForm.value;
    const image = this.projectForm.get('image')?.value; // Retrieve image data

    this.projectService.createProjectWithImage(userIdObject.idUser, formData.nomProjet, image)
      .subscribe(response => {
        console.log('Project created successfully:', response);
        // Reset form if needed
        this.projectForm.reset();
        this.closeCreate();
        this.getAllProjectByUser();
      }, error => {
        console.error('Error creating project:', error);
        // Handle error as needed
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
    // Call the delete function with the project ID
    this.projectService.deleteProject(this.projectIdToDelete, this.users.user.idUser)
      .subscribe(response => {
        console.log('Project deleted successfully:', response);
        // Optionally, you can update the UI to reflect the deletion
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


projectIdToDelete: number | null = null;
openDelete(projectId: number){
 this.showPopupdelte=!this.showPopupdelte
 this.projectIdToDelete = projectId;
}

closeDeletePopup() {
  // Hide the popup
  this.showPopupdelte = false;
}


invites: any
progressPercentage: number = 0;
totalBlocks: number = 37; // Nombre total de blocs dans votre projet
filledBlocks: number = 0; // Nombre de blocs remplis par des données
blocks: any[] = []; // Tableau de blocs
// TypeScript



getAllProjectByUser() {
  const userIdObject = this.authService.getStoredUserId();
  if (userIdObject !== null && userIdObject.idUser) {
    this.userId = userIdObject.idUser;
  
    this.projectService.getallProjectByUser(this.userId).subscribe((response: any[]) => {
      this.projects = response;

      // Vérifier si selectedProjectId est null
      const selectedProjectId = localStorage.getItem('selectedProjectId');
      if (selectedProjectId === null && this.projects.length > 0) {
        // Enregistrer l'ID du premier projet dans localStorage
        this.saveProjectId(this.projects[0].idProjet);
      }

      this.projects.forEach(project => {
        this.loadImage(project.idProjet);
        this.getInvitesByUserId(project.idProjet);
      });
    });
  } else {
    console.error('Error: Unable to retrieve userId.');
  }
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







