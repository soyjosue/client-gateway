import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Inject,
  ParseUUIDPipe,
  Query,
  Patch,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { NATS_SERVICE } from 'src/config';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { catchError } from 'rxjs';
import { OrderPaginationDto } from './dto/order-pagination.dto';
import { PaginationDto } from 'src/common';
import { StatusDto } from './dto/status.dto';

@Controller('orders')
export class OrdersController {
  constructor(
    @Inject(NATS_SERVICE)
    private readonly client: ClientProxy,
  ) {}

  @Post()
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.client.send('createOrder', createOrderDto).pipe(
      catchError((err: Error) => {
        throw new RpcException(err);
      }),
    );
  }

  @Get()
  findAll(@Query() paginationDto: OrderPaginationDto) {
    return this.client.send('findAllOrders', paginationDto).pipe(
      catchError((err: Error) => {
        throw new RpcException(err);
      }),
    );
  }

  @Get('/id/:id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.client.send('findOneOrder', { id }).pipe(
      catchError((err: Error) => {
        throw new RpcException(err);
      }),
    );
  }

  @Get('/status/:status')
  findAllByStatus(
    @Param() statusDto: StatusDto,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.client
      .send('findAllOrders', {
        ...statusDto,
        ...paginationDto,
      })
      .pipe(
        catchError((err: Error) => {
          throw new RpcException(err);
        }),
      );
  }

  @Patch(':id')
  changeStatusById(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() status: StatusDto,
  ) {
    return this.client
      .send('changeOrderStatus', {
        id,
        ...status,
      })
      .pipe(
        catchError((err: Error) => {
          throw new RpcException(err);
        }),
      );
  }
}
