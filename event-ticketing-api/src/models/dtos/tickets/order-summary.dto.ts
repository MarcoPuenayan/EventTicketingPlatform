import { ApiProperty } from '@nestjs/swagger';

export class OrderSummaryDto {
  @ApiProperty({ example: 199.98, description: 'Subtotal before discounts' })
  subTotal: number;

  @ApiProperty({ example: 19.99, description: 'Discount amount' })
  discountAmount: number;

  @ApiProperty({ example: 9.00, description: 'Service fee (5%)' })
  serviceFee: number;

  @ApiProperty({ example: 14.40, description: 'Tax amount (8%)' })
  taxAmount: number;

  @ApiProperty({ example: 203.39, description: 'Total amount to pay' })
  totalAmount: number;

  @ApiProperty({ example: 'USD', description: 'Currency code' })
  currency: string;

  @ApiProperty({
    example: [
      {
        ticketTypeId: 1,
        ticketTypeName: 'General Admission',
        quantity: 2,
        pricePerTicket: 99.99,
        itemTotal: 199.98,
      },
    ],
    description: 'Breakdown by ticket type',
  })
  itemBreakdown: any[];

  @ApiProperty({
    example: 'SAVE20',
    description: 'Promo code applied',
    nullable: true,
  })
  promoCodeApplied: string | null;
}
