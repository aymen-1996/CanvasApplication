import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BlocksService } from 'src/app/services/blocks.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { PopupComponent } from '../../popup/popup.component';
import { StepperSelectionEvent } from '@angular/cdk/stepper';
import {  MatStepper } from '@angular/material/stepper';
import { PopupInviteComponent } from '../../popup/popup-invite/popup-invite.component';
import html2canvas from 'html2canvas';
import { jsPDF } from "jspdf";
import { Subscription, interval, switchMap } from 'rxjs';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { UserService } from 'src/app/services/user.service';
import { ProjetService } from 'src/app/services/projet.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { PopupAcceptedComponent } from '../../popup/popup-accepted/popup-accepted.component';
import { CanvasService } from 'src/app/services/canvas.service';
import { NotifService } from 'src/app/services/notif.service';
import { Notification } from 'src/app/models/notification';
import { ChatService } from 'src/app/services/chat.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-swot',
  templateUrl: './swot.component.html',
  styleUrls: ['./swot.component.css']
})
export class SwotComponent implements OnInit {
  userId!:number
  pendingInvites: any[] = [];
  pendingInvitesCount: number = 0;
  pollSubscription!: Subscription;
  projectImages: { [key: number]: string } = {}; 
  projects:any
  selectedProjectId: string | null = null; 
  userPhotoUrl!: SafeUrl | string; 
  currentProject: any;
  showDropdown: boolean = false;
  showPendingInvitesDropdown: boolean = false;

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
  selectProject:any
  notifications: Notification[] = [];
  isDropdownVisible = false;
  unreadNotificationCount = 0;
  showComments: boolean = false;
  isSliding: boolean = false; 
  messageCount: number = 0;
intervalId: any;
  @ViewChild(MatStepper) stepper!: MatStepper;

    constructor(private dialogue: MatDialog ,private authService:AuthService,private chatService:ChatService ,private notifService:NotifService,private http: HttpClient,private canvasService:CanvasService,private projetService:ProjetService,private sanitizer: DomSanitizer,private userService:UserService ,private router: Router,private blockService:BlocksService , private dialog: MatDialog, private activatedRoute:ActivatedRoute ,private formBuilder: FormBuilder){

  }
  ngOnInit(): void {
    this.users = JSON.parse(localStorage.getItem('currentUser') as string);

    this.selectProject =  localStorage.getItem('selectedProjectId');
    this.GetNotif()

    this.activatedRoute.data.subscribe((data: any) => {
      const title = data.title || 'Titre par défaut';
      document.title = `Canvas | ${title}`;
    });

    this.getBlocksByCanvasId()
    this.GetRole()
    this.getMessageCount()
    this.intervalId = setInterval(() => {
      this.getMessageCount();
    }, 5000);
    this.getUserPhoto()
    this.listeCanvases()
    this.ListProjectsAndCanvas()

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
    this.donneesForm = this.formBuilder.group({
      coleur: ''
    });
    this.donneesForms = this.formBuilder.group({
      ticket: '',
    });
   
  }
  
