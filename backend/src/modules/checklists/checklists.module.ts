import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChecklistTemplate } from '@/common/entities/checklist-template.entity';
import { ChecklistItem } from '@/common/entities/checklist-item.entity';
import { ChecklistExecution } from '@/common/entities/checklist-execution.entity';
import { ChecklistsService } from './checklists.service';
import { ChecklistsController } from './checklists.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ChecklistTemplate, ChecklistItem, ChecklistExecution])],
  controllers: [ChecklistsController],
  providers: [ChecklistsService],
  exports: [ChecklistsService],
})
export class ChecklistsModule {}
