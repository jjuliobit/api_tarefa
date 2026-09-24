import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { DatabaseService } from 'src/database/database.service';

/**
 * JWT Strategy - Valida e decodifica tokens JWT automaticamente
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly databaseService: DatabaseService) {
    super({
      // De onde extrair o token JWT
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      
      // Se true, aceita tokens expirados (NÃO RECOMENDADO)
      ignoreExpiration: false,
      
      // Secret para validar o token (mesma usada para assinar)
      secretOrKey: process.env.JWT_SECRET || 'a-string-secret-at-least-256-bits-long',
    });
  }

  /**
   * Método chamado automaticamente após o token ser validado
   * 
   * @param payload - Dados decodificados do token (sub, email, etc)
   * @returns Dados do usuário que ficarão em req.user
   */
  async validate(payload: any) {
    // payload.sub = id do usuário
    // payload.email = email do usuário
    
    // Buscar usuário atualizado no banco
    const user = await this.databaseService.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        nome: true,
      }
    });

    // Se o usuário não existe mais, rejeita o token
    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    // O objeto retornado aqui fica disponível em req.user
    const result = {
      userId: user.id,
      email: user.email,
      nome: user.nome,
    };
    
    return result;
  }
}