  toggleComments() {
    this.showComments = !this.showComments;
  
    if (this.showComments) {
      this.isSliding = false; 
    } else {
      this.isSliding = true;
      setTimeout(() => {
        this.isSliding = false; 
      }, 500); 
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
    const selectedProjectId = localStorage.getItem('selectedProjectId');
    
    if (!selectedProjectId) {
      console.error('Aucun ID de projet sélectionné trouvé dans localStorage.');
      return;
    }
    
    this.canvasService.getCanvases(this.users.user.idUser, this.selectProject).subscribe(
      (data) => {
        if (data && Array.isArray(data.Canvas)) {
          const swotCanvas = data.Canvas.find((c: { nomCanvas: string; }) => c.nomCanvas === 'SWOT');
          
          if (swotCanvas) {
            this.idBloc = swotCanvas.idCanvas;
            console.log("ID du canvas swot getBlocksByCanvasId:", this.idBloc);
            
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
          } else {
            console.error('Canvas swot non trouvé.');
          }
        } else {
          console.error('Format de données inattendu:', data);
        }
      },
      (error) => {
        console.error('Erreur lors de la récupération des canvases:', error);
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
  
 
      this.blockService.getBlockById(this.blockId).subscribe(
        (donnee) => {
          if (donnee) {
            const randomIndex = Math.floor(Math.random() * colors.length);
            const selectedColor = colors[randomIndex];
  
            this.donneesForm.patchValue({
              coleur: selectedColor
            });
  
            this.blockService.createDonnees(this.blockId, this.donneesForm.value).subscribe(
              (response) => {
                this.getDonneesByBloc(this.blockId);
                console.log('Donnees created successfully:', response);
              },
              (error) => {
                console.error('Error creating donnees:', error);
              }
            );
          } else {
            console.error('Donnee with ID ' + this.selectedDonneeId + ' not found.');
          }
        },
        (error) => {
          console.error('Error fetching donnee by ID:', error);
        }
      );
     
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
              this.blocks.forEach((block: any) => {
                this.getDonneesByBloc(block.idBlock);
              });
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

      this.blocks.forEach((block: any) => {
        this.getDonneesByBloc(block.idBlock);
      });
    
    },
    (error) => {
      console.error('Error deleting donnee:', error);
    }
  );
}


//Role invitation dans canvas
GetRole(): void {
  this.canvasService.getCanvases(this.users.user.idUser, this.selectProject).subscribe(
    (data) => {
      if (data && Array.isArray(data.Canvas)) {
        const swotCanvas = data.Canvas.find((c: { nomCanvas: string; }) => c.nomCanvas === 'SWOT');
        if (swotCanvas) {
          console.log("ID du canvas swot:", swotCanvas.idCanvas);
          this.idBloc = swotCanvas.idCanvas;
          console.log("idddd", this.idBloc);

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
        } else {
          console.warn('Canvas swot non trouvé.');
        }
      } else {
        console.error('Format de données inattendu:', data);
      }
    },
    (error) => {
      console.error('Erreur lors de la récupération des canvases:', error);
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


calculateWidth3(totalItems: number, currentIndex: number): string {
  if (totalItems === 1) {
    return '97%';
  } else if (totalItems <= 3) {
    return 'calc(97% / ' + totalItems + ')';
  } else if (currentIndex < 3) {
    return '32.3333%';
  } else {
    return 'calc(97% / 3)';
  }
}



//telecharger pdf
telechargerPDF(): void {
  let DATA: any = document.getElementById('table');
  let options = { scale: 2 }; 
  html2canvas(DATA, options).then((canvas) => {
    const FILEURI = canvas.toDataURL('image/png');

    let PDF = new jsPDF('l', 'mm', 'a3'); 

    let imgWidth = 410; 
    let imgHeight = 160;

    let centerPositionX = (PDF.internal.pageSize.getWidth() - imgWidth) / 2;
    let topPositionY = 10; 

    let titleText = 'Tableau Swot';
    let titleFontSize = 22;
    let titlePositionX = (PDF.internal.pageSize.getWidth() - PDF.getStringUnitWidth(titleText) * titleFontSize) / 2;

    PDF.addImage(FILEURI, 'PNG', centerPositionX, topPositionY + titleFontSize, imgWidth, imgHeight);
    
    PDF.setFontSize(titleFontSize);

    PDF.setTextColor(0, 0, 255); 
    
    PDF.text(titleText, titlePositionX, topPositionY);

    PDF.save('Swot.pdf');

  });
}


//partie header
listeCanvases(): void {
  this.canvasService.getCanvases(this.users.user.idUser, this.selectProject).subscribe(
    (data) => {
      if (data && Array.isArray(data.Canvas)) {
        const swotCanvas = data.Canvas.find((c: { nomCanvas: string; }) => c.nomCanvas === 'Canvas');
        if (swotCanvas) {
          console.log("ID du canvas swot:", swotCanvas.idCanvas);
          this.idBloc = swotCanvas.idCanvas;
          console.log("idddd", this.idBloc);
          
          this.getBlocksByCanvasId();
        } else {
          console.warn('Canvas swot non trouvé.');
        }
      } else {
        console.error('Format de données inattendu:', data);
      }
    },
    (error) => {
      console.error('Erreur lors de la récupération des canvases:', error);
    }
  );
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
        this.userPhotoUrl = this.sanitizer.bypassSecurityTrustUrl(reader.result as string);
      };
      reader.readAsDataURL(res);
    },
    error => {
      console.error('Error getting user photo:', error);
    }
  );
}

ListProjectsAndCanvas() {
  this.projetService.getProjectsCanvasByUserId(this.users.user.idUser)
    .subscribe(
      response => {
        this.projects = response.projects;
        console.log("Projets récupérés:", this.projects);


        if (!this.idBloc && this.projects.length > 0) {
          for (const project of this.projects) {
            const swotCanvas = project.canvas.find((canvas: { nomCanvas: string; }) => canvas.nomCanvas === 'SWOT');
            if (swotCanvas) {
              this.idBloc = swotCanvas.idCanvas;
              break; 
            }
          }
        }
        this.currentProject = this.projects.find((project: { canvas: any[]; }) => {
          return project.canvas.some(canvas => canvas.idCanvas === this.idBloc);
        });

        console.log("ID du canvas sélectionné:", this.idBloc);

      },
      error => {
        console.error('Erreur lors du chargement des projets :', error);
      }
    );
}
getCanvasId(projectId: string, type: string): string | undefined {
  const project = this.projects.find((p: { idProjet: string; }) => p.idProjet === projectId);
  if (project) {
    const canvas = project.canvas.find((c: { nomCanvas: string; }) => c.nomCanvas.toLowerCase() === type.toLowerCase());
    return canvas?.idCanvas;
  }
  return undefined;
}

//routerlink
navigateToSwot(project: any): void {
  localStorage.setItem('selectedProjectId', project.idProjet);
  
  this.selectProject = project.idProjet;
  
  this.listeCanvases();
  
  const idCanvas = this.getCanvasId(project.idProjet, 'swot');
  if (idCanvas) {
    this.router.navigateByUrl(`/swot`)
    .then(() => {
      this.updateSwotData(idCanvas);
    });
  } else {
    console.error('Canvas de type "swot" non trouvé pour le projet donné.');
  }
}



updateSwotData(idCanvas: string) {
  this.idBloc = idCanvas;
  this.currentProject = this.projects.find((project: { canvas: any[]; }) => {
    return project.canvas.some(canvas => canvas.idCanvas === this.idBloc);
  });
  this.getBlocksByCanvasId();
  this.GetRole()

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
  this.projetService.updateInviteState(userId, idInvite)
    .subscribe(
      (response) => {
        console.log('Invitation state updated successfully:', response);

        this.pendingInvites = this.pendingInvites.filter(invite => invite.id !== idInvite);
        this.pendingInvitesCount = this.pendingInvites.length;
        this.projetService.updateProject(); 
        this.projetService.updateCanvas(); 
        this.ListProjectsAndCanvas()

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
  this.projetService.deleteInviteByIdAndUserId(idInvite,userId )
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







