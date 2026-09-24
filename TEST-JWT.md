# 🧪 Guia de Teste - JWT Authentication

## 📋 Pré-requisitos

1. Banco de dados rodando
2. Aplicação rodando: `npm run start:dev`
3. Ter um usuário cadastrado no banco

---

## 🚀 Passo a Passo para Testar

### **Passo 1: Criar um usuário (se ainda não tem)**

```http
POST http://localhost:3000/users
Content-Type: application/json

{
  "email": "teste@email.com",
  "nome": "Teste Usuario",
  "senha": "senha123"
}
```

**Resposta esperada:**
```json
{
  "id": 1,
  "email": "teste@email.com",
  "nome": "Teste Usuario",
  "createdAt": "2024-..."
}
```

---

### **Passo 2: Fazer Login**

```http
POST http://localhost:3000/auth
Content-Type: application/json

{
  "email": "teste@email.com",
  "senha": "senha123"
}
```

**Resposta esperada:**
```json
{
  "id": 1,
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImVtYWlsIjoidGVzdGVAZW1haWwuY29tIiwiaWF0IjoxNjM..."
}
```

**🔴 IMPORTANTE:** Copie o `access_token` da resposta!

---

### **Passo 3: Acessar Rota Protegida**

```http
GET http://localhost:3000/users/profile
Authorization: Bearer SEU_TOKEN_AQUI
```

**Substitua `SEU_TOKEN_AQUI` pelo token que você copiou!**

**Resposta esperada:**
```json
{
  "message": "Dados do usuário autenticado",
  "user": {
    "userId": 1,
    "email": "teste@email.com",
    "nome": "Teste Usuario"
  }
}
```

---

### **Passo 4: Testar sem Token (Deve Falhar)**

```http
GET http://localhost:3000/users/profile
```

**Resposta esperada:**
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

---

## 🐛 Problemas Comuns

### **Erro: "Unauthorized" mesmo com token**

**Causas possíveis:**

1. **Token não está no formato correto**
   - ✅ Correto: `Authorization: Bearer eyJhbGciOiJIUzI1N...`
   - ❌ Errado: `Authorization: eyJhbGciOiJIUzI1N...`
   - ❌ Errado: `Bearer: eyJhbGciOiJIUzI1N...`

2. **JWT_SECRET diferente**
   - Verifique se o `.env` tem: `JWT_SECRET=a-string-secret-at-least-256-bits-long`
   - Reinicie a aplicação após alterar o .env

3. **Token expirado**
   - Faça login novamente para obter um novo token

4. **Usuário foi deletado do banco**
   - A JwtStrategy verifica se o usuário ainda existe

---

## 🔍 Como Debugar

### **1. Verificar se a Strategy está registrada:**

Abra o console da aplicação e procure por erros relacionados a Passport ou JWT.

### **2. Adicionar logs na JwtStrategy:**

Edite `src/auth/strategies/jwt.strategy.ts`:

```typescript
async validate(payload: any) {
  console.log('🔍 Token recebido - Payload:', payload);
  
  const user = await this.databaseService.user.findUnique({
    where: { id: payload.sub },
    select: {
      id: true,
      email: true,
      nome: true,
    }
  });

  console.log('🔍 Usuário encontrado:', user);

  if (!user) {
    throw new UnauthorizedException('Usuário não encontrado');
  }

  return {
    userId: user.id,
    email: user.email,
    nome: user.nome,
  };
}
```

### **3. Verificar se o Guard está sendo chamado:**

Edite `src/auth/guards/jwt-auth.guard.ts`:

```typescript
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err, user, info) {
    console.log('🛡️ Guard chamado');
    console.log('Erro:', err);
    console.log('User:', user);
    console.log('Info:', info);
    
    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    return user;
  }
}
```

---

## 🎯 Teste Completo com cURL

```bash
# 1. Criar usuário
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@email.com","nome":"Teste Usuario","senha":"senha123"}'

# 2. Fazer login
curl -X POST http://localhost:3000/auth \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@email.com","senha":"senha123"}'

# 3. Acessar rota protegida (substitua TOKEN pelo recebido)
curl -X GET http://localhost:3000/users/profile \
  -H "Authorization: Bearer TOKEN"
```

---

## ✅ Checklist de Verificação

- [ ] Aplicação está rodando sem erros
- [ ] Banco de dados está conectado
- [ ] Usuário foi criado com sucesso
- [ ] Login retorna um `access_token`
- [ ] Token está sendo enviado no header correto: `Authorization: Bearer ...`
- [ ] JWT_SECRET está configurado no .env
- [ ] JwtStrategy está registrada no AuthModule
- [ ] AuthModule está importado no UsersModule

---

## 📱 Testando com Postman/Insomnia

### **No Postman:**

1. Crie uma nova requisição GET para `http://localhost:3000/users/profile`
2. Vá na aba **Authorization**
3. Escolha **Type: Bearer Token**
4. Cole o token no campo **Token**
5. Clique em **Send**

### **No Insomnia:**

1. Crie uma nova requisição GET para `http://localhost:3000/users/profile`
2. Vá na aba **Auth**
3. Escolha **Bearer Token**
4. Cole o token
5. Clique em **Send**
