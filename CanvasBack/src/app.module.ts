/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { ProjetModule } from './projet/projet.module';
import { InviteModule } from './invite/invite.module';
import {invite } from './invite/invite.entity';
import { projet } from './projet/projet.entity';
import { user } from './user/user.entity';
import { CanvasModule } from './canvas/canvas.module';
import { canvas } from './canvas/canvas.entity';
import { BlockModule } from './block/block.module';
import { block } from './block/block.entity';
import { DonneesModule } from './donnees/donnees.module';
import { donnees } from './donnees/donnees.entity';
import { UserController } from './user/user.controller';
import { message } from './Message/message.entity';

import { UserService } from './user/user.service';
import { AuthModule } from './auth/auth.module';
import { EmailService } from './user/email/email.service';
import { ChatGateway } from './Gateway/chatGateway';
import { UploadController } from './Gateway/upload.controller';
import { ChatService } from './Message/chat.service';
import { Token } from './Token/token';
import { ScheduleModule } from '@nestjs/schedule';
import { Notification } from './notif/notif.entity';
import { NotificationModule } from './notif/notif.module';
import { ChatModule } from './Message/chat.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { commentaire } from './commentaires/commentaire.entity';
import { CommentaireModule } from './commentaires/commentaire.module';
import { reaction } from './reactionMessage/reaction.entity';
import { ReactionModule } from './reactionMessage/reaction.module';




@Module({
  imports: [
 
    TypeOrmModule.forFeature([message]), 
    ConfigModule.forRoot(),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '',
      database: 'canvasback_mysql-data',
      entities: [invite,projet,user,canvas,block,donnees , message , Token ,Notification , commentaire,reaction] ,
      synchronize: false,
    }),
    UserModule,
    ProjetModule,
    CommentaireModule,
    InviteModule,
    CanvasModule,
    BlockModule,
    DonneesModule,
    JwtModule,
    AuthModule,
    ChatModule,
    NotificationModule,
    ReactionModule
   
    
  ],
  controllers: [AppController , UploadController],
  providers: [
  AppService,JwtService,UserService,EmailService , ChatGateway , ChatService ],
})
export class AppModule {}
