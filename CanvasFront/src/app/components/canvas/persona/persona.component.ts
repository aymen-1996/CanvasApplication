import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BlocksService } from 'src/app/services/blocks.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { PopupComponent } from '../../popup/popup.component';
import { StepperSelectionEvent } from '@angular/cdk/stepper';
import {  MatStepper } from '@angular/material/stepper';
import { PopupInviteComponent } from '../../popup/popup-invite/popup-invite.component';
import html2canvas from 'html2canvas';
import { jsPDF } from "jspdf";
@Component({
  selector: 'app-persona',
  templateUrl: './persona.component.html',
  styleUrls: ['./persona.component.css']
})
export class PersonaComponent implements OnInit{
  showFirst:boolean=true;
  selectedId: string | null = null;
  blocks:any;
  block:any
  idBloc:any
  blockId:any
  donneesForm!: FormGroup;
  donneesForms!: FormGroup;
  donnees: any;
  selectedDonneeId!: number |null;
  private existingTicketValue: string | null = null;
  formVisibilityMap: Map<number, boolean> = new Map();
  generatedColors: string[] = ['rgb(0, 150, 136)', 'rgb(156, 39, 176)', 'rgb(76, 175, 80)', 'rgb(255, 87, 34)', 'rgb(255, 152, 0)', 'rgb(63, 81, 181)'];
  showAddButton = true;
  showDeleteButton: boolean = false;
  currentBlockIndex = 0;
  users:any
  showTable: boolean = false;
  userRole:any
  @ViewChild(MatStepper) stepper!: MatStepper;

    constructor(private blockService:BlocksService , private dialog: MatDialog, private activatedRoute:ActivatedRoute ,private formBuilder: FormBuilder){
    this.idBloc = this.activatedRoute.snapshot.params['id'];

  }
  ngOnInit(): void {
    this.users = JSON.parse(localStorage.getItem('currentUser') as string);
    this.getBlocksByCanvasId()
    this.GetRole()

    this.donneesForm = this.formBuilder.group({
      coleur: ''
    });
    this.donneesForms = this.formBuilder.group({
      ticket: '',
    });
   
  }
 
//affichage 6 couleurs pour update couleur
  groupColors(colors: string[]): string[][] {
    const groupedColors: string[][] = [];
    for (let i = 0; i < colors.length; i += 3) {
      groupedColors.push(colors.slice(i, i + 3));
    }
    return groupedColors;
  }
  
  onShowFirstChange(value: boolean) {
    this.showFirst = value;
  }

  toggleSelection(id: string): void {
    if (this.userRole?.roleInvite !== 'moniteur') {
      this.selectedId = id;
    }
 
  }
  
   //afficher partie update couleur aussi
   toggleFormVisibility(itemId: number): void {
    const currentVisibility = this.formVisibilityMap.get(itemId) || false;
  
    this.formVisibilityMap.forEach((_, otherItemId) => {
      if (otherItemId !== itemId) {
        this.formVisibilityMap.set(otherItemId, false);
      }
    });
  
    this.formVisibilityMap.set(itemId, !currentVisibility);
  }

    //affichage button d update couleur dans note MuiBox-root
    toggleDeleteButton(donnees: any): void {
      this.showDeleteButton =  true
      this.selectedDonneeId = donnees.idDonnees;
    }

    isSelected(id: string): boolean {
      return this.selectedId === id;
    }

  isSelectedDonnee(donnees: any): boolean {
    return this.selectedDonneeId === donnees.idDonnees;
  }

  //si click svg parite 6 couleur affiche 
  isFormVisibleForItemId(itemId: number): boolean {
    return this.formVisibilityMap.get(itemId) || false;
  }

  //les blocks by id canvas
  getBlocksByCanvasId(): void {
    this.blockService.getBlocksByCanvasId(this.idBloc).subscribe(
      (blocks) => {
        this.blocks = blocks;
  
        if (this.blocks && this.blocks.length > 0) {
          const firstBlockId = this.blocks[0]?.idBlock;
  
          if (firstBlockId) {
            this.toggleSelection(firstBlockId);
            this.detectedBlockById(firstBlockId);
            this.getDonneesByBloc(firstBlockId);
          } else {
            console.error('Block ID is undefined for the first block.');
          }
  
          for (let i = 1; i < this.blocks.length; i++) {
            const currentBlockId = this.blocks[i]?.idBlock;
  
            if (currentBlockId) {
              this.getDonneesByBloc(currentBlockId);
            } else {
              console.error(`Block ID is undefined for block at index ${i}.`);
            }
          }
        } else {
          console.error('Blocks array is empty.');
        }
  
        console.log('Blocks', this.blocks);
      },
      (error) => {
        console.error('Error fetching blocks:', error);
      }
    );
  }
  
