
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
    imageUser?: string;
    genre?: string;
    role?: string;
    jwt: string  | null;
  }
  