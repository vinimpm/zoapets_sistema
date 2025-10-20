import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { ApiKey } from '../../common/entities/api-key.entity';
import { User } from '../../common/entities/user.entity';
import { CreateApiKeyDto, UpdateApiKeyDto } from './dto';

@Injectable()
export class ApiKeysService {
  constructor(
    @InjectRepository(ApiKey)
    private apiKeysRepository: Repository<ApiKey>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(userId: string, createApiKeyDto: CreateApiKeyDto): Promise<{ apiKey: ApiKey; key: string }> {
    // Verify user exists
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`Usuário com ID ${userId} não encontrado`);
    }

    // Generate secure API key
    const key = this.generateApiKey();

    const apiKey = this.apiKeysRepository.create({
      ...createApiKeyDto,
      key,
      userId,
      expiresAt: createApiKeyDto.expiresAt ? new Date(createApiKeyDto.expiresAt) : undefined,
    });

    const saved = await this.apiKeysRepository.save(apiKey);

    // Return the key only once (won't be retrievable later for security)
    return {
      apiKey: saved,
      key,
    };
  }

  private generateApiKey(): string {
    // Generate a secure random API key
    const prefix = 'zp'; // Zoa Pets prefix
    const random = crypto.randomBytes(32).toString('hex');
    return `${prefix}_${random}`;
  }

  async findAll(userId?: string): Promise<ApiKey[]> {
    const where: any = {};

    if (userId) {
      where.userId = userId;
    }

    return this.apiKeysRepository.find({
      where,
      relations: ['user'],
      select: {
        id: true,
        nome: true,
        descricao: true,
        permissions: true,
        ipWhitelist: true,
        rateLimit: true,
        expiresAt: true,
        ativo: true,
        lastUsedAt: true,
        usageCount: true,
        createdAt: true,
        updatedAt: true,
        // Don't select the actual key for security
      },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<ApiKey> {
    const apiKey = await this.apiKeysRepository.findOne({
      where: { id },
      relations: ['user'],
      select: {
        id: true,
        nome: true,
        descricao: true,
        permissions: true,
        ipWhitelist: true,
        rateLimit: true,
        expiresAt: true,
        ativo: true,
        lastUsedAt: true,
        usageCount: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!apiKey) {
      throw new NotFoundException(`API Key com ID ${id} não encontrada`);
    }

    return apiKey;
  }

  async update(id: string, updateApiKeyDto: UpdateApiKeyDto): Promise<ApiKey> {
    const apiKey = await this.apiKeysRepository.findOne({ where: { id } });

    if (!apiKey) {
      throw new NotFoundException(`API Key com ID ${id} não encontrada`);
    }

    if (updateApiKeyDto.expiresAt) {
      updateApiKeyDto['expiresAt'] = new Date(updateApiKeyDto.expiresAt);
    }

    Object.assign(apiKey, updateApiKeyDto);
    return this.apiKeysRepository.save(apiKey);
  }

  async revoke(id: string): Promise<ApiKey> {
    const apiKey = await this.apiKeysRepository.findOne({ where: { id } });

    if (!apiKey) {
      throw new NotFoundException(`API Key com ID ${id} não encontrada`);
    }

    apiKey.ativo = false;
    return this.apiKeysRepository.save(apiKey);
  }

  async activate(id: string): Promise<ApiKey> {
    const apiKey = await this.apiKeysRepository.findOne({ where: { id } });

    if (!apiKey) {
      throw new NotFoundException(`API Key com ID ${id} não encontrada`);
    }

    apiKey.ativo = true;
    return this.apiKeysRepository.save(apiKey);
  }

  async remove(id: string): Promise<void> {
    const apiKey = await this.apiKeysRepository.findOne({ where: { id } });

    if (!apiKey) {
      throw new NotFoundException(`API Key com ID ${id} não encontrada`);
    }

    await this.apiKeysRepository.remove(apiKey);
  }

  async getUsageStats(id: string): Promise<any> {
    const apiKey = await this.apiKeysRepository.findOne({ where: { id } });

    if (!apiKey) {
      throw new NotFoundException(`API Key com ID ${id} não encontrada`);
    }

    return {
      id: apiKey.id,
      nome: apiKey.nome,
      usageCount: apiKey.usageCount,
      lastUsedAt: apiKey.lastUsedAt,
      rateLimit: apiKey.rateLimit,
      createdAt: apiKey.createdAt,
    };
  }
}
