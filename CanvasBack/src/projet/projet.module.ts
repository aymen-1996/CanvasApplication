/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { ProjetService } from './projet.service';
import { ProjetController } from './projet.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { projet } from './projet.entity';
import { MulterModule } from '@nestjs/platform-express';
import { user } from 'src/user/user.entity';
import { block } from 'src/block/Block.entity';
import { canvas } from 'src/canvas/canvas.entity';
import { invite } from 'src/invite/invite.entity';
import { donnees } from 'src/donnees/donnees.entity';
import { Notification } from 'src/notif/notif.entity';
import { message } from 'src/Message/message.entity';
import { NotificationGateway } from 'src/Gateway/NotificationGateway';
import { NotificationService } from 'src/notif/notif.service';


@Module({

  imports: [TypeOrmModule.forFeature([projet,user,block,canvas,invite,donnees ,Notification ]
    
 ,) ,  MulterModule.register({
  dest: './uploads',
})],
  providers: [ProjetService , NotificationService , NotificationGateway ],
  controllers: [ProjetController],
  exports: [TypeOrmModule],
})
export class ProjetModule {}