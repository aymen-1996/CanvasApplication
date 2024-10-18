import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentaireService } from './commentaire.service';
import { commentaire } from './commentaire.entity';
import { user } from 'src/user/user.entity';
import { canvas } from 'src/canvas/canvas.entity';
import { CommentaireController } from './commentaire.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([user,canvas,commentaire])],
  providers: [
    CommentaireService],
  controllers: [CommentaireController],

  exports: [CommentaireService] 
})
export class CommentaireModule {}
