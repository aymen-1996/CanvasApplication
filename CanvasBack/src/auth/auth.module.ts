import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { user } from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';
import { EmailService } from 'src/user/email/email.service';
import { Token } from 'src/Token/token';

@Module({
  imports: [JwtModule.register({
    secret:'secret',
    signOptions:{expiresIn:'3d'}
  }),TypeOrmModule.forFeature([user , Token]) ],
  controllers: [AuthController],
  providers: [AuthService, UserService, EmailService],
  exports: [TypeOrmModule],
})
export class AuthModule {}
