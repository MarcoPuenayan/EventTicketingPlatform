import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { TicketsService } from './tickets.service';
import { CreateTicketTypeDto } from '../../models/dtos/tickets/create-ticket-type.dto';
import { UpdateTicketTypeDto } from '../../models/dtos/tickets/update-ticket-type.dto';
import { PurchaseTicketsDto } from '../../models/dtos/tickets/purchase-tickets.dto';
import { TicketTypeResponseDto } from '../../models/dtos/tickets/ticket-type-response.dto';
import { TicketResponseDto } from '../../models/dtos/tickets/ticket-response.dto';
import { OrderResponseDto } from '../../models/dtos/tickets/order-response.dto';
import { OrderSummaryDto } from '../../models/dtos/tickets/order-summary.dto';
import { CheckInTicketDto } from '../../models/dtos/tickets/check-in-ticket.dto';
import { TicketValidationDto } from '../../models/dtos/tickets/ticket-validation.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../../entities/user.entity';
import { RoleType } from '../../entities/enums/role-type.enum';

@ApiTags('Tickets')
@Controller('api/tickets')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  // ========== TICKET TYPES ==========

  @Get('event/:eventId/ticket-types')
  @Public()
  @ApiOperation({ summary: 'Get ticket types for an event' })
  @ApiResponse({
    status: 200,
    description: 'Ticket types retrieved',
    type: [TicketTypeResponseDto],
  })
  async getEventTicketTypes(
    @Param('eventId', ParseIntPipe) eventId: number,
  ): Promise<TicketTypeResponseDto[]> {
    return this.ticketsService.getTicketTypesByEvent(eventId);
  }

  @Post('ticket-types')
  @ApiBearerAuth()
  @Roles(RoleType.Organizer, RoleType.Admin)
  @ApiOperation({ summary: 'Create a ticket type' })
  @ApiResponse({
    status: 201,
    description: 'Ticket type created',
    type: TicketTypeResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Organizer role required',
  })
  async createTicketType(
    @Body() createDto: CreateTicketTypeDto,
    @CurrentUser() user: User,
  ): Promise<TicketTypeResponseDto> {
    return this.ticketsService.createTicketType(createDto, user.userId);
  }

  @Get('ticket-types/:id')
  @Public()
  @ApiOperation({ summary: 'Get ticket type by ID' })
  @ApiResponse({
    status: 200,
    description: 'Ticket type found',
    type: TicketTypeResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Ticket type not found' })
  async getTicketType(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<TicketTypeResponseDto> {
    return this.ticketsService.getTicketTypeById(id);
  }

  @Put('ticket-types/:id')
  @ApiBearerAuth()
  @Roles(RoleType.Organizer, RoleType.Admin)
  @ApiOperation({ summary: 'Update a ticket type' })
  @ApiResponse({
    status: 200,
    description: 'Ticket type updated',
    type: TicketTypeResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not the event owner' })
  @ApiResponse({ status: 404, description: 'Ticket type not found' })
  async updateTicketType(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateTicketTypeDto,
    @CurrentUser() user: User,
  ): Promise<TicketTypeResponseDto> {
    return this.ticketsService.updateTicketType(id, updateDto, user.userId);
  }

  // ========== ORDER CALCULATION ==========

  @Post('calculate-order')
  @Public()
  @ApiOperation({ summary: 'Calculate order summary before purchase' })
  @ApiResponse({
    status: 200,
    description: 'Order summary calculated',
    type: OrderSummaryDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async calculateOrder(
    @Body() purchaseDto: PurchaseTicketsDto,
  ): Promise<OrderSummaryDto> {
    return this.ticketsService.calculateOrderSummary(purchaseDto);
  }

  // ========== PURCHASE ==========

  @Post('purchase')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Purchase tickets' })
  @ApiResponse({
    status: 200,
    description: 'Tickets purchased successfully',
    type: OrderResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async purchaseTickets(
    @Body() purchaseDto: PurchaseTicketsDto,
    @CurrentUser() user: User,
  ): Promise<OrderResponseDto> {
    return this.ticketsService.purchaseTickets(purchaseDto, user.userId);
  }

  // ========== USER TICKETS ==========

  @Get('my-tickets')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get tickets for current user' })
  @ApiResponse({
    status: 200,
    description: 'Tickets retrieved',
    type: [TicketResponseDto],
  })
  async getMyTickets(@CurrentUser() user: User): Promise<TicketResponseDto[]> {
    return this.ticketsService.getUserTickets(user.userId);
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get ticket by ID' })
  @ApiResponse({
    status: 200,
    description: 'Ticket found',
    type: TicketResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  async getTicket(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
  ): Promise<TicketResponseDto> {
    return this.ticketsService.getTicketById(id, user.userId);
  }

  @Get(':id/qr')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get QR code data for ticket' })
  @ApiResponse({ status: 200, description: 'QR data retrieved' })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  async getTicketQR(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
  ): Promise<{ qrData: string; ticketNumber: string; message: string }> {
    const ticket = await this.ticketsService.getTicketById(id, user.userId);
    return {
      qrData: ticket.qrCode,
      ticketNumber: ticket.ticketNumber,
      message: 'Use this data to generate QR code in frontend',
    };
  }

  // ========== TICKET VALIDATION ==========

  @Post('validate')
  @ApiBearerAuth()
  @Roles(RoleType.Organizer, RoleType.Admin)
  @ApiOperation({ summary: 'Validate a ticket by ticket number' })
  @ApiResponse({
    status: 200,
    description: 'Validation result',
    type: TicketValidationDto,
  })
  async validateTicket(
    @Body() body: { ticketNumber: string },
  ): Promise<TicketValidationDto> {
    return this.ticketsService.validateTicket(body.ticketNumber);
  }

  @Post('check-in')
  @ApiBearerAuth()
  @Roles(RoleType.Organizer, RoleType.Admin)
  @ApiOperation({ summary: 'Check-in a ticket' })
  @ApiResponse({
    status: 200,
    description: 'Ticket checked in',
    type: TicketResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Not the event organizer',
  })
  async checkInTicket(
    @Body() checkInDto: CheckInTicketDto,
    @CurrentUser() user: User,
  ): Promise<TicketResponseDto> {
    return this.ticketsService.checkInTicket(checkInDto, user.userId);
  }

  // ========== ORDERS ==========

  @Get('orders/my-orders')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get orders for current user' })
  @ApiResponse({
    status: 200,
    description: 'Orders retrieved',
    type: [OrderResponseDto],
  })
  async getMyOrders(@CurrentUser() user: User): Promise<OrderResponseDto[]> {
    return this.ticketsService.getUserOrders(user.userId);
  }

  @Get('orders/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get order by ID' })
  @ApiResponse({
    status: 200,
    description: 'Order found',
    type: OrderResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async getOrder(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
  ): Promise<OrderResponseDto> {
    return this.ticketsService.getOrderById(id, user.userId);
  }
}
