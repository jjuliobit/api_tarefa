# 🔐 Guia Completo de JWT no NestJS - Do Zero ao Avançado

## 📋 Índice

1. [O que é JWT?](#o-que-é-jwt)
2. [Estrutura de Pastas e Arquivos](#estrutura-de-pastas-e-arquivos)
3. [Configuração](#configuração)
4. [Métodos e Funções](#métodos-e-funções)
5. [Implementação Passo a Passo](#implementação-passo-a-passo)
6. [Fluxo do JWT](#fluxo-do-jwt)
7. [Exemplo Prático Completo](#exemplo-prático-completo)
8. [Resumo e Checklist](#resumo-e-checklist)

---

## 🎯 O que é JWT?

**JWT (JSON Web Token)** é um padrão de autenticação que permite transmitir informações de forma segura entre cliente e servidor.

### Como funciona?

```
┌─────────────┐                    ┌─────────────┐
│   Cliente   │                    │   Servidor  │
└──────┬──────┘                    └──────┬──────┘
       │                                  │
       │  1. Login (email + senha)        │
       │─────────────────────────────────>│
       │                                  │
       │  2. Token JWT                    │
       │<─────────────────────────────────│
       │                                  │
       │  3. Requisição + Token           │
       │─────────────────────────────────>│
       │                                  │
       │  4. Resposta (dados protegidos)  │
       │<─────────────────────────────────│
       │                                  │
```

### Estrutura de um Token JWT

Um token JWT tem 3 partes separadas por pontos:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImVtYWlsIjoidXNlckBleGFtcGxlLmNvbSJ9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
    ↑ Header                              ↑ Payload                                    ↑ Signature
```

1. **Header**: Tipo do token e algoritmo de criptografia
2. **Payload**: Dados do usuário (id, email, etc)
3. **Signature**: Assinatura para verificar autenticidade

---

## 📁 Estrutura de Pastas e Arquivos

```
src/
└── auth/                           ← Módulo de autenticação
    ├── decorators/                 ← Decoradores customizados
    │   └── current-user.decorator.ts   ← Pega dados do usuário logado
    │
    ├── dto/                        ← Data Transfer Objects
    │   ├── create-auth.dto.ts      ← Dados para login
    │   └── update-auth.dto.ts      ← (não usado em JWT)
    │
    ├── entities/                   ← Entidades
    │   └── auth.entity.ts          ← (não usado em JWT)
    │
    ├── guards/                     ← Guardas de rota
    │   └── jwt-auth.guard.ts       ← Protege rotas (requer token)
    │
    ├── strategies/                 ← Estratégias de autenticação
    │   └── jwt.strategy.ts         ← Valida e decodifica token
    │
    ├── auth.controller.ts          ← Rotas de autenticação
    ├── auth.module.ts              ← Configuração do módulo
    └── auth.service.ts             ← Lógica de autenticação
```

### Para que serve cada arquivo?

| Arquivo | Função |
|---------|--------|
| `auth.controller.ts` | Define as rotas (POST /auth/login) |
| `auth.service.ts` | Valida credenciais e gera token |
| `auth.module.ts` | Configura JWT (secret, expiração) |
| `jwt.strategy.ts` | Valida token automaticamente |
| `jwt-auth.guard.ts` | Protege rotas (só aceita com token válido) |
| `current-user.decorator.ts` | Facilita acesso aos dados do usuário |

---

## ⚙️ Configuração

### 1. Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# Banco de dados
DATABASE_URL="postgresql://user:password@localhost:5432/mydb"

# JWT Secret (use uma string longa e aleatória)
JWT_SECRET="sua-chave-secreta-super-segura-aqui-min-256-bits"
```

> **⚠️ IMPORTANTE**: Nunca compartilhe o JWT_SECRET! Ele é usado para assinar e validar tokens.

### 2. Instalar Dependências

```bash
pnpm install @nestjs/jwt @nestjs/passport passport passport-jwt
pnpm install -D @types/passport-jwt

# Para criptografar senhas
pnpm install bcrypt
pnpm install -D @types/bcrypt
```

### 3. Configurar o AuthModule

No arquivo `src/auth/auth.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    DatabaseModule,        // Para acessar o banco
    PassportModule,        // Biblioteca de autenticação
    
    // Configuração do JWT
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'fallback-secret',
      signOptions: { 
        expiresIn: '1d'   // Token expira em 1 dia
        // Outras opções: '7d', '30m', '2h'
      }
    })
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,          // ← IMPORTANTE: Registra a strategy
  ],
  exports: [
    JwtStrategy,          // ← Permite outros módulos usarem
  ],
})
export class AuthModule {}
```

**Explicação das configurações:**

- `secret`: Chave para assinar o token (deve ser secreta!)
- `expiresIn`: Quanto tempo o token é válido
  - `'1d'` = 1 dia
  - `'7d'` = 7 dias
  - `'30m'` = 30 minutos
  - `'2h'` = 2 horas

---

## 🔧 Métodos e Funções

### 1. AuthService - `signIn()`

**Localização**: `src/auth/auth.service.ts`

```typescript
async signIn(userData: { email: string, senha: string }) {
  // 1. Busca usuário pelo email
  // 2. Valida se o usuário existe
  // 3. Compara a senha com bcrypt
  // 4. Cria o payload do token
  // 5. Gera e retorna o token
}
```

**Parâmetros:**
- `userData.email`: Email do usuário
- `userData.senha`: Senha em texto plano

**Retorna:**
```typescript
{
  id: number,              // ID do usuário
  access_token: string     // Token JWT gerado
}
```

**Quando usar:**
- Quando o usuário faz login

**Erros que pode lançar:**
- `UnauthorizedException`: Credenciais inválidas ou senha incorreta

---

### 2. JwtStrategy - `validate()`

**Localização**: `src/auth/strategies/jwt.strategy.ts`

```typescript
async validate(payload: any) {
  // 1. Recebe os dados decodificados do token
  // 2. Busca o usuário no banco
  // 3. Valida se o usuário ainda existe
  // 4. Retorna os dados que ficarão em req.user
}
```

**Parâmetros:**
- `payload.sub`: ID do usuário (subject)
- `payload.email`: Email do usuário
- `payload.iat`: Data de criação do token
- `payload.exp`: Data de expiração do token

**Retorna:**
```typescript
{
  userId: number,
  email: string,
  nome: string
}
```

**Quando é executado:**
- Automaticamente quando uma rota protegida é acessada
- Depois que o token é validado

**Erros que pode lançar:**
- `UnauthorizedException`: Usuário não encontrado

---

### 3. JwtAuthGuard - `canActivate()` e `handleRequest()`

**Localização**: `src/auth/guards/jwt-auth.guard.ts`

```typescript
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  
  canActivate(context: ExecutionContext) {
    // 1. Pega a requisição HTTP
    // 2. Chama o método pai para validar
    return super.canActivate(context);
  }

  handleRequest(err, user, info) {
    // 1. Verifica se houve erro na validação
    // 2. Verifica se o usuário foi encontrado
    // 3. Lança exceção se algo falhou
    // 4. Retorna o usuário se tudo OK
  }
}
```

**Quando usar:**
```typescript
@UseGuards(JwtAuthGuard)  // ← Protege esta rota
@Get('profile')
getProfile(@CurrentUser() user) {
  return user;
}
```

**O que faz:**
- Bloqueia acesso se não houver token
- Bloqueia acesso se o token for inválido
- Bloqueia acesso se o token estiver expirado
- Permite acesso se tudo estiver OK

---

### 4. CurrentUser Decorator

**Localização**: `src/auth/decorators/current-user.decorator.ts`

```typescript
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;  // Retorna dados do JwtStrategy.validate()
  },
);
```

**Como usar:**

**Sem o decorator (forma difícil):**
```typescript
@Get('profile')
getProfile(@Request() req) {
  return req.user;  // Precisa acessar req.user
}
```

**Com o decorator (forma fácil):**
```typescript
@Get('profile')
getProfile(@CurrentUser() user) {
  return user;  // Já recebe os dados direto!
}
```

**Retorna:**
```typescript
{
  userId: number,
  email: string,
  nome: string
}
```

---

### 5. JwtService - `signAsync()`

**Localização**: Injetado pelo `@nestjs/jwt`

```typescript
await this.jwtService.signAsync(payload)
```

**Parâmetros:**
```typescript
payload = {
  sub: userId,      // ID do usuário (padrão JWT)
  email: email,     // Qualquer dado que você quiser
  // Você pode adicionar mais campos
}
```

**Retorna:**
- String com o token JWT

**Quando usar:**
- Ao fazer login (para gerar o token)

---

### 6. bcrypt - `compare()` e `hash()`

**Localização**: Biblioteca externa `bcrypt`

**compare() - Verifica senha:**
```typescript
const isPasswordValid = await bcrypt.compare(
  senhaTextoPlano,    // Senha que o usuário digitou
  senhaHasheada       // Senha salva no banco (hash)
);
// Retorna true ou false
```

**hash() - Criptografa senha:**
```typescript
const senhaHasheada = await bcrypt.hash(senhaTextoPlano, 10);
// Retorna: $2b$10$xyzabc... (hash da senha)
```

**Quando usar:**
- `compare()`: No login (validar senha)
- `hash()`: Ao criar usuário (salvar senha criptografada)

---

## 🚀 Implementação Passo a Passo

### PASSO 1: Criar o Módulo de Autenticação

```bash
nest g module auth
nest g controller auth
nest g service auth
```

Isso cria:
- `auth.module.ts`
- `auth.controller.ts`
- `auth.service.ts`

---

### PASSO 2: Instalar Dependências

```bash
pnpm install @nestjs/jwt @nestjs/passport passport passport-jwt bcrypt
pnpm install -D @types/passport-jwt @types/bcrypt
```

---

### PASSO 3: Configurar Variáveis de Ambiente

Crie `.env`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/mydb"
JWT_SECRET="minha-chave-secreta-super-segura-256-bits-ou-mais"
```

---

### PASSO 4: Criar a JWT Strategy

Crie `src/auth/strategies/jwt.strategy.ts`:

```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly databaseService: DatabaseService) {
    super({
      // 1. De onde extrair o token
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      
      // 2. Não aceitar tokens expirados
      ignoreExpiration: false,
      
      // 3. Secret para validar (mesma do módulo)
      secretOrKey: process.env.JWT_SECRET || 'fallback-secret',
    });
  }

  // Executado automaticamente após validar o token
  async validate(payload: any) {
    // payload = { sub: userId, email: email, iat: ..., exp: ... }
    
    // Buscar dados atualizados do usuário no banco
    const user = await this.databaseService.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        nome: true,
      }
    });

    // Se usuário não existe, rejeita
    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    // Retorna objeto que ficará em req.user
    return {
      userId: user.id,
      email: user.email,
      nome: user.nome,
    };
  }
}
```

**Explicação:**

1. **ExtractJwt.fromAuthHeaderAsBearerToken()**: Busca o token no header `Authorization: Bearer <token>`
2. **ignoreExpiration: false**: Rejeita tokens expirados
3. **secretOrKey**: Valida a assinatura do token
4. **validate()**: Busca dados frescos do usuário no banco

---

### PASSO 5: Criar o JWT Auth Guard

Crie `src/auth/guards/jwt-auth.guard.ts`:

```typescript
import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  
  canActivate(context: ExecutionContext) {
    // Chama a validação do Passport
    return super.canActivate(context);
  }

  handleRequest(err, user, info) {
    // Se houver erro ou não houver usuário, bloqueia
    if (err || !user) {
      throw err || new UnauthorizedException('Token inválido ou ausente');
    }
    
    // Retorna o usuário (vai para req.user)
    return user;
  }
}
```

**Explicação:**

- **canActivate()**: Verifica se pode acessar a rota
- **handleRequest()**: Trata erros e retorna o usuário

---

### PASSO 6: Criar o Decorator CurrentUser

Crie `src/auth/decorators/current-user.decorator.ts`:

```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;  // Dados do JwtStrategy.validate()
  },
);
```

**Explicação:**

Facilita acesso aos dados do usuário logado.

---

### PASSO 7: Implementar o AuthService

Edite `src/auth/auth.service.ts`:

```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DatabaseService } from 'src/database/database.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly databaseService: DatabaseService,
    private jwtService: JwtService,
  ) {}

  async signIn(userData: { email: string; senha: string }) {
    const { email, senha } = userData;

    // 1. Buscar usuário pelo email
    const user = await this.databaseService.user.findUnique({
      where: { email }
    });

    // 2. Validar se existe
    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    // 3. Comparar senha
    const isPasswordValid = await bcrypt.compare(senha, user.senha);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Senha incorreta');
    }

    // 4. Criar payload do token
    const payload = {
      sub: user.id,       // 'sub' é padrão JWT (subject)
      email: user.email,
    };

    // 5. Gerar e retornar token
    return {
      id: payload.sub,
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
```

**Explicação passo a passo:**

1. Busca o usuário no banco pelo email
2. Verifica se o usuário existe
3. Compara a senha fornecida com o hash salvo
4. Cria o payload com os dados do usuário
5. Gera o token JWT e retorna

---

### PASSO 8: Criar o Controller

Edite `src/auth/auth.controller.ts`:

```typescript
import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.OK)  // Retorna 200 em vez de 201
  @Post('login')
  login(@Body() authDto: { email: string; senha: string }) {
    return this.authService.signIn(authDto);
  }
}
```

**Explicação:**

- Rota: `POST /auth/login`
- Recebe: `{ email, senha }`
- Retorna: `{ id, access_token }`

---

### PASSO 9: Configurar o AuthModule

Edite `src/auth/auth.module.ts`:

```typescript
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
      secret: process.env.JWT_SECRET || 'fallback-secret',
      signOptions: { expiresIn: '1d' }
    })
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,  // ← IMPORTANTE!
  ],
  exports: [
    JwtStrategy,  // ← IMPORTANTE!
  ],
})
export class AuthModule {}
```

**Explicação:**

- Importa `DatabaseModule` para acessar o Prisma
- Configura o JWT com secret e expiração
- Registra e exporta a `JwtStrategy`

---

### PASSO 10: Importar no AppModule

Edite `src/app.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
// ... outros imports

