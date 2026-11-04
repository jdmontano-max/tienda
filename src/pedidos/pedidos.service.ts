import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Estado } from '../generated/prisma/enums';
import { PrismaService } from '../prisma/prisma.service';
import { CrearPedidoDto } from './dto/crear-pedido.dto';

@Injectable()
export class PedidosService {
  constructor(private prisma: PrismaService) {}

    // CREAR PEDIDO (todo dentro de una transacción: o se guarda todo, o nada)
  async crear(dto: CrearPedidoDto) {
    const { nombreCliente, cantidad, productos: ids } = dto;

    return this.prisma.$transaction(async (tx) => {
      // Regla: no puede tener otro pedido pendiente
      const pendiente = await tx.pedido.findFirst({
        where: { nombreCliente, estado: Estado.PENDIENTE },
      });
      if (pendiente) {
        throw new BadRequestException('El cliente ya tiene un pedido pendiente');
      }

      // Regla: todos los productos deben existir (una sola consulta)
      const productos = await tx.producto.findMany({
        where: { id: { in: ids } },
      });
      if (productos.length !== ids.length) {
        const encontrados = new Set(productos.map((p) => p.id));
        const faltantes = ids.filter((id) => !encontrados.has(id));
        throw new BadRequestException(
          `Los productos no existen: ${faltantes.join(', ')}`,
        );
      }

      // Regla: stock suficiente. El descuento es atómico: solo se aplica
      // si todavía hay stock, así nunca queda en negativo.
      for (const producto of productos) {
        const resultado = await tx.producto.updateMany({
          where: { id: producto.id, stock: { gte: cantidad } },
          data: { stock: { decrement: cantidad } },
        });
        if (resultado.count === 0) {
          throw new BadRequestException(
            `No hay stock suficiente de ${producto.nombre}`,
          );
        }
      }

      return tx.pedido.create({
        data: {
          nombreCliente,
          cantidad,
          estado: Estado.PENDIENTE,
          productos: { connect: ids.map((id) => ({ id })) },
        },
        include: { productos: true },
      });
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