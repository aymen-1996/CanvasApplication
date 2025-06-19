import { BadRequestException, Body, Controller, Delete, Get, Header, NotFoundException, Param, ParseIntPipe, Patch, Post, Put, Query, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ProjetService } from './projet.service';
import { FileInterceptor } from '@nestjs/platform-express';
import * as path from 'path';
import {Response, Request} from 'express';
import { invite } from '../invite/invite.entity';
import { projet } from './projet.entity';
import { user } from '../user/user.entity';

@Controller('projet')
export class ProjetController { constructor(private readonly projetService: ProjetService
) {}

//creation projet (upload image n est pas obligatoir)
@Post(':userId/create')
@UseInterceptors(FileInterceptor('image'))
async createProjectWithImage(
  @Param('userId') userId: number,
  @Body('nomProjet') nomProjet: string,
  @UploadedFile() image: Express.Multer.File,
): Promise<any> {
  try {
    console.log('Uploaded File:', image); 
    const project = await this.projetService.createProject(userId, nomProjet, image);
    return project;
  } catch (error) {
    throw error;
  }
}

@Get(':userId')
async getProjectsByUserId(
  @Param('userId') userId: number, 
  @Query('search') search: string = ''
) {
    try {
        const invites = await this.projetService.getProjectsByUserId(userId, search);

        const uniqueProjectIds = new Set();
        const uniqueProjects = [];

        invites.forEach(invite => {
            const projectId = invite.projet.idProjet.toString();
            
            if (!uniqueProjectIds.has(projectId) && invite.etat === 'accepted') {
                uniqueProjectIds.add(projectId);
                uniqueProjects.push(invite.projet);
            }
        });

        return { projects: uniqueProjects };
    } catch (error) {
        return { success: false, error: error.message };
    }
}


//liste canvas par id projet et id user selon class invite 
@Get(':userId/:projetId')
async getCanvasesByUserIdAndProjetId(
  @Param('userId') userId: number,
  @Param('projetId') projetId: number,
) {
  try {
    const invites = await this.projetService.getCanvasInvitesByUserIdAndProjetId(userId, projetId);
    const uniqueCanvasIds = new Set();

    const result = invites
      .filter(invite => invite.etat === 'accepted')
      .filter(invite => {
        const canvasId = invite.canvas.idCanvas.toString();
        if (!uniqueCanvasIds.has(canvasId)) {
          uniqueCanvasIds.add(canvasId);
          return true;
        }
        return false;
      })
      .map(invite => ({
        idCanvas: invite.canvas.idCanvas,
        nomCanvas: invite.canvas.nomCanvas,
        roleInvite: invite.roleInvite,
        projet: {
          idProjet: invite.projet.idProjet,
          nomProjet: invite.projet.nomProjet,
          user: {
            idUser: invite.projet.user.idUser,
            nomUser: invite.projet.user.nomUser
          }
        }
      }));

    return { Canvas: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
}



//afficher image projet
@Get('image/:projetId/im')
async serveImage(@Param('projetId') projetId: number): Promise<{ imageUrl: string }> {
  const user = await this.projetService.getProjectById(projetId);

  if (user && user.imageProjet) {
    const filename = user.imageProjet;
    const imageUrl = `https://api.chouaibi.shop/upload/image/${filename}`;

    return { imageUrl }; 
  } else {
    throw new NotFoundException('User not found');
  }
}


//Delete Projet
@Delete(':projectId/:userId')
async deleteProject(@Param('projectId') projectId: number , @Param('userId') userId: number): Promise<void> {
  try {
    await this.projetService.deleteProjectAndRelatedEntities(projectId, userId);
  } catch (error) {
    console.error('Error in deleteProject:', error);
    throw error;
  }
}

//Role
@Get('role/:userId/:canvasId/role')
async getRoleByUserIdAndCanvasId(

  @Param('userId') userId: number,
  @Param('canvasId') canvasId: number
): Promise<invite> {
  return this.projetService.getRoleByUserIdAndCanvasId(userId, canvasId);
}

@Get(':userId/:canvasId/projet')
async getProjetByUserIdAndCanvasId(
  @Param('userId') userId: number,
  @Param('canvasId') canvasId: number,
): Promise<any> {
  return this.projetService.getProjetByUserIdAndCanvasId(userId, canvasId);
}


//invite en attente
@Get('invites/:userId/etat')
  async getPendingInvitesByUserId(@Param('userId') userId: number) {
  try {
    const pendingInvites = await this.projetService.getPendingInvitesByUserId(userId);
    return { pendingInvites };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

//change etat 
@Put('invites/:userId/:inviteId/updateState')
async updateInviteState(
  @Param('userId') userId: number,
  @Param('inviteId') inviteId: number,
): Promise<{ success: boolean; message: string; invite: invite | null; project: projet | null; user: user | null }> {
  try {
    const { invite, project, user } = await this.projetService.updateInviteState(userId, inviteId);

    return {
      success: true,
      message: 'Invitation updated successfully',
      invite,
      project, 
      user, 
    };
  } catch (error) {
    return { 
      success: false, 
      message: error.message,
      invite: null,
      project: null,
      user: null 
    };
  }
}


@Get('/progress/:projectId/invites') 
async getInvitesProgressPercentageByProjectId(@Param('projectId') projectId: number): Promise<number[]> {
  try {
    const invites = await this.projetService.progress(projectId);
    const progressPercentages = invites.map(invite => invite.progressPercentage);
    return progressPercentages; 
  } catch (error) {
    throw new Error('Error retrieving invites progress percentage by project ID.'); 
  }
}


@Get('proj/:userId/canvas')
async getProjectsCanvasByUserId(@Param('userId') userId: number) {
    try {
        const invites = await this.projetService.getProjectCanvassByUserId(userId);

        const uniqueProjectIds = new Set();
        const uniqueProjects = [];

        invites.forEach(invite => {
            const projectId = invite.projet.idProjet.toString();
            
            if (!uniqueProjectIds.has(projectId) && invite.etat === 'accepted') {
                uniqueProjectIds.add(projectId);
                uniqueProjects.push(invite.projet);
            }
        });

        return { projects: uniqueProjects };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

//Projebyid
@Get('projid/:id/proj')
async getProjectById(@Param('id', ParseIntPipe) idProjet: number): Promise<any> {
    try {
        const project = await this.projetService.getProjectById(idProjet);
        if (project) {
            return {
                success: true,
                data: project,
            };
        } else {
            return {
                success: false,
                message: 'Project not found',
            };
        }
    } catch (error) {
        return {
            success: false,
            message: 'Failed to fetch project',
            error: error.message || error.toString(),
        };
    }
}

//change image projet
@Put(':projectId/image')
@UseInterceptors(FileInterceptor('image'))
async updateProjectImage(
  @Param('projectId', ParseIntPipe) projectId: number,
  @UploadedFile() image: Express.Multer.File,
): Promise<projet> {
  if (!image) {
    throw new BadRequestException('Image file is required');
  }
  try {
    return await this.projetService.updateProjectImage(projectId, image);
  } catch (error) {
    throw new NotFoundException('Project not found');
  }
}
}

