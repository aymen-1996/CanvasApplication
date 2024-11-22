/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { InviteService } from './invite.service';
import { InviteController } from './invite.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { invite } from './invite.entity';
import { user } from 'src/user/user.entity';
import { canvas } from 'src/canvas/canvas.entity';
import { projet } from 'src/projet/projet.entity';
import { UnifiedGateway } from 'src/Gateway/UnifiedGateway';
import { Notification } from 'src/notif/notif.entity';


@Module({
  imports: [TypeOrmModule.forFeature([invite, user, canvas, projet , Notification])],
  controllers: [InviteController],
  providers: [InviteService, UnifiedGateway],
  exports: [TypeOrmModule],
})
export class InviteModule {}
