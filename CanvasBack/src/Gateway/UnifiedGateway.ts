import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../notif/notif.entity';
import { InviteService } from '../invite/invite.service';

@WebSocketGateway()
export class UnifiedGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedClients: { [userId: number]: Socket } = {};

  constructor(
    @InjectRepository(Notification)
    private notifRepository: Repository<Notification>,
    private inviteService: InviteService,
  ) {}

  afterInit(server: Server) {
    console.log('WebSocket Server Initialized');
  }

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

  // ---- Message Handling ----
  emitMessageDeleted(messageId: number, userId: number): void {
    this.server.emit('messageDeleted', { messageId, userId });
  }
  

  emitMessageUpdated(messageId: number, newContent: string): void {
    this.server.emit('messageUpdated', { messageId, newContent });
  }

  // ---- Invite Handling ----
  @SubscribeMessage('inviteUser')
  async handleInviteUser(client: Socket, { idProjet, idCanvas, emailUser, role, idUserSendInvite }): Promise<void> {
    try {
      const successMessage = await this.inviteService.inviteUser(idProjet, idCanvas, emailUser, role, idUserSendInvite);
      this.server.emit('newInvite', { message: successMessage });
    } catch (error) {
      this.server.emit('inviteError', { error: error.message });
    }
  }

  // ---- Notifications ----
  async sendNotification(userId: number, notificationData: any): Promise<void> {
    const client = this.connectedClients[userId];
    if (client) {
      client.emit('newNotification', notificationData);
    } else {
      console.log(`User ${userId} is not connected.`);
    }
  }
}
