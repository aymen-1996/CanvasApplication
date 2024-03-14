import { Component, EventEmitter, Inject, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { BlocksService } from 'src/app/services/blocks.service';


@Component({
  selector: 'app-popup-invite',
  templateUrl: './popup-invite.component.html',
  styleUrls: ['./popup-invite.component.css']
})
export class PopupInviteComponent {
  @Output() deleteDonneeFromPopup = new EventEmitter<void>();
  idBloc:any
  inviteForm!: FormGroup;
  users:any
  projet:any
  successMessage: string | null = null;
  errorMessage: string | null = null;
  constructor(private dialogRef: MatDialogRef<PopupInviteComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { confirmationMessage: string, idBloc: any } ,private formBuilder: FormBuilder,private activatedRoute:ActivatedRoute, private blockService: BlocksService) {
      this.idBloc = data.idBloc;
    }

    ngOnInit(): void {
      this.users = JSON.parse(localStorage.getItem('currentUser') as string);
this.GetProjet()
      this.inviteForm = this.formBuilder.group({
        emailUser:'',
        role: '',
      });
    }
  closePopup() {
    this.dialogRef.close();
  }

  GetProjet():void{
    this.blockService.getProjetByUserIdAndCanvasId(this.users.user.idUser, this.idBloc)
    .subscribe(
      (projet: any) => {
        this.projet = projet;
        console.log('User projet is:', this.projet);
      },
      error => {
        console.error('Error fetching user role:', error);
      }
    );
  }

  inviteUser(): void {
    this.blockService.getProjetByUserIdAndCanvasId(this.users.user.idUser, this.idBloc)
      .subscribe(
        (projet: any) => {
          this.projet = projet;
          console.log('User projet is:', this.projet);

          const idProjet = this.projet.idProjet;

          this.blockService.inviteUser(idProjet, this.idBloc, this.inviteForm.value.emailUser, this.inviteForm.value.role)
            .subscribe(
              (response: any) => {
                console.log('Invitation sent successfully', response);

              
                  this.successMessage = response.message;
                  this.errorMessage = null;
                  setTimeout(() => {
                    this.closePopup();
                  }, 2000);
                },
              error => {
                console.error('Error sending invitation', error);
                this.errorMessage = error.error.error
              this.successMessage = null;
              }
            );
        },
        error => {
          console.error('Error fetching user role:', error);
        }
      );
  }
  
}
