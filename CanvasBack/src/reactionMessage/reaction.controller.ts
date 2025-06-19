import { Controller, Post, Body, Param, Get } from '@nestjs/common';
import { ReactionService } from './reaction.service';
import { ReactionGateway } from '../Gateway/reaction.Gateways';

@Controller('reactions')
export class ReactionController {
  constructor(
    private readonly reactionService: ReactionService,
    private readonly reactionGateway: ReactionGateway,
  ) {}

  @Post(':idUser/:idMessage')
  async createOrUpdateReaction(
    @Param('idUser') idUser: number,
    @Param('idMessage') idMessage: number,
    @Body() body: { newReaction: string },
  ) {
    const { newReaction } = body;

    const result = await this.reactionService.createOrUpdateReaction(
      idUser,
      idMessage,
      newReaction,
    );

    this.reactionGateway.server.emit('reactionUpdated', {
      idUser,
      idMessage,
      newReaction,
    });

    return result;
  }


  @Get(':idMessage')
  async getReactions(@Param('idMessage') idMessage: number) {
    return this.reactionService.getReactionsByMessageId(idMessage);
  }
}
