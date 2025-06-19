import { Controller, Get, Put, Param, Delete, Body, NotFoundException, Query } from '@nestjs/common';
import { ChatService } from './chat.service';
import { message } from './message.entity';
import { UnifiedGateway } from '../Gateway/UnifiedGateway';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService ,private readonly deleteGateway: UnifiedGateway,
  ) {}

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

    @Get('unread-messages/count/:senderId/:recipientId')
    async getUnreadMessagesCount(
      @Param('senderId') senderId: number,
      @Param('recipientId') recipientId: number
    ): Promise<{ count: number }> {
      const count = await this.chatService.countUnreadMessagesBetweenUsers(senderId, recipientId);
      return { count };
    }
    
    
    
    //delete msg
    @Delete(':messageId/:userId')
  async deleteMessage(
    @Param('messageId') messageId: number, 
    @Param('userId') userId: number 
  ): Promise<void> {
    await this.chatService.deleteMessage(messageId, userId);
    this.deleteGateway.emitMessageDeleted(messageId , userId);

    
  }
    

    @Put(':id')
    async updateMessage(
      @Param('id') id: number,
      @Body('content') newContent: string  
    ): Promise<message> {
      const updatedMessage = await this.chatService.updateMessage(id, newContent);
      this.deleteGateway.emitMessageUpdated(id, newContent);

      if (!updatedMessage) {
        throw new NotFoundException('Message not found');
      }
  
      return updatedMessage;
      
    }
  }
