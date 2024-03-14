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
import { block } from './block/Block.entity';
import { DonneesModule } from './donnees/donnees.module';
import { donnees } from './donnees/donnees.entity';
import { UserController } from './user/user.controller';

import { UserService } from './user/user.service';
import { AuthModule } from './auth/auth.module';
import { EmailService } from './user/email/email.service';


@Module({
  imports: [
   
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '',
      database: 'Canvas',
      entities: [invite,projet,user,canvas,block,donnees],
      synchronize: false,
    }),
    UserModule,
    ProjetModule,
    InviteModule,
    CanvasModule,
    BlockModule,
    DonneesModule,
    JwtModule,
    AuthModule
   
    
  ],
  controllers: [AppController],
  providers: [AppService,JwtService,UserService,EmailService],
})
export class AppModule {}
