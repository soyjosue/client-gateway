import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { Request } from 'express';
import { catchError, firstValueFrom } from 'rxjs';
import { NATS_SERVICE } from 'src/config';
import { CurrentUser } from '../interfaces/current-user.interface';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(@Inject(NATS_SERVICE) private readonly client: ClientProxy) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException('Token not found.');
    }
    try {
      const { user, token: newToken } = await firstValueFrom(
        this.client
          .send<{
            user: CurrentUser;
            token: string;
          }>('auth.verify.user', token)
          .pipe(
            catchError((error: Error) => {
              throw new RpcException(error);
            }),
          ),
      );

      request['user'] = user;
      request['token'] = newToken;
    } catch {
      throw new UnauthorizedException();
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
