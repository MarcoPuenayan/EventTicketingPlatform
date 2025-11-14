import { ApiProperty } from '@nestjs/swagger';

export class RevenueAnalyticsDto {
  @ApiProperty({ example: 125000.50 })
  totalRevenue: number;

  @ApiProperty({ example: 3250 })
  totalAttendees: number;

  @ApiProperty({ example: 15 })
  activeEvents: number;

  @ApiProperty({ example: 8 })
  totalVenues: number;

  @ApiProperty({ type: [EventRevenueDto] })
  events: EventRevenueDto[];
}

export class EventRevenueDto {
  @ApiProperty({ example: 1 })
  eventId: number;

  @ApiProperty({ example: 'Summer Music Festival 2025' })
  eventName: string;

  @ApiProperty({ example: 45000.00 })
  totalRevenue: number;

  @ApiProperty({ example: 900 })
  attendeeCount: number;

  @ApiProperty({ example: 1200 })
  ticketsSold: number;
}

export class PaymentMethodDto {
  @ApiProperty({ example: 'CreditCard' })
  paymentMethod: string;

  @ApiProperty({ example: 250 })
  orderCount: number;

  @ApiProperty({ example: 65.5 })
  percentage: number;

  @ApiProperty({ example: 82000.00 })
  totalAmount: number;
}

export class CapacityEventDto {
  @ApiProperty({ example: 1 })
  eventId: number;

  @ApiProperty({ example: 'Summer Music Festival 2025' })
  eventName: string;

  @ApiProperty({ example: 5000 })
  maxCapacity: number;

  @ApiProperty({ example: 3750 })
  ticketsSold: number;

  @ApiProperty({ example: 75.0 })
  utilizationPercentage: number;
}

export class CheckInHourlyDto {
  @ApiProperty({ example: '18:00' })
  hour: string;

  @ApiProperty({ example: 245 })
  checkInCount: number;

  @ApiProperty({ example: 245 })
  cumulativeCount: number;
}

export class SeasonalTrendDto {
  @ApiProperty({ example: 'July 2025' })
  month: string;

  @ApiProperty({ example: 8 })
  eventCount: number;

  @ApiProperty({ example: 125000.00 })
  totalRevenue: number;

  @ApiProperty({ example: 2500 })
  totalAttendance: number;
}
