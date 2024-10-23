import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { canvas } from 'src/canvas/canvas.entity';
import { invite } from 'src/invite/invite.entity';
@Injectable()
export class CanvasService {

    constructor(
        @InjectRepository(canvas)
        private readonly canvasRepository: Repository<canvas>,
        @InjectRepository(invite)
        private readonly inviteRepository: Repository<invite>,
      ) {}
    async getCanvasByUser(userId: number): Promise<canvas[]> {
        const invites = await this.inviteRepository
          .createQueryBuilder('invite')
          .leftJoinAndSelect('invite.canvas', 'canvas')
          .where('invite.userId = :userId', { userId })
          .getMany();
    
        const canvasIds = invites.map(invite => invite.canvas.idCanvas);
    
        return this.canvasRepository
          .createQueryBuilder('canvas')
          .where('canvas.idCanvas IN (:...canvasIds)', { canvasIds })
          .getMany();
      }
}
