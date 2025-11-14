import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PromoCodeResponseDto } from './promo-code-response.dto';

export class PromoCodeValidationDto {
  @ApiProperty({
    description: 'Whether the promo code is valid for the specified order',
    example: true,
  })
  isValid: boolean;

  @ApiProperty({
    description: 'Validation message explaining the result',
    example: 'Promo code applied successfully!',
  })
  message: string;

  @ApiProperty({
    description: 'Calculated discount amount',
    example: 15.0,
  })
  discountAmount: number;

  @ApiProperty({
    description: 'Formatted discount amount for display',
    example: '$15.00',
  })
  formattedDiscount: string;

  @ApiPropertyOptional({
    description: 'Promo code details if valid',
    type: () => PromoCodeResponseDto,
  })
  promoCode?: PromoCodeResponseDto;
}
