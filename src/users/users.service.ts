import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from '../database/database.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private readonly databaseService: DatabaseService) { }

  async create(createUserDto: Prisma.UserCreateInput) {
    try {
      const hashPassword = await bcrypt.hash(createUserDto.senha, 6)
      const users = await this.databaseService.user.create({
        data: {
          nome: createUserDto.nome,
          email: createUserDto.email,
          senha: hashPassword,
          status: createUserDto.status ?? true
        }
      })

      return {
        message: `O usuario: ${users.nome} cadastrado`
      }

    } catch(error: any) {
        if(error?.code === 'P2002') {
          throw new ConflictException('Email ja cadastrado')
        }
    }

  }

  async findAll() {
    const users = await this.databaseService.user.findMany({
      select: {
        id: true,
        nome: true,
        email: true,
        status: true,
        tarefas: true, 
      },
    })

    if (users.length == 0) {
      throw new NotFoundException('Usuario não encontrado')
    } 

    return users

  }

  async findOne(id: string) {
    const user = await this.databaseService.user.findUnique({
      where: {
        id
      }
    })

    if(!user) {
      throw new NotFoundException("Usuario não encontrado")
    }

    return user
  }

 async update(id: string, updateUserDto: Prisma.UserUpdateInput) {
    const user = await this.databaseService.user.update({
      where: {
        id
      },
      data: {
        nome: updateUserDto.nome,
        status: updateUserDto.status,
        tarefas: updateUserDto?.tarefas
      }
    })

    return {
      message: `O usuario de id:${user.id} foram atualizados `
    }
  }

  async remove(id: string) {
    const user = await this.databaseService.user.delete({
      where: { id }
    })

    return {
      message: `O usuario de ${user.nome} foi excluido`
    }
  }
}
