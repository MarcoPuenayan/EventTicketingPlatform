import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class ValidatePromoCodeDto {
  @ApiProperty({
    example: 'SUMMER2025',
    description: 'Promo code to validate',
  })
  @IsNotEmpty()
  @IsString()
  code: string;

  @ApiProperty({
    example: 1,
    description: 'Event ID',
  })
  @IsNotEmpty()
  @IsInt()
  eventId: number;

  @ApiProperty({
    example: 99.99,
    description: 'Order subtotal amount',
    minimum: 0,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  orderSubtotal: number;
}

export class PromoCodeValidationResponseDto {
  @ApiProperty({ example: true })
  isValid: boolean;

  @ApiProperty({ example: 'Promo code applied successfully' })
  message: string;

  @ApiProperty({ example: 15.00 })
  discountAmount: number;

  @ApiProperty({ example: '15% off' })
  formattedDiscount: string;
}
