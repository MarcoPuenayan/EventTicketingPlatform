import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export enum PromoCodeType {
  Percentage = 'Percentage',
  FixedAmount = 'FixedAmount',
}

export enum PromoCodeScope {
  Global = 'Global',
  Event = 'Event',
}

export class CreatePromoCodeDto {
  @ApiProperty({
    example: 'SUMMER2025',
    description: 'Promo code (uppercase letters and numbers only)',
    maxLength: 50,
    pattern: '^[A-Z0-9]+$',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  @Matches(/^[A-Z0-9]+$/, {
    message: 'Promo code must contain only uppercase letters and numbers',
  })
  code: string;

  @ApiProperty({
    example: 'Summer festival discount',
    description: 'Promo code description',
    maxLength: 200,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  description?: string;

  @ApiProperty({
    enum: PromoCodeType,
    example: PromoCodeType.Percentage,
    description: 'Type of discount (Percentage or FixedAmount)',
  })
  @IsNotEmpty()
  @IsEnum(PromoCodeType)
  type: PromoCodeType;

  @ApiProperty({
    example: 15,
    description: 'Discount value (percentage or fixed amount)',
    minimum: 0.01,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0.01)
  value: number;

  @ApiProperty({
    example: 50,
    description: 'Minimum order amount to apply discount',
    minimum: 0,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minimumOrderAmount?: number;

  @ApiProperty({
    example: 100,
    description: 'Maximum discount amount that can be applied',
    minimum: 0,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maximumDiscountAmount?: number;

  @ApiProperty({
    enum: PromoCodeScope,
    example: PromoCodeScope.Event,
    description: 'Scope of promo code (Global or Event-specific)',
  })
  @IsNotEmpty()
  @IsEnum(PromoCodeScope)
  scope: PromoCodeScope;

  @ApiProperty({
    example: 1,
    description: 'Event ID (required if scope is Event)',
    required: false,
  })
  @IsOptional()
  @IsInt()
  eventId?: number;

  @ApiProperty({
    example: '2025-01-01T00:00:00Z',
    description: 'When promo code becomes active',
  })
  @IsNotEmpty()
  @IsDateString()
  startDate: string;

  @ApiProperty({
    example: '2025-12-31T23:59:59Z',
    description: 'When promo code expires',
  })
  @IsNotEmpty()
  @IsDateString()
  endDate: string;

  @ApiProperty({
    example: 100,
    description: 'Maximum total uses allowed',
    minimum: 1,
    maximum: 10000,
    default: 100,
  })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(10000)
  maxUsageCount: number = 100;

  @ApiProperty({
    example: 1,
    description: 'Maximum uses per user',
    minimum: 1,
    maximum: 50,
    default: 1,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  maxUsagePerUser?: number = 1;
}
