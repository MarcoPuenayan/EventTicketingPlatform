import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsNotEmpty, Min } from 'class-validator';

export class ValidatePromoCodeDto {
  @ApiProperty({
    description: 'Promo code to validate',
    example: 'SUMMER2024',
  })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({
    description: 'Event ID for which the promo code will be applied',
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  eventId: number;

  @ApiProperty({
    description: 'Order subtotal before discount',
    example: 100.0,
  })
  @IsNumber()
  @Min(0)
  orderSubtotal: number;
}
