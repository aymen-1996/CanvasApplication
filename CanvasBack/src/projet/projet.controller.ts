import { BadRequestException, Body, Controller, Delete, Get, NotFoundException, Param, ParseIntPipe, Post, Put, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ProjetService } from './projet.service';
import { FileInterceptor } from '@nestjs/platform-express';
import * as path from 'path';
import {Response, Request} from 'express';
import { invite } from 'src/invite/invite.entity';


@Controller('projet')
export class ProjetController { constructor(private readonly projetService: ProjetService) {}

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

//liste Projet par id user selon class invite
@Get(':userId')
async getProjectsByUserId(@Param('userId') userId: number) {
    try {
        const invites = await this.projetService.getProjectsByUserId(userId);

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
    const uniqueProjectIds = new Set();

    const result = invites
      .filter(invite => invite.etat === 'accepted')
      .filter(invite => {
        const canvasId = invite.canvas.idCanvas.toString();
        if (!uniqueProjectIds.has(canvasId)) {
          uniqueProjectIds.add(canvasId);
          return true;
        }
        return false;
      })
      .map(invite => ({
        idCanvas: invite.canvas.idCanvas,
        nomCanvas: invite.canvas.nomCanvas,
        roleInvite: invite.roleInvite, // Include roleInvite for each canvas
      }));

    return { Canvas: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
}


//afficher image projet
@Get('image/:projetId/im')
async serveImage(@Param('projetId') projetId: number, @Res() res: Response) {
  const user = await this.projetService.getProjectById(projetId);

  if (user && user.imageProjet) {
    const filename = user.imageProjet;
    const imagePath = path.join(__dirname, '..', '..', 'uploads', filename);

    const exists = require('fs').existsSync(imagePath);

    if (exists) {
      res.sendFile(imagePath);
    } else {
      throw new NotFoundException('Image not found');
    }
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
): Promise<{ success: boolean, message: string }> {
  try {
    await this.projetService.updateInviteState(userId, inviteId);
    return { success: true, message: 'Invitation state updated successfully.' };
  } catch (error) {
    return { success: false, message: error.message };
  }
}


}
