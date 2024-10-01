import { SafeUrl } from "@angular/platform-browser";

export interface User {
    idUser: number;
    nomUser?: string;
    prenomUser?: string;
    emailUser?: string;
    passwordUser?: string;
    gov?: string;
    datenaissance?: Date;
    adresse?: string;
    education?: string;
    qualification?: string;
    cv?: string;
    imageUser?: SafeUrl | null;  // Modifier ici pour accepter SafeUrl
    genre?: string;
    role?: string;
    jwt: string  | null;
  }
  