import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationService } from './notif.service';
import { NotificationController } from './notif.controller';
import { Notification } from 'src/notif/notif.entity';
import { UnifiedGateway } from 'src/Gateway/UnifiedGateway';
import { InviteService } from 'src/invite/invite.service';
import { invite } from 'src/invite/invite.entity';
import { projet } from 'src/projet/projet.entity';
import { user } from 'src/user/user.entity';
import { canvas } from 'src/canvas/canvas.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Notification , invite ,projet , user ,canvas])],
  providers: [NotificationService, UnifiedGateway ,InviteService],
  controllers: [NotificationController], 
  exports: [TypeOrmModule], 
})
export class NotificationModule {}
