import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatController } from './chat.controller'; 
import { message } from './message.entity';
import { user } from '../user/user.entity';
import { ChatService } from './chat.service';
import { UnifiedGateway } from '../Gateway/UnifiedGateway';
import { Notification } from '../notif/notif.entity';
import { InviteService } from '../invite/invite.service';
import { invite } from '../invite/invite.entity';
import { projet } from '../projet/projet.entity';
import { canvas } from '../canvas/canvas.entity';
import { reaction } from '../reactionMessage/reaction.entity';

@Module({
  imports: [TypeOrmModule.forFeature([message, user , Notification ,invite ,projet , canvas , reaction])],
  providers: [ChatService , UnifiedGateway , InviteService], 
  controllers: [ChatController], 
  exports: [TypeOrmModule], 
})
export class ChatModule {}
