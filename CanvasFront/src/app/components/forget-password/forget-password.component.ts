import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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


  constructor(private fb: FormBuilder, private authService: AuthService) {
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
