import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateEventDto {
  @ApiProperty({
    example: 'Summer Music Festival 2025',
    description: 'Event title',
    maxLength: 200,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  title: string;

  @ApiProperty({
    example: 'Join us for an amazing summer music festival...',
    description: 'Full event description',
    maxLength: 2000,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(2000)
  description: string;

  @ApiProperty({
    example: 'The biggest summer music festival',
    description: 'Short description for listings',
    maxLength: 500,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  shortDescription?: string;

  @ApiProperty({
    example: 1,
    description: 'Venue ID where the event takes place',
  })
  @IsNotEmpty()
  @IsInt()
  venueId: number;

  @ApiProperty({
    example: 1,
    description: 'Event category ID',
  })
  @IsNotEmpty()
  @IsInt()
  categoryId: number;

  @ApiProperty({
    example: '2025-07-15T19:00:00Z',
    description: 'Event start date and time',
  })
  @IsNotEmpty()
  @IsDateString()
  startDateTime: string;

  @ApiProperty({
    example: '2025-07-15T23:00:00Z',
    description: 'Event end date and time',
  })
  @IsNotEmpty()
  @IsDateString()
  endDateTime: string;

  @ApiProperty({
    example: 'https://example.com/images/event.jpg',
    description: 'Event image URL',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @ApiProperty({
    example: 'https://example.com/images/banner.jpg',
    description: 'Event banner image URL',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  bannerImageUrl?: string;

  @ApiProperty({
    example: 'music,festival,summer,outdoor',
    description: 'Comma-separated tags',
    required: false,
  })
  @IsOptional()
  @IsString()
  tags?: string;

  @ApiProperty({
    example: 5000,
    description: 'Maximum attendees allowed',
    minimum: 1,
    maximum: 100000,
  })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(100000)
  maxAttendees: number;

  @ApiProperty({
    example: 49.99,
    description: 'Base ticket price',
    minimum: 0,
    maximum: 10000,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(10000)
  basePrice: number;

  @ApiProperty({
    example: 'USD',
    description: 'Currency code',
    default: 'USD',
  })
  @IsOptional()
  @IsString()
  currency?: string = 'USD';

  @ApiProperty({
    example: false,
    description: 'Is this an online event?',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isOnline?: boolean = false;

  @ApiProperty({
    example: 'https://zoom.us/j/123456789',
    description: 'Online event URL (required if isOnline=true)',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  onlineUrl?: string;
}
