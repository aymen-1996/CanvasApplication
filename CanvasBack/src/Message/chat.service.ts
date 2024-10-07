import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { message } from 'src/Message/message.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(message)
    private readonly messageRepository: Repository<message>,
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

}
