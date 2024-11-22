import { WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: true })
export class ReactionGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly maxListeners = 50;

  constructor() {
    this.server?.setMaxListeners(this.maxListeners);
  }

  handleConnection(client: Socket): void {
    client.setMaxListeners(this.maxListeners);
  }

  handleDisconnect(client: Socket): void {
  }

  @SubscribeMessage('addReaction')
  handleAddReaction(@MessageBody() data: any): void {
    console.log('Réaction ajoutée ou mise à jour:', data);
    this.server.emit('reactionUpdated', {
      idMessage: data.idMessage,
      idUser: data.idUser,
      newReaction: data.newReaction,
    });
  }
  
}
