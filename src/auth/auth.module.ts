import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { DatabaseModule } from 'src/database/database.module';
import { JwtStrategy } from './strategies/jwt.strategy';


@Module({
  imports: [
    DatabaseModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'a-string-secret-at-least-256-bits-long',
      signOptions: { expiresIn: '1d'}
    })
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,  // ← IMPORTANTE: Registra a strategy
  ],
  exports: [
    JwtStrategy,  // ← IMPORTANTE: Exporta para outros módulos
  ],
})
export class AuthModule {}
