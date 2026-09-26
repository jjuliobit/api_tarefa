import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TarefasService } from './tarefas.service';
import { Prisma } from '@prisma/client';

@Controller('tarefas')
export class TarefasController {
  constructor(private readonly tarefasService: TarefasService) {}

  @Post()
  create(@Body() createTarefaDto: Prisma.TarefaCreateInput) {
    return this.tarefasService.create(createTarefaDto);
  }

  @Get()
  findAll() {
    return this.tarefasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tarefasService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTarefaDto: Prisma.TarefaUpdateInput) {
    return this.tarefasService.update(id, updateTarefaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tarefasService.remove(id);
  }
}
