import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {DropdownModule} from "primeng/dropdown";
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { InscriptionComponent } from './components/inscription/inscription.component';
import { ProjectComponent } from './components/project/project.component';
import { CanvasComponent } from './components/canvas/canvas.component';
import { ProfilComponent } from './components/profil/profil.component';
import { CommonModule } from '@angular/common';
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
import { BmcComponent } from './components/canvas/bmc/bmc.component';
import {MatStepperIntl, MatStepperModule} from '@angular/material/stepper';
import { MatDialogModule } from '@angular/material/dialog';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ChangePassComponent } from './components/change-pass/change-pass.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { ForgetPasswordComponent } from './components/forget-password/forget-password.component';
import { PopupComponent } from './components/popup/popup.component';
import { EmpathieComponent } from './components/canvas/empathie/empathie.component';
import { VpCanvasComponent } from './components/canvas/vp-canvas/vp-canvas.component';
import { PersonaComponent } from './components/canvas/persona/persona.component';
import { LeanCanvasComponent } from './components/canvas/lean-canvas/lean-canvas.component';
import { SwotComponent } from './components/canvas/swot/swot.component';
import { PopupInviteComponent } from './components/popup/popup-invite/popup-invite.component';
import { PopupAcceptedComponent } from './components/popup/popup-accepted/popup-accepted.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    InscriptionComponent,
    ProjectComponent,
    CanvasComponent,
    ProfilComponent,
    HeaderComponent,
    AddProjectComponent,
    BmcComponent,
    ForgetPasswordComponent,
    ChangePassComponent,
    PopupComponent,
    SwotComponent,
    EmpathieComponent,
    VpCanvasComponent,
    PersonaComponent,
    LeanCanvasComponent,
    PopupInviteComponent,
    PopupAcceptedComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MatDialogModule,

    MatFormFieldModule, 
    FormsModule,
    HttpClientModule,
    MatSelectModule,
    CommonModule,
    DropdownModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    MatIconModule,
    MatProgressBarModule,
    ButtonModule,
    RippleModule,
    DialogModule,
    MatToolbarModule,
    MatStepperModule,
    NgSelectModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }