import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { ProjectComponent } from './components/project/project.component';
import { InscriptionComponent } from './components/inscription/inscription.component';
import { ProfilComponent } from './components/profil/profil.component';
import { AddProjectComponent } from './components/project/add-project/add-project.component';
import { CanvasComponent } from './components/canvas/canvas.component';
import { BmcComponent } from './components/canvas/bmc/bmc.component';
import { ForgetPasswordComponent } from './components/forget-password/forget-password.component';
import { ChangePassComponent } from './components/change-pass/change-pass.component';

import { AuthGuard } from './guards/auth.guard';
import { SwotComponent } from './components/canvas/swot/swot.component';
import { EmpathieComponent } from './components/canvas/empathie/empathie.component';
import { PersonaComponent } from './components/canvas/persona/persona.component';
import { VpCanvasComponent } from './components/canvas/vp-canvas/vp-canvas.component';
import { LeanCanvasComponent } from './components/canvas/lean-canvas/lean-canvas.component';


const routes: Routes = [

  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'projects',
    component: ProjectComponent,
    canActivate: [AuthGuard]
  },
 
  {
    path: 'register',
    component: InscriptionComponent
  },

  {
    path: 'profil',
    component: ProfilComponent,
    canActivate: [AuthGuard]

  },
  {
    path: 'new-project',
    component: AddProjectComponent,
    canActivate: [AuthGuard]

  },
  {
    path: 'canvas/:id',
    component: CanvasComponent,
    canActivate: [AuthGuard]

  },
  {
    path: 'bmc/:id',
    component: BmcComponent,
    canActivate: [AuthGuard]

  },
  {
    path: 'lean/:id',
    component: LeanCanvasComponent,
    canActivate: [AuthGuard]

  },
  {
    path: 'persona/:id',
    component: PersonaComponent,
    canActivate: [AuthGuard]

  },
  {
    path: 'vp/:id',
    component: VpCanvasComponent,
    canActivate: [AuthGuard]

  },
  {
    path: 'reinitialiser-mot-de-passe',
    component: ForgetPasswordComponent
  },

  {
    path: 'swot/:id',
    component: SwotComponent,
    canActivate: [AuthGuard]

  },
  {
    path: 'empathie/:id',
    component: EmpathieComponent,
    canActivate: [AuthGuard]

  },
  { path: 'reset-password/:resetToken', 
  component: ChangePassComponent }, 
  {
    path: '**',
    redirectTo: '/login'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
