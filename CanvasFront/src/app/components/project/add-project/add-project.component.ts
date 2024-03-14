import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-add-project',
  templateUrl: './add-project.component.html',
  styleUrls: ['./add-project.component.scss']
})
export class AddProjectComponent implements OnInit{
  @Input() modalProject: boolean = true;
  @Output() closeModalProject=new EventEmitter<boolean>();
  @Output() refreshProject=new EventEmitter<boolean>();  
  refreshAd:boolean = false;
  constructor(){}
  ngOnInit(): void {
  
  }
  cancel() {
    this.modalProject = false;

    this.closeModalProject.emit(this.modalProject);
  }


  exit() {
    this.modalProject = false;
    this.refreshAd = true;
    this.closeModalProject.emit(this.modalProject);
    this.refreshProject.emit(this.refreshAd);
  }
}
