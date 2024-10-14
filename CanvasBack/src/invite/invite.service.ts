// invite.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { invite } from './invite.entity';
import { projet } from 'src/projet/projet.entity';
import { user } from 'src/user/user.entity';
import { canvas } from 'src/canvas/canvas.entity';

@Injectable()
export class InviteService {
  constructor(
    @InjectRepository(invite)
    private readonly inviteRepository: Repository<invite>,
    @InjectRepository(projet)
    private readonly projetRepository: Repository<projet>,
    @InjectRepository(user)
    private readonly userRepository: Repository<user>,
    @InjectRepository(canvas)
    private readonly canvasRepository: Repository<canvas>,
  ) {}

  async inviteUser(idProjet: number, idCanvas: number, emailUser: string, role: string): Promise<string> {
    const user = await this.userRepository.findOne({ where: { emailUser } });

    if (!user) {
        throw new Error(`Utilisateur avec l'adresse e-mail ${emailUser} non trouvé.`);
    }

    if (!user.enabled) {
        throw new Error(`Vous ne pouvez pas envoyer une invitation à cet utilisateur, car son compte n'est pas activé.`);
    }

    if (!role) {
      throw new Error("Veuillez choisir un rôle pour l'invitation.");
    }

    const projet = await this.projetRepository.findOne({ where: { idProjet } });
    const canvas = await this.canvasRepository.findOne({ where: { idCanvas } });

    const userInProject = await this.projetRepository.findOne({
        where: { idProjet, user: { idUser: user.idUser } },
    });

    if (userInProject) {
      throw new Error(`Vous ne pouvez pas envoyer une invitation à cet utilisateur, car il est le superviseur du projet`);
    }

    const existingInvite = await this.inviteRepository.findOne({
        where: { user, canvas: { idCanvas: idCanvas }, roleInvite: role },
    });

    if (existingInvite) {
        throw new Error(`Une invitation existe déjà pour cet utilisateur`);
    } else {
        const existingInviteWithSameUserAndCanvas = await this.inviteRepository.findOne({
            where: { user, canvas: { idCanvas: idCanvas } },
        });

        if (existingInviteWithSameUserAndCanvas) {
            existingInviteWithSameUserAndCanvas.roleInvite = role;
            await this.inviteRepository.save(existingInviteWithSameUserAndCanvas);
            return `Le rôle de l'utilisateur dans l'invitation a été mis à jour avec succès`;
        } else {
            const invite = this.inviteRepository.create({
                etat: 'en attente',
                nomInvite: user.nomUser,
                emailInvite: user.emailUser,
                roleInvite: role,
                projet,
                user,
                canvas,
            });

            await this.inviteRepository.save(invite);
            return `Invitation envoyée avec succès`;
        }
    }
}


async deleteInviteByIdAndUserId(idInvite: number, idUser: number): Promise<string> {
    const invite = await this.inviteRepository.findOne({ 
      where: { 
        idInvite: idInvite, 
        user: { idUser: idUser } 
      } 
    });
  
    if (!invite) {
      throw new NotFoundException(`L'invitation avec l'ID ${idInvite} n'existe pas pour l'utilisateur avec l'ID ${idUser}`);
    }
  
    await this.inviteRepository.remove(invite);
    
    return `L'invitation avec l'ID ${idInvite} a été supprimée avec succès pour l'utilisateur avec l'ID ${idUser}`;
  }
  
}