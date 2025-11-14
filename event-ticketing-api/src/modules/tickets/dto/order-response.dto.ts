import { ApiProperty } from '@nestjs/swagger';

export class OrderResponseDto {
  @ApiProperty({ example: 1 })
  orderId: number;

  @ApiProperty({ example: 'ORD-2025-001234' })
  orderNumber: string;

  @ApiProperty({ example: 1 })
  userId: number;

  @ApiProperty({ example: 1 })
  eventId: number;

  @ApiProperty({ example: 'Summer Music Festival 2025' })
  eventTitle: string;

  @ApiProperty({ example: 99.98 })
  subTotal: number;

  @ApiProperty({ example: 8.99 })
  taxAmount: number;

  @ApiProperty({ example: 5.00 })
  serviceFee: number;

  @ApiProperty({ example: 10.00 })
  discountAmount: number;

  @ApiProperty({ example: 103.97 })
  totalAmount: number;

  @ApiProperty({ example: 'Completed' })
  status: string;

  @ApiProperty({ example: 'john.doe@example.com' })
  billingEmail: string;

  @ApiProperty({ example: 'John' })
  billingFirstName: string;

  @ApiProperty({ example: 'Doe' })
  billingLastName: string;

  @ApiProperty({ example: '123 Main St' })
  billingAddress?: string;

  @ApiProperty({ example: 'New York' })
  billingCity?: string;

  @ApiProperty({ example: 'NY' })
  billingState?: string;

  @ApiProperty({ example: '10001' })
  billingZipCode?: string;

  @ApiProperty({ example: 'SUMMER2025' })
  promoCodeUsed?: string;

  @ApiProperty({ example: '2025-11-13T10:00:00Z' })
  orderDate: Date;

  @ApiProperty({ example: '2025-11-13T10:01:00Z' })
  completedAt?: Date;

  @ApiProperty({ example: 2 })
  ticketCount: number;
}
