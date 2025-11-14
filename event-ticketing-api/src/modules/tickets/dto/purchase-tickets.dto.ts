import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export class TicketPurchaseItem {
  @ApiProperty({
    example: 1,
    description: 'Ticket type ID to purchase',
  })
  @IsNotEmpty()
  @IsInt()
  ticketTypeId: number;

  @ApiProperty({
    example: 2,
    description: 'Quantity to purchase',
    minimum: 1,
    maximum: 100,
  })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(100)
  quantity: number;
}

export class AttendeeInfo {
  @ApiProperty({
    example: 'John',
    description: 'Attendee first name',
  })
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @ApiProperty({
    example: 'Doe',
    description: 'Attendee last name',
  })
  @IsNotEmpty()
  @IsString()
  lastName: string;

  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'Attendee email address',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;
}

export class PurchaseTicketsDto {
  @ApiProperty({
    example: 1,
    description: 'Event ID',
  })
  @IsNotEmpty()
  @IsInt()
  eventId: number;

  @ApiProperty({
    type: [TicketPurchaseItem],
    description: 'List of ticket types and quantities to purchase',
  })
  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => TicketPurchaseItem)
  ticketItems: TicketPurchaseItem[];

  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'Billing email address',
  })
  @IsNotEmpty()
  @IsEmail()
  billingEmail: string;

  @ApiProperty({
    example: 'John',
    description: 'Billing first name',
  })
  @IsNotEmpty()
  @IsString()
  billingFirstName: string;

  @ApiProperty({
    example: 'Doe',
    description: 'Billing last name',
  })
  @IsNotEmpty()
  @IsString()
  billingLastName: string;

  @ApiProperty({
    example: '123 Main St',
    description: 'Billing address',
    required: false,
  })
  @IsOptional()
  @IsString()
  billingAddress?: string;

  @ApiProperty({
    example: 'New York',
    description: 'Billing city',
    required: false,
  })
  @IsOptional()
  @IsString()
  billingCity?: string;

  @ApiProperty({
    example: 'NY',
    description: 'Billing state',
    required: false,
  })
  @IsOptional()
  @IsString()
  billingState?: string;

  @ApiProperty({
    example: '10001',
    description: 'Billing zip code',
    required: false,
  })
  @IsOptional()
  @IsString()
  billingZipCode?: string;

  @ApiProperty({
    example: 'SUMMER2025',
    description: 'Promo code to apply',
    required: false,
  })
  @IsOptional()
  @IsString()
  promoCode?: string;

  @ApiProperty({
    type: [AttendeeInfo],
    description: 'List of attendee information',
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttendeeInfo)
  attendees?: AttendeeInfo[];
}
