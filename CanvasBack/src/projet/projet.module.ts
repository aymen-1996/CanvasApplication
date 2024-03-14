/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { ProjetService } from './projet.service';
import { ProjetController } from './projet.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { projet } from './projet.entity';
import { MulterModule } from '@nestjs/platform-express';
import { user } from 'src/user/user.entity';
import { block } from 'src/block/Block.entity';
import { canvas } from 'src/canvas/canvas.entity';
import { invite } from 'src/invite/invite.entity';
import { donnees } from 'src/donnees/donnees.entity';


@Module({

  imports: [TypeOrmModule.forFeature([projet,user,block,canvas,invite,donnees]
    
 ,) ,  MulterModule.register({
  dest: './uploads',
})],
  providers: [ProjetService ],
  controllers: [ProjetController],
  exports: [TypeOrmModule],
})
export class ProjetModule {}