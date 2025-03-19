import {
  Catch,
  ArgumentsHost,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Response } from 'express';

@Catch(RpcException)
export class RpcCustomExceptionFilter implements ExceptionFilter<RpcException> {
  catch(exception: RpcException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const rpcError = exception.getError();
    console.log({ rpcError });

    if (
      typeof rpcError === 'object' &&
      'status' in rpcError &&
      'message' in rpcError
    ) {
      let status: HttpStatus;
      if (typeof rpcError.status === 'number')
        status = rpcError.status as HttpStatus;
      else status = HttpStatus.BAD_GATEWAY;

      return response.status(status).json(rpcError);
    }

    // response.status(401).json({
    //   status: 401,
    //   message: 'Hola mundo, saludos a todos!',
    // });
  }
}
