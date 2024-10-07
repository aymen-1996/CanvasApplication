import { Controller, Get, Put, Param } from '@nestjs/common';
import { ChatService } from './chat.service';
import { message } from './message.entity';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('last/:senderId/:recipientId')
  async getLastMessage(
    @Param('senderId') senderId: number,
    @Param('recipientId') recipientId: number,
  ) {
    return await this.chatService.getLastMessage(senderId, recipientId);
  }

  @Put('read/:userId')
  async markMessagesAsReadByUser(@Param('userId') userId: number) {
    return this.chatService.markMessagesAsReadByUser(userId);
  }

  @Get(':recipientId/message')
  async getMessagesByRecipientId(@Param('recipientId') recipientId: number) {
    return this.chatService.findMessagesByRecipientId(recipientId);
  }

    //afficher msg entre deux users
    @Get(':senderId/:recipientId')
    async getMessages(
      @Param('senderId') senderId: number,
      @Param('recipientId') recipientId: number,
    ): Promise<message[]> {
      return this.chatService.getMessagesBetweenUsers(senderId, recipientId);
    }
}
