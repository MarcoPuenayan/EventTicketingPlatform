import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PromoCodesService } from './promo-codes.service';
import { CreatePromoCodeDto } from '../../models/dtos/promo-codes/create-promo-code.dto';
import { UpdatePromoCodeDto } from '../../models/dtos/promo-codes/update-promo-code.dto';
import { ValidatePromoCodeDto } from '../../models/dtos/promo-codes/validate-promo-code.dto';
import { PromoCodeResponseDto } from '../../models/dtos/promo-codes/promo-code-response.dto';
import { PromoCodeValidationDto } from '../../models/dtos/promo-codes/promo-code-validation.dto';
import { PromoCodeUsageResponseDto } from '../../models/dtos/promo-codes/promo-code-usage-response.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { CurrentUser } from '../../decorators/current-user.decorator';
import { Public } from '../../decorators/public.decorator';
import { RoleType } from '../../models/entities/enums';

@ApiTags('Promo Codes')
@Controller('api/promo-codes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PromoCodesController {
  constructor(private readonly promoCodesService: PromoCodesService) {}

  @Post()
  @Roles(RoleType.Organizer)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new promo code (Organizer only)' })
  @ApiResponse({ status: 201, description: 'Promo code created successfully', type: PromoCodeResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid request' })
  @ApiResponse({ status: 403, description: 'Forbidden - Organizer role required' })
  async createPromoCode(
    @Body() createDto: CreatePromoCodeDto,
    @CurrentUser('userId') userId: number,
  ): Promise<PromoCodeResponseDto> {
    return this.promoCodesService.createPromoCode(createDto, userId);
  }

  @Get()
  @Roles(RoleType.Organizer, RoleType.Admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all promo codes (Organizer: own codes, Admin: all codes)' })
  @ApiResponse({ status: 200, description: 'List of promo codes', type: [PromoCodeResponseDto] })
  async getPromoCodes(
    @CurrentUser('userId') userId: number,
    @CurrentUser('role') role: string,
  ): Promise<PromoCodeResponseDto[]> {
    if (role === RoleType.Admin) {
      return this.promoCodesService.getAllPromoCodes(userId);
    }
    return this.promoCodesService.getOrganizerPromoCodes(userId);
  }

  @Get('stats')
  @Roles(RoleType.Organizer, RoleType.Admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get promo code statistics' })
  @ApiResponse({ status: 200, description: 'Promo code statistics' })
  async getPromoCodeStats(@CurrentUser('userId') userId: number, @CurrentUser('role') role: string): Promise<any> {
    if (role === RoleType.Admin) {
      return this.promoCodesService.getSystemPromoCodeStats(userId);
    }
    return this.promoCodesService.getOrganizerPromoCodeStats(userId);
  }

  @Get('event/:eventId')
  @Roles(RoleType.Organizer)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get promo codes for a specific event (Organizer only)' })
  @ApiResponse({ status: 200, description: 'List of promo codes for the event', type: [PromoCodeResponseDto] })
  @ApiResponse({ status: 404, description: 'Event not found or access denied' })
  async getEventPromoCodes(
    @Param('eventId', ParseIntPipe) eventId: number,
    @CurrentUser('userId') userId: number,
  ): Promise<PromoCodeResponseDto[]> {
    return this.promoCodesService.getEventPromoCodes(eventId, userId);
  }

  @Get(':id')
  @Roles(RoleType.Organizer)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get promo code by ID (Organizer only)' })
  @ApiResponse({ status: 200, description: 'Promo code details', type: PromoCodeResponseDto })
  @ApiResponse({ status: 404, description: 'Promo code not found' })
  async getPromoCode(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('userId') userId: number,
  ): Promise<PromoCodeResponseDto> {
    return this.promoCodesService.getPromoCodeById(id, userId);
  }

  @Put(':id')
  @Roles(RoleType.Organizer)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a promo code (Organizer only)' })
  @ApiResponse({ status: 200, description: 'Promo code updated successfully', type: PromoCodeResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid request or promo code already used' })
  @ApiResponse({ status: 404, description: 'Promo code not found' })
  async updatePromoCode(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdatePromoCodeDto,
    @CurrentUser('userId') userId: number,
  ): Promise<PromoCodeResponseDto> {
    return this.promoCodesService.updatePromoCode(id, updateDto, userId);
  }

  @Delete(':id')
  @Roles(RoleType.Organizer)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a promo code (Organizer only)' })
  @ApiResponse({ status: 204, description: 'Promo code deleted successfully' })
  @ApiResponse({ status: 404, description: 'Promo code not found' })
  async deletePromoCode(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('userId') userId: number,
  ): Promise<void> {
    const result = await this.promoCodesService.deletePromoCode(id, userId);
    if (!result) {
      throw new ForbiddenException('Promo code not found');
    }
  }

  @Get(':id/analytics')
  @Roles(RoleType.Organizer)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get analytics for a specific promo code (Organizer only)' })
  @ApiResponse({ status: 200, description: 'Promo code analytics' })
  @ApiResponse({ status: 404, description: 'Promo code not found' })
  async getPromoCodeAnalytics(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('userId') userId: number,
  ): Promise<any> {
    return this.promoCodesService.getPromoCodeAnalytics(id, userId);
  }

  @Get(':id/usage-history')
  @Roles(RoleType.Organizer)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get usage history for a specific promo code (Organizer only)' })
  @ApiResponse({ status: 200, description: 'Promo code usage history', type: [PromoCodeUsageResponseDto] })
  @ApiResponse({ status: 404, description: 'Promo code not found' })
  async getPromoCodeUsageHistory(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('userId') userId: number,
  ): Promise<PromoCodeUsageResponseDto[]> {
    return this.promoCodesService.getPromoCodeUsageHistory(id, userId);
  }

  // Customer-facing endpoint
  @Post('validate')
  @Public()
  @ApiOperation({ summary: 'Validate a promo code (Public endpoint)' })
  @ApiResponse({ status: 200, description: 'Promo code validation result', type: PromoCodeValidationDto })
  @ApiResponse({ status: 400, description: 'Invalid request' })
  async validatePromoCode(
    @Body() validateDto: ValidatePromoCodeDto,
    @CurrentUser('userId') userId?: number,
  ): Promise<PromoCodeValidationDto> {
    // If user is not authenticated, userId will be undefined, use 0
    const userIdForValidation = userId || 0;
    return this.promoCodesService.validatePromoCode(
      validateDto.code,
      validateDto.eventId,
      validateDto.orderSubtotal,
      userIdForValidation,
    );
  }
}
