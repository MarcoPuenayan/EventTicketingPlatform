import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PromoCodeResponseDto {
  @ApiProperty({ description: 'Promo code ID', example: 1 })
  promoCodeId: number;

  @ApiProperty({ description: 'Promo code', example: 'SUMMER2024' })
  code: string;

  @ApiProperty({ description: 'Promo code description', example: 'Summer sale - 20% off all events' })
  description: string;

  @ApiProperty({ description: 'Promo code type (Percentage or FixedAmount)', example: 'Percentage' })
  type: string;

  @ApiProperty({ description: 'Discount value (percentage or fixed amount)', example: 20 })
  value: number;

  @ApiProperty({ description: 'Formatted value for display', example: '20% off' })
  formattedValue: string;

  @ApiPropertyOptional({ description: 'Minimum order amount required', example: 50.0 })
  minimumOrderAmount?: number;

  @ApiPropertyOptional({ description: 'Maximum discount amount cap', example: 100.0 })
  maximumDiscountAmount?: number;

  @ApiProperty({ description: 'Promo code scope (Global, OrganizerWide, EventSpecific)', example: 'EventSpecific' })
  scope: string;

  @ApiProperty({ description: 'Organizer ID who created the promo code', example: 5 })
  organizerId: number;

  @ApiPropertyOptional({ description: 'Organizer name', example: 'John Doe' })
  organizerName?: string;

  @ApiPropertyOptional({ description: 'Event ID (for event-specific codes)', example: 10 })
  eventId?: number;

  @ApiPropertyOptional({ description: 'Event title (for event-specific codes)', example: 'Summer Music Festival' })
  eventTitle?: string;

  @ApiProperty({ description: 'Promo code start date', example: '2024-06-01T00:00:00Z' })
  startDate: Date;

  @ApiProperty({ description: 'Promo code end date', example: '2024-08-31T23:59:59Z' })
  endDate: Date;

  @ApiProperty({ description: 'Maximum total usage count', example: 100 })
  maxUsageCount: number;

  @ApiProperty({ description: 'Current usage count', example: 25 })
  currentUsageCount: number;

  @ApiProperty({ description: 'Remaining usage count', example: 75 })
  remainingUsageCount: number;

  @ApiPropertyOptional({ description: 'Maximum usage per user', example: 1 })
  maxUsagePerUser?: number;

  @ApiProperty({ description: 'Promo code status (Active, Inactive, Expired)', example: 'Active' })
  status: string;

  @ApiProperty({ description: 'Whether the promo code is active', example: true })
  isActive: boolean;

  @ApiProperty({ description: 'Whether the promo code is currently valid', example: true })
  isValid: boolean;

  @ApiPropertyOptional({ description: 'Reason if promo code is invalid', example: 'Expired' })
  invalidReason?: string;

  @ApiProperty({ description: 'Creation timestamp', example: '2024-05-15T10:00:00Z' })
  createdAt: Date;

  @ApiPropertyOptional({ description: 'Last update timestamp', example: '2024-05-20T14:30:00Z' })
  updatedAt?: Date;
}
