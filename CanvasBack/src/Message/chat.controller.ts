import { Controller, Get, Put, Param } from '@nestjs/common';
import { ChatService } from './chat.service';

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
}
