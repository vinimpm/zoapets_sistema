import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SOP } from '@/common/entities/sop.entity';
import { SopsService } from './sops.service';
import { SopsController } from './sops.controller';

@Module({
  imports: [TypeOrmModule.forFeature([SOP])],
  controllers: [SopsController],
  providers: [SopsService],
  exports: [SopsService],
})
export class SopsModule {}
