import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmpathieComponent } from './empathie.component';
import { RouterModule } from '@angular/router';
import {DropdownModule} from "primeng/dropdown";

import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { DialogModule } from 'primeng/dialog';
import { MatToolbarModule } from '@angular/material/toolbar';
import {MatStepperIntl, MatStepperModule} from '@angular/material/stepper';
import { MatDialogModule } from '@angular/material/dialog';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { NgSelectModule } from '@ng-select/ng-select';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AppRoutingModule } from 'src/app/app-routing.module';
@NgModule({
  declarations: [EmpathieComponent],
  imports: [
    CommonModule,
            MatDialogModule,
            MatBadgeModule,
            MatMenuModule,
            MatFormFieldModule, 
            FormsModule,
            HttpClientModule,
            MatSelectModule,
            DropdownModule,
            ReactiveFormsModule,
            MatIconModule,
            MatProgressBarModule,
            MatProgressSpinnerModule,
            ButtonModule,
            RippleModule,
            DialogModule,
            MatToolbarModule,
            MatStepperModule,
            NgSelectModule,
            
    RouterModule.forChild([
      { path: '', component: EmpathieComponent }
    ])
  ]
})
export class EmpathieModule { }
