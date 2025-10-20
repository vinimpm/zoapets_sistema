import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiKey } from '../entities/api-key.entity';

export const IS_PUBLIC_API_KEY = 'isPublicApi';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectRepository(ApiKey)
    private apiKeysRepository: Repository<ApiKey>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublicApi = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_API_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!isPublicApi) {
      return true; // Not a public API endpoint
    }

    const request = context.switchToHttp().getRequest();
    const apiKey = this.extractApiKey(request);

    if (!apiKey) {
      throw new UnauthorizedException('API Key não fornecida. Use o header X-API-Key');
    }

    // Validate API Key
    const keyRecord = await this.apiKeysRepository.findOne({
      where: { key: apiKey, ativo: true },
      relations: ['user'],
    });

    if (!keyRecord) {
      throw new UnauthorizedException('API Key inválida');
    }

    // Check expiration
    if (keyRecord.expiresAt && new Date() > keyRecord.expiresAt) {
      throw new UnauthorizedException('API Key expirada');
    }

    // Check IP whitelist
    if (keyRecord.ipWhitelist && keyRecord.ipWhitelist.length > 0) {
      const clientIp = request.ip || request.connection.remoteAddress;
      if (!keyRecord.ipWhitelist.includes(clientIp)) {
        throw new UnauthorizedException('IP não autorizado para esta API Key');
      }
    }

    // Update usage
    keyRecord.lastUsedAt = new Date();
    keyRecord.usageCount += 1;
    await this.apiKeysRepository.save(keyRecord);

    // Attach user and apiKey to request
    request.user = keyRecord.user;
    request.apiKey = keyRecord;

    return true;
  }

  private extractApiKey(request: any): string | undefined {
    // Try header first
    const headerKey = request.headers['x-api-key'];
    if (headerKey) return headerKey;

    // Try query parameter
    const queryKey = request.query['api_key'];
    if (queryKey) return queryKey;

    return undefined;
  }
}
