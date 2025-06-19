import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationService } from './notif.service';
import { NotificationController } from './notif.controller';
import { Notification } from '../notif/notif.entity';
import { UnifiedGateway } from '../Gateway/UnifiedGateway';
import { InviteService } from '../invite/invite.service';
import { invite } from '../invite/invite.entity';
import { projet } from '../projet/projet.entity';
import { user } from '../user/user.entity';
import { canvas } from '../canvas/canvas.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Notification , invite ,projet , user ,canvas])],
  providers: [NotificationService, UnifiedGateway ,InviteService],
  controllers: [NotificationController], 
  exports: [TypeOrmModule], 
})
export class NotificationModule {}
