import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  Patch,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/core/auth/jwt-auth.guard';
import { MensagensService } from './mensagens.service';
import { CreateMensagemDto, MarkReadDto } from './dto';
import { MensagensGateway } from './mensagens.gateway';

@Controller('mensagens')
@UseGuards(JwtAuthGuard)
export class MensagensController {
  constructor(
    private readonly mensagensService: MensagensService,
    private readonly mensagensGateway: MensagensGateway,
  ) {}

  @Post()
  async create(@Body() createDto: CreateMensagemDto, @Request() req: any) {
    const mensagem = await this.mensagensService.create(req.user.userId, createDto);

    // Emit real-time event
    this.mensagensGateway.sendMessageToUser(createDto.destinatarioId, mensagem);

    return mensagem;
  }

  @Get('conversations')
  getConversations(@Request() req: any) {
    return this.mensagensService.getConversationsList(req.user.userId);
  }

  @Get('conversation/:userId')
  getConversation(@Param('userId') userId: string, @Request() req: any) {
    return this.mensagensService.findConversation(req.user.userId, userId);
  }

  @Get('received')
  getReceived(@Request() req: any) {
    return this.mensagensService.findReceivedMessages(req.user.userId);
  }

  @Get('sent')
  getSent(@Request() req: any) {
    return this.mensagensService.findSentMessages(req.user.userId);
  }

  @Get('unread-count')
  getUnreadCount(@Request() req: any) {
    return this.mensagensService.getUnreadCount(req.user.userId);
  }

  @Patch('mark-read')
  async markAsRead(@Body() markReadDto: MarkReadDto, @Request() req: any) {
    await this.mensagensService.markAsRead(req.user.userId, markReadDto);

    // Emit real-time event
    this.mensagensGateway.notifyMessageRead(req.user.userId);

    return { success: true };
  }

  @Patch('conversation/:userId/mark-read')
  async markConversationAsRead(@Param('userId') userId: string, @Request() req: any) {
    await this.mensagensService.markConversationAsRead(req.user.userId, userId);

    // Emit real-time event
    this.mensagensGateway.notifyMessageRead(req.user.userId);

    return { success: true };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.mensagensService.findById(id);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @Request() req: any) {
    return this.mensagensService.delete(id, req.user.userId);
  }
}
