import apiClient from '@/lib/api-client';
import { io, Socket } from 'socket.io-client';

export interface Mensagem {
  id: string;
  remetenteId: string;
  destinatarioId: string;
  conteudo: string;
  lida: boolean;
  createdAt: string;
  remetente?: any;
  destinatario?: any;
}

export interface Conversation {
  userId: string;
  user: any;
  lastMessage: Mensagem;
  unreadCount: number;
}

export interface CreateMensagemDto {
  destinatarioId: string;
  conteudo: string;
}

export interface MarkReadDto {
  mensagemIds: string[];
}

class MensagensService {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<Function>> = new Map();

  // REST API methods
  async sendMessage(data: CreateMensagemDto): Promise<Mensagem> {
    const response = await apiClient.post('/mensagens', data);
    return response.data;
  }

  async getConversations(): Promise<Conversation[]> {
    const response = await apiClient.get('/mensagens/conversations');
    return response.data;
  }

  async getConversation(userId: string): Promise<Mensagem[]> {
    const response = await apiClient.get(`/mensagens/conversation/${userId}`);
    return response.data;
  }

  async getReceived(): Promise<Mensagem[]> {
    const response = await apiClient.get('/mensagens/received');
    return response.data;
  }

  async getSent(): Promise<Mensagem[]> {
    const response = await apiClient.get('/mensagens/sent');
    return response.data;
  }

  async getUnreadCount(): Promise<number> {
    const response = await apiClient.get('/mensagens/unread-count');
    return response.data;
  }

  async markAsRead(mensagemIds: string[]): Promise<void> {
    await apiClient.patch('/mensagens/mark-read', { mensagemIds });
  }

  async markConversationAsRead(userId: string): Promise<void> {
    await apiClient.patch(`/mensagens/conversation/${userId}/mark-read`);
  }

  async deleteMessage(id: string): Promise<void> {
    await apiClient.delete(`/mensagens/${id}`);
  }

  // WebSocket methods
  connect(token: string) {
    if (this.socket?.connected) {
      return;
    }

    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    this.socket = io(`${backendUrl}/mensagens`, {
      auth: {
        token,
      },
      transports: ['websocket', 'polling'],
    });

    this.socket.on('connect', () => {
      console.log('Connected to mensagens WebSocket');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from mensagens WebSocket');
    });

    this.socket.on('newMessage', (mensagem: Mensagem) => {
      this.emit('newMessage', mensagem);
    });

    this.socket.on('messagesRead', () => {
      this.emit('messagesRead');
    });

    this.socket.on('userTyping', (data: { userId: string; isTyping: boolean }) => {
      this.emit('userTyping', data);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  sendTypingIndicator(destinatarioId: string, isTyping: boolean) {
    if (this.socket?.connected) {
      this.socket.emit('typing', { destinatarioId, isTyping });
    }
  }

  // Event emitter methods
  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  off(event: string, callback: Function) {
    if (this.listeners.has(event)) {
      this.listeners.get(event)!.delete(callback);
    }
  }

  private emit(event: string, data?: any) {
    if (this.listeners.has(event)) {
      this.listeners.get(event)!.forEach(callback => callback(data));
    }
  }
}

export const mensagensService = new MensagensService();
