import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-forget-password',
  templateUrl: './forget-password.component.html',
  styleUrls: ['./forget-password.component.scss']
})
export class ForgetPasswordComponent {

  form: FormGroup;
  errorMessage: string = ''
  successMessage: string = ''


  constructor(private activatedRoute:ActivatedRoute,private fb: FormBuilder, private authService: AuthService) {
    this.activatedRoute.data.subscribe((data: any) => {
      const title = data.title || 'Titre par défaut';
      document.title = `Canvas | ${title}`;
    });
    this.form = this.fb.group({
      emailUser: '',
    });
  }

  SendMail() {
 
      const email = this.form.value.emailUser;
      this.authService.PasswordReset(email).subscribe(
        (response) => {
          console.log(response);

          this.successMessage=response.message
          this.errorMessage=""
        },
        (error) => {
          this.errorMessage=error.error.message
          this.successMessage=""
          console.error('Error requesting password reset:', error);
        }
      );
    
  }
}
