import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { user } from '../user/user.entity';
import { UserService } from '../user/user.service';
import { EmailService } from '../user/email/email.service';
import { Token } from '../Token/token';
import { message } from '../Message/message.entity';
import { invite } from '../invite/invite.entity';

@Module({
  imports: [JwtModule.register({
    secret:'secret',
    signOptions:{expiresIn:'3d'}
  }),TypeOrmModule.forFeature([user , Token , message , invite]) ],
  controllers: [AuthController],
  providers: [AuthService, UserService, EmailService],
  exports: [TypeOrmModule],
})
export class AuthModule {}
