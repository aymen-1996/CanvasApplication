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
    component: LoginComponent,
    data: { title: 'Login' }
  },
  {
    path: 'projects',
    component: ProjectComponent,
    canActivate: [AuthGuard],
    data: { title: 'Projets' }
  },
 
  {
    path: 'register',
    component: InscriptionComponent,
    data: { title: 'Register' }
  },

  {
    path: 'profil',
    component: ProfilComponent,
    canActivate: [AuthGuard],
    data: { title: 'Profil' }

  },
  {
    path: 'new-project',
    component: AddProjectComponent,
    canActivate: [AuthGuard]

  },
  {
    path: 'canvas',
    component: CanvasComponent,
    canActivate: [AuthGuard],
    data: { title: 'Mes Canvas' }

  },
  {
    path: 'bmc',
    component: BmcComponent,
    canActivate: [AuthGuard],
    data: { title: 'BMC' }
  },
  {
    path: 'lean',
    component: LeanCanvasComponent,
    canActivate: [AuthGuard],
    data: { title: 'LEAN' }

  },
  {
    path: 'persona',
    component: PersonaComponent,
    canActivate: [AuthGuard],
    data: { title: 'Persona' }

  },
  {
    path: 'vp',
    component: VpCanvasComponent,
    canActivate: [AuthGuard],
    data: { title: 'VP Canvas' }

  },
  {
    path: 'reinitialiser-mot-de-passe',
    component: ForgetPasswordComponent,
    data: { title: 'Reinitialisation Mot de Passe' }
  },

  {
    path: 'swot',
    component: SwotComponent,
    canActivate: [AuthGuard],
    data: { title: 'SWOT' }

  },
  {
    path: 'empathie',
    component: EmpathieComponent,
    canActivate: [AuthGuard],
    data: { title: 'Empathie' }

  },
  { path: 'reset-password/:resetToken', 
  component: ChangePassComponent ,
  data: { title: 'Nouveau Mot de Passe' }
}, 
  
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