    //affichage les donnees de chaque block
    getDonneesByBloc(blockId: number): void {
      this.blockService.getByBloc(blockId).subscribe(
        (data) => {
          this.donnees = data;
          const blocIndex = this.blocks.findIndex((block: { idBlock: number }) => block.idBlock === blockId);
    
          if (blocIndex !== -1) {
            this.blocks[blocIndex].donnees = data;
            console.log("aaaaa", this.blocks[blocIndex].donnees);
          }
    
          console.log('Donnees for Bloc', blockId, ':', this.donnees);
        },
        (error) => {
          console.error('Error fetching donnees for Block', blockId, ':', error);
        }
      );
    }
  
  //pour detecter id block pour l'affichge donnees et creation donnees
  detectedBlockById(blockId: number): void {
    this.blockService.getBlockById(blockId).subscribe(
      (idBloc) => {
        this.blockId = idBloc;
        console.log('Bloc retrieved, ID:', this.blockId);
  
        this.getDonneesByBloc(this.blockId);
  
        this.currentBlockIndex = this.blocks.findIndex((block: { idBlock: number }) => block.idBlock === this.blockId);
        this.showTable = false;

        console.log('Current Block ID:', this.blockId);
  
        const currentStepIndex = this.currentBlockIndex;
        if (currentStepIndex >= 0 && currentStepIndex < this.stepper.steps.length) {
          this.stepper.selectedIndex = currentStepIndex;
          
        } else {
          console.error('Invalid stepper index:', currentStepIndex);
        }
  
  
       
      },
      (error) => {
        console.error('Error fetching block by ID:', error);
      }
    );
  }
  
  
  //Creer color donnees
  creatColor(): void {
    const colors = [
      'rgb(0, 150, 136)',
      'rgb(156, 39, 176)',
      'rgb(76, 175, 80)',
      'rgb(255, 87, 34)',
      'rgb(255, 152, 0)',
      'rgb(63, 81, 181)'
    ];
  
    if (this.donnees.length < 6) {
      const randomIndex = Math.floor(Math.random() * colors.length);
      const selectedColor = colors[randomIndex];
  
      this.donneesForm.patchValue({
        coleur: selectedColor
      });
  
      this.blockService.createDonnees(this.blockId, this.donneesForm.value).subscribe(
        (response) => {
          this.getDonneesByBloc(this.blockId);
          console.log('Donnees created successfully:', response);
          this.showAddButton = this.donnees.length < 6; 
        },
        (error) => {
          console.error('Error creating donnees:', error);
        }
      );
    } else {
      const donneeSixieme = this.donnees.splice(5, 1)[0]; 
  
  
      this.showAddButton = this.donnees.length < 6;
    }
  }
  

  updateTicketValue(event: Event): void {
    const updatedTicket = (event.target as HTMLTextAreaElement)?.value;
  
    if (this.donneesForms.get('ticket')?.value !== updatedTicket) {
      this.existingTicketValue = updatedTicket;
    }
  }
  
