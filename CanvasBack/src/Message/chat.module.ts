import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatController } from './chat.controller'; 
import { message } from './message.entity';
import { user } from 'src/user/user.entity';
import { ChatService } from './chat.service';
import { UnifiedGateway } from 'src/Gateway/UnifiedGateway';
import { Notification } from 'src/notif/notif.entity';
import { InviteService } from 'src/invite/invite.service';
import { invite } from 'src/invite/invite.entity';
import { projet } from 'src/projet/projet.entity';
import { canvas } from 'src/canvas/canvas.entity';
import { reaction } from 'src/reactionMessage/reaction.entity';

@Module({
  imports: [TypeOrmModule.forFeature([message, user , Notification ,invite ,projet , canvas , reaction])],
  providers: [ChatService , UnifiedGateway , InviteService], 
  controllers: [ChatController], 
  exports: [TypeOrmModule], 
})
export class ChatModule {}
