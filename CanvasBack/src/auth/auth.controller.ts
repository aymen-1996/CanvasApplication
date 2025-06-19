/* eslint-disable prettier/prettier */
import { Controller, Get, Post, Body, Param, Delete, BadRequestException, Res, NotFoundException, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcryptjs';
import { Response } from 'express';
import { user } from '../user/user.entity';
import { EmailService } from '../user/email/email.service';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { InjectRepository } from '@nestjs/typeorm';


@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService  ,@InjectRepository(user) private readonly userRep:Repository<user>,private readonly userService:UserService ,private jwtService:JwtService ,private emailService:EmailService) {}



async updateUserStatus(userId: number, status: { enLigne: boolean, lastLogout: Date | null }) {
    await this.userRep.update(userId, status);
}

@Post('login')
async login(
    @Body('emailUser') email: string,
    @Body('passwordUser') password: string,
    @Res({ passthrough: true }) response: Response
) {
    const user = await this.userService.findOneByEmail(email);
    if (!user) {
        return { user: null, message: 'Email not found!', success: false, token: '' };
    }

    if (!user.enabled) {
        return { user: null, message: 'Votre compte n\'est pas activé. Activez-le selon le lien envoyé à votre email.', success: false, token: '' };
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordUser);
    if (!isPasswordValid) {
        return { user: null, message: 'Incorrect password!', success: false, token: '' };
    }

    await this.updateUserStatus(user.idUser, { enLigne: true, lastLogout: null });

    const jwt = await this.jwtService.signAsync({ id: user.idUser });
    response.cookie('jwt', jwt, { httpOnly: true });

    const { nomUser, prenomUser, idUser } = user;

    return { jwt, user: { nomUser, prenomUser, idUser } };
}

  
  

//envoyer lien
  @Post('request')
  async requestPasswordReset(@Body() { email }: { email: string }) {
    const user = await this.userService.findOneByEmail(email);

    if (!user) {
        throw new NotFoundException('Utilisateur non trouvé. Créez un compte avec cette adresse e-mail.');
    }

    const token = await this.generateResetToken(user);

    const resetLink = `http://localhost:4200/reset-password/${token}`;

     this.emailService.sendEmail(
      email,
      'Réinitialisation de mot de passe',
      `Pour réinitialiser votre mot de passe, cliquez sur le lien suivant : http://localhost:4200/reset-password/${token}. Le lien expire dans 10 minutes.`,
      );

    return { message: 'Email envoyé pour la réinitialisation du mot de passe'};
  }

  //Generate token and save in class user 
  async generateResetToken(user: user): Promise<string> {
    const token = uuidv4();
    const expirationDate = new Date();
    expirationDate.setMinutes(expirationDate.getMinutes() + 10);

    user.resetToken = token;
    user.resetTokenExpiration = expirationDate;

    await this.userRep.save(user);

    return token;
  }

 
  // Pour que si resttoken n est pas valide ,nouveau lien envoyer a user
  @Post('validate-reset-token/:resetToken')
  async validateResetToken(@Param('resetToken') resetToken: string) {
    try {
      const user = await this.userService.findOne({ resetToken });
  
      if (!user || (user.resetTokenExpiration && user.resetTokenExpiration < new Date())) {
        const newToken = await this.generateResetToken(user);
        this.emailService.sendEmail(
            user.emailUser,
            'Réinitialisation de mot de passe',
            `Pour réinitialiser votre mot de passe, cliquez sur le lien suivant : http://localhost:4200/reset-password/${newToken}. Le lien expire dans 10 minutes.`,
          );
            
          return { message: 'Email envoyé pour la réinitialisation du mot de passe' };          
      }

    } catch (error) {
      console.error('Error in validateResetToken:', error.message);
      return { message: 'An error occurred while processing the reset token' };
    }
  }


  //verfication token
  @Get('verify-token/:token')
  async verifyToken(@Param('token') token: string): Promise<{ isValid: boolean }> {
    try {
      const decoded = this.jwtService.verify(token);

      return { isValid: true };
    } catch (error) {
      return { isValid: false };
    }
  }
  //Api logout // localhost:3000/auth/logout
  @Post('logout')
  async logout(@Req() request: any, @Body('idUser') idUser: number) {
      if (idUser) {
          await this.updateUserStatus(idUser, {
              enLigne: false,
              lastLogout: new Date() 
          });
      }
  
      if (request.session) {
          request.session.destroy();
      }
  
      return { message: 'Déconnexion réussie' };
  }
  

  @Post('update-status')
  async updateStatus(@Body('idUser') idUser: number) {
      if (idUser) {
          await this.updateUserStatus(idUser, {
              enLigne: false,
              lastLogout: new Date()
          });
      }
      return { message: 'Statut mis à jour avec succès' };
  }

  @Post('update-status-en-ligne')
  async updateStatusEnLigne(@Body('idUser') idUser: number) {
      if (idUser) {
          await this.updateUserStatus(idUser, {
              enLigne: true,        
              lastLogout: null 
          });
      }
      return { message: 'Statut mis à jour: en ligne' };
  }
  
}


