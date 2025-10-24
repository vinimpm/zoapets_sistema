import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { Mensagem } from '@/common/entities/mensagem.entity';
import { MensagensService } from './mensagens.service';
import { MensagensController } from './mensagens.controller';
import { MensagensGateway } from './mensagens.gateway';

@Module({
  imports: [
    TypeOrmModule.forFeature([Mensagem]),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [MensagensController],
  providers: [MensagensService, MensagensGateway],
  exports: [MensagensService, MensagensGateway],
})
export class MensagensModule {}
