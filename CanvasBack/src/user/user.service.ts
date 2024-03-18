/* eslint-disable prettier/prettier */
import {  Body, Injectable, InternalServerErrorException, Post, Req, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { user } from 'src/user/user.entity';
import {  Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { EmailService } from './email/email.service';
import { AuthGuard } from '@nestjs/passport';
import { updateUserDto } from './DTO/updateUser.dto';

@Injectable()
export class UserService {
    constructor(@InjectRepository(user) private readonly userRep:Repository<user>,private readonly emailService: EmailService){
        
    }

    async findOneByEmail(emailUser:string):Promise<user | undefined>{
        try{
            const user=this.userRep.findOne({ where: { emailUser } });
            return user
        }catch(error ){
            return undefined;
        }
    }

    async findOne(data: any
    ):Promise<user | undefined>{
        try{
            const user=this.userRep.findOneById(data);
            return user
        }catch(e){
            return undefined;
        }

    }

    async findOneById(idUser: number): Promise<user | undefined> {
        return this.userRep.findOneBy({ idUser });
      }

      async create(data: any): Promise<{ user?: user; message?: string }> {
        const existingUser = await this.findOneByEmail(data.emailUser);
      
        if (existingUser) {
          return { message: 'Cet utilisateur a déjà un compte' };
        } else {
          if (!data.emailUser) {
            return { message: 'Veuillez saisir un email' };
          }
          if (!data.passwordUser) {
            return { message: 'Veuillez saisir un mot de passe' };
          }
      
          if (!data.datenaissance) {
            data.datenaissance = null; 
          }
      
          const hashedPwd = await bcrypt.hash(data.passwordUser, 12);
          const userToSave = { ...data, passwordUser: hashedPwd };
      
          if (!userToSave.imageUser) {
            userToSave.imageUser = 'avatar.png';
            // Définissez le nom de fichier d'image par défaut ici
          }
      
          const savedUser = await this.userRep.save(userToSave);
      
          if (savedUser) {
            delete savedUser.passwordUser;
            return { user: savedUser };
          } else {
            return { message: 'Erreur lors de la création de l\'utilisateur' };
          }
        }
      }

      async changephoto(userId: number, photoName: string): Promise<user> {
        try {
            const user = await this.userRep.findOne({ where: { idUser: userId } });
            if (!user) {
                throw new Error('User not found');
            }
            user.imageUser = photoName;
            return this.userRep.save(user);
        } catch (error) {
            console.error('Error changing photo:', error.message);
            throw new Error('Failed to change photo');
        }
    }

async requestPasswordReset(emailUser: string): Promise<void> {
    const user = await this.userRep.findOne({ where: { emailUser } });

    if (!user) {
      throw new Error('User not found');
    }

    const resetCode = Math.floor(100000 + Math.random() * 900000);

    await this.storeResetCode(user.idUser, resetCode);


    this.emailService.sendEmail(
      user.emailUser,
      'Password Reset Code',
      `Your password reset code is: ${resetCode}`,
    );
  }

  async storeResetCode(userId: number, resetCode: number): Promise<void> {
    const user = await this.userRep.findOne({ where: { idUser: userId } });

    if (!user) {
      throw new Error('User not found');
    }

    user.resetCode = resetCode;

    await this.userRep.save(user);
  }


  async getResetCode(userId: number): Promise<{ code: number } | null> {
    const user = await this.userRep.findOne({ where: { idUser: userId } });

    if (!user) {
      throw new Error('User not found');
    }

    return user.resetCode ? { code: user.resetCode } : null;
  }

  async updatePassword(userId: number, newPassword: string): Promise<void> {

    const user = await this.userRep.findOne({ where: { idUser: userId } });

    if (!user) {
      throw new Error('User not found');
    }

    user.passwordUser = newPassword;

    await this.userRep.save(user);
  }

  //verification resttoken de lien
  async verifyResetToken(resetToken: string): Promise<{ status: string; message: string }> {
    try {
      const user = await this.userRep.findOne({ where: { resetToken } });
  
      if (!user) {
        return { status: 'not-found', message: 'User not found or invalid reset token' };
      }
  
      if (user.resetTokenExpiration && new Date() > user.resetTokenExpiration) {
        return { status: 'error', message: 'Reset token has expired' };
      }
  
      return { status: 'success', message: 'Reset token is valid' };
    } catch (error) {
      console.error('Error verifying reset token:', error.message);
      return { status: 'error', message: 'An error occurred while verifying the reset token' };
    }
  }

  async resetPassword(resetToken: string, newPassword: string, confirmPassword: string): Promise<{ status: string }> {
    try {
      const user = await this.userRep.findOne({where:{ resetToken} });

      if (!user) {
        return { status: 'error' }; 
      }

      if (newPassword !== confirmPassword) {
        return { status: 'error' }; 
      }

      const hashedPassword = await bcrypt.hash(newPassword, 12);

      user.passwordUser = hashedPassword;
      user.resetToken = null;
      user.resetTokenExpiration = null

      await this.userRep.save(user);

      return { status: 'success' }; 
    } catch (error) {
      console.error('Error in resetPassword:', error.message);
      throw new InternalServerErrorException('An error occurred while processing the password reset');
    }
  }
 
  //update block 
  async updateUser(id: number, UpdateUserDto: updateUserDto): Promise<user> {
    let updateduser = await this.userRep.findOneBy({
      idUser: id,
    });

    updateduser = { ...updateduser, ...UpdateUserDto };
    return await this.userRep.save(updateduser);
  }
}
