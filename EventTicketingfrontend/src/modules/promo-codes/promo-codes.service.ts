import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PromoCode } from '../../models/entities/promo-code.entity';
import { PromoCodeUsage } from '../../models/entities/promo-code-usage.entity';
import { Event } from '../../models/entities/event.entity';
import { User } from '../../models/entities/user.entity';
import { CreatePromoCodeDto } from '../../models/dtos/promo-codes/create-promo-code.dto';
import { UpdatePromoCodeDto } from '../../models/dtos/promo-codes/update-promo-code.dto';
import { PromoCodeResponseDto } from '../../models/dtos/promo-codes/promo-code-response.dto';
import { PromoCodeValidationDto } from '../../models/dtos/promo-codes/promo-code-validation.dto';
import { PromoCodeUsageResponseDto } from '../../models/dtos/promo-codes/promo-code-usage-response.dto';
import { PromoCodeType, PromoCodeScope, PromoCodeStatus } from '../../models/entities/enums';
import { RoleType } from '../../models/entities/enums';

@Injectable()
export class PromoCodesService {
  constructor(
    @InjectRepository(PromoCode)
    private readonly promoCodeRepository: Repository<PromoCode>,
    @InjectRepository(PromoCodeUsage)
    private readonly promoCodeUsageRepository: Repository<PromoCodeUsage>,
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createPromoCode(createDto: CreatePromoCodeDto, organizerId: number): Promise<PromoCodeResponseDto> {
    // Verify organizer has Organizer role
    const organizer = await this.userRepository.findOne({
      where: { userId: organizerId },
      relations: ['userRoles'],
    });

    if (!organizer || !organizer.userRoles.some(ur => ur.role === RoleType.Organizer && ur.isActive)) {
      throw new ForbiddenException('Only organizers can create promo codes');
    }

    // Check for duplicate code
    const existingCode = await this.promoCodeRepository.findOne({
      where: { code: createDto.code.toUpperCase() },
    });

    if (existingCode) {
      throw new BadRequestException(`Promo code '${createDto.code}' already exists. Please choose a different code.`);
    }

    // Validate event-specific scope
    if (createDto.scope === PromoCodeScope.EventSpecific) {
      if (!createDto.eventId) {
        throw new BadRequestException('Event ID is required for event-specific promo codes');
      }

      const event = await this.eventRepository.findOne({ where: { eventId: createDto.eventId } });
      if (!event) {
        throw new NotFoundException('Event not found');
      }

      if (event.organizerId !== organizerId) {
        throw new ForbiddenException('You can only create promo codes for your own events');
      }
    }

    // Validate dates
    if (createDto.startDate >= createDto.endDate) {
      throw new BadRequestException('End date must be after start date');
    }

    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const startDate = new Date(createDto.startDate);
    startDate.setHours(0, 0, 0, 0);

    if (startDate < now) {
      throw new BadRequestException('Start date cannot be in the past');
    }

    // Validate percentage value
    if (createDto.type === PromoCodeType.Percentage && (createDto.value <= 0 || createDto.value > 100)) {
      throw new BadRequestException('Percentage value must be between 0.01 and 100');
    }

    // Create promo code
    const promoCode = this.promoCodeRepository.create({
      code: createDto.code.toUpperCase(),
      description: createDto.description,
      type: createDto.type,
      value: createDto.value,
      minimumOrderAmount: createDto.minimumOrderAmount,
      maximumDiscountAmount: createDto.maximumDiscountAmount,
      scope: createDto.scope,
      organizerId,
      eventId: createDto.scope === PromoCodeScope.EventSpecific ? createDto.eventId : null,
      startDate: createDto.startDate,
      endDate: createDto.endDate,
      maxUsageCount: createDto.maxUsageCount,
      maxUsagePerUser: createDto.maxUsagePerUser,
      createdAt: new Date(),
    });

    const savedPromoCode = await this.promoCodeRepository.save(promoCode);
    return this.getPromoCodeById(savedPromoCode.promoCodeId, organizerId);
  }

  async validatePromoCode(
    code: string,
    eventId: number,
    orderSubtotal: number,
    userId: number,
  ): Promise<PromoCodeValidationDto> {
    const promoCode = await this.promoCodeRepository.findOne({
      where: { code: code.toUpperCase() },
      relations: ['organizer', 'event', 'promoCodeUsages'],
    });

    if (!promoCode) {
      return {
        isValid: false,
        message: 'Promo code not found',
        discountAmount: 0,
        formattedDiscount: '$0.00',
      };
    }

    // Check if active
    if (!promoCode.isActive || promoCode.status !== PromoCodeStatus.Active) {
      return {
        isValid: false,
        message: 'This promo code is no longer active',
        discountAmount: 0,
        formattedDiscount: '$0.00',
      };
    }

    // Check date range
    const now = new Date();
    if (now < promoCode.startDate) {
      const startDateStr = promoCode.startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      return {
        isValid: false,
        message: `This promo code will be valid from ${startDateStr}`,
        discountAmount: 0,
        formattedDiscount: '$0.00',
      };
    }

    if (now > promoCode.endDate) {
      return {
        isValid: false,
        message: 'This promo code has expired',
        discountAmount: 0,
        formattedDiscount: '$0.00',
      };
    }

    // Check usage limits
    if (promoCode.currentUsageCount >= promoCode.maxUsageCount) {
      return {
        isValid: false,
        message: 'This promo code has reached its usage limit',
        discountAmount: 0,
        formattedDiscount: '$0.00',
      };
    }

    // Check per-user usage limit
    if (promoCode.maxUsagePerUser && userId > 0) {
      const userUsageCount = promoCode.promoCodeUsages.filter(u => u.userId === userId).length;
      if (userUsageCount >= promoCode.maxUsagePerUser) {
        return {
          isValid: false,
          message: 'You have already used this promo code the maximum number of times',
          discountAmount: 0,
          formattedDiscount: '$0.00',
        };
      }
    }

    // Check minimum order amount
    if (promoCode.minimumOrderAmount && orderSubtotal < promoCode.minimumOrderAmount) {
      return {
        isValid: false,
        message: `Minimum order amount of $${promoCode.minimumOrderAmount.toFixed(2)} required`,
        discountAmount: 0,
        formattedDiscount: '$0.00',
      };
    }

    // Validate event
    const event = await this.eventRepository.findOne({ where: { eventId } });
    if (!event) {
      return {
        isValid: false,
        message: 'Invalid event',
        discountAmount: 0,
        formattedDiscount: '$0.00',
      };
    }

    // Check scope
    switch (promoCode.scope) {
      case PromoCodeScope.EventSpecific:
        if (promoCode.eventId !== eventId) {
          return {
            isValid: false,
            message: 'This promo code is not valid for this event',
            discountAmount: 0,
            formattedDiscount: '$0.00',
          };
        }
        break;

      case PromoCodeScope.OrganizerWide:
        if (promoCode.organizerId !== event.organizerId) {
          return {
            isValid: false,
            message: 'This promo code is not valid for events by this organizer',
            discountAmount: 0,
            formattedDiscount: '$0.00',
          };
        }
        break;

      case PromoCodeScope.Global:
        // No additional validation needed for global scope
        break;
    }

    // Calculate discount
    const discountAmount = this.calculateDiscount(promoCode, orderSubtotal);

    return {
      isValid: true,
      message: 'Promo code applied successfully!',
      discountAmount,
      formattedDiscount: `$${discountAmount.toFixed(2)}`,
      promoCode: this.mapToResponseDto(promoCode),
    };
  }

  async calculateDiscountAmount(code: string, eventId: number, orderSubtotal: number, userId: number): Promise<number> {
    const validation = await this.validatePromoCode(code, eventId, orderSubtotal, userId);
    return validation.isValid ? validation.discountAmount : 0;
  }

  private calculateDiscount(promoCode: PromoCode, orderSubtotal: number): number {
    let discount = 0;

    switch (promoCode.type) {
      case PromoCodeType.Percentage:
        discount = orderSubtotal * (promoCode.value / 100);
        break;

      case PromoCodeType.FixedAmount:
        discount = Math.min(promoCode.value, orderSubtotal);
        break;
    }

    // Apply maximum discount limit if specified
    if (promoCode.maximumDiscountAmount) {
      discount = Math.min(discount, promoCode.maximumDiscountAmount);
    }

    return discount;
  }

  async recordPromoCodeUsage(
    code: string,
    orderId: number,
    eventId: number,
    discountAmount: number,
    orderSubtotal: number,
    userId: number,
  ): Promise<PromoCodeUsageResponseDto> {
    const promoCode = await this.promoCodeRepository.findOne({
      where: { code: code.toUpperCase() },
    });

    if (!promoCode) {
      throw new NotFoundException('Promo code not found');
    }

    // Record usage
    const usage = this.promoCodeUsageRepository.create({
      promoCodeId: promoCode.promoCodeId,
      orderId,
      userId,
      eventId,
      discountAmount,
      orderSubtotal,
      usedAt: new Date(),
    });

    const savedUsage = await this.promoCodeUsageRepository.save(usage);

    // Update usage count
    promoCode.currentUsageCount++;
    await this.promoCodeRepository.save(promoCode);

    return this.getUsageById(savedUsage.promoCodeUsageId);
  }

  async getOrganizerPromoCodes(organizerId: number): Promise<PromoCodeResponseDto[]> {
    const promoCodes = await this.promoCodeRepository.find({
      where: { organizerId },
      relations: ['event'],
      order: { createdAt: 'DESC' },
    });

    return promoCodes.map(pc => this.mapToResponseDto(pc));
  }

  async getAllPromoCodes(adminId: number): Promise<PromoCodeResponseDto[]> {
    // Verify admin role (this should be checked by guard, but double-check)
    const promoCodes = await this.promoCodeRepository.find({
      relations: ['event', 'organizer'],
      order: { createdAt: 'DESC' },
    });

    return promoCodes.map(pc => this.mapToResponseDto(pc));
  }

  async getEventPromoCodes(eventId: number, organizerId: number): Promise<PromoCodeResponseDto[]> {
    // Verify organizer owns the event
    const event = await this.eventRepository.findOne({ where: { eventId } });
    if (!event || event.organizerId !== organizerId) {
      throw new NotFoundException('Event not found or access denied');
    }

    // Get event-specific and organizer-wide promo codes
    const promoCodes = await this.promoCodeRepository.find({
      where: [
        { organizerId, eventId },
        { organizerId, scope: PromoCodeScope.OrganizerWide },
      ],
      relations: ['event'],
      order: { createdAt: 'DESC' },
    });

    return promoCodes.map(pc => this.mapToResponseDto(pc));
  }

  async getPromoCodeById(promoCodeId: number, organizerId: number): Promise<PromoCodeResponseDto> {
    const promoCode = await this.promoCodeRepository.findOne({
      where: { promoCodeId, organizerId },
      relations: ['event', 'organizer'],
    });

    if (!promoCode) {
      throw new NotFoundException('Promo code not found');
    }

    return this.mapToResponseDto(promoCode);
  }

  async updatePromoCode(
    promoCodeId: number,
    updateDto: UpdatePromoCodeDto,
    organizerId: number,
  ): Promise<PromoCodeResponseDto> {
    const promoCode = await this.promoCodeRepository.findOne({
      where: { promoCodeId, organizerId },
    });

    if (!promoCode) {
      throw new NotFoundException('Promo code not found');
    }

    if (promoCode.currentUsageCount > 0) {
      throw new BadRequestException('Cannot modify promo code that has already been used');
    }

    // Update fields
    if (updateDto.description !== undefined) {
      promoCode.description = updateDto.description;
    }

    if (updateDto.type !== undefined) {
      promoCode.type = updateDto.type;
    }

    if (updateDto.value !== undefined) {
      if (updateDto.type === PromoCodeType.Percentage && (updateDto.value <= 0 || updateDto.value > 100)) {
        throw new BadRequestException('Percentage value must be between 0.01 and 100');
      }
      promoCode.value = updateDto.value;
    }

    if (updateDto.minimumOrderAmount !== undefined) {
      promoCode.minimumOrderAmount = updateDto.minimumOrderAmount;
    }

    if (updateDto.maximumDiscountAmount !== undefined) {
      promoCode.maximumDiscountAmount = updateDto.maximumDiscountAmount;
    }

    if (updateDto.startDate !== undefined) {
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const startDate = new Date(updateDto.startDate);
      startDate.setHours(0, 0, 0, 0);

      if (startDate < now) {
        throw new BadRequestException('Start date cannot be in the past');
      }
      promoCode.startDate = updateDto.startDate;
    }

    if (updateDto.endDate !== undefined) {
      promoCode.endDate = updateDto.endDate;
    }

    if (updateDto.maxUsageCount !== undefined) {
      promoCode.maxUsageCount = updateDto.maxUsageCount;
    }

    if (updateDto.maxUsagePerUser !== undefined) {
      promoCode.maxUsagePerUser = updateDto.maxUsagePerUser;
    }

    if (updateDto.status !== undefined) {
      promoCode.status = updateDto.status;
    }

    if (updateDto.isActive !== undefined) {
      promoCode.isActive = updateDto.isActive;
    }

    // Validate date range
    if (promoCode.startDate >= promoCode.endDate) {
      throw new BadRequestException('End date must be after start date');
    }

    promoCode.updatedAt = new Date();
    await this.promoCodeRepository.save(promoCode);

    return this.getPromoCodeById(promoCodeId, organizerId);
  }

  async deletePromoCode(promoCodeId: number, organizerId: number): Promise<boolean> {
    const promoCode = await this.promoCodeRepository.findOne({
      where: { promoCodeId, organizerId },
      relations: ['promoCodeUsages'],
    });

    if (!promoCode) {
      return false;
    }

    // If promo code has been used, deactivate instead of delete
    if (promoCode.promoCodeUsages && promoCode.promoCodeUsages.length > 0) {
      promoCode.isActive = false;
      promoCode.status = PromoCodeStatus.Inactive;
      promoCode.updatedAt = new Date();
      await this.promoCodeRepository.save(promoCode);
    } else {
      await this.promoCodeRepository.remove(promoCode);
    }

    return true;
  }

  async getPromoCodeAnalytics(promoCodeId: number, organizerId: number): Promise<any> {
    const promoCode = await this.promoCodeRepository.findOne({
      where: { promoCodeId, organizerId },
      relations: ['promoCodeUsages', 'promoCodeUsages.order', 'promoCodeUsages.event'],
    });

    if (!promoCode) {
      throw new NotFoundException('Promo code not found');
    }

    const usages = promoCode.promoCodeUsages || [];
    const totalDiscountGiven = usages.reduce((sum, u) => sum + u.discountAmount, 0);
    const totalOrderValue = usages.reduce((sum, u) => sum + u.orderSubtotal, 0);
    const averageDiscountAmount = usages.length > 0 ? totalDiscountGiven / usages.length : 0;
    const conversionRate = promoCode.maxUsageCount > 0 ? (promoCode.currentUsageCount / promoCode.maxUsageCount) * 100 : 0;

    // Usage by day
    const usageByDay = usages.reduce((acc, usage) => {
      const date = usage.usedAt.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { date, usages: 0, totalDiscount: 0, totalOrderValue: 0 };
      }
      acc[date].usages++;
      acc[date].totalDiscount += usage.discountAmount;
      acc[date].totalOrderValue += usage.orderSubtotal;
      return acc;
    }, {} as Record<string, any>);

    // Usage by event
    const usageByEvent = usages.reduce((acc, usage) => {
      const key = `${usage.event.eventId}`;
      if (!acc[key]) {
        acc[key] = {
          eventId: usage.event.eventId,
          eventTitle: usage.event.title,
          usages: 0,
          totalDiscount: 0,
          totalOrderValue: 0,
        };
      }
      acc[key].usages++;
      acc[key].totalDiscount += usage.discountAmount;
      acc[key].totalOrderValue += usage.orderSubtotal;
      return acc;
    }, {} as Record<string, any>);

    return {
      promoCodeId: promoCode.promoCodeId,
      code: promoCode.code,
      totalUsages: promoCode.currentUsageCount,
      maxUsages: promoCode.maxUsageCount,
      remainingUsages: promoCode.maxUsageCount - promoCode.currentUsageCount,
      totalDiscountGiven,
      averageDiscountAmount,
      totalOrderValue,
      conversionRate,
      usageByDay: Object.values(usageByDay).sort((a: any, b: any) => a.date.localeCompare(b.date)),
      usageByEvent: Object.values(usageByEvent).sort((a: any, b: any) => b.usages - a.usages),
    };
  }

