import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CrearProductoDto } from './dto/crear-producto.dto';

@Injectable()
export class ProductosService {
  constructor(private prisma: PrismaService) {}

    crear(dto: CrearProductoDto) {
    return this.prisma.producto.create({ data: dto });
  }
}