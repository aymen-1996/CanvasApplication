import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { project } from 'src/app/models/project';
import { User } from 'src/app/models/user';
import { AuthService } from 'src/app/services/auth.service';
import { ProjetService } from 'src/app/services/projet.service';
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
  constructor(private fb:FormBuilder ,private projectService: ProjetService ,private authService:AuthService){}
   ngOnInit(): void {
    this.users = JSON.parse(localStorage.getItem('currentUser') as string);

    this.projectService.projectUpdated$.subscribe(() => {
      this.getAllProjectByUser();
      this.getInvitesByUserId(5)
    });
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
      console.log(this.userId);
  
      this.projectService.getallProjectByUser(this.userId).subscribe((response: any[]) => {
          console.log(response);
          this.projects = response;
          
          console.log(this.projects);
          
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
              console.log("Progress percentage for project", projId, ":",  this.projectProgress[projId]);

          },
          error => {
              console.error('Error fetching progress percentage:', error);
          }
      );
}





}






