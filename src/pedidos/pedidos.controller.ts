import { Body, Controller, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common';
import { PedidosService } from './pedidos.service';

@Controller('pedidos')
export class PedidosController {
  constructor(private readonly service: PedidosService) {}

  @Post()
  crear(@Body() body: { nombreCliente: string; cantidad: number; productos: number[] }) {
    return this.service.crear(body.nombreCliente, body.cantidad, body.productos);
  }

  @Put(':id/enviar')
  enviar(@Param('id', ParseIntPipe) id: number) {
    return this.service.enviar(id);
  }

  @Put(':id/recibir')
  recibir(@Param('id', ParseIntPipe) id: number, @Query('codigo') codigo: string) {
    return this.service.recibir(id, codigo);
  }
}