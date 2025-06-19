import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { user } from '../user/user.entity';
import { message } from '../Message/message.entity';
import { reaction } from './reaction.entity';

@Injectable()
export class ReactionService {
  constructor(
    @InjectRepository(reaction)
    private readonly reactionRepository: Repository<reaction>,
    @InjectRepository(user)
    private readonly userRepository: Repository<user>,
    @InjectRepository(message)
    private readonly messageRepository: Repository<message>,
  ) {}

 
  async createOrUpdateReaction(idUser: number, idMessage: number, newReaction: string) {
    const existingReaction = await this.reactionRepository.findOne({
      where: { user: { idUser }, message: { id: idMessage } },
    });

    if (existingReaction) {
      if (existingReaction.reaction === newReaction) {
        await this.reactionRepository.remove(existingReaction);
        return { message: 'Réaction supprimée' };
      } else {
        existingReaction.reaction = newReaction;
        await this.reactionRepository.save(existingReaction);
        return { message: 'Réaction mise à jour' };
      }
    } else {
      const user = await this.userRepository.findOne({ where: { idUser: idUser } });
      const message = await this.messageRepository.findOne({ where: { id: idMessage } });

      if (!user || !message) {
        throw new Error('Utilisateur ou message introuvable');
      }

      const newReactionEntity = new reaction();
      newReactionEntity.reaction = newReaction;
      newReactionEntity.user = user;
      newReactionEntity.message = message;

      await this.reactionRepository.save(newReactionEntity);
      return { message: 'Réaction créée' };
    }
  }

  async getReactionsByMessageId(idMessage: number): Promise<any> {
    const reactions = await this.reactionRepository.find({
      where: { message: { id: idMessage } },
      relations: ['user', 'message'],
    });

    return reactions.map(reaction => ({
      id:reaction.user.idUser,
      reaction: reaction.reaction,
      userName: reaction.user.nomUser, 
      userPrenom: reaction.user.prenomUser,
      createdAt: reaction.createdAt,
    }));
  }
}