  async getPromoCodeUsageHistory(promoCodeId: number, organizerId: number): Promise<PromoCodeUsageResponseDto[]> {
    const promoCode = await this.promoCodeRepository.findOne({
      where: { promoCodeId, organizerId },
    });

    if (!promoCode) {
      throw new NotFoundException('Promo code not found');
    }

    const usages = await this.promoCodeUsageRepository.find({
      where: { promoCodeId },
      relations: ['promoCode', 'order', 'user', 'event'],
      order: { usedAt: 'DESC' },
    });

    return usages.map(usage => ({
      promoCodeUsageId: usage.promoCodeUsageId,
      promoCode: usage.promoCode.code,
      orderNumber: usage.order.orderNumber,
      customerName: `${usage.user.firstName} ${usage.user.lastName}`,
      customerEmail: usage.user.email,
      eventTitle: usage.event.title,
      discountAmount: usage.discountAmount,
      orderSubtotal: usage.orderSubtotal,
      usedAt: usage.usedAt,
    }));
  }

  async getOrganizerPromoCodeStats(organizerId: number): Promise<any> {
    const promoCodes = await this.promoCodeRepository.find({
      where: { organizerId },
      relations: ['promoCodeUsages'],
    });

    const totalPromoCodes = promoCodes.length;
    const activePromoCodes = promoCodes.filter(pc => pc.isActive && pc.status === PromoCodeStatus.Active).length;
    const totalUsages = promoCodes.reduce((sum, pc) => sum + pc.currentUsageCount, 0);
    const totalDiscountGiven = promoCodes.reduce(
      (sum, pc) => sum + (pc.promoCodeUsages?.reduce((s, u) => s + u.discountAmount, 0) || 0),
      0,
    );

    return {
      totalPromoCodes,
      activePromoCodes,
      inactivePromoCodes: totalPromoCodes - activePromoCodes,
      totalUsages,
      totalDiscountGiven,
      averageDiscountPerUse: totalUsages > 0 ? totalDiscountGiven / totalUsages : 0,
    };
  }

