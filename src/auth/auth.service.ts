import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DatabaseService } from 'src/database/database.service';
import * as bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';


@Injectable()
export class AuthService {
  constructor(
    private readonly databaseService: DatabaseService,
    private jwtService: JwtService,
  ) { }

  async signIn(userData: Prisma.UserGetPayload<{}>) {
    const { email, senha } = userData;

    const user = await this.databaseService.user.findUnique({
      where: {email}
    })

    if(!user) {
      throw new UnauthorizedException('Credenciais invalidas')
    }

    const isPasswordValid = await bcrypt.compare(senha, user.senha)
    if(!isPasswordValid) {
      throw new UnauthorizedException("Senha incorreta")
    }


    if(user.status === false) {
      throw new UnauthorizedException("O usuario desativado")
    }

    const payload = {
      sub: user.id,
      email: user.email
    }

    return {
      id: payload.sub,
      access_token: await this.jwtService.signAsync(payload)
    }
  }
}
