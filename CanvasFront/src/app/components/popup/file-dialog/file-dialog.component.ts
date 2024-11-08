import { Component, ViewChild, ElementRef, Inject, EventEmitter, Output } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

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

  constructor(public dialogRef: MatDialogRef<FileDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {}

  ngOnInit() {
    this.resetFileData();

    if (this.data && this.data.selectedFile) {
      this.selectedFile = this.data.selectedFile;
      this.fileName = this.selectedFile?.name ?? null;
      if (this.selectedFile && this.selectedFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.imageURL = e.target.result;
        };
        reader.readAsDataURL(this.selectedFile);
      }
    }
  }

  resetFileData(): void {
    this.selectedFile = null;
    this.fileName = null;
    this.imageURL = null;
    this.audioURL =null;
    this.recordingTime =0
  }

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
  
    event.target.value = '';
  }
  

  @Output() fileRemoved = new EventEmitter<void>();

  removeFile(): void {
    this.resetFileData();
    this.fileRemoved.emit();
    console.log('Fichier supprimé, mais le dialogue reste ouvert');
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
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };
  
      this.mediaRecorder.start(500); 
      this.isRecording = true;
  
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
    clearInterval(this.recordingInterval);
  
    setTimeout(() => {
      this.processAudioChunks();
    }, 50); 
  }
  
  processAudioChunks(): void {
    if (this.audioChunks.length > 0) {
      const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
      const audioFile = new File([audioBlob], 'recording.mp3', { type: 'audio/wav' });
  
      this.selectedFile = audioFile;
      this.fileName = audioFile.name;
  
      if (this.audioURL) {
        URL.revokeObjectURL(this.audioURL);
      }
  
      this.audioURL = URL.createObjectURL(audioBlob);
      this.audioChunks = [];
    } else {
      console.error('Aucune donnée audio enregistrée.');
    }
  }
  
  
  

  formatRecordingTime(): string {
    const minutes = Math.floor(this.recordingTime / 60);
    const seconds = this.recordingTime % 60;
    return `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }
}
