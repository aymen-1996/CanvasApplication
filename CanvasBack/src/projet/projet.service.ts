/* eslint-disable prettier/prettier */
import { BadRequestException, Injectable, NotFoundException, UploadedFile } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { projet } from './projet.entity';
import { DeepPartial, FindOneOptions, Repository } from 'typeorm';
import { canvas } from 'src/canvas/canvas.entity';
import { block } from 'src/block/Block.entity';
import { invite } from 'src/invite/invite.entity';
import { Multer } from 'multer';
import * as path from 'path';

import * as fs from 'fs/promises';
import { donnees } from 'src/donnees/donnees.entity';

@Injectable()
export class ProjetService {
    constructor(
        @InjectRepository(projet)
        private readonly projectRepository: Repository<projet>,
        @InjectRepository(canvas)
        private readonly canvasRepository: Repository<canvas>,
        @InjectRepository(block)
        private readonly blockRepository: Repository<block>,
        @InjectRepository(invite)
        private readonly inviteRepository: Repository<invite>,
        @InjectRepository(donnees)
        private readonly donneesRepository: Repository<donnees>,
    ) {}



    //Creation Projet
    async createProject(
        userId: number,
        nomProjet: string,
        image?: Express.Multer.File,
      ): Promise<projet> {
        try {
            let nomImage: string | undefined;

            if (image) {  
              const currentDate = new Date().toISOString().replace(/[-:T.]/g, '');
              nomImage = `${currentDate}_${image.originalname}`;
        
              const uploadsPath = path.join(__dirname, '..', '..', 'uploads');
              const imagePath = path.join(uploadsPath, nomImage);
        
              await fs.copyFile(image.path, imagePath);
        
              await fs.unlink(image.path);
            }
    
            else if(!image){
                nomImage = 'project.jpg';
            }

            const project = this.projectRepository.create({
                user: { idUser: userId },
                nomProjet: nomProjet,
                imageProjet: nomImage,
            });

    
            await this.projectRepository.save(project);
    

            const canvasNames = ['BMC', 'Lean Canvas', 'VP Canvas', 'SWOT', 'Empathy Map Canvas', 'Persona Canvas'];
    
            for (const canvasRole of canvasNames) {
                const canvas = this.canvasRepository.create({ projet: project, nomCanvas: canvasRole });
                await this.canvasRepository.save(canvas);
    
                const invite = this.inviteRepository.create({
                    roleInvite: 'editor',
                    etat:'accepted',
                    user: { idUser: userId },
                    projet: project,
                    canvas: canvas,
                });
                await this.inviteRepository.save(invite);
    
                const defaultBlocks = this.getDefaultBlocks(canvasRole);
                for (const blockType of defaultBlocks) {
                    const block = this.blockRepository.create({
                        canvas: canvas,
                        nomBlock: blockType.nomBlock,
                        description: blockType.description,
                    });
                    await this.blockRepository.save(block);
                }
            }
            return project;
        } catch (error) {
            console.error('Error in createProject:', error);
            throw error;
        }
    }

