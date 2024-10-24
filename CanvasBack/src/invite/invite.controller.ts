import { Body, Controller, Delete, Get, NotFoundException, Param, ParseIntPipe, Post, Query, Res } from '@nestjs/common';
import { InviteService } from './invite.service';
import { Response } from 'express'; // Import the Response object
import { invite } from './invite.entity';
import { projet } from 'src/projet/projet.entity';
import { canvas } from 'src/canvas/canvas.entity';

@Controller('invite')
export class InviteController {

    constructor(private readonly inviteService: InviteService) {}

    //envoyer invitation si invitation est deja existe return error
    @Post(':idProjet/:idCanvas')
    async inviteUser(
      @Param('idProjet', ParseIntPipe) idProjet: number,
      @Param('idCanvas', ParseIntPipe) idCanvas: number,
      @Body('emailUser') emailUser: string,
      @Body('role') role: string,
      @Res() res: Response, 
    ): Promise<void> {
      try {
        const successMessage = await this.inviteService.inviteUser(idProjet, idCanvas, emailUser, role);
        res.status(200).json({ message: successMessage });
      } catch (error) {
        res.status(400).json({ error: error.message });
      }
    }


    //Refus invite (delete)
    @Delete(':idInvite/:idUser')
    async deleteInviteByIdAndUserId(
      @Param('idInvite') idInvite: number, 
      @Param('idUser') idUser: number
    ): Promise<any> {
      try {
        const result = await this.inviteService.deleteInviteByIdAndUserId(idInvite, idUser);
        return { success: true, message: result };
      } catch (error) {
        return { success: false, message: error.message };
      }
    }

    @Get('project-by-canvas/:nomCanvas/:userId')
    async getProjectByCanvasAndUser(
      @Param('nomCanvas') nomCanvas: string,
      @Param('userId') userId: number
    ): Promise<{ projects: { canvas: any[]; idProjet: number; imageProjet: string; nomProjet: string }[] }> { // تأكد من أن نوع الإرجاع يعكس التغييرات
      const result = await this.inviteService.getProjectByCanvasAndUser(nomCanvas, userId);
    
      if (!result || result.projects.length === 0) {
        throw new NotFoundException(`No projects found for canvas: ${nomCanvas} and user: ${userId}`);
      }
    
      return result;
    }
    
}