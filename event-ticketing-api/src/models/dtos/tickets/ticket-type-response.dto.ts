import { ApiProperty } from '@nestjs/swagger';

export class TicketTypeResponseDto {
  @ApiProperty({ example: 1, description: 'Ticket type ID' })
  ticketTypeId: number;

  @ApiProperty({ example: 1, description: 'Event ID' })
  eventId: number;

  @ApiProperty({ example: 'Rock Concert 2025', description: 'Event title' })
  eventTitle: string;

  @ApiProperty({ example: 'General Admission', description: 'Ticket type name' })
  name: string;

  @ApiProperty({
    example: 'Access to general standing area',
    description: 'Description',
    nullable: true,
  })
  description: string | null;

  @ApiProperty({ example: 99.99, description: 'Price per ticket' })
  price: number;

  @ApiProperty({ example: 500, description: 'Total quantity available' })
  quantityAvailable: number;

  @ApiProperty({ example: 150, description: 'Quantity sold' })
  quantitySold: number;

  @ApiProperty({ example: 350, description: 'Quantity remaining' })
  quantityRemaining: number;

  @ApiProperty({
    example: '2025-10-01T00:00:00Z',
    description: 'Sale start date',
    nullable: true,
  })
  saleStartDate: Date | null;

  @ApiProperty({
    example: '2025-12-30T23:59:59Z',
    description: 'Sale end date',
    nullable: true,
  })
  saleEndDate: Date | null;

  @ApiProperty({
    example: 1,
    description: 'Minimum quantity per order',
  })
  minQuantityPerOrder: number;

  @ApiProperty({
    example: 10,
    description: 'Maximum quantity per order',
  })
  maxQuantityPerOrder: number;

  @ApiProperty({ example: true, description: 'Is ticket type active' })
  isActive: boolean;

  @ApiProperty({ example: true, description: 'Is currently on sale' })
  isOnSale: boolean;

  @ApiProperty({ example: 1, description: 'Sort order for display' })
  sortOrder: number;

  @ApiProperty({
    example: '2025-09-01T10:00:00Z',
    description: 'Created at',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2025-09-15T14:30:00Z',
    description: 'Updated at',
  })
  updatedAt: Date;
}
