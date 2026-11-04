import { Body, Controller, Post } from '@nestjs/common';
import { ProductosService } from './productos.service';
import { CrearProductoDto } from './dto/crear-producto.dto';

@Controller('productos')
export class ProductosController {
  constructor(private readonly service: ProductosService) {}

   @Post()
  crear(@Body() dto: CrearProductoDto) {
    return this.service.crear(dto);
  }
}