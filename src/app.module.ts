import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { ProductosModule } from './productos/productos.module';
import { PedidosModule } from './pedidos/pedidos.module';

@Module({
  imports: [PrismaModule, ProductosModule, PedidosModule],
})
export class AppModule {}