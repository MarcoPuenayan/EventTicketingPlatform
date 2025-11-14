import { ApiProperty } from '@nestjs/swagger';

export class PromoCodeUsageResponseDto {
  @ApiProperty({
    description: 'Promo code usage ID',
    example: 1,
  })
  promoCodeUsageId: number;

  @ApiProperty({
    description: 'Promo code that was used',
    example: 'SUMMER2024',
  })
  promoCode: string;

  @ApiProperty({
    description: 'Order number',
    example: 'ORD-20240615-ABC123',
  })
  orderNumber: string;

  @ApiProperty({
    description: 'Customer full name',
    example: 'John Doe',
  })
  customerName: string;

  @ApiProperty({
    description: 'Customer email',
    example: 'john.doe@example.com',
  })
  customerEmail: string;

  @ApiProperty({
    description: 'Event title',
    example: 'Summer Music Festival',
  })
  eventTitle: string;

  @ApiProperty({
    description: 'Discount amount applied',
    example: 15.0,
  })
  discountAmount: number;

  @ApiProperty({
    description: 'Order subtotal before discount',
    example: 100.0,
  })
  orderSubtotal: number;

  @ApiProperty({
    description: 'Timestamp when promo code was used',
    example: '2024-06-15T14:30:00Z',
  })
  usedAt: Date;
}
