import { Module } from '@nestjs/common';
import { TarefasService } from './tarefas.service';
import { TarefasController } from './tarefas.controller';
import { UsersService } from 'src/users/users.service';

@Module({
  controllers: [TarefasController],
  providers: [TarefasService, UsersService],
})
export class TarefasModule {}
