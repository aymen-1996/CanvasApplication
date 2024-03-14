import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { user } from './user.entity';


import { ConfigService } from '@nestjs/config';
import { EmailService } from './email/email.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [JwtModule.register({
    secret:'secret',
    signOptions:{expiresIn:'3d'}
  }),TypeOrmModule.forFeature([user]) ],
  providers: [UserService, EmailService],
  controllers: [UserController],
  exports: [TypeOrmModule],
})
export class UserModule {}
