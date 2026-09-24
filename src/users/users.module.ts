import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [AuthModule],  // ← Importa para poder usar JwtAuthGuard
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