  async getSystemPromoCodeStats(adminId: number): Promise<any> {
    const promoCodes = await this.promoCodeRepository.find({
      relations: ['promoCodeUsages', 'organizer'],
    });

    const totalPromoCodes = promoCodes.length;
    const activePromoCodes = promoCodes.filter(pc => pc.isActive && pc.status === PromoCodeStatus.Active).length;
    const totalUsages = promoCodes.reduce((sum, pc) => sum + pc.currentUsageCount, 0);
    const totalDiscountGiven = promoCodes.reduce(
      (sum, pc) => sum + (pc.promoCodeUsages?.reduce((s, u) => s + u.discountAmount, 0) || 0),
      0,
    );

    // Stats by organizer
    const statsByOrganizer = promoCodes.reduce((acc, pc) => {
      const key = pc.organizerId;
      if (!acc[key]) {
        acc[key] = {
          organizerId: pc.organizerId,
          organizerName: pc.organizer ? `${pc.organizer.firstName} ${pc.organizer.lastName}` : 'Unknown',
          totalPromoCodes: 0,
          totalUsages: 0,
          totalDiscountGiven: 0,
        };
      }
      acc[key].totalPromoCodes++;
      acc[key].totalUsages += pc.currentUsageCount;
      acc[key].totalDiscountGiven += pc.promoCodeUsages?.reduce((s, u) => s + u.discountAmount, 0) || 0;
      return acc;
    }, {} as Record<number, any>);

    return {
      totalPromoCodes,
      activePromoCodes,
      inactivePromoCodes: totalPromoCodes - activePromoCodes,
      totalUsages,
      totalDiscountGiven,
      averageDiscountPerUse: totalUsages > 0 ? totalDiscountGiven / totalUsages : 0,
      statsByOrganizer: Object.values(statsByOrganizer).sort((a: any, b: any) => b.totalUsages - a.totalUsages),
    };
  }

