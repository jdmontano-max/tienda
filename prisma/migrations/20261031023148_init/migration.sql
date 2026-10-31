-- CreateEnum
CREATE TYPE "Estado" AS ENUM ('PENDIENTE', 'ENVIADO', 'RECIBIDO');

-- CreateTable
CREATE TABLE "Producto" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "stock" INTEGER NOT NULL,

    CONSTRAINT "Producto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pedido" (
    "id" SERIAL NOT NULL,
    "nombreCliente" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "estado" "Estado" NOT NULL DEFAULT 'PENDIENTE',
    "codigoVerificacion" TEXT,

    CONSTRAINT "Pedido_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_PedidoToProducto" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_PedidoToProducto_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_PedidoToProducto_B_index" ON "_PedidoToProducto"("B");

-- AddForeignKey
ALTER TABLE "_PedidoToProducto" ADD CONSTRAINT "_PedidoToProducto_A_fkey" FOREIGN KEY ("A") REFERENCES "Pedido"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PedidoToProducto" ADD CONSTRAINT "_PedidoToProducto_B_fkey" FOREIGN KEY ("B") REFERENCES "Producto"("id") ON DELETE CASCADE ON UPDATE CASCADE;
