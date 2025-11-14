import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateTicketTypeDto {
  @ApiProperty({
    example: 1,
    description: 'Event ID this ticket type belongs to',
  })
  @IsNotEmpty()
  @IsInt()
  eventId: number;

  @ApiProperty({
    example: 'General Admission',
    description: 'Ticket type name',
    maxLength: 100,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    example: 'Access to general seating area',
    description: 'Ticket type description',
    maxLength: 500,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({
    example: 49.99,
    description: 'Ticket price',
    minimum: 0,
    maximum: 10000,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(10000)
  price: number;

  @ApiProperty({
    example: 500,
    description: 'Quantity of tickets available',
  })
  @IsNotEmpty()
  @IsInt()
  quantityAvailable: number;

  @ApiProperty({
    example: '2025-01-01T00:00:00Z',
    description: 'When ticket sales start',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  saleStartDate?: string;

  @ApiProperty({
    example: '2025-07-15T18:00:00Z',
    description: 'When ticket sales end',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  saleEndDate?: string;

  @ApiProperty({
    example: 1,
    description: 'Minimum quantity per order',
    minimum: 1,
    maximum: 100,
    default: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  minQuantityPerOrder?: number = 1;

  @ApiProperty({
    example: 10,
    description: 'Maximum quantity per order',
    minimum: 1,
    maximum: 100,
    default: 10,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  maxQuantityPerOrder?: number = 10;

  @ApiProperty({
    example: 0,
    description: 'Sort order for display',
    default: 0,
  })
  @IsOptional()
  @IsInt()
  sortOrder?: number = 0;
}