@Module({
  imports: [
    AuthModule,  // ← Adicione aqui
    // ... outros módulos
  ],
})
export class AppModule {}
```

---

## 🔄 Fluxo do JWT

### Fluxo Completo de Autenticação

```
┌─────────────────────────────────────────────────────────────────┐
│                    1. FAZER LOGIN                                │
└─────────────────────────────────────────────────────────────────┘

Cliente                        Controller                  Service
  │                                │                          │
  │  POST /auth/login              │                          │
  │  { email, senha }              │                          │
  │───────────────────────────────>│                          │
  │                                │  signIn(authDto)         │
  │                                │─────────────────────────>│
  │                                │                          │
  │                                │     1. Busca user no DB  │
  │                                │     2. Valida senha      │
  │                                │     3. Cria payload      │
  │                                │     4. Gera token JWT    │
  │                                │                          │
  │                                │  { id, access_token }    │
  │                                │<─────────────────────────│
  │  { id, access_token }          │                          │
  │<───────────────────────────────│                          │
  │                                │                          │

┌─────────────────────────────────────────────────────────────────┐
│              2. ACESSAR ROTA PROTEGIDA                           │
└─────────────────────────────────────────────────────────────────┘

Cliente                Guard                Strategy            Controller
  │                      │                      │                    │
  │  GET /users/profile  │                      │                    │
  │  Authorization:      │                      │                    │
  │  Bearer <token>      │                      │                    │
  │─────────────────────>│                      │                    │
  │                      │                      │                    │
  │                      │  1. Extrai token     │                    │
  │                      │  2. Valida assinatura│                    │
  │                      │  3. Verifica expiração                    │
  │                      │─────────────────────>│                    │
  │                      │                      │                    │
  │                      │                      │  4. Decodifica     │
  │                      │                      │     payload        │
  │                      │                      │  5. Busca user DB  │
  │                      │                      │  6. Retorna dados  │
  │                      │                      │                    │
  │                      │  { userId, email }   │                    │
  │                      │<─────────────────────│                    │
  │                      │                      │                    │
  │                      │  7. req.user = dados │                    │
  │                      │  8. Libera acesso    │                    │
  │                      │─────────────────────────────────────────>│
  │                      │                      │                    │
  │                      │                      │  9. Retorna dados  │
  │  { userId, email }   │                      │                    │
  │<───────────────────────────────────────────────────────────────│
  │                      │                      │                    │
