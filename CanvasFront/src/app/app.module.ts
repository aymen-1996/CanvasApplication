import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {DropdownModule} from "primeng/dropdown";
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { CommonModule, DatePipe } from '@angular/common';
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HeaderComponent } from './components/header/header.component';
import {MatIconModule} from '@angular/material/icon';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { DialogModule } from 'primeng/dialog';
import { AddProjectComponent } from './components/project/add-project/add-project.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import {MatStepperIntl, MatStepperModule} from '@angular/material/stepper';
import { MatDialogModule } from '@angular/material/dialog';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { NgSelectModule } from '@ng-select/ng-select';
import { PopupComponent } from './components/popup/popup.component';
import { PopupInviteComponent } from './components/popup/popup-invite/popup-invite.component';
import { PopupAcceptedComponent } from './components/popup/popup-accepted/popup-accepted.component';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { FileDialogComponent } from './components/popup/file-dialog/file-dialog.component';
import { SocketService } from './services/socket.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LoginComponent } from './components/login/login.component';


@NgModule({
  declarations: [
    AppComponent,
    AddProjectComponent,
    PopupComponent,
    PopupInviteComponent,
    PopupAcceptedComponent,
    FileDialogComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MatDialogModule,
    MatBadgeModule,
    MatMenuModule,
    MatFormFieldModule, 
    FormsModule,
    HttpClientModule,
    MatSelectModule,
    DropdownModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    MatIconModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    ButtonModule,
    RippleModule,
    DialogModule,
    MatToolbarModule,
    MatStepperModule,
    NgSelectModule,
    
  ],
  providers: [
    DatePipe, SocketService
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],  
  bootstrap: [AppComponent]
})
export class AppModule { }
