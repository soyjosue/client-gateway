import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';
import { Request } from 'express';

export const Token = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();

    if (!request['token']) {
      throw new InternalServerErrorException(
        'Token not found in request (AuthGuard called?)',
      );
    }

    return request['token'] as string;
  },
);
