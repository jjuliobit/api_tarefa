import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Decorator customizado para acessar dados do usuário autenticado
 * 
 * Uso:
 * @UseGuards(JwtAuthGuard)
 * @Get('profile')
 * getProfile(@CurrentUser() user) {
 *   // user = { userId, email, nome }
 *   return user;
 * }
 * 
 * Em vez de:
 * getProfile(@Request() req) {
 *   return req.user;
 * }
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
