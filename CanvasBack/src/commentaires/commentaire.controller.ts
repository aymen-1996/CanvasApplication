import { Controller, Post, Body, Param, UploadedFile, UseInterceptors, Get, Res } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as fs from 'fs';
import * as path from 'path';
import { CommentaireService } from './commentaire.service';
import { Response } from 'express'; 

@Controller('commentaire')
export class CommentaireController {
    constructor(private readonly commentaireService: CommentaireService) {}

    //creer commentaire 
    @Post('create/:idUser/:idCanvas')
    @UseInterceptors(FileInterceptor('file'))
    async createCommentaire(
        @Param('idUser') idUser: number,
        @Param('idCanvas') idCanvas: number,
        @Body('contenu') contenu: string,
        @UploadedFile() file: Express.Multer.File
    ) {
        let fileName = null;
        if (file) {
            fileName = `${Date.now()}-${file.originalname}`;
            const filePath = path.join(__dirname, '..', '..', 'uploads', fileName);
            await fs.promises.writeFile(filePath, file.buffer);
        }

        return this.commentaireService.createCommentaire(idUser, idCanvas, contenu, fileName);
    }
    

    //get commnetaire
    @Get(':idCanvas')
    async getCommentaires(
        @Param('idCanvas') idCanvas: number
    ) {
        return this.commentaireService.getCommentairesByCanvas(idCanvas);
    }
    
    //count
    @Get(':idCanvas/count')
    async countCommentaires(
        @Param('idCanvas') idCanvas: number,
    ): Promise<number> {
        return this.commentaireService.countCommentairesByCanvas(idCanvas);
    }
    
    //afficher contenu de file
    @Get('file/:fileName')
    async getFile(@Param('fileName') fileName: string, @Res() res: Response) {
        const filePath = await this.commentaireService.getFilePath(fileName);

        res.sendFile(filePath);
    }
}
