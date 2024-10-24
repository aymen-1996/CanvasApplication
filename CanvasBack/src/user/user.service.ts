/* eslint-disable prettier/prettier */
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { user } from 'src/user/user.entity';
import { In, LessThan, Like, MoreThan, Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { EmailService } from './email/email.service';
import * as crypto from 'crypto';
import { Token } from 'src/Token/token';
import { updateUserDto } from './DTO/updateUser.dto';
import { Cron } from '@nestjs/schedule';
import { message } from 'src/Message/message.entity';
import { projet } from 'src/projet/projet.entity';
import { invite } from 'src/invite/invite.entity';

interface ConfirmEmailResponse {
  user?: user;
  message?: string;
  color?: string; 
}
@Injectable()
export class UserService {
    constructor(
        @InjectRepository(Token)
        private tokenRepository: Repository<Token >,
        @InjectRepository(user)
        private readonly userRep: Repository<user>,
        @InjectRepository(message) private readonly messageRepository: Repository<message>,
        @InjectRepository(invite)
        private inviteRepository: Repository<invite>,      
          private readonly emailService: EmailService,
    ) {}

    async findOneByEmail(emailUser: string): Promise<user | undefined> {
        try {
            return await this.userRep.findOne({ where: { emailUser } });
        } catch (error) {
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
        return await this.userRep.findOneBy({ idUser });
    }

    async create(data: any): Promise<{ user?: any; message?: string }> {
      const existingUser = await this.findOneByEmail(data.emailUser);


      if (existingUser) {
          return { message: 'Cet utilisateur a déjà un compte' };
      }

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
      const userToSave = { ...data, passwordUser: hashedPwd, enabled: false };

      if (!userToSave.imageUser) {
          userToSave.imageUser = 'avatar.png';
      }

      const savedUser = await this.userRep.save(userToSave); 

      const token = crypto.randomBytes(32).toString('hex');
      const createdAt = new Date();
      const expiresAt = new Date(createdAt);
      expiresAt.setHours(expiresAt.getHours() + 24);

      const newToken = this.tokenRepository.create({
          token,
          createdAt,
          expiresAt,
          user: { idUser: savedUser.idUser },
      });

      const savedToken = await this.tokenRepository.save(newToken); 

      if (!savedToken) {
          return { message: 'Erreur lors de l\'enregistrement du token' };
      }

      const confirmationUrl = `http://localhost:3000/user/confirm/${token}`;
      this.emailService.sendConfirmationEmail(userToSave.emailUser, userToSave.nomUser, confirmationUrl);

      delete savedUser.passwordUser; 
      return { user: savedUser };
  }

  async confirmEmail(token: string): Promise<{ user?: user; message?: string; color?: string }> {
    const foundToken = await this.tokenRepository.findOne({
        where: { token },
        relations: ['user'],
    });

    if (!foundToken) {
        return { message: 'Invalid token.', color: 'red' };
    }

    const user = foundToken.user;

    if (foundToken.expiresAt && foundToken.expiresAt < new Date()) {
        const validTokens = await this.tokenRepository.find({
            where: {
                user: { idUser: user.idUser },
                expiresAt: MoreThan(new Date()), 
            },
        });

        if (validTokens.length > 0) {
            const validToken = validTokens[0]; 
            const confirmationUrl = `http://localhost:3000/user/confirm/${validToken.token}`;
             this.emailService.sendConfirmationEmail(user.emailUser, user.nomUser, confirmationUrl);

            return {
                message: 'Your token has expired. A valid confirmation link has been sent to your email.',
                color: 'red',
            };
        } else {
            const newToken = crypto.randomBytes(32).toString('hex');
            const createdAt = new Date();
            const expiresAt = new Date(createdAt);
            expiresAt.setHours(expiresAt.getHours() + 24);

            await this.tokenRepository.save({
                token: newToken,
                createdAt,
                expiresAt,
                user: { idUser: user.idUser },
            });

            const confirmationUrl = `http://localhost:3000/user/confirm/${newToken}`;
             this.emailService.sendConfirmationEmail(user.emailUser, user.nomUser, confirmationUrl);

            return {
                message: 'Your token has expired. A new confirmation link has been sent to your email.',
                color: 'red',
            };
        }
    }

    if (user) {
        user.enabled = true;
        await this.userRep.save(user);
    }

    await this.tokenRepository.remove(foundToken);
    return { user };
}


@Cron('0 0 * * *')
async deleteInactiveUsers() {
  console.log('Starting deleteInactiveUsers process...');
  const checkDate = this.getCheckDate();
  console.log(`Check date set to: ${checkDate}`);

  const usersToDelete = await this.userRep.find({
    where: {
      enabled: false,
      createdDate: LessThan(checkDate),
    },
    relations: ['tokens'], 
  });

  console.log(`Found ${usersToDelete.length} inactive users to delete.`);

  const userEmails = new Set<string>(); 

  if (usersToDelete.length > 0) {
    for (const user of usersToDelete) {
      userEmails.add(user.emailUser);

      if (user.tokens && user.tokens.length > 0) {
        await this.tokenRepository.remove(user.tokens);
        console.log(`Deleted tokens for user: ${user.emailUser}`);
      }
    }

    await this.userRep.remove(usersToDelete);
    console.log(`Deleted users: ${usersToDelete.map(u => u.emailUser).join(', ')}`);

    for (const email of userEmails) {
      console.log(`Sending deletion email to: ${email}`);
      try {
        await this.emailService.sendEmail(email, 'Your account has been deleted', 'Your account has been deleted.');
      } catch (error) {
        console.error(`Error sending email to ${email}:`, error);
      }
    }
  } else {
    console.log('No inactive users found for deletion.');
  }
}



private getCheckDate(): Date {
    const currentDate = new Date();
    currentDate.setDate(currentDate.getDate() - 7); 
    return currentDate;
}

async getUserById(idUser: number): Promise<user> {
    return this.userRep.findOne({ where: { idUser } });
}

async getUniqueUsersByLastMessage(idUser: number, nomUser?: string): Promise<user[]> {
    const userInvitations = await this.inviteRepository.find({
        where: { user: { idUser }, etat: 'accepted' },
        relations: ['projet'],
    });

    const projectIds = userInvitations.map(invite => invite.projet.idProjet);

    const usersQuery = this.inviteRepository
        .createQueryBuilder('invite')
        .innerJoinAndSelect('invite.user', 'user')
        .where('invite.projetId IN (:...projectIds)', { projectIds })
        .andWhere('user.idUser != :idUser', { idUser })
        .andWhere('invite.etat = :etat', { etat: 'accepted' });

    if (nomUser) {
        usersQuery.andWhere('user.nomUser LIKE :nomUser', { nomUser: `%${nomUser}%` });
    }

    const users = await usersQuery.getMany();

    const messages = await this.messageRepository.find({
        where: { recipientId: idUser },
    });

    const lastMessageMap = messages.reduce((acc, message) => {
        if (!acc[message.senderId] || message.sentAt > acc[message.senderId].sentAt) {
            acc[message.senderId] = message;
        }
        return acc;
    }, {});

    const uniqueUsersMap = new Map<number, { user: user, lastMessageDate: Date | null }>();

    users.forEach(invite => {
        const lastMessage = lastMessageMap[invite.user.idUser];
        const lastMessageDate = lastMessage ? lastMessage.sentAt : null;

        if (!uniqueUsersMap.has(invite.user.idUser)) {
            uniqueUsersMap.set(invite.user.idUser, {
                user: invite.user,
                lastMessageDate,
            });
        }
    });

    const sortedUsers = Array.from(uniqueUsersMap.values()).sort((a, b) => {
        if (a.lastMessageDate && b.lastMessageDate) {
            return b.lastMessageDate.getTime() - a.lastMessageDate.getTime();
        }
        return a.lastMessageDate ? -1 : 1;
    });

    return sortedUsers.map(item => item.user);
}



    async changephoto(userId: number, photoName: string): Promise<user> {
        try {
            const user = await this.userRep.findOne({ where: { idUser: userId } });
            if (!user) {
                throw new Error('User not found');
            }
            user.imageUser = photoName;
            return await this.userRep.save(user);
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

        await this.emailService.sendEmail(
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

        user.passwordUser = await bcrypt.hash(newPassword, 12);
        await this.userRep.save(user);
    }

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
            const user = await this.userRep.findOne({ where: { resetToken } });

            if (!user) {
                return { status: 'error' };
            }

            if (newPassword !== confirmPassword) {
                return { status: 'error' };
            }

            user.passwordUser = await bcrypt.hash(newPassword, 12);
            user.resetToken = null;
            user.resetTokenExpiration = null;

            await this.userRep.save(user);
            return { status: 'success' };
        } catch (error) {
            console.error('Error in resetPassword:', error.message);
            throw new InternalServerErrorException('An error occurred while processing the password reset');
        }
    }

    async updateUser(id: number, UpdateUserDto: updateUserDto): Promise<user> {
        let updatedUser = await this.userRep.findOneBy({ idUser: id });

        if (!updatedUser) {
            throw new Error('User not found');
        }

        updatedUser = { ...updatedUser, ...UpdateUserDto };
        return await this.userRep.save(updatedUser);
    }


    async findAllUsersByEmail(emailUser: string): Promise<user[]> {
        return await this.userRep.find({
          where: {
            emailUser: Like(`${emailUser}%`),
          },
        });
      }
      

}
