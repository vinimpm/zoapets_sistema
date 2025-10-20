import { Injectable, NestMiddleware, BadRequestException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    // Extract tenant from header (X-Tenant-ID or X-Tenant-Slug)
    const tenantId = req.headers['x-tenant-id'] as string;
    const tenantSlug = req.headers['x-tenant-slug'] as string;

    // Skip tenant validation for public routes
    if (req.path.includes('/auth/login') || req.path.includes('/health')) {
      return next();
    }

    if (!tenantId && !tenantSlug) {
      throw new BadRequestException('Tenant não especificado. Use o header X-Tenant-ID ou X-Tenant-Slug');
    }

    try {
      // Get tenant from public schema
      const query = tenantId
        ? 'SELECT * FROM public.tenants WHERE id = $1 AND status = $2'
        : 'SELECT * FROM public.tenants WHERE slug = $1 AND status = $2';

      const tenant = await this.dataSource.query(query, [
        tenantId || tenantSlug,
        'active',
      ]);

      if (!tenant || tenant.length === 0) {
        throw new BadRequestException('Tenant não encontrado ou inativo');
      }

      // Set schema context for this request
      const schemaName = tenant[0].schema_name;
      await this.dataSource.query(`SET search_path TO "${schemaName}", public`);

      // Attach tenant to request
      (req as any).tenant = tenant[0];

      next();
    } catch (error) {
      throw new BadRequestException('Erro ao validar tenant: ' + error.message);
    }
  }
}