  //update ticket
  updatedonne(donneeId: number): void {
    this.blockService.getDonneeById(donneeId).subscribe(
      (donnee) => {
        if (donnee) {
          const updatedTicketValue = this.existingTicketValue !== null ? this.existingTicketValue : donnee.ticket;
  
          console.log('updatedTicketValue:', updatedTicketValue);
  
          this.blockService.updateDonnee(donneeId, { ...this.donneesForms.value, ticket: updatedTicketValue }).subscribe(
            (response) => {
              console.log('Donnee updated successfully:', response);
  
              this.donneesForms.reset();
  
              this.getDonneesByBloc(this.blockId);
            },
            (error) => {
              console.error('Error updating donnee:', error);
            }
          );
  
          this.existingTicketValue = null;
        } else {
          console.error('Donnee with ID ' + donneeId + ' not found.');
        }
      },
      (error) => {
        console.error('Error fetching donnee by ID:', error);
      }
    );
  }
  
  
  //update color
  updateColor(donneeId: number, selectedColor: string): void {
    this.blockService.getDonneeById(donneeId).subscribe(
      (existingDonnee) => {
        if (existingDonnee) {
          const updatedDonnee = { ...existingDonnee, coleur: selectedColor };
  
          this.blockService.updateDonnee(donneeId, updatedDonnee).subscribe(
            (response) => {
              console.log('Note color updated successfully:', response);
              this.getDonneesByBloc(this.blockId);
            },
            (error) => {
              console.error('Error updating note color:', error);
            }
          );
        } else {
          console.error(`Donnee with ID ${donneeId} not found.`);
        }
      },
      (error) => {
        console.error(`Error fetching donnee with ID ${donneeId}:`, error);
      }
    );
  }
  
  
 //dans le cas update ticket si je fais entrer l'entrée n'enregistrer dans bd avec ticket
  onEnterKey(event: any): void {
    if (event instanceof KeyboardEvent) {
      event.preventDefault();
    }
  }
  
  //cocher les steps 
  onStepChange(event: StepperSelectionEvent): void {
    const selectedStepIndex = event.selectedIndex;
  
    if (selectedStepIndex === 7) { // Check if the selected step is "Sommaire"
      for (let i = 0; i < this.stepper.steps.length; i++) {
        const step = this.stepper.steps.toArray()[i];
        step.completed = i <= selectedStepIndex;
      }
  
     
      this.selectedId = null;
      this.currentBlockIndex=7
      this.showTable=true
  
    } else if (selectedStepIndex >= 0 && selectedStepIndex < this.blocks.length) {
      for (let i = 0; i <= selectedStepIndex; i++) {
        const step = this.stepper.steps.toArray()[i];
        step.completed = true;
      }
  
      for (let i = selectedStepIndex + 1; i < this.stepper.steps.length; i++) {
        const step = this.stepper.steps.toArray()[i];
        step.completed = false;
      }
  
      const selectedBlock = this.blocks[selectedStepIndex];
  
      this.detectedBlockById(selectedBlock.idBlock);
  
      if (this.currentBlockIndex !== selectedStepIndex) {
        this.toggleSelection(selectedBlock.idBlock);
      }
    }
  }
  
  



