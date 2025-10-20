import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../../common/entities/user.entity';
import { Role } from '../../common/entities/role.entity';
import { CreateUserDto, UpdateUserDto } from './dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Check if email already exists
    const existingUser = await this.usersRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email já está em uso');
    }

    // Hash password
    const senhaHash = await bcrypt.hash(createUserDto.senha, 10);

    // Get roles
    let roles: Role[] = [];
    if (createUserDto.roleIds && createUserDto.roleIds.length > 0) {
      roles = await this.rolesRepository.findBy({
        id: In(createUserDto.roleIds),
      });
    } else {
      // Default role
      const defaultRole = await this.rolesRepository.findOne({
        where: { nome: 'Veterinário' },
      });
      if (defaultRole) {
        roles = [defaultRole];
      }
    }

    const user = this.usersRepository.create({
      ...createUserDto,
      senhaHash,
      roles,
    });

    return this.usersRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({
      relations: ['roles'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['roles'],
    });

    if (!user) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado`);
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    // Check if email is being changed and is already in use
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.usersRepository.findOne({
        where: { email: updateUserDto.email },
      });

      if (existingUser) {
        throw new ConflictException('Email já está em uso');
      }
    }

    // Hash password if provided
    if (updateUserDto.senha) {
      updateUserDto['senhaHash'] = await bcrypt.hash(updateUserDto.senha, 10);
      delete updateUserDto.senha;
    }

    // Update roles if provided
    if (updateUserDto.roleIds) {
      const roles = await this.rolesRepository.findBy({
        id: In(updateUserDto.roleIds),
      });
      user.roles = roles;
    }

    Object.assign(user, updateUserDto);
    return this.usersRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.usersRepository.softRemove(user);
  }

  async deactivate(id: string): Promise<User> {
    const user = await this.findOne(id);
    user.ativo = false;
    return this.usersRepository.save(user);
  }

  async activate(id: string): Promise<User> {
    const user = await this.findOne(id);
    user.ativo = true;
    return this.usersRepository.save(user);
  }
}
