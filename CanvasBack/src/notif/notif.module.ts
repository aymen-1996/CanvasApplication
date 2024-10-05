import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationService } from './notif.service';
import { NotificationGateway } from 'src/Gateway/NotificationGateway';
import { NotificationController } from './notif.controller';
import { Notification } from 'src/notif/notif.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Notification])],
  providers: [NotificationService, NotificationGateway],
  controllers: [NotificationController], 
  exports: [TypeOrmModule], 
})
export class NotificationModule {}
