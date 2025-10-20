import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PetsService } from './pets.service';
import { PetsController } from './pets.controller';
import { Pet } from '../../common/entities/pet.entity';
import { Tutor } from '../../common/entities/tutor.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Pet, Tutor])],
  controllers: [PetsController],
  providers: [PetsService],
  exports: [PetsService],
})
export class PetsModule {}
