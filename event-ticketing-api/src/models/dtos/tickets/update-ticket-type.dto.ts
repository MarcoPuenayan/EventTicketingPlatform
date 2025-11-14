import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsDateString, IsBoolean, Min, Max } from 'class-validator';

export class UpdateTicketTypeDto {
  @ApiProperty({
    example: 'VIP Pass',
    description: 'Ticket type name',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    example: 'Premium access with backstage pass',
    description: 'Ticket type description',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: 199.99,
    description: 'Price per ticket',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiProperty({
    example: 100,
    description: 'Total quantity available',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  quantityAvailable?: number;

  @ApiProperty({
    example: '2025-10-01T00:00:00Z',
    description: 'Sale start date',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  saleStartDate?: Date;

  @ApiProperty({
    example: '2025-12-30T23:59:59Z',
    description: 'Sale end date',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  saleEndDate?: Date;

  @ApiProperty({
    example: 1,
    description: 'Minimum quantity per order',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  minQuantityPerOrder?: number;

  @ApiProperty({
    example: 5,
    description: 'Maximum quantity per order',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  maxQuantityPerOrder?: number;

  @ApiProperty({
    example: true,
    description: 'Is ticket type active',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({
    example: 1,
    description: 'Sort order for display',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}
