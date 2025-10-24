import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Mensagem } from '@/common/entities/mensagem.entity';
import { CreateMensagemDto, MarkReadDto } from './dto';

@Injectable()
export class MensagensService {
  constructor(
    @InjectRepository(Mensagem)
    private mensagemRepository: Repository<Mensagem>,
  ) {}

  async create(remetenteId: string, createDto: CreateMensagemDto): Promise<Mensagem> {
    const mensagem = this.mensagemRepository.create({
      remetenteId,
      destinatarioId: createDto.destinatarioId,
      conteudo: createDto.conteudo,
      lida: false,
    });

    return this.mensagemRepository.save(mensagem);
  }

  async findConversation(userId: string, otherUserId: string): Promise<Mensagem[]> {
    return this.mensagemRepository.find({
      where: [
        { remetenteId: userId, destinatarioId: otherUserId },
        { remetenteId: otherUserId, destinatarioId: userId },
      ],
      relations: ['remetente', 'destinatario'],
      order: { createdAt: 'ASC' },
    });
  }

  async findReceivedMessages(userId: string): Promise<Mensagem[]> {
    return this.mensagemRepository.find({
      where: { destinatarioId: userId },
      relations: ['remetente', 'destinatario'],
      order: { createdAt: 'DESC' },
    });
  }

  async findSentMessages(userId: string): Promise<Mensagem[]> {
    return this.mensagemRepository.find({
      where: { remetenteId: userId },
      relations: ['remetente', 'destinatario'],
      order: { createdAt: 'DESC' },
    });
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.mensagemRepository.count({
      where: {
        destinatarioId: userId,
        lida: false,
      },
    });
  }

  async getConversationsList(userId: string): Promise<any[]> {
    // Get all users the current user has conversed with
    const sent = await this.mensagemRepository
      .createQueryBuilder('m')
      .select('m.destinatario_id', 'userId')
      .addSelect('MAX(m.created_at)', 'lastMessageAt')
      .where('m.remetente_id = :userId', { userId })
      .groupBy('m.destinatario_id')
      .getRawMany();

    const received = await this.mensagemRepository
      .createQueryBuilder('m')
      .select('m.remetente_id', 'userId')
      .addSelect('MAX(m.created_at)', 'lastMessageAt')
      .where('m.destinatario_id = :userId', { userId })
      .groupBy('m.remetente_id')
      .getRawMany();

    // Combine and deduplicate
    const userIds = new Set([
      ...sent.map(s => s.userId),
      ...received.map(r => r.userId),
    ]);

    const conversations = [];

    for (const otherUserId of userIds) {
      const messages = await this.findConversation(userId, otherUserId);
      const lastMessage = messages[messages.length - 1];
      const unreadCount = messages.filter(
        m => m.destinatarioId === userId && !m.lida,
      ).length;

      conversations.push({
        userId: otherUserId,
        user: lastMessage.remetenteId === otherUserId
          ? lastMessage.remetente
          : lastMessage.destinatario,
        lastMessage,
        unreadCount,
      });
    }

    // Sort by last message date
    conversations.sort(
      (a, b) =>
        new Date(b.lastMessage.createdAt).getTime() -
        new Date(a.lastMessage.createdAt).getTime(),
    );

    return conversations;
  }

  async markAsRead(userId: string, markReadDto: MarkReadDto): Promise<void> {
    // Verify user owns these messages (is the destinatario)
    const messages = await this.mensagemRepository.find({
      where: {
        id: In(markReadDto.mensagemIds),
        destinatarioId: userId,
      },
    });

    if (messages.length !== markReadDto.mensagemIds.length) {
      throw new ForbiddenException('Você não pode marcar estas mensagens como lidas');
    }

    await this.mensagemRepository.update(
      { id: In(markReadDto.mensagemIds) },
      { lida: true },
    );
  }

  async markConversationAsRead(userId: string, otherUserId: string): Promise<void> {
    await this.mensagemRepository.update(
      {
        remetenteId: otherUserId,
        destinatarioId: userId,
        lida: false,
      },
      { lida: true },
    );
  }

  async findById(id: string): Promise<Mensagem> {
    const mensagem = await this.mensagemRepository.findOne({
      where: { id },
      relations: ['remetente', 'destinatario'],
    });

    if (!mensagem) {
      throw new NotFoundException(`Mensagem ${id} não encontrada`);
    }

    return mensagem;
  }

  async delete(id: string, userId: string): Promise<void> {
    const mensagem = await this.findById(id);

    // Only sender can delete
    if (mensagem.remetenteId !== userId) {
      throw new ForbiddenException('Você não pode excluir esta mensagem');
    }

    await this.mensagemRepository.remove(mensagem);
  }
}
