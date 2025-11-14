import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import {
  RevenueAnalyticsDto,
  PaymentMethodAnalyticsDto,
  CapacityAnalyticsDto,
  DemographicsAnalyticsDto,
  CheckInAnalyticsDto,
  VenueAnalyticsDto,
  SeasonalAnalyticsDto,
  LowAttendanceAnalyticsDto,
} from '../../models/dtos/analytics';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { CurrentUser } from '../../decorators/current-user.decorator';
import { RoleType } from '../../models/entities/enums';

@ApiTags('Analytics')
@Controller('api/analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('revenue-by-event')
  @Roles(RoleType.Organizer, RoleType.Admin)
  @ApiOperation({ summary: 'Get revenue analytics by event' })
  @ApiResponse({ status: 200, description: 'Revenue analytics data', type: RevenueAnalyticsDto })
  @ApiQuery({ name: 'period', required: false, enum: ['last7days', 'last30days', 'last3months', 'last6months', 'lastyear'] })
  async getRevenueByEvent(
    @CurrentUser('userId') userId: number,
    @Query('period') period: string = 'last30days',
  ): Promise<RevenueAnalyticsDto> {
    return this.analyticsService.getRevenueAnalytics(userId, period);
  }

  @Get('payment-methods')
  @Roles(RoleType.Organizer, RoleType.Admin)
  @ApiOperation({ summary: 'Get payment method analytics' })
  @ApiResponse({ status: 200, description: 'Payment method distribution', type: PaymentMethodAnalyticsDto })
  @ApiQuery({ name: 'period', required: false, enum: ['last7days', 'last30days', 'last3months', 'last6months', 'lastyear'] })
  async getPaymentMethodAnalytics(
    @CurrentUser('userId') userId: number,
    @Query('period') period: string = 'last30days',
  ): Promise<PaymentMethodAnalyticsDto> {
    return this.analyticsService.getPaymentMethodAnalytics(userId, period);
  }

  @Get('event-capacity')
  @Roles(RoleType.Organizer, RoleType.Admin)
  @ApiOperation({ summary: 'Get event capacity analytics' })
  @ApiResponse({ status: 200, description: 'Event capacity utilization', type: CapacityAnalyticsDto })
  @ApiQuery({ name: 'period', required: false, enum: ['last7days', 'last30days', 'last3months', 'last6months', 'lastyear'] })
  async getEventCapacityAnalytics(
    @CurrentUser('userId') userId: number,
    @Query('period') period: string = 'last30days',
  ): Promise<CapacityAnalyticsDto> {
    return this.analyticsService.getCapacityAnalytics(userId, period);
  }

  @Get('attendee-demographics')
  @Roles(RoleType.Organizer, RoleType.Admin)
  @ApiOperation({ summary: 'Get attendee demographics analytics' })
  @ApiResponse({ status: 200, description: 'Attendee demographics data', type: DemographicsAnalyticsDto })
  @ApiQuery({ name: 'period', required: false, enum: ['last7days', 'last30days', 'last3months', 'last6months', 'lastyear'] })
  async getAttendeeDemographics(
    @CurrentUser('userId') userId: number,
    @Query('period') period: string = 'last30days',
  ): Promise<DemographicsAnalyticsDto> {
    return this.analyticsService.getDemographicsAnalytics(userId, period);
  }

  @Get('check-in-patterns')
  @Roles(RoleType.Organizer, RoleType.Admin)
  @ApiOperation({ summary: 'Get check-in patterns analytics' })
  @ApiResponse({ status: 200, description: 'Check-in patterns data', type: CheckInAnalyticsDto })
  @ApiQuery({ name: 'period', required: false, enum: ['last7days', 'last30days', 'last3months', 'last6months', 'lastyear'] })
  async getCheckInAnalytics(
    @CurrentUser('userId') userId: number,
    @Query('period') period: string = 'last30days',
  ): Promise<CheckInAnalyticsDto> {
    return this.analyticsService.getCheckInAnalytics(userId, period);
  }

  @Get('venue-performance')
  @Roles(RoleType.Organizer, RoleType.Admin)
  @ApiOperation({ summary: 'Get venue performance analytics' })
  @ApiResponse({ status: 200, description: 'Venue performance data', type: VenueAnalyticsDto })
  @ApiQuery({ name: 'period', required: false, enum: ['last7days', 'last30days', 'last3months', 'last6months', 'lastyear'] })
  async getVenuePerformance(
    @CurrentUser('userId') userId: number,
    @Query('period') period: string = 'last30days',
  ): Promise<VenueAnalyticsDto> {
    return this.analyticsService.getVenueAnalytics(userId, period);
  }

  @Get('seasonal-trends')
  @Roles(RoleType.Organizer, RoleType.Admin)
  @ApiOperation({ summary: 'Get seasonal trends analytics (last 12 months)' })
  @ApiResponse({ status: 200, description: 'Seasonal trends data', type: SeasonalAnalyticsDto })
  async getSeasonalTrends(@CurrentUser('userId') userId: number): Promise<SeasonalAnalyticsDto> {
    return this.analyticsService.getSeasonalTrends(userId);
  }

  @Get('low-attendance-events')
  @Roles(RoleType.Organizer, RoleType.Admin)
  @ApiOperation({ summary: 'Get low attendance events with recommendations' })
  @ApiResponse({ status: 200, description: 'Low attendance events data', type: LowAttendanceAnalyticsDto })
  async getLowAttendanceEvents(@CurrentUser('userId') userId: number): Promise<LowAttendanceAnalyticsDto> {
    return this.analyticsService.getLowAttendanceEvents(userId);
  }
}
