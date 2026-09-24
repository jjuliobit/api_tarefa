import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from '../database/database.service';


@Injectable()
export class TarefasService {
  constructor(private readonly databaseService: DatabaseService) { }

  async create(createTarefaDto: Prisma.TarefaCreateInput) {
    this.databaseService.tarefa.create({ data: createTarefaDto })
    return {
      mensagem: "Tarefa cadastrada"
    }
  }

  async findAll() {
    const tarefaData = await this.databaseService.tarefa.findMany({})

    if (tarefaData.length == 0) {
      throw new NotFoundException('Tarefa não encontrado');
    }

    return tarefaData
  }

  async findOne(id: number) {
    try {
      const tarefaData = await this.databaseService.tarefa.findUnique({
        where: { id }
      });

      if (!tarefaData) {
        throw new NotFoundException(`Tarefa com ID ${id} não encontrada`);
      }

      return tarefaData;
    } catch (err) {
      throw err;
    }
  }

  async update(id: number, updateTarefaDto: Prisma.TarefaUpdateInput) {
    const tarefaData = await this.databaseService.tarefa.update({
      where: {
        id,
      },
      data: updateTarefaDto
    });

    if(!tarefaData) {
      throw new NotFoundException(`Tarefa com ID ${id} não encontrada`);
    }

    return tarefaData
  }

  async remove(id: number) {
    const tarefaData = await this.databaseService.tarefa.delete({
      where: { id }
    });

    if(!tarefaData) {
      throw new NotFoundException(`Tarefa com ID ${id} não encontrada`);
    }

    return tarefaData
  }
}
