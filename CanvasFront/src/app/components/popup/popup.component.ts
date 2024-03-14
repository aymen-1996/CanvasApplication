import { Component, EventEmitter, Inject, Output } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { BlocksService } from 'src/app/services/blocks.service';

@Component({
  selector: 'app-popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.css']
})
export class PopupComponent {
  @Output() deleteDonneeFromPopup = new EventEmitter<void>();


  constructor(private dialogRef: MatDialogRef<PopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { confirmationMessage: string } , private blockService: BlocksService) {}

  closePopup() {
    this.dialogRef.close();
  }

  onDeleteDonneeFromPopup(): void {
    this.deleteDonneeFromPopup.emit();
    this.dialogRef.close(true);
  }
}
