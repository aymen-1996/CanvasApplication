import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CanvasService } from 'src/app/services/canvas.service';
import { ProjetService } from 'src/app/services/projet.service';


@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.scss']
})
export class CanvasComponent implements OnInit {
  showFirst: boolean = true;
  canvas: any;
  users: any;
  projet: any;
  project:any
  selectProject:any;
  constructor(private activatedRoute: ActivatedRoute, private canvasService: CanvasService ,private PojectService:ProjetService  ) {
  }

  ngOnInit(): void {
    this.users = JSON.parse(localStorage.getItem('currentUser') as string);

    this.selectProject =  localStorage.getItem('selectedProjectId');

    this.activatedRoute.data.subscribe((data: any) => {
      const title = data.title || 'Titre par défaut';
      document.title = `Canvas | ${title}`;
    });
    this.PojectService.canvasUpdated$.subscribe(() => {
      this.listeCanvases(this.selectProject);
    });
    this.listeCanvases(this.selectProject);
    this.getProject(this.selectProject)
  }

  onShowFirstChange(value: boolean) {
    this.showFirst = value;
  }


onCanvasClick(type: string): void {
this.getCanvasId(type);
}
showNoCanvasMessage: boolean = false; // Variable d'état


listeCanvases(projet: number): void {
  this.PojectService.getallProjectByUser(this.users.user.idUser).subscribe(
    (projects) => {
      const selectedProjectId = localStorage.getItem('selectedProjectId');
      const isProjectValid = projects.some(project => project.idProjet === Number(selectedProjectId));

      if (!isProjectValid) {
        if (projects.length > 0) {
          localStorage.setItem('selectedProjectId', projects[0].idProjet.toString());
        } else {
          console.error('Aucun projet disponible.');
        }
      }

      this.canvasService.getCanvases(this.users.user.idUser, projet).subscribe(
        (data) => {
          this.canvas = data;
          if (!this.canvas || !this.canvas.Canvas || this.canvas.Canvas.length === 0) {
            setTimeout(() => {
              this.showNoCanvasMessage = true;
            }, 100);
          } 
          console.log('Canvas trouvés:', this.canvas);
        },
        (error) => {
          console.error('Erreur lors de la récupération des canvas:', error);
        }
      );
    },
    (error) => {
      console.error('Erreur lors de la récupération des projets:', error);
    }
  );
}

  

  shouldDisplayLean(): boolean {
    const lowerCaseCanvasNames = this.canvas.Canvas.map((c: { nomCanvas: string; }) => c.nomCanvas.toLowerCase());
  
    const displayLean = lowerCaseCanvasNames.includes('lean canvas');
  
    return displayLean;
  }
  
 
  
  shouldDisplayVP(): boolean {
    const lowerCaseCanvasNames = this.canvas.Canvas.map((c: { nomCanvas: string; }) => c.nomCanvas.toLowerCase());
  
    const displayVP = lowerCaseCanvasNames.includes('vp canvas');
  
    return displayVP;
  }
  
  shouldDisplayBMC(): boolean {
    const lowerCaseCanvasNames = this.canvas.Canvas.map((c: { nomCanvas: string; }) => c.nomCanvas.toLowerCase());
  
    const displayBMC = lowerCaseCanvasNames.includes('bmc');
  
    return displayBMC;
  }
  
  shouldDisplaySWOT(): boolean {
    const lowerCaseCanvasNames = this.canvas.Canvas.map((c: { nomCanvas: string; }) => c.nomCanvas.toLowerCase());
  
    const displaySWOT = lowerCaseCanvasNames.includes('swot');
  
    return displaySWOT;
  }
  
  shouldDisplayEmpathie(): boolean {
    const lowerCaseCanvasNames = this.canvas.Canvas.map((c: { nomCanvas: string; }) => c.nomCanvas.toLowerCase());
  
    const displayEmpathie = lowerCaseCanvasNames.includes('empathy map canvas');
  
    return displayEmpathie;
  }
  
  shouldDisplayPersona(): boolean {
    const lowerCaseCanvasNames = this.canvas.Canvas.map((c: { nomCanvas: string; }) => c.nomCanvas.toLowerCase());
  
    const displayPersona = lowerCaseCanvasNames.includes('persona canvas');
  
    return displayPersona;
  }
  
  getCanvasId(type: string): string | undefined {
    const canvas = this.canvas.Canvas.find((c: { nomCanvas: string; }) => c.nomCanvas.toLowerCase() === type.toLowerCase());
    return canvas?.idCanvas;
  }
  
  getCanvasName(type: string): string | undefined {
    const canvas = this.canvas.Canvas.find((c: { nomCanvas: string; }) => c.nomCanvas.toLowerCase() === type.toLowerCase());
    return canvas?.nomCanvas;
  }

  getCanvasRoleInvite(type: string, currentUserId: number): string {
    const canvas = this.canvas.Canvas.find(
      (c: { nomCanvas: string; }) => c.nomCanvas.toLowerCase() === type.toLowerCase()
    );
  
    if (canvas?.projet?.user?.idUser === currentUserId) {
      return 'Porteur';
    }
  
    return canvas?.roleInvite === 'editor' ? 'Superviseur' : canvas?.roleInvite;
  }
  

  getProject(id:number): void {
    this.PojectService.getProjectById(id)
      .subscribe(
        response => {
          this.project = response.data;
          console.log("projproj",this.project)
        },
        error => {
        }
      );
  }
}
