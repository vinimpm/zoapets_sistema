import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Configuracao } from '../../common/entities/configuracao.entity';
import { UpdateConfiguracaoDto } from './dto/update-configuracao.dto';

@Injectable()
export class ConfiguracoesService {
  constructor(
    @InjectRepository(Configuracao)
    private configuracoesRepository: Repository<Configuracao>,
  ) {}

  async get(tenantSlug: string): Promise<Configuracao> {
    let config = await this.configuracoesRepository.findOne({
      where: { tenantSlug },
    });

    // Se não existir, criar configuração padrão
    if (!config) {
      config = this.configuracoesRepository.create({
        nomeClinica: 'Zoa Pets Hospital Veterinário',
        tenantSlug,
        notificacoesEmail: true,
        notificacoesSms: false,
        notificacoesWhatsapp: true,
      });
      await this.configuracoesRepository.save(config);
    }

    return config;
  }

  async update(updateConfiguracaoDto: UpdateConfiguracaoDto, tenantSlug: string): Promise<Configuracao> {
    let config = await this.get(tenantSlug);

    // Atualizar campos
    Object.assign(config, updateConfiguracaoDto);

    return this.configuracoesRepository.save(config);
  }
}
