import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { envs, ORDER_SERVICE } from 'src/config';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: ORDER_SERVICE,
        transport: Transport.TCP,
        options: {
          host: envs.microservices.orders.host,
          port: envs.microservices.orders.port,
        },
      },
    ]),
  ],
  controllers: [OrdersController],
})
export class OrdersModule {}
