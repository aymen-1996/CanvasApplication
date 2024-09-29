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
}
