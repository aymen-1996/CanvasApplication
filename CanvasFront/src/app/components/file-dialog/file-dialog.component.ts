import { Component, ViewChild, ElementRef } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-file-dialog',
  templateUrl: './file-dialog.component.html',
  styleUrls: ['./file-dialog.component.css']
})
export class FileDialogComponent {
  @ViewChild('fileInput') fileInput!: ElementRef;
  selectedFile: File | null = null;
  fileName: string | null = null;
  private mediaRecorder!: MediaRecorder;
  private audioChunks: Blob[] = [];
  isRecording: boolean = false;
  recordingTime: number = 0; 
  recordingInterval: any;
  audioURL: string | null = null; 
  imageURL: string | null = null;

  constructor(public dialogRef: MatDialogRef<FileDialogComponent>) {}

  onFileSelectClick(): void {
    this.fileInput.nativeElement.click();
  }

  onFileChange(event: any): void {
    this.selectedFile = event.target.files[0];
    this.fileName = this.selectedFile ? this.selectedFile.name : null;
    console.log('Fichier sélectionné:', this.fileName);
  
    if (this.selectedFile && this.selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imageURL = e.target.result;
      };
      reader.readAsDataURL(this.selectedFile);
    } 
  }
  
  removeFile(): void {
    this.selectedFile = null;
    this.fileName = null; 
  }

  sendFile(): void {
    this.dialogRef.close(this.selectedFile); 
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  async startRecording(): Promise<void> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream);
  
      this.mediaRecorder.ondataavailable = (event) => {
        this.audioChunks.push(event.data);
      };
  
      this.mediaRecorder.start();
      this.isRecording = true;
  
      // Démarrer un minuteur pour afficher le temps d'enregistrement
      this.recordingInterval = setInterval(() => {
        this.recordingTime++;
      }, 1000);
    } catch (error) {
      console.error('Erreur d\'accès au microphone :', error);
    }
  }

  stopRecording(): void {
    this.mediaRecorder.stop();
    this.isRecording = false;

    // Arrêter le minuteur
    clearInterval(this.recordingInterval);

    this.mediaRecorder.onstop = () => {
      // Vérifier que des données ont bien été collectées
      if (this.audioChunks.length > 0) {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/mp3' });

        // Créer un fichier à partir du blob audio
        const audioFile = new File([audioBlob], 'recording.mp3', { type: 'audio/mp3' });

        // Simuler que ce fichier est un fichier sélectionné
        this.selectedFile = audioFile;
        this.fileName = audioFile.name;

        // Afficher l'URL audio si besoin
        this.audioURL = URL.createObjectURL(audioBlob);
        this.audioChunks = []; // Réinitialiser les chunks après traitement
      } else {
        console.error('Aucune donnée audio enregistrée.');
      }
    };
  }

  formatRecordingTime(): string {
    const minutes = Math.floor(this.recordingTime / 60);
    const seconds = this.recordingTime % 60;
    return `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }
}
