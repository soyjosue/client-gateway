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
import { ORDER_SERVICE } from 'src/config';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { catchError } from 'rxjs';
import { OrderPaginationDto } from './dto/order-pagination.dto';
import { PaginationDto } from 'src/common';
import { StatusDto } from './dto/status.dto';

@Controller('orders')
export class OrdersController {
  constructor(
    @Inject(ORDER_SERVICE)
    private readonly ordersClient: ClientProxy,
  ) {}

  @Post()
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersClient.send('createOrder', createOrderDto).pipe(
      catchError((err: Error) => {
        throw new RpcException(err);
      }),
    );
  }

  @Get()
  findAll(@Query() paginationDto: OrderPaginationDto) {
    return this.ordersClient.send('findAllOrders', paginationDto).pipe(
      catchError((err: Error) => {
        throw new RpcException(err);
      }),
    );
  }

  @Get('/id/:id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.ordersClient.send('findOneOrder', { id }).pipe(
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
    return this.ordersClient
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
    return this.ordersClient
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
