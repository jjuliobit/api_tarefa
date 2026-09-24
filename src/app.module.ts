import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { TarefasModule } from './tarefas/tarefas.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';


@Module({
  imports: [TarefasModule, DatabaseModule, UsersModule, AuthModule],
})
export class AppModule {}
