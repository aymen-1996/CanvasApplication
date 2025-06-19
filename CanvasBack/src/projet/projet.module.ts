/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { ProjetService } from './projet.service';
import { ProjetController } from './projet.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { projet } from './projet.entity';
import { MulterModule } from '@nestjs/platform-express';
import { user } from '../user/user.entity';
import { block } from '../block/block.entity';
import { canvas } from '../canvas/canvas.entity';
import { invite } from '../invite/invite.entity';
import { donnees } from '../donnees/donnees.entity';
import { Notification } from '../notif/notif.entity';
import { message } from '../Message/message.entity';
import { NotificationService } from '../notif/notif.service';
import { AuthService } from '../auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { UnifiedGateway } from '../Gateway/UnifiedGateway';
import { InviteService } from '../invite/invite.service';


@Module({

  imports: [TypeOrmModule.forFeature([projet,user,block,canvas,invite,donnees ,Notification ]
    
 ,) ,  MulterModule.register({
  dest: './uploads',
})],
  providers: [ProjetService , NotificationService , UnifiedGateway ,InviteService, AuthService , JwtService],
  controllers: [ProjetController ],
  exports: [TypeOrmModule],
})
export class ProjetModule {}