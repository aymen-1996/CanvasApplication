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
import { ChatComponent } from './components/chat/chat.component';
import {  PreloadAllModules } from '@angular/router';


const routes: Routes = [
  {
    path: 'login',
    loadChildren: () => import('./components/login/login.module').then(m => m.LoginModule),
    data: { title: 'Login' }
  },
  {
    path: 'chat',
    loadChildren: () => import('./components/chat/chat.module').then(m => m.ChatModule),
    canActivate: [AuthGuard],
    data: { title: 'Chat' }
  },
  {
    path: 'projects',
    loadChildren: () => import('./components/project/project.module').then(m => m.ProjectModule),
    canActivate: [AuthGuard],
    data: { title: 'Projets' }
  },
  {
    path: 'register',
    loadChildren: () => import('./components/inscription/inscription.module').then(m => m.InscriptionModule),
    data: { title: 'Register' }
  },
  {
    path: 'profil',
    loadChildren: () => import('./components/profil/profil.module').then(m => m.ProfilModule),
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
    loadChildren: () => import('./components/canvas/canvas.module').then(m => m.CanvasModule),
    canActivate: [AuthGuard],
    data: { title: 'Mes Canvas' }
  },
  {
    path: 'bmc',
    loadChildren: () => import('./components/canvas/bmc/bmc.module').then(m => m.BmcModule),
    canActivate: [AuthGuard],
    data: { title: 'BMC' }
  },
  {
    path: 'lean',
    loadChildren: () => import('./components/canvas/lean-canvas/lean-canvas.module').then(m => m.LeanModule),
    canActivate: [AuthGuard],
    data: { title: 'LEAN' }
  },
  {
    path: 'persona',
    loadChildren: () => import('./components/canvas/persona/persona.module').then(m => m.PersonaModule),
    canActivate: [AuthGuard],
    data: { title: 'Persona' }
  },
  {
    path: 'vp',
    loadChildren: () => import('./components/canvas/vp-canvas/vp-canvas.module').then(m => m.VpModule),
    canActivate: [AuthGuard],
    data: { title: 'VP Canvas' }
  },
  {
    path: 'reinitialiser-mot-de-passe',
    loadChildren: () => import('./components/forget-password/forget.module').then(m => m.ForgetPasswordModule),
    data: { title: 'Réinitialisation Mot de Passe' }
  },
  {
    path: 'swot',
    loadChildren: () => import('./components/canvas/swot/swot.module').then(m => m.SwotModule),
    canActivate: [AuthGuard],
    data: { title: 'SWOT' }
  },
  {
    path: 'empathie',
    loadChildren: () => import('./components/canvas/empathie/empathie.module').then(m => m.EmpathieModule),
    canActivate: [AuthGuard],
    data: { title: 'Empathie' }
  },
  {
    path: 'reset-password/:resetToken',
    loadChildren: () => import('./components/change-pass/changePass.module').then(m => m.ChangePasswordModule),
    data: { title: 'Nouveau Mot de Passe' }
  },
  {
    path: '**',
    redirectTo: '/login'
  }
];

@NgModule({
   imports: [
    RouterModule.forRoot(routes, {
      preloadingStrategy: PreloadAllModules
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
