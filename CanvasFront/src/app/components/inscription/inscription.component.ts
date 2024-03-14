import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { UserService } from 'src/app/services/user.service';
import * as alertify from 'alertifyjs';
interface City {
  name: string
}
@Component({
  selector: 'app-inscription',
  templateUrl: './inscription.component.html',
  styleUrls: ['./inscription.component.scss']
})
export class InscriptionComponent implements OnInit{
  governorates : City[] | any;
  showFirst: boolean = false;
  showFirst2: boolean = true;
  signUpForm:any;
 constructor( private formBuilder: FormBuilder, private userService: UserService){
  this.governorates = [
    { name: 'Tunis' },
    { name: 'Ariana' },
    { name: 'Ben Arous' },
    { name: 'Manouba' },
    { name: 'Nabeul' },
    { name: 'Zaghouan' },
    { name: 'Bizerte' },
    { name: 'Beja' },
    { name: 'Jendouba' },
    { name: 'Kef' },
    { name: 'Siliana' },
    { name: 'Kairouan' },
    { name: 'Kasserine' },
    { name: 'Sidi Bouzid' },
    { name: 'Sfax' },
    { name: 'Gabes' },
    { name: 'Medenine' },
    { name: 'Tataouine' }
  ];


  
}
  
 
  ngOnInit(): void {
    this.signUpForm= this.formBuilder.group({
    nomUser:[''],
    prenomUser:[''],
    emailUser:['',[Validators.required, Validators.email]],
    passwordUser:['',Validators.required],
    passwordUserconfirmed:['',Validators.required],
    gov:[''],
    datenaissance:[''],
    adresse:[''],
    education:[''],
    qualification:[''],
    cv:[''],
    },{ validator: this.passwordMatchValidator })

  }


  passwordMatchValidator(formGroup: FormGroup): {[key: string]: any} | null {
    const passwordControl = formGroup.get('passwordUser');
    const confirmPasswordControl = formGroup.get('passwordUserconfirmed');

    if (passwordControl && confirmPasswordControl && passwordControl.value !== confirmPasswordControl.value) {
      confirmPasswordControl.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    } else {
      confirmPasswordControl?.setErrors(null);
      return null;
    }
  }

  onSignup():void{
    // if (this.signUpForm.invalid) {
    //   // If the form is invalid, show an alert
    //   alertify.set('notifier', 'position', 'top-right');
    //   alertify.notify('Formulaire invalide', 'error', 10);
    //   return; // Exit the function early
    // }
    this.signUpForm.markAllAsTouched();
    if (this.signUpForm.invalid) {
      // If the form is invalid, show an alert
      alertify.set('notifier', 'position', 'top-right');
      alertify.notify('Veuillez remplir tous les champs requis.','error');
      return; // Exit the function early
  }else {
    this.userService.signup(this.signUpForm.value).subscribe(
      (response: any) => {
        if (response.user) {
          alertify.set('notifier', 'position', 'top-right');
          alertify.notify('Compte ajouté', 'success', 10);
        } else if (response.message) {
          // If the response contains a message, show an alert with the message
          alertify.set('notifier', 'position', 'top-right');
          alertify.notify(response.message, 'error', 10);
        }
      },
      (error) => {
        // Handle error from the backend if any
        console.error('Error:', error);
        alertify.set('notifier', 'position', 'top-right');
        alertify.notify('Une erreur s\'est produite', 'error', 10);
      }
    );


  }

   
  


  }

  onShowFirstChange(value: boolean) {
    this.showFirst2 = value;
    this.showFirst=!value;


  }
}