    //Creation Blocks
    getDefaultBlocks(canvasRole: string): { nomBlock: string, description: string }[] {
        switch (canvasRole) {
            case 'BMC':
                return [
                    { 
                        nomBlock: 'Segments', 
                        description: `Ce bloc reprend l'ensemble de personnes, ou d'établissements ou d'organisations, à qui vous comptez proposer votre offre, de bien ou de service.
Un segment est une population homogène de consommateurs représentant une ou plusieurs similitudes au niveau de leurs caractéristiques, ces similitudes peuvent être d'ordre comportemental, social, économique, psychographique, etc. et sont appelées critères de segmentation.` 
                    },
                    { nomBlock: 'Proposition de valeur', description: `Ce bloc reprend l'ensemble des gains (bénéfices) qu'offre l'utilisation de votre produit ou service
                    ` },
                    { nomBlock: 'Canaux de distribution', description: `Ce bloc reprend les scénarios que vous avez imaginez pour permettre à vos clients (segments que vous avez ciblez) de recevoir ou récupérer leurs commandes en magasin, place de marché, livraison à domicile, etc.
                    ` },
                    { nomBlock: 'Relation client', description: `Ce bloc reprend les moyens que vous allez mettre à disposition pour vos clients afin de se renseigner sur vos produits ou d'échanger avec vous sur les commandes qu'il ont effectuées et leurs expérience Hotline téléphonique, Compte whatsapp ou autre réseau sociaux, Rubrique contacter nous etc
                    ` },
                    { nomBlock: 'Structure de revenus', description: `Ce bloc reprends par quel moyen et sous quel forme vos clients vont vous payer Cash, Abonnement, Crédit etc.
                    ` },
                    { nomBlock: 'Activités clés', description:`Ce bloc regroupe l'ensemble des activités que vous devez assurer en interne au seins de votre établissement pour réaliser (votre proposition de valeurs) produit
                    ` },
                    { nomBlock: 'Ressources clés', description: `Pour ce bloc, en amont avec les activités clés que vous avez défini lors de l'étape précédente vous allez déterminer les ressources clés c'est à dire qu'elles sont les moyens que vous devez assurer au seins de votre établissement pour garantir le bon déroulement de vos activités clés
                    ` },
                    { nomBlock: 'Partenaires clés', description: `Ce bloc reprends les partenaires dont le rôle est d'alléger votre structure c'est à dire minimiser les coûts et les risque relative à votre business, en assurant certaines tâches qui sont nécessaire à votre activité et dont vous ne disposez pas de moyen suffisante pour les réaliser, ou qui ne relève pas de votre expertise
                    ` },
                    { nomBlock: 'Structure de coûts', description: `Dans ce bloc il s'agit de définir la structure des coûts c'est à dire quel sont les coût que votre établissement doit supporter pour mettre en exécution ce que vous avez prévue au niveau des blocs précédents
                    `},
                ];

                case 'Lean Canvas':
                    return [
                        { nomBlock: 'Segments de clientèles', description: 'Segments de clientèles' },
                        { nomBlock: 'Utilisateurs pionniers', description: 'Utilisateurs pionniers' },
                        { nomBlock: 'Problème', description: 'Problème' },
                        { nomBlock: 'Alternatives existantes', description: 'Alternatives existantes' },
                        { nomBlock: 'Solution', description: 'Solution' },
                        { nomBlock: 'Proposition de valeur unique', description: 'Proposition de valeur unique' },
                        { nomBlock: 'Votre <<Pitch>>!', description: ' Votre <<Pitch>>!' },
                        { nomBlock: 'Avantage compétitif', description: 'Avantage compétitif' },
                        { nomBlock: 'Canaux', description: 'Canaux' },
                        { nomBlock: 'Indicateurs de performance', description: 'Indicateurs de performance' },
                        { nomBlock: 'Coûts', description: 'Coûts' },
                        { nomBlock: 'Sources de revenus', description: 'Sources de revenus' },
                    ];
    
                case 'VP Canvas':
                    return [
                        { nomBlock: '', description: 'Jobs to be done' },
                        { nomBlock: '', description: 'Pains' },
                        { nomBlock: '', description: 'Gains' },
                        { nomBlock: '', description: 'Produits & services' },
                        { nomBlock: '', description: 'Pain Relievers' },
                        { nomBlock: '', description: 'Gain Creators' },
                    ];
    
                case 'SWOT':
                    return [
                        { nomBlock: 'Forces', description: '' },
                        { nomBlock: 'Faiblesses', description: '' },
                        { nomBlock: 'Opportunités', description: '' },
                        { nomBlock: 'Menaces', description: '' },
                    ];
    
                case 'Empathy Map Canvas':
                    return [
                        { nomBlock: '', description: 'Ce que votre persona Entend' },
                        { nomBlock: '', description: 'Ce que votre persona pense et ressent' },
                        { nomBlock: '', description: 'Ce que votre persona Voit' },
                        { nomBlock: '', description: 'Ce que votre persona Dit et fait' },
                        { nomBlock: 'PROBLEMES', description: 'Problème : peurs, Frustrations et Obstacles' },
                        { nomBlock: 'BESOINS', description: ' Besoins Envie' },

                    ];
    
                case 'Persona Canvas':
                    return [
                        { nomBlock: 'Profil', description: 'Profil' },
                        { nomBlock: 'Contexte', description: 'Contexte' },
                        { nomBlock: 'Attentes', description: 'Attentes' },
                        { nomBlock: 'Sentiments', description: 'Sentiments' },
                        { nomBlock: 'Problèmes', description: 'Problèmes' },
                        { nomBlock: 'Outils', description: 'Outils' },
                        { nomBlock: 'Ressources', description: 'Ressources' },
                    ];

            default:
                return [];
        }


        
    }

    //List projet selon Invite
    async getProjectsByUserId(userId: number): Promise<invite[]> {
        return this.inviteRepository.find({
            where: { user: { idUser: userId } },
            relations: ['projet'], 
        });
    }

    async getPendingInvitesByUserId(userId: number) {
        try {
          const pendingInvites = await this.inviteRepository.find({
            where: { user: { idUser: userId }, etat: 'en attente' },
            relations: ['projet', 'user', 'canvas'],
          });
    
          return pendingInvites;
        } catch (error) {
          throw new Error(`Unable to fetch pending invites: ${error.message}`);
        }
      }

