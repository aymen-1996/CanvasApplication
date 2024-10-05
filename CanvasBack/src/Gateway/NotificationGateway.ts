import { InjectRepository } from '@nestjs/typeorm';
import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Repository } from 'typeorm';
import { Notification } from 'src/notif/notif.entity';

@WebSocketGateway()
export class NotificationGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  private connectedClients: { [userId: number]: Socket } = {};

  constructor(
    @InjectRepository(Notification)
    private notifRepository: Repository<Notification>,
  ) {}

  async handleConnection(client: Socket) {
    const userId = parseInt(client.handshake.query.userId as string, 10);
    if (userId) {
      this.connectedClients[userId] = client; 
      console.log(`Client connected: ${client.id}, UserId: ${userId}`);
    }
  }

  async handleDisconnect(client: Socket) {
    const userId = Object.keys(this.connectedClients).find(id => this.connectedClients[+id].id === client.id);
    if (userId) {
      delete this.connectedClients[+userId];
      console.log(`Client disconnected: ${client.id}, UserId: ${userId}`);
    }
  }


 

}
