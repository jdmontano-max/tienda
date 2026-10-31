import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductosService {
  constructor(private prisma: PrismaService) {}

  crear(datos: { nombre: string; descripcion: string; stock: number }) {
    return this.prisma.producto.create({ data: datos });
  }
}