/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { InviteService } from './invite.service';
import { InviteController } from './invite.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { invite } from './invite.entity';
import { user } from 'src/user/user.entity';
import { canvas } from 'src/canvas/canvas.entity';
import { projet } from 'src/projet/projet.entity';
import { InviteGateway } from 'src/Gateway/inviteGateways';


@Module({
  imports: [TypeOrmModule.forFeature([invite, user, canvas, projet])],
  controllers: [InviteController],
  providers: [InviteService, InviteGateway],
  exports: [TypeOrmModule],
})
export class InviteModule {}
