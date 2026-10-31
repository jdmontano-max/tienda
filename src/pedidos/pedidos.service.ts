import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Estado } from '../generated/prisma/enums';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PedidosService {
  constructor(private prisma: PrismaService) {}

  // CREAR PEDIDO
  async crear(nombreCliente: string, cantidad: number, idsProductos: number[]) {
    // Regla: no puede tener otro pedido pendiente
    const pendiente = await this.prisma.pedido.findFirst({
      where: { nombreCliente, estado: Estado.PENDIENTE },
    });
    if (pendiente) {
      throw new BadRequestException('El cliente ya tiene un pedido pendiente');
    }

    for (const id of idsProductos) {
      // Regla: el producto debe existir
      const producto = await this.prisma.producto.findUnique({ where: { id } });
      if (!producto) {
        throw new BadRequestException(`El producto ${id} no existe`);
      }

      // Regla: debe haber stock suficiente
      if (producto.stock < cantidad) {
        throw new BadRequestException(`No hay stock suficiente de ${producto.nombre}`);
      }
    }

    // El stock baja al hacer el pedido
    for (const id of idsProductos) {
      await this.prisma.producto.update({
        where: { id },
        data: { stock: { decrement: cantidad } },
      });
    }

    return this.prisma.pedido.create({
      data: {
        nombreCliente,
        cantidad,
        estado: Estado.PENDIENTE,
        productos: { connect: idsProductos.map((id) => ({ id })) },
      },
      include: { productos: true },
    });
  }

  // PENDIENTE -> ENVIADO (aquí se genera el código)
  async enviar(id: number) {
    const pedido = await this.buscar(id);

    if (pedido.estado !== Estado.PENDIENTE) {
      throw new BadRequestException('Solo se puede enviar un pedido pendiente');
    }

    // El randomizador: número de 6 cifras
    const codigo = Math.floor(100000 + Math.random() * 900000);

    return this.prisma.pedido.update({
      where: { id },
      data: { codigoVerificacion: String(codigo), estado: Estado.ENVIADO },
    });
  }

  // ENVIADO -> RECIBIDO (solo con el código correcto)
  async recibir(id: number, codigo: string) {
    const pedido = await this.buscar(id);

    // Regla: antes de recibido debe estar enviado
    if (pedido.estado !== Estado.ENVIADO) {
      throw new BadRequestException('El pedido debe estar ENVIADO');
    }

    // Regla: solo se marca recibido con el código
    if (pedido.codigoVerificacion !== codigo) {
      throw new BadRequestException('Código de verificación incorrecto');
    }

    return this.prisma.pedido.update({
      where: { id },
      data: { estado: Estado.RECIBIDO },
    });
  }

  private async buscar(id: number) {
    const pedido = await this.prisma.pedido.findUnique({ where: { id } });
    if (!pedido) {
      throw new NotFoundException('El pedido no existe');
    }
    return pedido;
  }
}