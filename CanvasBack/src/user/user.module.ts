import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { user } from './user.entity';
import { EmailService } from './email/email.service';
import { Token } from 'src/Token/token';
import { message } from 'src/Message/message.entity';
import { invite } from 'src/invite/invite.entity';

@Module({
  imports: [JwtModule.register({
    secret:'secret',
    signOptions:{expiresIn:'3d'}
  }),TypeOrmModule.forFeature([user ,Token , message , invite]) ],
  providers: [UserService, EmailService],
  controllers: [UserController],
  exports: [TypeOrmModule],
})
export class UserModule {}
