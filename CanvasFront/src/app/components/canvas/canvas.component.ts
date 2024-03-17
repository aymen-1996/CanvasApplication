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
  constructor(private activatedRoute: ActivatedRoute, private canvasService: CanvasService ,private PojectService:ProjetService  ) {
    this.projet = this.activatedRoute.snapshot.params['id'];
  }

  ngOnInit(): void {
    this.activatedRoute.data.subscribe((data: any) => {
      const title = data.title || 'Titre par défaut';
      document.title = `Canvas | ${title}`;
    });
    this.users = JSON.parse(localStorage.getItem('currentUser') as string);
    this.PojectService.canvasUpdated$.subscribe(() => {
      this.listeCanvases();
    });
    this.listeCanvases();
  }

  onShowFirstChange(value: boolean) {
    this.showFirst = value;
  }

  listeCanvases(): void {
    this.canvasService.getCanvases(this.users.user.idUser, this.projet).subscribe(
      (data) => {
        this.canvas = data;
        console.log(this.canvas);
      },
      (error) => {
        console.error('Error fetching canvas:', error);
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

  getCanvasRoleInvite(type: string): string | undefined {
    const canvas = this.canvas.Canvas.find((c: { nomCanvas: string; }) => c.nomCanvas.toLowerCase() === type.toLowerCase());
    return canvas?.roleInvite;
  }
  

}
