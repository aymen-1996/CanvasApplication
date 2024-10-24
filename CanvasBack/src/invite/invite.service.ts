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
      throw new Error(`Vous ne pouvez pas envoyer une invitation à cet utilisateur, car il est le porteur de projet`);
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
  async getProjectByCanvasAndUser(nomCanvas: string, userId: number): Promise<{ projects: { canvas: any[], idProjet: number, imageProjet: string, nomProjet: string }[] }> {
    const invites = await this.inviteRepository
        .createQueryBuilder('invite')
        .leftJoinAndSelect('invite.projet', 'projet')
        .leftJoinAndSelect('invite.canvas', 'canvas')
        .leftJoinAndSelect('invite.user', 'user')
        .where('canvas.nomCanvas = :nomCanvas', { nomCanvas })
        .andWhere('invite.userId = :userId', { userId })
        .andWhere('invite.etat = :etat', { etat: 'accepted' }) 
        .select(['invite', 'projet', 'canvas', 'user'])
        .getMany();

    if (invites.length === 0) {
        throw new NotFoundException(`No invites found for canvas: ${nomCanvas}, user: ${userId}, with status accepted`);
    }

    const projectsMap = new Map<number, { canvas: any[], idProjet: number, imageProjet: string, nomProjet: string }>();

    for (const invite of invites) {
        const project = invite.projet;

        if (!projectsMap.has(project.idProjet)) {
            projectsMap.set(project.idProjet, {
                canvas: [],
                idProjet: project.idProjet,
                imageProjet: project.imageProjet,
                nomProjet: project.nomProjet
            });
        }

        const projectEntry = projectsMap.get(project.idProjet);
        if (projectEntry) {
            const canvasEntry = {
                idCanvas: invite.canvas.idCanvas,
                nomCanvas: invite.canvas.nomCanvas
            };
            projectEntry.canvas.push(canvasEntry);
        }
    }

    const projectsArray = Array.from(projectsMap.values());

    if (projectsArray.length === 0) {
        throw new NotFoundException(`No project found for canvas: ${nomCanvas} and user: ${userId}`);
    }

    return {
        projects: projectsArray 
    };
}






  
}