  //open popup delete donnees
openPopup(donneeId: number): void {
  const confirmationMessage = 'Êtes-vous sûr de vouloir supprimer cette Post-it ?';
  const dialogRef = this.dialog.open(PopupComponent, {
    width: '600px',
    data: { confirmationMessage, donneeId },
  });

  dialogRef.afterClosed().subscribe((result) => {
    if (result) {
      console.log('Post-it supprimée');
      this.deleteDonnees(donneeId);
    } else {
      console.log('Suppression annulée');
    }
  });
}

//Popup Invitation
openPopupInvite(): void {
  const confirmationMessage = 'Êtes-vous sûr de vouloir supprimer cette Post-it ?';
  const dialogRef = this.dialog.open(PopupInviteComponent, {
    width: '450px',
    position: { top: '175px' }, 
    data: { confirmationMessage, idBloc: this.idBloc }, 
  });

  dialogRef.afterClosed().subscribe((result) => {
    if (result) {
    } else {
    }
  });
}
//delete donnees
deleteDonnees(id: number): void {
  this.blockService.deleteDonnees(id).subscribe(
    () => {
      console.log('Donnee deleted successfully');

      this.getDonneesByBloc(this.blockId);

    },
    (error) => {
      console.error('Error deleting donnee:', error);
    }
  );
}



//deplacer vers block suivant
suivant(): void {
  if (this.currentBlockIndex === 6) {
    if (!this.hasMoreBlocks()) {
      this.showTable = true;

      setTimeout(() => {
        this.stepper.selectedIndex = 7; 
        this.currentBlockIndex=7
        
      });
    }
  } else if (this.currentBlockIndex < this.blocks.length - 1) {
    this.currentBlockIndex++;

    const nextBlockId = this.blocks[this.currentBlockIndex].idBlock;

    this.detectedBlockById(nextBlockId);

    this.toggleSelection(nextBlockId);
    this.stepper.selectedIndex = this.currentBlockIndex;

    console.log('currentBlockIndex:', this.currentBlockIndex);
  }
}



hasMoreBlocks(): boolean {
  const hasMore = this.blocks.length > this.currentBlockIndex + 1;

  if (!hasMore) {
    this.showTable = true;
  }

  return hasMore;
}

//deplacer vers block precedent
precedent(): void {
  if (this.currentBlockIndex > 0) {
    this.currentBlockIndex--;

    if (this.stepper.selectedIndex === 7) {
    


      setTimeout(() => {
        const targetMatStepIndex = 6; 
        const targetMatStepId = this.blocks[targetMatStepIndex].idBlock;
        this.stepper.selectedIndex = targetMatStepIndex;
        this.currentBlockIndex = targetMatStepIndex;
        this.selectedId = targetMatStepId;
        this.detectedBlockById(targetMatStepId);
        this.toggleSelection(targetMatStepId);
        this.showTable = false;
      });
    } else {
      const previousBlockId = this.blocks[this.currentBlockIndex].idBlock;

      this.selectedId = previousBlockId;
      this.detectedBlockById(previousBlockId);
      this.toggleSelection(previousBlockId);

      this.stepper.selectedIndex = this.currentBlockIndex;
      this.showTable = false;
    }
  }
}


//Role invitation dans canvas
GetRole():void{
  this.blockService.getRoleByUserIdAndCanvasId(this.users.user.idUser, this.idBloc)
  .subscribe(
    (role: any) => {
      this.userRole = role;
      console.log('User Role:', this.userRole);
    },
    error => {
      console.error('Error fetching user role:', error);
    }
  );
}

//pour n affiche button suivant si showtable
shouldDisplayButton(): boolean {
  const isLastBlock = this.currentBlockIndex === this.blocks.length - 1;

  return (this.userRole?.roleInvite === 'editor' && !this.showTable) ||
         (this.userRole?.roleInvite === 'moniteur' && this.showTable && isLastBlock);
}


shouldDisplayMesg(): boolean {
  const isLastBlock = this.currentBlockIndex === this.blocks.length - 1;

  return (this.userRole?.roleInvite === 'editor' && !this.showTable) ||
         (this.userRole?.roleInvite === 'moniteur' && this.showTable && isLastBlock);
}

//calcule width block[8]et [4]
calculateWidth(totalItems: number): string {
  if (totalItems === 1) {
    return '100%';
  } else if (totalItems === 2) {
    return '50%';
  } else if (totalItems === 3) {
    return '33.33%';
  } else {
    return '33.33%';
  }
}

//calcule width block[8]et [4] dans le grand tableau
calculateWidth2(totalItems: number): string {
  if (totalItems <= 1) {
    return '100%';
  } else {
    const calculatedWidth = 100 / totalItems;
    return `${calculatedWidth}%`;
  }
}

//telecharger pdf
telechargerPDF(): void {
  setTimeout(() => {
    let DATA: any = document.getElementById('tableau');

    if (DATA) {
      let options = { scale: 2 };
      html2canvas(DATA, options).then((canvas) => {
        const FILEURI = canvas.toDataURL('image/png');

        let PDF = new jsPDF('l', 'mm', 'a3');

        let imgWidth = 380;
        let imgHeight = 180;
        let marginY = 30;

        let centerPositionX = (PDF.internal.pageSize.getWidth() - imgWidth) / 2;
        let topPositionY = marginY;

        let titleText = 'Tableau persona';
        let titleFontSize = 22;
        let titlePositionX =
          (PDF.internal.pageSize.getWidth() - PDF.getStringUnitWidth(titleText) * titleFontSize) / 2;

        PDF.addImage(FILEURI, 'PNG', centerPositionX, topPositionY + titleFontSize, imgWidth, imgHeight);

        PDF.setFontSize(titleFontSize);

        PDF.setTextColor(0, 0, 255);

        PDF.text(titleText, titlePositionX, topPositionY);

        PDF.save('persona.pdf');
      });
    } else {
      console.error("L'élément avec l'ID 'tableau' n'a pas été trouvé.");
    }
  }, 0);
}


}