  // Helper methods
  private async getUsageById(usageId: number): Promise<PromoCodeUsageResponseDto> {
    const usage = await this.promoCodeUsageRepository.findOne({
      where: { promoCodeUsageId: usageId },
      relations: ['promoCode', 'order', 'user', 'event'],
    });

    if (!usage) {
      throw new NotFoundException('Usage record not found');
    }

    return {
      promoCodeUsageId: usage.promoCodeUsageId,
      promoCode: usage.promoCode.code,
      orderNumber: usage.order.orderNumber,
      customerName: `${usage.user.firstName} ${usage.user.lastName}`,
      customerEmail: usage.user.email,
      eventTitle: usage.event.title,
      discountAmount: usage.discountAmount,
      orderSubtotal: usage.orderSubtotal,
      usedAt: usage.usedAt,
    };
  }

  private mapToResponseDto(promoCode: PromoCode): PromoCodeResponseDto {
    const now = new Date();
    const isValid =
      promoCode.isActive &&
      promoCode.status === PromoCodeStatus.Active &&
      now >= promoCode.startDate &&
      now <= promoCode.endDate &&
      promoCode.currentUsageCount < promoCode.maxUsageCount;

    let invalidReason: string | undefined;
    if (!isValid) {
      if (!promoCode.isActive || promoCode.status !== PromoCodeStatus.Active) {
        invalidReason = 'Inactive';
      } else if (now < promoCode.startDate) {
        invalidReason = 'Not yet active';
      } else if (now > promoCode.endDate) {
        invalidReason = 'Expired';
      } else if (promoCode.currentUsageCount >= promoCode.maxUsageCount) {
        invalidReason = 'Usage limit reached';
      }
    }

    const formattedValue =
      promoCode.type === PromoCodeType.Percentage
        ? `${promoCode.value}% off`
        : `$${promoCode.value.toFixed(2)} off`;

    return {
      promoCodeId: promoCode.promoCodeId,
      code: promoCode.code,
      description: promoCode.description,
      type: promoCode.type,
      value: promoCode.value,
      formattedValue,
      minimumOrderAmount: promoCode.minimumOrderAmount,
      maximumDiscountAmount: promoCode.maximumDiscountAmount,
      scope: promoCode.scope,
      organizerId: promoCode.organizerId,
      organizerName: promoCode.organizer ? `${promoCode.organizer.firstName} ${promoCode.organizer.lastName}` : undefined,
      eventId: promoCode.eventId,
      eventTitle: promoCode.event?.title,
      startDate: promoCode.startDate,
      endDate: promoCode.endDate,
      maxUsageCount: promoCode.maxUsageCount,
      currentUsageCount: promoCode.currentUsageCount,
      remainingUsageCount: promoCode.maxUsageCount - promoCode.currentUsageCount,
      maxUsagePerUser: promoCode.maxUsagePerUser,
      status: promoCode.status,
      isActive: promoCode.isActive,
      isValid,
      invalidReason,
      createdAt: promoCode.createdAt,
      updatedAt: promoCode.updatedAt,
    };
  }
}
