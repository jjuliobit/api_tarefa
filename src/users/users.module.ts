import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { AuthModule } from 'src/auth/auth.module';
import { TarefasService } from 'src/tarefas/tarefas.service';

@Module({
  imports: [AuthModule],  // ← Importa para poder usar JwtAuthGuard
  controllers: [UsersController],
  providers: [UsersService, TarefasService],
})
export class UsersModule {}
