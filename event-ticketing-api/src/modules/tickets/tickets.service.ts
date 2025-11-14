import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket } from '../../entities/ticket.entity';
import { TicketType } from '../../entities/ticket-type.entity';
import { Event } from '../../entities/event.entity';
import { Order } from '../../entities/order.entity';
import { User } from '../../entities/user.entity';
import { PromoCode } from '../../entities/promo-code.entity';
import { PromoCodeUsage } from '../../entities/promo-code-usage.entity';
import { QrCodeService } from './qrcode.service';
import { CreateTicketTypeDto } from '../../models/dtos/tickets/create-ticket-type.dto';
import { UpdateTicketTypeDto } from '../../models/dtos/tickets/update-ticket-type.dto';
import { PurchaseTicketsDto } from '../../models/dtos/tickets/purchase-tickets.dto';
import { TicketTypeResponseDto } from '../../models/dtos/tickets/ticket-type-response.dto';
import { TicketResponseDto } from '../../models/dtos/tickets/ticket-response.dto';
import { OrderResponseDto } from '../../models/dtos/tickets/order-response.dto';
import { OrderSummaryDto } from '../../models/dtos/tickets/order-summary.dto';
import { CheckInTicketDto } from '../../models/dtos/tickets/check-in-ticket.dto';
import { TicketValidationDto } from '../../models/dtos/tickets/ticket-validation.dto';
import { TicketStatus } from '../../entities/enums/ticket-status.enum';
import { OrderStatus } from '../../entities/enums/order-status.enum';
import { EventStatus } from '../../entities/enums/event-status.enum';
import { PromoCodeType } from '../../entities/enums/promo-code-type.enum';

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
    @InjectRepository(TicketType)
    private readonly ticketTypeRepository: Repository<TicketType>,
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(PromoCode)
    private readonly promoCodeRepository: Repository<PromoCode>,
    @InjectRepository(PromoCodeUsage)
    private readonly promoCodeUsageRepository: Repository<PromoCodeUsage>,
    private readonly qrCodeService: QrCodeService,
  ) {}

  // ========== TICKET TYPES ==========

  /**
   * Create ticket type
   */
  async createTicketType(
    createDto: CreateTicketTypeDto,
    organizerId: number,
  ): Promise<TicketTypeResponseDto> {
    const event = await this.eventRepository.findOne({
      where: { eventId: createDto.eventId },
      relations: ['ticketTypes', 'ticketTypes.tickets'],
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (event.organizerId !== organizerId) {
      throw new ForbiddenException(
        'You can only create ticket types for your own events',
      );
    }

    // Business rules
    if (event.isPublished) {
      throw new BadRequestException(
        'Cannot create ticket types for published events',
      );
    }

    const totalTicketsSold = event.ticketTypes
      ? event.ticketTypes.reduce((sum, tt) => sum + tt.quantitySold, 0)
      : 0;

    if (totalTicketsSold > 0) {
      throw new BadRequestException(
        `Cannot create new ticket types. ${totalTicketsSold} ticket(s) already sold`,
      );
    }

    if (event.status !== EventStatus.Draft) {
      throw new BadRequestException(
        'Ticket types can only be created when event is in DRAFT status',
      );
    }

    // Check for duplicate names
    const existingType = event.ticketTypes?.find(
      (tt) =>
        tt.name.toLowerCase() === createDto.name.toLowerCase() && tt.isActive,
    );

    if (existingType) {
      throw new BadRequestException(
        `Ticket type '${createDto.name}' already exists for this event`,
      );
    }

    const ticketType = this.ticketTypeRepository.create({
      ...createDto,
      quantitySold: 0,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const saved = await this.ticketTypeRepository.save(ticketType);
    return this.getTicketTypeById(saved.ticketTypeId);
  }

  /**
   * Get ticket types by event
   */
  async getTicketTypesByEvent(eventId: number): Promise<TicketTypeResponseDto[]> {
    const ticketTypes = await this.ticketTypeRepository.find({
      where: { eventId, isActive: true },
      relations: ['event'],
      order: { sortOrder: 'ASC' },
    });

    return ticketTypes.map((tt) => this.mapToTicketTypeResponse(tt));
  }

  /**
   * Get ticket type by ID
   */
  async getTicketTypeById(ticketTypeId: number): Promise<TicketTypeResponseDto> {
    const ticketType = await this.ticketTypeRepository.findOne({
      where: { ticketTypeId },
      relations: ['event'],
    });

    if (!ticketType) {
      throw new NotFoundException('Ticket type not found');
    }

    return this.mapToTicketTypeResponse(ticketType);
  }

  /**
   * Update ticket type
   */
  async updateTicketType(
    ticketTypeId: number,
    updateDto: UpdateTicketTypeDto,
    organizerId: number,
  ): Promise<TicketTypeResponseDto> {
    const ticketType = await this.ticketTypeRepository.findOne({
      where: { ticketTypeId },
      relations: ['event'],
    });

    if (!ticketType) {
      throw new NotFoundException('Ticket type not found');
    }

    if (ticketType.event.organizerId !== organizerId) {
      throw new ForbiddenException(
        'You can only update ticket types for your own events',
      );
    }

    // Update fields
    Object.assign(ticketType, updateDto);
    ticketType.updatedAt = new Date();

    await this.ticketTypeRepository.save(ticketType);
    return this.getTicketTypeById(ticketTypeId);
  }

  // ========== PURCHASE TICKETS ==========

  /**
   * Calculate order summary (before purchase)
   */
  async calculateOrderSummary(
    purchaseDto: PurchaseTicketsDto,
  ): Promise<OrderSummaryDto> {
    let subTotal = 0;
    const itemBreakdown: any[] = [];

    // Calculate subtotal
    for (const item of purchaseDto.items) {
      const ticketType = await this.ticketTypeRepository.findOne({
        where: { ticketTypeId: item.ticketTypeId },
        relations: ['event'],
      });

      if (!ticketType) {
        throw new NotFoundException(
          `Ticket type ${item.ticketTypeId} not found`,
        );
      }

      const itemTotal = ticketType.price * item.quantity;
      subTotal += itemTotal;

      itemBreakdown.push({
        ticketTypeId: ticketType.ticketTypeId,
        ticketTypeName: ticketType.name,
        quantity: item.quantity,
        pricePerTicket: ticketType.price,
        itemTotal,
      });
    }

    // Apply promo code if provided
    let discountAmount = 0;
    let promoCode: PromoCode | null = null;

    if (purchaseDto.promoCode) {
      promoCode = await this.promoCodeRepository.findOne({
        where: { code: purchaseDto.promoCode },
      });

      if (promoCode && promoCode.isActive) {
        if (promoCode.type === PromoCodeType.Percentage) {
          discountAmount = subTotal * (promoCode.discountValue / 100);
        } else if (promoCode.type === PromoCodeType.FixedAmount) {
          discountAmount = promoCode.discountValue;
        }

        // Cap discount at subtotal
        if (discountAmount > subTotal) {
          discountAmount = subTotal;
        }
      }
    }

    // Calculate fees and taxes
    const serviceFee = (subTotal - discountAmount) * 0.05; // 5% service fee
    const taxAmount = (subTotal - discountAmount) * 0.08; // 8% tax
    const totalAmount = subTotal - discountAmount + serviceFee + taxAmount;

    return {
      subTotal,
      discountAmount,
      serviceFee,
      taxAmount,
      totalAmount,
      currency: 'USD',
      itemBreakdown,
      promoCodeApplied: promoCode?.code || null,
    };
  }

  /**
   * Purchase tickets
   */
  async purchaseTickets(
    purchaseDto: PurchaseTicketsDto,
    userId: number,
  ): Promise<OrderResponseDto> {
    // Validate ticket availability
    for (const item of purchaseDto.items) {
      const ticketType = await this.ticketTypeRepository.findOne({
        where: { ticketTypeId: item.ticketTypeId },
      });

      if (!ticketType) {
        throw new NotFoundException(
          `Ticket type ${item.ticketTypeId} not found`,
        );
      }

      const remaining = ticketType.quantityAvailable - ticketType.quantitySold;
      if (remaining < item.quantity) {
        throw new BadRequestException(
          `Only ${remaining} tickets available for ${ticketType.name}`,
        );
      }

      // Check quantity limits
      if (
        item.quantity < ticketType.minQuantityPerOrder ||
        item.quantity > ticketType.maxQuantityPerOrder
      ) {
        throw new BadRequestException(
          `Quantity must be between ${ticketType.minQuantityPerOrder} and ${ticketType.maxQuantityPerOrder}`,
        );
      }
    }

    // Calculate order summary
    const summary = await this.calculateOrderSummary(purchaseDto);

    // Create order
    const order = this.orderRepository.create({
      userId,
      orderNumber: this.generateOrderNumber(),
      subTotal: summary.subTotal,
      discountAmount: summary.discountAmount,
      serviceFee: summary.serviceFee,
      taxAmount: summary.taxAmount,
      totalAmount: summary.totalAmount,
      status: OrderStatus.Completed,
      billingName: purchaseDto.billingInfo.name,
      billingEmail: purchaseDto.billingInfo.email,
      billingPhone: purchaseDto.billingInfo.phone,
      billingAddress: purchaseDto.billingInfo.address,
      billingCity: purchaseDto.billingInfo.city,
      billingState: purchaseDto.billingInfo.state,
      billingZipCode: purchaseDto.billingInfo.zipCode,
      billingCountry: purchaseDto.billingInfo.country,
      paymentMethod: purchaseDto.paymentMethod,
      promoCode: purchaseDto.promoCode || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const savedOrder = await this.orderRepository.save(order);

    // Create tickets
    const tickets: Ticket[] = [];

    for (const item of purchaseDto.items) {
      const ticketType = await this.ticketTypeRepository.findOne({
        where: { ticketTypeId: item.ticketTypeId },
        relations: ['event'],
      });

      if (!ticketType) continue;

      for (let i = 0; i < item.quantity; i++) {
        const attendeeInfo =
          item.attendees && item.attendees[i]
            ? item.attendees[i]
            : { firstName: '', lastName: '', email: '' };

        const ticketNumber = this.qrCodeService.generateTicketNumber();
        const qrData = this.qrCodeService.generateQrCodeData(
          ticketNumber,
          ticketType.event.eventId,
          ticketType.event.title,
        );

        const ticket = this.ticketRepository.create({
          userId,
          orderId: savedOrder.orderId,
          eventId: ticketType.event.eventId,
          ticketTypeId: item.ticketTypeId,
          ticketNumber,
          qrCode: qrData,
          pricePaid: ticketType.price,
          status: TicketStatus.Valid,
          purchaseDate: new Date(),
          attendeeFirstName: attendeeInfo.firstName,
          attendeeLastName: attendeeInfo.lastName,
          attendeeEmail: attendeeInfo.email,
        });

        tickets.push(ticket);
      }

      // Update quantity sold
      ticketType.quantitySold += item.quantity;
      await this.ticketTypeRepository.save(ticketType);
    }

    await this.ticketRepository.save(tickets);

    // Record promo code usage if applicable
    if (purchaseDto.promoCode && summary.discountAmount > 0) {
      const promoCode = await this.promoCodeRepository.findOne({
        where: { code: purchaseDto.promoCode },
      });

      if (promoCode) {
        const usage = this.promoCodeUsageRepository.create({
          promoCodeId: promoCode.promoCodeId,
          userId,
          orderId: savedOrder.orderId,
          eventId: tickets[0].eventId,
          discountAmount: summary.discountAmount,
          orderSubtotal: summary.subTotal,
          usedAt: new Date(),
        });

        await this.promoCodeUsageRepository.save(usage);

        // Increment usage count
        promoCode.usageCount += 1;
        await this.promoCodeRepository.save(promoCode);
      }
    }

    return this.getOrderById(savedOrder.orderId, userId);
  }

  // ========== TICKETS ==========

  /**
   * Get user tickets
   */
  async getUserTickets(userId: number): Promise<TicketResponseDto[]> {
    const tickets = await this.ticketRepository.find({
      where: { userId },
      relations: ['ticketType', 'ticketType.event', 'ticketType.event.venue'],
      order: { purchaseDate: 'DESC' },
    });

    return tickets.map((t) => this.mapToTicketResponse(t));
  }

  /**
   * Get ticket by ID
   */
  async getTicketById(
    ticketId: number,
    userId: number,
  ): Promise<TicketResponseDto> {
    const ticket = await this.ticketRepository.findOne({
      where: { ticketId, userId },
      relations: ['ticketType', 'ticketType.event', 'ticketType.event.venue'],
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    return this.mapToTicketResponse(ticket);
  }

  /**
   * Validate ticket
   */
  async validateTicket(ticketNumber: string): Promise<TicketValidationDto> {
    const ticket = await this.ticketRepository.findOne({
      where: { ticketNumber },
      relations: ['ticketType', 'ticketType.event'],
    });

    if (!ticket) {
      return {
        isValid: false,
        message: 'Ticket not found',
        ticketNumber,
      };
    }

    if (ticket.status === TicketStatus.Used) {
      return {
        isValid: false,
        message: 'Ticket already used',
        ticketNumber,
        checkInDate: ticket.checkInDate,
      };
    }

    if (ticket.status === TicketStatus.Cancelled) {
      return {
        isValid: false,
        message: 'Ticket cancelled',
        ticketNumber,
      };
    }

    if (ticket.status === TicketStatus.Refunded) {
      return {
        isValid: false,
        message: 'Ticket refunded',
        ticketNumber,
      };
    }

    return {
      isValid: true,
      message: 'Ticket valid',
      ticketNumber,
      eventTitle: ticket.ticketType.event.title,
      attendeeName: `${ticket.attendeeFirstName} ${ticket.attendeeLastName}`,
      ticketTypeName: ticket.ticketType.name,
    };
  }

  /**
   * Check-in ticket
   */
  async checkInTicket(
    checkInDto: CheckInTicketDto,
    userId: number,
  ): Promise<TicketResponseDto> {
    const ticket = await this.ticketRepository.findOne({
      where: { ticketNumber: checkInDto.ticketNumber },
      relations: ['ticketType', 'ticketType.event', 'ticketType.event.venue'],
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    // Verify organizer owns the event
    if (ticket.ticketType.event.organizerId !== userId) {
      throw new ForbiddenException('Not authorized to check-in this ticket');
    }

    if (ticket.status === TicketStatus.Used) {
      throw new BadRequestException('Ticket already checked in');
    }

    if (ticket.status !== TicketStatus.Valid) {
      throw new BadRequestException(`Ticket is ${ticket.status}`);
    }

    ticket.status = TicketStatus.Used;
    ticket.checkInDate = new Date();

    await this.ticketRepository.save(ticket);
    return this.mapToTicketResponse(ticket);
  }

  // ========== ORDERS ==========

  /**
   * Get order by ID
   */
  async getOrderById(
    orderId: number,
    userId: number,
  ): Promise<OrderResponseDto> {
    const order = await this.orderRepository.findOne({
      where: { orderId, userId },
      relations: ['tickets', 'tickets.ticketType', 'tickets.ticketType.event'],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return this.mapToOrderResponse(order);
  }

  /**
   * Get user orders
   */
  async getUserOrders(userId: number): Promise<OrderResponseDto[]> {
    const orders = await this.orderRepository.find({
      where: { userId },
      relations: ['tickets', 'tickets.ticketType', 'tickets.ticketType.event'],
      order: { createdAt: 'DESC' },
    });

    return orders.map((o) => this.mapToOrderResponse(o));
  }

  // ========== HELPER METHODS ==========

  private generateOrderNumber(): string {
    const prefix = 'ORD';
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(Math.random() * 900000) + 100000;
    return `${prefix}-${date}-${random}`;
  }

  private mapToTicketTypeResponse(tt: TicketType): TicketTypeResponseDto {
    const now = new Date();
    const isOnSale =
      tt.isActive &&
      (!tt.saleStartDate || tt.saleStartDate <= now) &&
      (!tt.saleEndDate || tt.saleEndDate >= now);

    return {
      ticketTypeId: tt.ticketTypeId,
      eventId: tt.eventId,
      eventTitle: tt.event?.title || '',
      name: tt.name,
      description: tt.description,
      price: tt.price,
      quantityAvailable: tt.quantityAvailable,
      quantitySold: tt.quantitySold,
      quantityRemaining: tt.quantityAvailable - tt.quantitySold,
      saleStartDate: tt.saleStartDate,
      saleEndDate: tt.saleEndDate,
      minQuantityPerOrder: tt.minQuantityPerOrder,
      maxQuantityPerOrder: tt.maxQuantityPerOrder,
      isActive: tt.isActive,
      isOnSale,
      sortOrder: tt.sortOrder,
      createdAt: tt.createdAt,
      updatedAt: tt.updatedAt,
    };
  }

  private mapToTicketResponse(t: Ticket): TicketResponseDto {
    return {
      ticketId: t.ticketId,
      eventId: t.eventId,
      eventTitle: t.ticketType?.event?.title || '',
      ticketTypeId: t.ticketTypeId,
      ticketTypeName: t.ticketType?.name || '',
      ticketNumber: t.ticketNumber,
      qrCode: t.qrCode,
      pricePaid: t.pricePaid,
      currency: t.ticketType?.event?.currency || 'USD',
      status: t.status,
      purchaseDate: t.purchaseDate,
      checkInDate: t.checkInDate,
      attendeeFirstName: t.attendeeFirstName,
      attendeeLastName: t.attendeeLastName,
      attendeeEmail: t.attendeeEmail,
      eventStartDateTime: t.ticketType?.event?.startDateTime?.toISOString() || '',
      venueName: t.ticketType?.event?.venue?.name || 'TBD',
      venueAddress: t.ticketType?.event?.venue?.address || 'TBD',
    };
  }

  private mapToOrderResponse(o: Order): OrderResponseDto {
    return {
      orderId: o.orderId,
      orderNumber: o.orderNumber,
      subTotal: o.subTotal,
      discountAmount: o.discountAmount,
      serviceFee: o.serviceFee,
      taxAmount: o.taxAmount,
      totalAmount: o.totalAmount,
      status: o.status,
      promoCode: o.promoCode,
      paymentMethod: o.paymentMethod,
      billingName: o.billingName,
      billingEmail: o.billingEmail,
      createdAt: o.createdAt,
      tickets: o.tickets ? o.tickets.map((t) => this.mapToTicketResponse(t)) : [],
    };
  }
}
