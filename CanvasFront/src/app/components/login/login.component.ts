import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { User } from 'src/app/models/user';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit{
  showFirst: boolean = false;
  email: string = '';
  password: string = '';
  errorMessage: string = ''
  formUser!: FormGroup

  constructor(private router:Router , private authService: AuthService , private formBuilder: FormBuilder){
    if (this.authService.currentUserValue ) {
      this.router.navigate(['/projects']);
    }
  }
  ngOnInit(): void {
   
    this.formUser = this.formBuilder.group({

      emailUser:'',

      passwordUser: '',
    });
  }

  onLogin(): void {
    this.authService.login(this.formUser.value.emailUser, this.formUser.value.passwordUser).subscribe(
      (response) => {
        if (response && response.jwt) {
          this.router.navigate(['/projects']);
          console.log(response);
        } else {
          this.errorMessage = response.message;
          console.error('Unexpected response format:', response);
        }
      },
      (error) => {
        console.error('Login error:', error);
        this.errorMessage = 'An unexpected error occurred.';
      }
    );
  }
  
  
  

   login(){
     this.router.navigate(["/projects"]);
   }
   onShowFirstChange(value: boolean) {
    this.showFirst = value;
  }
}
