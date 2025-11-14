import { ApiProperty } from '@nestjs/swagger';

export class EventRevenueDto {
  @ApiProperty({ description: 'Event ID', example: 1 })
  eventId: number;

  @ApiProperty({ description: 'Event name', example: 'Summer Music Festival' })
  eventName: string;

  @ApiProperty({ description: 'Total revenue from this event', example: 15000.0 })
  totalRevenue: number;

  @ApiProperty({ description: 'Number of tickets sold', example: 150 })
  ticketsSold: number;

  @ApiProperty({ description: 'Total attendee count', example: 150 })
  attendeeCount: number;
}

export class RevenueAnalyticsDto {
  @ApiProperty({ description: 'Total revenue across all events', example: 50000.0 })
  totalRevenue: number;

  @ApiProperty({ description: 'Total attendees across all events', example: 500 })
  totalAttendees: number;

  @ApiProperty({ description: 'Number of active (published) events', example: 10 })
  activeEvents: number;

  @ApiProperty({ description: 'Total number of venues used', example: 5 })
  totalVenues: number;

  @ApiProperty({ description: 'Revenue breakdown by event', type: [EventRevenueDto] })
  events: EventRevenueDto[];
}

export class PaymentMethodDto {
  @ApiProperty({ description: 'Payment method name', example: 'Credit Card' })
  paymentMethod: string;

  @ApiProperty({ description: 'Number of orders using this method', example: 65 })
  orderCount: number;

  @ApiProperty({ description: 'Total amount paid via this method', example: 32500.0 })
  totalAmount: number;

  @ApiProperty({ description: 'Percentage of total orders', example: 65 })
  percentage: number;
}

export class PaymentMethodAnalyticsDto {
  @ApiProperty({ description: 'Payment methods distribution', type: [PaymentMethodDto] })
  methods: PaymentMethodDto[];
}

export class CapacityEventDto {
  @ApiProperty({ description: 'Event ID', example: 1 })
  eventId: number;

  @ApiProperty({ description: 'Event name', example: 'Tech Conference 2024' })
  eventName: string;

  @ApiProperty({ description: 'Maximum capacity', example: 500 })
  maxCapacity: number;

  @ApiProperty({ description: 'Tickets sold', example: 420 })
  ticketsSold: number;

  @ApiProperty({ description: 'Capacity utilization percentage', example: 84.0 })
  utilizationPercentage: number;
}

export class CapacityAnalyticsDto {
  @ApiProperty({ description: 'Event capacity data', type: [CapacityEventDto] })
  events: CapacityEventDto[];
}

export class AgeGroupDto {
  @ApiProperty({ description: 'Age group range', example: '26-35' })
  ageGroup: string;

  @ApiProperty({ description: 'Number of attendees in this age group', example: 120 })
  count: number;

  @ApiProperty({ description: 'Percentage of total attendees', example: 40.0 })
  percentage: number;
}

export class GenderDistributionDto {
  @ApiProperty({ description: 'Gender category', example: 'Male' })
  gender: string;

  @ApiProperty({ description: 'Number of attendees', example: 150 })
  count: number;

  @ApiProperty({ description: 'Percentage of total attendees', example: 50.0 })
  percentage: number;
}

export class DemographicsAnalyticsDto {
  @ApiProperty({ description: 'Age distribution', type: [AgeGroupDto] })
  ageDistribution: AgeGroupDto[];

  @ApiProperty({ description: 'Gender distribution', type: [GenderDistributionDto] })
  genderDistribution: GenderDistributionDto[];
}

export class CheckInHourlyDto {
  @ApiProperty({ description: 'Hour of the day', example: '14:00' })
  hour: string;

  @ApiProperty({ description: 'Number of check-ins in this hour', example: 25 })
  checkInCount: number;

  @ApiProperty({ description: 'Cumulative check-in count', example: 150 })
  cumulativeCount: number;
}

export class CheckInAnalyticsDto {
  @ApiProperty({ description: 'Hourly check-in pattern', type: [CheckInHourlyDto] })
  hourlyPattern: CheckInHourlyDto[];

  @ApiProperty({ description: 'Total check-ins recorded', example: 450 })
  totalCheckIns: number;

  @ApiProperty({ description: 'Total tickets sold', example: 500 })
  totalTicketsSold: number;

  @ApiProperty({ description: 'Attendance rate percentage', example: 90.0 })
  attendanceRate: number;
}

export class VenuePerformanceDto {
  @ApiProperty({ description: 'Venue ID', example: 1 })
  venueId: number;

  @ApiProperty({ description: 'Venue name', example: 'Madison Square Garden' })
  venueName: string;

  @ApiProperty({ description: 'Number of events held at this venue', example: 15 })
  eventCount: number;

  @ApiProperty({ description: 'Average attendance per event', example: 350 })
  avgAttendance: number;

  @ApiProperty({ description: 'Total revenue from this venue', example: 75000.0 })
  totalRevenue: number;

  @ApiProperty({ description: 'Average rating for events at this venue', example: 4.5 })
  avgRating: number;
}

export class VenueAnalyticsDto {
  @ApiProperty({ description: 'Venue performance data', type: [VenuePerformanceDto] })
  performance: VenuePerformanceDto[];
}

export class SeasonalTrendDto {
  @ApiProperty({ description: 'Month and year', example: 'Jun 2024' })
  month: string;

  @ApiProperty({ description: 'Number of events in this month', example: 8 })
  eventCount: number;

  @ApiProperty({ description: 'Total revenue for this month', example: 25000.0 })
  totalRevenue: number;

  @ApiProperty({ description: 'Total attendance for this month', example: 250 })
  totalAttendance: number;
}

export class SeasonalAnalyticsDto {
  @ApiProperty({ description: 'Monthly trends data', type: [SeasonalTrendDto] })
  monthlyTrends: SeasonalTrendDto[];
}

export class TicketTypeDataDto {
  @ApiProperty({ description: 'Ticket type name', example: 'VIP' })
  typeName: string;

  @ApiProperty({ description: 'Ticket price', example: 150.0 })
  price: number;

  @ApiProperty({ description: 'Number of tickets sold', example: 25 })
  sold: number;
}

export class LowAttendanceEventDto {
  @ApiProperty({ description: 'Event ID', example: 5 })
  eventId: number;

  @ApiProperty({ description: 'Event name', example: 'Jazz Night' })
  eventName: string;

  @ApiProperty({ description: 'Maximum capacity', example: 200 })
  maxCapacity: number;

  @ApiProperty({ description: 'Tickets sold', example: 45 })
  ticketsSold: number;

  @ApiProperty({ description: 'Capacity utilization percentage', example: 22.5 })
  utilizationPercentage: number;

  @ApiProperty({ description: 'Days until event', example: 15 })
  daysUntilEvent: number;

  @ApiProperty({ description: 'Ticket types for this event', type: [TicketTypeDataDto] })
  ticketTypes: TicketTypeDataDto[];

  @ApiProperty({ description: 'Potential issues identified', type: [String], example: ['Very low ticket sales', 'Poor marketing reach'] })
  potentialIssues: string[];

  @ApiProperty({ description: 'Recommended actions', type: [String], example: ['Consider reducing ticket prices', 'Increase marketing budget'] })
  recommendations: string[];
}

export class LowAttendanceAnalyticsDto {
  @ApiProperty({ description: 'Events with low attendance', type: [LowAttendanceEventDto] })
  events: LowAttendanceEventDto[];
}
