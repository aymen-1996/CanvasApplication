import { Component, EventEmitter, Inject, Output } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { BlocksService } from 'src/app/services/blocks.service';

@Component({
  selector: 'app-popup-accepted',
  templateUrl: './popup-accepted.component.html',
  styleUrls: ['./popup-accepted.component.css']
})
export class PopupAcceptedComponent {
  @Output() updateInviteState = new EventEmitter<void>();
  @Output() deleteInvite = new EventEmitter<void>();
  successMessage: string = '';

  constructor(private dialogRef: MatDialogRef<PopupAcceptedComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { confirmationMessage: string, nomUser: string, projetName: string },
              private blockService: BlocksService) {}

  closePopup() {
    this.dialogRef.close();
  }

  updateInvite(): void {
    console.log('Mettre à jour l\'action déclenchée pour l\'ID:', this.data);
    this.updateInviteState.emit();
    this.successMessage = 'Vous avez accepté l\'invitation';
    console.log("msg update",  this.successMessage )

    setTimeout(() => {
      this.dialogRef.close({ action: 'accept' });
      this.successMessage = ''
    }, 2000); 
  }

  delete(): void {
    console.log('Suppression déclenchée pour l\'ID:', this.data);
    this.deleteInvite.emit();
    this.successMessage = 'Vous avez refusé l\'invitation!!';

    console.log("msg delete",  this.successMessage )
    setTimeout(() => {
      this.dialogRef.close({ action: 'delete' });
      this.successMessage = ''
    }, 2000); 
  }
}
