import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { PermissionsSeedService } from './permissions-seed.service';
import { Role } from '../../common/entities/role.entity';
import { Permission } from '../../common/entities/permission.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Role, Permission])],
  controllers: [RolesController],
  providers: [RolesService, PermissionsSeedService],
  exports: [RolesService, PermissionsSeedService],
})
export class RolesModule {}
