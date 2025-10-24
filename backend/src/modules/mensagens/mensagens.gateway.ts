import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/mensagens',
})
export class MensagensGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private userSockets: Map<string, Set<string>> = new Map(); // userId -> Set of socketIds

  constructor(private jwtService: JwtService) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token || client.handshake.headers.authorization?.split(' ')[1];

      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });

      const userId = payload.userId;

      // Store socket connection for this user
      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, new Set());
      }
      this.userSockets.get(userId).add(client.id);

      // Store userId in socket data for later use
      client.data.userId = userId;

      console.log(`Client connected to /mensagens: ${client.id} (user: ${userId})`);

      // Join user to their personal room
      client.join(`user:${userId}`);

    } catch (error) {
      console.error('WebSocket authentication error:', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.userId;

    if (userId && this.userSockets.has(userId)) {
      this.userSockets.get(userId).delete(client.id);

      if (this.userSockets.get(userId).size === 0) {
        this.userSockets.delete(userId);
      }
    }

    console.log(`Client disconnected from /mensagens: ${client.id}`);
  }

  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { destinatarioId: string; isTyping: boolean },
  ) {
    const userId = client.data.userId;

    // Notify the recipient that this user is typing
    this.server.to(`user:${data.destinatarioId}`).emit('userTyping', {
      userId,
      isTyping: data.isTyping,
    });
  }

  // Called from controller to notify user of new message
  sendMessageToUser(userId: string, mensagem: any) {
    this.server.to(`user:${userId}`).emit('newMessage', mensagem);
  }

  // Called from controller to notify user that messages were read
  notifyMessageRead(userId: string) {
    this.server.to(`user:${userId}`).emit('messagesRead');
  }
}
