import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/core/auth/jwt-auth.guard';
import { RolesGuard } from '@/core/auth/roles.guard';
import { Roles } from '@/core/auth/roles.decorator';
import { ChecklistsService } from './checklists.service';
import { CreateChecklistTemplateDto, UpdateChecklistTemplateDto, ExecuteChecklistItemDto } from './dto';

@Controller('checklists')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ChecklistsController {
  constructor(private readonly checklistsService: ChecklistsService) {}

  // Template management
  @Post('templates')
  @Roles('admin', 'veterinario')
  createTemplate(@Body() createDto: CreateChecklistTemplateDto) {
    return this.checklistsService.createTemplate(createDto);
  }

  @Get('templates')
  @Roles('admin', 'veterinario', 'auxiliar')
  findAllTemplates(@Query('tipoInternacao') tipoInternacao?: string) {
    return this.checklistsService.findAllTemplates(tipoInternacao);
  }

  @Get('templates/:id')
  @Roles('admin', 'veterinario', 'auxiliar')
  findTemplateById(@Param('id') id: string) {
    return this.checklistsService.findTemplateById(id);
  }

  @Put('templates/:id')
  @Roles('admin', 'veterinario')
  updateTemplate(@Param('id') id: string, @Body() updateDto: UpdateChecklistTemplateDto) {
    return this.checklistsService.updateTemplate(id, updateDto);
  }

  @Delete('templates/:id')
  @Roles('admin')
  deleteTemplate(@Param('id') id: string) {
    return this.checklistsService.deleteTemplate(id);
  }

  // Checklist execution
  @Post('internacoes/:internacaoId/initialize/:templateId')
  @Roles('admin', 'veterinario', 'auxiliar')
  initializeChecklist(
    @Param('internacaoId') internacaoId: string,
    @Param('templateId') templateId: string,
  ) {
    return this.checklistsService.initializeChecklistForInternacao(internacaoId, templateId);
  }

  @Get('internacoes/:internacaoId')
  @Roles('admin', 'veterinario', 'auxiliar')
  getChecklistByInternacao(@Param('internacaoId') internacaoId: string) {
    return this.checklistsService.getChecklistByInternacao(internacaoId);
  }

  @Get('internacoes/:internacaoId/progress')
  @Roles('admin', 'veterinario', 'auxiliar')
  getChecklistProgress(@Param('internacaoId') internacaoId: string) {
    return this.checklistsService.getChecklistProgress(internacaoId);
  }

  @Put('executions/:id')
  @Roles('admin', 'veterinario', 'auxiliar')
  executeChecklistItem(
    @Param('id') id: string,
    @Body() executeDto: ExecuteChecklistItemDto,
    @Request() req: any,
  ) {
    return this.checklistsService.executeChecklistItem(id, req.user.userId, executeDto);
  }
}
