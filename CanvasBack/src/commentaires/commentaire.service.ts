import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { commentaire } from './commentaire.entity';
import { user } from 'src/user/user.entity';
import { canvas } from 'src/canvas/canvas.entity';
import { Socket } from 'socket.io';
import { join } from 'path';
import { promises as fs } from 'fs';
@Injectable()
export class CommentaireService {
    constructor(
        @InjectRepository(commentaire) private commentaireRepo: Repository<commentaire>,
        @InjectRepository(user) private userRepo: Repository<user>,
        @InjectRepository(canvas) private canvasRepo: Repository<canvas>,

    ) {}

    // Creer nouveau commentaire
    async createCommentaire(idUser: number, idCanvas: number, contenu: string, file: string) {
        const userEntity = await this.userRepo.findOne({ where: { idUser } });
        if (!userEntity) {
            throw new NotFoundException(`User with ID ${idUser} not found.`);
        }

        const canvasEntity = await this.canvasRepo.findOne({ where: { idCanvas } });
        if (!canvasEntity) {
            throw new NotFoundException(`Canvas with ID ${idCanvas} not found.`);
        }

        const commentaireEntity = this.commentaireRepo.create({
            contenu,
            file,
            user: userEntity,
            canvas: canvasEntity,
        });

        const savedCommentaire = await this.commentaireRepo.save(commentaireEntity);


        return savedCommentaire;
    }
    
    //Liste des commentaires par idcanvas
    async getCommentairesByCanvas(idCanvas: number) {
        return await this.commentaireRepo.find({
            where: {
                canvas: { idCanvas },
            },
            relations: ['user', 'canvas'],
            order: {
                dateDeCommentaire: 'DESC', 
            },
        });
    }
    
    // Compter les commentaires par ID du canvas
    async countCommentairesByCanvas(idCanvas: number) {
        return await this.commentaireRepo.count({
            where: {
                canvas: { idCanvas },
            },
        });
    }
    //afficher contenu file 
    async getFilePath(fileName: string): Promise<string> {
        const filePath = join(__dirname, '..', '..', 'uploads', fileName);
        try {
            await fs.access(filePath);
            return filePath;
        } catch (error) {
            throw new NotFoundException('Le fichier n\'a pas pu être trouvé.');
        }
    }
}
