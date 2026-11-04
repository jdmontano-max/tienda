import { Body, Controller, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common';
import { PedidosService } from './pedidos.service';
import { CrearPedidoDto } from './dto/crear-pedido.dto';

@Controller('pedidos')
export class PedidosController {
  constructor(private readonly service: PedidosService) {}

   @Post()
  crear(@Body() dto: CrearPedidoDto) {
    return this.service.crear(dto);
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