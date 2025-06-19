import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReactionController } from './reaction.controller';
import { ReactionService } from './reaction.service';
import { reaction } from './reaction.entity';
import { message } from '../Message/message.entity';
import { user } from '../user/user.entity';
import { ReactionGateway } from '../Gateway/reaction.Gateways';

@Module({
  imports: [
    TypeOrmModule.forFeature([reaction , user ,message]), 
  ],
  controllers: [ReactionController],
  providers: [ReactionService , ReactionGateway],
  exports: [ReactionService], 
})
export class ReactionModule {}
