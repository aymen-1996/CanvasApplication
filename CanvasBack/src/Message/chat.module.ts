import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatController } from './chat.controller'; 
import { message } from './message.entity';
import { user } from 'src/user/user.entity';
import { ChatService } from './chat.service';

@Module({
  imports: [TypeOrmModule.forFeature([message, user])],
  providers: [ChatService], 
  controllers: [ChatController], 
  exports: [TypeOrmModule], 
})
export class ChatModule {}