```

### Detalhamento de Cada Etapa

#### 1️⃣ Login (Criação do Token)

```typescript
// Cliente envia
POST /auth/login
{
  "email": "user@example.com",
  "senha": "123456"
}

// AuthService faz:
1. const user = await prisma.user.findUnique({ where: { email } })
2. const isValid = await bcrypt.compare(senha, user.senha)
3. const payload = { sub: user.id, email: user.email }
4. const token = await jwtService.signAsync(payload)

// Servidor retorna
{
  "id": 1,
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### 2️⃣ Envio do Token

```typescript
// Cliente guarda o token e envia em todas as requisições
GET /users/profile
Headers:
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### 3️⃣ Validação do Token

```typescript
// 1. JwtAuthGuard intercepta a requisição
@UseGuards(JwtAuthGuard)
@Get('profile')

// 2. JwtStrategy extrai e valida o token
jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
  ↓
Token extraído: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  ↓
Valida assinatura com JWT_SECRET
  ↓
Verifica expiração (iat < exp)
  ↓
Decodifica payload: { sub: 1, email: "user@example.com", iat: ..., exp: ... }

// 3. JwtStrategy.validate() executa
async validate(payload) {
  const user = await prisma.user.findUnique({ where: { id: payload.sub } })
  return { userId: user.id, email: user.email, nome: user.nome }
}

// 4. Dados retornados ficam em req.user
req.user = { userId: 1, email: "user@example.com", nome: "João" }
```

#### 4️⃣ Acesso aos Dados

```typescript
// No controller, você pode acessar o usuário de 2 formas:

// Forma 1: Usando @Request()
@Get('profile')
getProfile(@Request() req) {
  return req.user;  // { userId, email, nome }
}

// Forma 2: Usando @CurrentUser() (melhor)
@Get('profile')
getProfile(@CurrentUser() user) {
  return user;  // { userId, email, nome }
}
```

### Quando o Token Expira?

```typescript
// Token criado em: 2024-01-01 10:00:00
// Expiração configurada: '1d' (1 dia)
// Token expira em: 2024-01-02 10:00:00

// Após expirar:
JwtStrategy valida o token
  ↓
Token expirado (exp < agora)
  ↓
throw new UnauthorizedException('Token expirado')
  ↓
Cliente recebe: 401 Unauthorized

// Solução: Fazer login novamente para obter novo token
```

---

## 💡 Exemplo Prático Completo

### Cenário: Sistema de Tarefas com Autenticação

Vamos criar um sistema onde:
1. Usuário faz login
2. Recebe um token
3. Usa o token para acessar suas tarefas

### 1. Criar Usuário (Registro)

```typescript
// src/users/users.service.ts
import * as bcrypt from 'bcrypt';

async create(data: { nome: string; email: string; senha: string }) {
  // Criptografa a senha antes de salvar
  const senhaHash = await bcrypt.hash(data.senha, 10);
  
  return this.databaseService.user.create({
    data: {
      nome: data.nome,
      email: data.email,
      senha: senhaHash,  // Salva a senha criptografada
    },
  });
}
```

**Testar:**
```bash
POST http://localhost:3000/users
Content-Type: application/json

{
  "nome": "João Silva",
  "email": "joao@example.com",
  "senha": "123456"
}
```

**Resposta:**
```json
{
  "id": 1,
  "nome": "João Silva",
  "email": "joao@example.com"
}
```

---

### 2. Fazer Login

```typescript
// src/auth/auth.controller.ts
@Post('login')
login(@Body() authDto: { email: string; senha: string }) {
  return this.authService.signIn(authDto);
}
```

**Testar:**
```bash
POST http://localhost:3000/auth/login
Content-Type: application/json

{
  "email": "joao@example.com",
  "senha": "123456"
}
```

**Resposta:**
```json
{
  "id": 1,
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImVtYWlsIjoiam9hb0BleGFtcGxlLmNvbSIsImlhdCI6MTcwNDEyMDAwMCwiZXhwIjoxNzA0MjA2NDAwfQ.abc123xyz"
}
```

---

### 3. Acessar Rota Protegida (Perfil)

```typescript
// src/users/users.controller.ts
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';

@Controller('users')
export class UsersController {
  
  @UseGuards(JwtAuthGuard)  // ← Protege a rota
  @Get('profile')
  getProfile(@CurrentUser() user) {
    return {
      mensagem: 'Você está autenticado!',
      usuario: user,
    };
  }
}
```

**Testar:**
```bash
GET http://localhost:3000/users/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Resposta:**
```json
{
  "mensagem": "Você está autenticado!",
  "usuario": {
    "userId": 1,
    "email": "joao@example.com",
    "nome": "João Silva"
  }
}
```

---

### 4. Listar Tarefas do Usuário Logado

```typescript
// src/tarefas/tarefas.controller.ts
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';

@Controller('tarefas')
export class TarefasController {
  constructor(private readonly tarefasService: TarefasService) {}
  
  @UseGuards(JwtAuthGuard)  // ← Protege a rota
  @Get()
  findAll(@CurrentUser() user) {
    // Busca apenas as tarefas do usuário logado
    return this.tarefasService.findAllByUser(user.userId);
  }
  
  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Body() createTarefaDto: CreateTarefaDto,
    @CurrentUser() user,
  ) {
    // Cria uma tarefa para o usuário logado
    return this.tarefasService.create({
      ...createTarefaDto,
      usuarioId: user.userId,  // ← Pega o ID do token
    });
  }
}
```

```typescript
// src/tarefas/tarefas.service.ts
async findAllByUser(usuarioId: number) {
  return this.databaseService.tarefa.findMany({
    where: { usuarioId },  // ← Filtra por usuário
  });
}

async create(data: { titulo: string; descricao: string; usuarioId: number }) {
  return this.databaseService.tarefa.create({
    data: {
      titulo: data.titulo,
      descricao: data.descricao,
      usuarioId: data.usuarioId,  // ← Associa ao usuário
    },
  });
}
```

**Testar - Criar Tarefa:**
```bash
POST http://localhost:3000/tarefas
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "titulo": "Estudar JWT",
  "descricao": "Implementar autenticação no NestJS"
}
```

**Resposta:**
```json
{
  "id": 1,
  "titulo": "Estudar JWT",
  "descricao": "Implementar autenticação no NestJS",
  "usuarioId": 1,
  "concluida": false
}
```

**Testar - Listar Tarefas:**
```bash
GET http://localhost:3000/tarefas
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Resposta:**
```json
[
  {
    "id": 1,
    "titulo": "Estudar JWT",
    "descricao": "Implementar autenticação no NestJS",
    "usuarioId": 1,
    "concluida": false
  }
]
```

---

### 5. Testando Erros Comuns

#### Erro 1: Token Ausente
```bash
GET http://localhost:3000/users/profile
# Sem header Authorization
```
**Resposta:**
```json
{
  "statusCode": 401,
  "message": "Token inválido ou ausente",
  "error": "Unauthorized"
}
```

#### Erro 2: Token Inválido
```bash
GET http://localhost:3000/users/profile
Authorization: Bearer token-invalido-xyz
```
**Resposta:**
```json
{
  "statusCode": 401,
  "message": "Token inválido ou ausente",
  "error": "Unauthorized"
}
```

#### Erro 3: Credenciais Incorretas
```bash
POST http://localhost:3000/auth/login
Content-Type: application/json

{
  "email": "joao@example.com",
  "senha": "senha-errada"
}
```
**Resposta:**
```json
{
  "statusCode": 401,
  "message": "Senha incorreta",
  "error": "Unauthorized"
}
```

---

## 📝 Resumo e Checklist

### Resumo dos Conceitos Principais

| Conceito | O que é | Para que serve |
|----------|---------|----------------|
| **JWT** | Token com 3 partes (header.payload.signature) | Autenticar usuário sem sessão |
| **Payload** | Dados dentro do token (id, email) | Identificar o usuário |
| **Secret** | Chave secreta para assinar o token | Garantir que o token não foi alterado |
| **Bearer Token** | Formato: `Authorization: Bearer <token>` | Enviar o token nas requisições |
| **JwtStrategy** | Valida e decodifica o token | Buscar dados do usuário |
| **JwtAuthGuard** | Protege rotas | Bloquear acesso sem token |
| **CurrentUser** | Decorator customizado | Acessar dados do usuário facilmente |

### Fluxo Resumido

```
1. LOGIN
   Cliente → email + senha → Server
   Server → valida → gera token → Cliente

2. GUARDAR TOKEN
   Cliente salva o token (localStorage, cookie, etc)

3. USAR TOKEN
   Cliente → requisição + token → Server
   Server → valida token → retorna dados

4. TOKEN EXPIRA
   Server → rejeita token → Cliente faz login novamente
```

### Como o Token é Validado?

```
1. Guard intercepta a requisição
2. Strategy extrai o token do header
3. Strategy valida a assinatura (usando JWT_SECRET)
4. Strategy verifica a expiração
5. Strategy executa validate() e busca o usuário no banco
6. Se tudo OK, req.user recebe os dados
7. Controller acessa req.user via @CurrentUser()
```

---

## ✅ Checklist para Implementar JWT Sozinho

Use esta checklist para implementar JWT do zero em um novo projeto:

### Configuração Inicial

- [ ] Instalar dependências
  ```bash
  pnpm install @nestjs/jwt @nestjs/passport passport passport-jwt bcrypt
  pnpm install -D @types/passport-jwt @types/bcrypt
  ```

- [ ] Criar arquivo `.env` com `JWT_SECRET`

- [ ] Criar módulo de autenticação
  ```bash
  nest g module auth
  nest g controller auth
  nest g service auth
  ```

### Arquivos JWT

- [ ] Criar `src/auth/strategies/jwt.strategy.ts`
  - [ ] Importar `PassportStrategy` e `Strategy`
  - [ ] Configurar `jwtFromRequest`, `ignoreExpiration`, `secretOrKey`
  - [ ] Implementar método `validate(payload)`
  - [ ] Buscar usuário no banco
  - [ ] Retornar objeto para `req.user`

- [ ] Criar `src/auth/guards/jwt-auth.guard.ts`
  - [ ] Estender `AuthGuard('jwt')`
  - [ ] Implementar `canActivate()`
  - [ ] Implementar `handleRequest()` com tratamento de erros

- [ ] Criar `src/auth/decorators/current-user.decorator.ts`
  - [ ] Usar `createParamDecorator`
  - [ ] Retornar `request.user`

### AuthService

- [ ] Implementar método `signIn()`
  - [ ] Buscar usuário por email
  - [ ] Validar se usuário existe
  - [ ] Comparar senha com bcrypt
  - [ ] Criar payload `{ sub: userId, email }`
  - [ ] Gerar token com `jwtService.signAsync()`
  - [ ] Retornar `{ id, access_token }`

### AuthController

- [ ] Criar rota `POST /auth/login`
  - [ ] Receber `{ email, senha }`
  - [ ] Chamar `authService.signIn()`
  - [ ] Retornar token

### AuthModule

- [ ] Importar `DatabaseModule`, `PassportModule`, `JwtModule`
- [ ] Configurar `JwtModule.register()`
  - [ ] Definir `secret`
  - [ ] Definir `signOptions: { expiresIn }`
- [ ] Adicionar `JwtStrategy` em `providers`
- [ ] Exportar `JwtStrategy` em `exports`

### Proteger Rotas

- [ ] Adicionar `@UseGuards(JwtAuthGuard)` nas rotas
- [ ] Usar `@CurrentUser()` para acessar dados do usuário
- [ ] Testar com token válido
- [ ] Testar sem token (deve retornar 401)
- [ ] Testar com token inválido (deve retornar 401)

### Testes

- [ ] Criar usuário
- [ ] Fazer login e obter token
- [ ] Acessar rota protegida com token
- [ ] Verificar que `@CurrentUser()` retorna dados corretos
- [ ] Testar token expirado (esperar expiração ou alterar `expiresIn`)

---

## 🎓 Perguntas para Testar seu Conhecimento

Tente responder sem consultar a documentação:

1. O que é JWT e quais são as 3 partes de um token?
2. Para que serve o JWT_SECRET?
3. Qual é a diferença entre `JwtStrategy` e `JwtAuthGuard`?
4. O que o método `validate()` da JwtStrategy faz?
5. Como o token é enviado do cliente para o servidor?
6. O que acontece quando o token expira?
7. Para que serve o decorator `@CurrentUser()`?
8. Qual é a diferença entre `bcrypt.hash()` e `bcrypt.compare()`?
9. Por que usamos `sub` no payload do token?
10. Como proteger uma rota para exigir autenticação?

### Respostas Rápidas

<details>
<summary>Ver respostas</summary>

1. **JWT é um token de autenticação.** Partes: Header (algoritmo), Payload (dados), Signature (validação)
2. **JWT_SECRET é usado para assinar e validar o token**, garantindo que ele não foi alterado
3. **JwtStrategy valida o token e busca o usuário.** JwtAuthGuard protege rotas exigindo token válido
4. **validate() busca dados atualizados do usuário no banco** e retorna para req.user
5. **No header Authorization: Bearer <token>**
6. **O servidor rejeita com 401 Unauthorized** e o cliente precisa fazer login novamente
7. **Facilita o acesso aos dados do usuário** sem precisar usar @Request() req.user
8. **hash() criptografa a senha.** compare() verifica se a senha corresponde ao hash
9. **'sub' é o padrão JWT para o identificador do usuário** (subject)
10. **Adicionar @UseGuards(JwtAuthGuard) acima do método** ou da classe

</details>

---

## 🔒 Boas Práticas de Segurança

1. **Nunca exponha o JWT_SECRET**
   - Não commite no Git
   - Use variáveis de ambiente
   - Use secrets diferentes em dev/prod

2. **Defina expiração curta para tokens**
   - Tokens de curta duração (1h-1d) são mais seguros
   - Implemente refresh tokens para sessões longas

3. **Valide sempre o usuário no banco**
   - Mesmo com token válido, confirme que o usuário ainda existe
   - Permite desabilitar usuários instantaneamente

4. **Use HTTPS em produção**
   - Tokens podem ser interceptados em HTTP
   - HTTPS criptografa a comunicação

5. **Criptografe senhas com bcrypt**
   - Nunca salve senhas em texto plano
   - Use salt rounds >= 10

6. **Não coloque dados sensíveis no payload**
   - O payload pode ser decodificado (não é criptografado)
   - Coloque apenas: id, email, roles

7. **Implemente rate limiting no login**
   - Previne ataques de força bruta
   - Use bibliotecas como `@nestjs/throttler`

---

## 🚀 Próximos Passos

Depois de dominar JWT básico, você pode implementar:

1. **Refresh Tokens**: Tokens de longa duração para renovar access tokens
2. **Roles e Permissions**: Controle de acesso baseado em funções
3. **Blacklist de Tokens**: Invalidar tokens antes da expiração (logout)
4. **OAuth2**: Login com Google, Facebook, GitHub
5. **Two-Factor Authentication (2FA)**: Segunda camada de segurança
6. **Rate Limiting**: Limitar tentativas de login

---

## 📚 Recursos Adicionais

- [Documentação oficial NestJS - Authentication](https://docs.nestjs.com/security/authentication)
- [JWT.io - Decodificar e verificar tokens](https://jwt.io/)
- [Passport.js - Estratégias de autenticação](http://www.passportjs.org/)
- [bcrypt - Documentação](https://www.npmjs.com/package/bcrypt)

---

**🎉 Parabéns! Você agora tem um guia completo de JWT!**

Salve este documento e use como referência sempre que precisar implementar autenticação JWT no NestJS.
