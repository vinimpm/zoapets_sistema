import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Convenio } from '@/common/entities/convenio.entity';
import { ConveniosService } from './convenios.service';
import { ConveniosController } from './convenios.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Convenio])],
  controllers: [ConveniosController],
  providers: [ConveniosService],
  exports: [ConveniosService],
})
export class ConveniosModule {}
