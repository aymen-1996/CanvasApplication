import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { message } from '../Message/message.entity';
import * as fs from 'fs';
import * as path from 'path';
import { reaction } from '../reactionMessage/reaction.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(message)
    private readonly messageRepository: Repository<message>,
    @InjectRepository(message)
    private readonly reactionRepository: Repository<reaction>

  ) {}

  async saveMessageWithImage(body: any, filePath: string): Promise<message> {
    console.log('Saving message:', { 
      content: body.message || '', 
      filePath: filePath, 
      senderId: body.senderId, 
      recipientId: body.recipientId 
    });
    
    const newMessage = this.messageRepository.create({
      content: body.message || '',
      filePath: filePath,
      senderId: body.senderId,
      recipientId: body.recipientId,
      sentAt: new Date(),
    });
    
    return this.messageRepository.save(newMessage);
  }

  //Affichage msg
  async getMessagesBetweenUsers(senderId: number, recipientId: number): Promise<message[]> {
    return this.messageRepository.find({
      where: [
        { senderId, recipientId },
        { senderId: recipientId, recipientId: senderId },
      ],
      relations: ['reactions'],
      order: { sentAt: 'ASC' }, 
    });
  }
//nombre de msg envoyer
  async findMessagesByRecipientId(recipientId: number): Promise<number> {
    const result = await this.messageRepository
      .createQueryBuilder('message')
      .select('COUNT(DISTINCT message.senderId)', 'count')
      .where('message.recipientId = :recipientId', { recipientId })
      .andWhere('message.etat = :etat', { etat: false })
      .getRawOne();
  
    return parseInt(result.count, 10); 
  }

  //dernier msg entre deux users
  async getLastMessage(senderId: number, recipientId: number): Promise<message> {
    return await this.messageRepository
      .createQueryBuilder('message')
      .where('(message.senderId = :senderId AND message.recipientId = :recipientId)', 
        { senderId, recipientId })
      .orderBy('message.sentAt', 'DESC')
      .getOne();
  }
  
  
  async markMessagesAsReadByUser(userId: number): Promise<void> {
    const messages = await this.messageRepository.find({
        where: { senderId: userId } 
    });

   
    messages.forEach((message) => {
        message.etat = true;
    });

    await this.messageRepository.save(messages);
}

async deleteMessage(id: number, userId: number): Promise<void> {
  try {
    const message = await this.messageRepository.findOne({
      where: {
        id,
        senderId: userId, 
      },
      relations: ['reactions'],
    });

    if (!message) {
      throw new Error(`Message with ID ${id} not found or you're not authorized to delete it.`);
    }

    if (message.reactions && message.reactions.length > 0) {
      for (const reaction of message.reactions) {
        await this.reactionRepository.delete({ id: reaction.id });
      }
    }

    await this.messageRepository.delete(id);
    console.log(`Message and its reactions successfully deleted by user with ID ${userId}`);
  } catch (error) {
    console.error('Error deleting message:', error.message);
    throw new Error(`Error deleting message with ID ${id}: ${error.message}`);
  }

}




async countUnreadMessagesBetweenUsers(senderId: number, recipientId: number): Promise<number> {
  const result = await this.messageRepository
    .createQueryBuilder('message')
    .select('COUNT(*)', 'count')
    .where('message.senderId = :senderId', { senderId })
    .andWhere('message.recipientId = :recipientId', { recipientId })
    .andWhere('message.etat = :etat', { etat: false })
    .getRawOne();
  return result ? parseInt(result.count, 10) : 0;
}




async updateMessage(id: number, newContent: string): Promise<message> {
  const messageToUpdate = await this.messageRepository.findOne({ where: { id } });
  if (!messageToUpdate) {
    throw new Error('Message not found');
  }

  messageToUpdate.content = newContent;
  await this.messageRepository.save(messageToUpdate);

  return messageToUpdate;
}

}
