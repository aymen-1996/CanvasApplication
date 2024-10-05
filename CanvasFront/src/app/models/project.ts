import { User } from "./user";

export interface project{
    idProjet: number
    etat:string;
  nomProjet:string;
  imageProjet?:string; 
  user:User
}