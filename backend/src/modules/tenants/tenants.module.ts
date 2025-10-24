import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantProvisioningService } from './tenant-provisioning.service';
import { TenantsController } from './tenants.controller';
import { RolesModule } from '../roles/roles.module';
import { Permission } from '../../common/entities/permission.entity';
import { Role } from '../../common/entities/role.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Permission, Role]),
    RolesModule,
  ],
  controllers: [TenantsController],
  providers: [TenantProvisioningService],
  exports: [TenantProvisioningService],
})
export class TenantsModule {}
