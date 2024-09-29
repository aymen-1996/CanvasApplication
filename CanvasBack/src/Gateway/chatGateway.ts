import {
  WebSocketGateway,
  SubscribeMessage,
  WebSocketServer,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Socket, Server } from 'socket.io';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { message } from 'src/Message/message.entity'; // Assurez-vous que le chemin est correct

@WebSocketGateway({ cors: true })
export class ChatGateway implements OnGatewayInit {
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('ChatGateway');

  constructor(
    @InjectRepository(message)
    private readonly messageRepository: Repository<message>,
  ) {}

  afterInit(server: Server) {
    this.logger.log('WebSocket Initialized');
  }

  //send msg 
  @SubscribeMessage('message')
  async handleMessage(client: Socket, payload: { 
    username: string; 
    message: string; 
    file?: Express.Multer.File; 
    senderId: number; 
    recipientId: number; 
    senderIdUser: number; 
    recipientIdUser: number; 
  }): Promise<void> {
    const filePath = payload.file ? await this.saveFile(payload.file) : null;
  
    const newMessage = this.messageRepository.create({
      content: payload.message,
      filePath: filePath, 
      senderId: payload.senderId,
      recipientId: payload.recipientId,
      sentAt: new Date(),
      senderIdUser: payload.senderIdUser,
      recipientIdUser: payload.recipientIdUser,
    });
  
    await this.messageRepository.save(newMessage);
  
    this.server.emit('message', newMessage);
  
    this.logger.log(`Message from ${payload.username}: ${payload.message}`);
  }
  
  

   async saveFile(file: Express.Multer.File): Promise<string> {
    const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
  
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
  
    const filename = `${Date.now()}-${file.originalname}`;
    const filePath = path.join(uploadsDir, filename);
  
    fs.writeFileSync(filePath, file.buffer);
  
    return filename;
  }
  
}
