import { Body, Controller, Post } from '@nestjs/common';
import { ProductosService } from './productos.service';

@Controller('productos')
export class ProductosController {
  constructor(private readonly service: ProductosService) {}

  @Post()
  crear(@Body() body: { nombre: string; descripcion: string; stock: number }) {
    return this.service.crear(body);
  }
}