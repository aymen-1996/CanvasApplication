import { WebSocketGateway, WebSocketServer, SubscribeMessage } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { InviteService } from 'src/invite/invite.service';

@WebSocketGateway()
export class InviteGateway {
  @WebSocketServer()
  server: Server;

  constructor(private inviteService: InviteService) {}

  @SubscribeMessage('inviteUser')
  async handleInviteUser(client: Socket, { idProjet, idCanvas, emailUser, role, idUserSendInvite }): Promise<void> {
      try {
          const successMessage = await this.inviteService.inviteUser(idProjet, idCanvas, emailUser, role, idUserSendInvite);
          this.server.emit('newInvite', { message: successMessage });
      } catch (error) {
          this.server.emit('inviteError', { error: error.message });
      }
  }
  
}
