import {
  ArrayNotEmpty,
  ArrayUnique,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsString,
  Min,
} from 'class-validator';

export class CrearPedidoDto {
  @IsString()
  @IsNotEmpty()
  nombreCliente: string;

  @IsInt()
  @Min(1)
  cantidad: number;

  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsInt({ each: true })
  productos: number[];
}