    //Liste Canvas selon invite par isuser et idProj
    async getCanvasInvitesByUserIdAndProjetId(userId: number, projetId: number): Promise<invite[]> {
        return this.inviteRepository.find({
          where: { user: { idUser: userId }, projet: { idProjet: projetId } },
          relations: ['canvas'],
        });
      }
      
    
    async getProjectById(idProjet: number): Promise<projet | undefined> {
        return this.projectRepository.findOne({ where: { idProjet: idProjet } });
      }



      //Delete Projet avec ses invites et ses canvas et blocs
      async deleteProjectAndRelatedEntities(projectId: number, userId: number): Promise<void> {
        try {
            const project = await this.projectRepository.findOneOrFail({ 
                where: { idProjet: projectId, user: { idUser: userId } }, 
                relations: ['canvas', 'canvas.block', 'canvas.block.donnees', 'invite']
            });
    
            if (!project) {
                throw new Error("Project not found or user does not have permission to delete it.");
            }
            
            for (const invite of project.invite) {
                await this.inviteRepository.remove(invite);
            }
    
            for (const canvas of project.canvas) {
                for (const block of canvas.block) {
                    await this.donneesRepository.delete({ block: { idBlock: block.idBlock } });
                }
                await this.blockRepository.delete({ canvas: { idCanvas: canvas.idCanvas } });
            }
    
            await this.canvasRepository.delete({ projet: { idProjet: projectId } });
    
            await this.projectRepository.delete(projectId);
        } catch (error) {
            console.error('Error in deleteProjectAndRelatedEntities:', error);
            throw error;
        }   
    }
    
    
    
//Role selon invite
async getRoleByUserIdAndCanvasId(

    userId: number,
    canvasId: number
  ): Promise<invite> {
    try {
      const invite = await this.inviteRepository.findOne({
        where: { user: { idUser: userId }, canvas: { idCanvas: canvasId } },
      });
  
      return invite
    } catch (error) {
      console.error('Error in getRoleByUserIdAndCanvasId:', error);
      throw error;
    }
  }


  async getProjetByUserIdAndCanvasId(userId: number, canvasId: number): Promise<any> {
    try {
      const invite = await this.inviteRepository.findOne({
        where: { user: { idUser: userId }, canvas: { idCanvas: canvasId } },
        relations: ['projet'],
      });

      return invite?.projet || null;
    } catch (error) {
      console.error('Error in getProjetByUserIdAndCanvasId:', error);
      throw error;
    }
  }

  //change etat invite 

async updateInviteState(userId: number, inviteId: number): Promise<void> {
    try {
      const inviteToUpdate = await this.inviteRepository.findOne({
        where: {
          user: { idUser: userId },
          idInvite: inviteId,
          etat: 'en attente',
        },
      });
  
      if (!inviteToUpdate) {
        throw new NotFoundException('Invite not found or not in "en attente" state.');
      }
  
      inviteToUpdate.etat = 'accepted';
      await this.inviteRepository.save(inviteToUpdate);
    } catch (error) {
      throw new BadRequestException('Failed to update invite state.');
    }
  }

  async progress(projectId: number): Promise<any[]> {
    const invites = await this.inviteRepository.find({
        where: { projet: { idProjet: projectId }},
        relations: ['projet', 'canvas', 'canvas.block', 'canvas.block.donnees'],
    });
  
    const projectsMap = new Map<string, any>();
  
    invites.forEach((invite) => {
        const projectId = invite.projet.idProjet.toString(); 
  
        if (!projectsMap.has(projectId)) {
            projectsMap.set(projectId, {
                projet: invite.projet,
                canvases: [],
                totalBlocks: 0,
                filledBlocksCount: 0,
                progressPercentage: 0,
            });
        }
  
        const projectData = projectsMap.get(projectId);
        projectData.canvases.push({
            canvas: invite.canvas,
            blocks: invite.canvas.block.map((block) => ({
                block,
                donnees: block.donnees,
            })),
        });

        projectData.totalBlocks += invite.canvas.block.length;

        invite.canvas.block.forEach(block => {
            if (block.donnees && block.donnees.length > 0) {
                projectData.filledBlocksCount++;
            }
        });

        projectData.progressPercentage = (projectData.filledBlocksCount / projectData.totalBlocks) * 100;
    });
  
    return Array.from(projectsMap.values());
}


async getProjectCanvassByUserId(userId: number): Promise<invite[]> {
  try {
      const invitations = await this.inviteRepository.find({
          where: { user: { idUser: userId } },
          relations: ['projet', 'projet.canvas'], // Ajout de la relation avec l'entité canvas
      });

      return invitations;
  } catch (error) {
      console.error('Erreur lors de la récupération des projets par utilisateur:', error);
      throw error;
  }
}
  
  
  
}


      
