/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { InviteService } from './invite.service';
import { InviteController } from './invite.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { invite } from './invite.entity';
import { user } from '../user/user.entity';
import { canvas } from '../canvas/canvas.entity';
import { projet } from '../projet/projet.entity';
import { UnifiedGateway } from '../Gateway/UnifiedGateway';
import { Notification } from '../notif/notif.entity';


@Module({
  imports: [TypeOrmModule.forFeature([invite, user, canvas, projet , Notification])],
  controllers: [InviteController],
  providers: [InviteService, UnifiedGateway],
  exports: [TypeOrmModule],
})
export class InviteModule {}
