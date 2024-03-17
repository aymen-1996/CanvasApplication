import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-change-pass',
  templateUrl: './change-pass.component.html',
  styleUrls: ['./change-pass.component.scss']
})
export class ChangePassComponent {
  resetToken!: string;
  responseMessage!: string;
  resetForm!: FormGroup;

  errorMessage: string = ''
  successMessage: string = ''

  constructor(private authService: AuthService,private activatedRoute:ActivatedRoute, private formBuilder: FormBuilder,) {
    console.log("Route Params:", this.activatedRoute.snapshot.params);

    this.resetToken = this.activatedRoute.snapshot.params['resetToken'];
  }

  
  ngOnInit() {
    this.activatedRoute.data.subscribe((data: any) => {
      const title = data.title || 'Titre par défaut';
      document.title = `Canvas | ${title}`;
    });
    this.resetForm = this.formBuilder.group({
      newpwd: '',
      comfpwd:'',
    });

    this.authService.validateResetToken(this.resetToken).subscribe(
      (response) => {
        console.log(response); 
      },
      (error) => {
        console.error(error);
      }
    );
  

    this.verifyResetToken();
  }
  verifyResetToken() {
    this.authService.verifyResetToken(this.resetToken).subscribe(
      (response) => {
        if (response.status === 'success') {
          console.log("Success:", response.message);
        } else {
          console.error("Error:", response.message);
          this.responseMessage = response.message;

        }
      },
      (error) => {
        console.error("HTTP Error:", error);
      }
    );
  }


  resetPassword(): void {
 
      this.authService.resetPassword(this.resetToken, this.resetForm.value.newpwd, this.resetForm.value.comfpwd).subscribe(
        (response) => {
          if(response.status == "success"){
            this.successMessage=response.message
            this.errorMessage=""
          }else{
            this.errorMessage=response.message
            this.successMessage=""
          }
       
        },
        (error) => {
         
          console.error('Error resetting password:', error);
        }
      );
  }
}
