import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TicketsService } from './tickets.service';
import { QrCodeService } from './qrcode.service';
import { Ticket } from '../../models/entities/ticket.entity';
import { TicketType } from '../../models/entities/ticket-type.entity';
import { Event } from '../../models/entities/event.entity';
import { Order } from '../../models/entities/order.entity';
import { User } from '../../models/entities/user.entity';
import { PromoCode } from '../../models/entities/promo-code.entity';
import { PromoCodeUsage } from '../../models/entities/promo-code-usage.entity';
import { PurchaseTicketsDto } from '../../models/dtos/tickets/purchase-tickets.dto';
import { BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { EventStatus, TicketStatus } from '../../models/entities/enums';

describe('TicketsService', () => {
  let service: TicketsService;
  let qrCodeService: QrCodeService;
  let ticketRepository: Repository<Ticket>;
  let ticketTypeRepository: Repository<TicketType>;
  let orderRepository: Repository<Order>;
  let promoCodeRepository: Repository<PromoCode>;

  const mockTicketRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    count: jest.fn(),
  };

  const mockTicketTypeRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
  };

  const mockOrderRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
  };

  const mockEventRepository = {
    findOne: jest.fn(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
  };

  const mockPromoCodeRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  const mockPromoCodeUsageRepository = {
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockQrCodeService = {
    generateQrCodeData: jest.fn(),
    generateTicketNumber: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TicketsService,
        {
          provide: QrCodeService,
          useValue: mockQrCodeService,
        },
        {
          provide: getRepositoryToken(Ticket),
          useValue: mockTicketRepository,
        },
        {
          provide: getRepositoryToken(TicketType),
          useValue: mockTicketTypeRepository,
        },
        {
          provide: getRepositoryToken(Event),
          useValue: mockEventRepository,
        },
        {
          provide: getRepositoryToken(Order),
          useValue: mockOrderRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(PromoCode),
          useValue: mockPromoCodeRepository,
        },
        {
          provide: getRepositoryToken(PromoCodeUsage),
          useValue: mockPromoCodeUsageRepository,
        },
      ],
    }).compile();

    service = module.get<TicketsService>(TicketsService);
    qrCodeService = module.get<QrCodeService>(QrCodeService);
    ticketRepository = module.get<Repository<Ticket>>(getRepositoryToken(Ticket));
    ticketTypeRepository = module.get<Repository<TicketType>>(getRepositoryToken(TicketType));
    orderRepository = module.get<Repository<Order>>(getRepositoryToken(Order));
    promoCodeRepository = module.get<Repository<PromoCode>>(getRepositoryToken(PromoCode));

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('calculateOrderSummary', () => {
    it('should calculate order summary without promo code', async () => {
      const ticketTypeId = 1;
      const quantity = 2;
      const eventId = 1;

      const mockTicketType = {
        ticketTypeId: 1,
        eventId: 1,
        name: 'General Admission',
        price: 50.0,
        quantityAvailable: 100,
        quantitySold: 10,
      };

      mockTicketTypeRepository.findOne.mockResolvedValue(mockTicketType);

      const result = await service.calculateOrderSummary([{ ticketTypeId, quantity }], eventId);

      expect(result.subTotal).toBe(100.0); // 50 * 2
      expect(result.discountAmount).toBe(0);
      expect(result.serviceFee).toBe(5.0); // 5% of 100
      expect(result.taxAmount).toBe(8.4); // 8% of (100 + 5)
      expect(result.totalAmount).toBe(113.4); // 100 + 5 + 8.4
      expect(result.itemBreakdown).toHaveLength(1);
    });

    it('should throw BadRequestException if ticket type not found', async () => {
      mockTicketTypeRepository.findOne.mockResolvedValue(null);

      await expect(service.calculateOrderSummary([{ ticketTypeId: 999, quantity: 1 }], 1)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if insufficient tickets available', async () => {
      const mockTicketType = {
        ticketTypeId: 1,
        quantityAvailable: 100,
        quantitySold: 95,
        price: 50,
      };

      mockTicketTypeRepository.findOne.mockResolvedValue(mockTicketType);

      await expect(service.calculateOrderSummary([{ ticketTypeId: 1, quantity: 10 }], 1)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('purchaseTickets', () => {
    const purchaseDto: PurchaseTicketsDto = {
      items: [{ ticketTypeId: 1, quantity: 2 }],
      eventId: 1,
      billingName: 'John Doe',
      billingEmail: 'john@example.com',
      billingAddress: '123 Main St',
      billingCity: 'New York',
      billingPostalCode: '10001',
      billingCountry: 'USA',
    };

    const userId = 1;

    it('should successfully purchase tickets', async () => {
      const mockTicketType = {
        ticketTypeId: 1,
        eventId: 1,
        name: 'General Admission',
        price: 50.0,
        quantityAvailable: 100,
        quantitySold: 10,
        minQuantityPerOrder: 1,
        maxQuantityPerOrder: 10,
        event: {
          eventId: 1,
          title: 'Test Event',
          status: EventStatus.Published,
        },
      };

      const mockOrder = {
        orderId: 1,
        orderNumber: 'ORD-20241113-ABC123',
        userId,
        subTotal: 100,
        discountAmount: 0,
        serviceFee: 5,
        taxAmount: 8.4,
        totalAmount: 113.4,
      };

      mockTicketTypeRepository.findOne.mockResolvedValue(mockTicketType);
      mockOrderRepository.create.mockReturnValue(mockOrder);
      mockOrderRepository.save.mockResolvedValue(mockOrder);
      mockQrCodeService.generateTicketNumber.mockReturnValue('TKT-20241113-XYZ789');
      mockQrCodeService.generateQrCodeData.mockReturnValue(JSON.stringify({ ticketNumber: 'TKT-20241113-XYZ789' }));
      mockTicketRepository.create.mockReturnValue({
        ticketId: 1,
        ticketNumber: 'TKT-20241113-XYZ789',
        status: TicketStatus.Valid,
      });
      mockTicketRepository.save.mockResolvedValue({
        ticketId: 1,
        ticketNumber: 'TKT-20241113-XYZ789',
      });
      mockTicketTypeRepository.save.mockResolvedValue(mockTicketType);
      mockOrderRepository.findOne.mockResolvedValue({
        ...mockOrder,
        tickets: [
          { ticketId: 1, ticketNumber: 'TKT-20241113-XYZ789' },
          { ticketId: 2, ticketNumber: 'TKT-20241113-XYZ790' },
        ],
      });

      const result = await service.purchaseTickets(purchaseDto, userId);

      expect(result).toHaveProperty('orderId');
      expect(result).toHaveProperty('orderNumber');
      expect(result.tickets).toHaveLength(2);
      expect(mockTicketTypeRepository.save).toHaveBeenCalled();
    });

    it('should throw BadRequestException if quantity exceeds max per order', async () => {
      const mockTicketType = {
        ticketTypeId: 1,
        eventId: 1,
        quantityAvailable: 100,
        quantitySold: 10,
        minQuantityPerOrder: 1,
        maxQuantityPerOrder: 5,
        event: { status: EventStatus.Published },
      };

      mockTicketTypeRepository.findOne.mockResolvedValue(mockTicketType);

      const invalidDto = {
        ...purchaseDto,
        items: [{ ticketTypeId: 1, quantity: 10 }],
      };

      await expect(service.purchaseTickets(invalidDto, userId)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if event is not published', async () => {
      const mockTicketType = {
        ticketTypeId: 1,
        eventId: 1,
        event: { status: EventStatus.Draft },
      };

      mockTicketTypeRepository.findOne.mockResolvedValue(mockTicketType);

      await expect(service.purchaseTickets(purchaseDto, userId)).rejects.toThrow(BadRequestException);
    });
  });

  describe('validateTicket', () => {
    it('should return valid status for unused ticket', async () => {
      const mockTicket = {
        ticketId: 1,
        ticketNumber: 'TKT-20241113-ABC123',
        status: TicketStatus.Valid,
        checkInDate: null,
        event: { eventId: 1, title: 'Test Event' },
        attendeeFirstName: 'John',
        attendeeLastName: 'Doe',
      };

      mockTicketRepository.findOne.mockResolvedValue(mockTicket);

      const result = await service.validateTicket('TKT-20241113-ABC123');

      expect(result.isValid).toBe(true);
      expect(result.message).toContain('Valid');
      expect(result.eventTitle).toBe('Test Event');
    });

    it('should return invalid status for used ticket', async () => {
      const mockTicket = {
        ticketId: 1,
        ticketNumber: 'TKT-20241113-ABC123',
        status: TicketStatus.Used,
        checkInDate: new Date(),
      };

      mockTicketRepository.findOne.mockResolvedValue(mockTicket);

      const result = await service.validateTicket('TKT-20241113-ABC123');

      expect(result.isValid).toBe(false);
      expect(result.message).toContain('already been used');
    });

    it('should return invalid status for non-existent ticket', async () => {
      mockTicketRepository.findOne.mockResolvedValue(null);

      const result = await service.validateTicket('INVALID-TICKET');

      expect(result.isValid).toBe(false);
      expect(result.message).toContain('not found');
    });
  });

  describe('checkInTicket', () => {
    it('should successfully check in a valid ticket', async () => {
      const mockTicket = {
        ticketId: 1,
        ticketNumber: 'TKT-20241113-ABC123',
        status: TicketStatus.Valid,
        eventId: 1,
        checkInDate: null,
        event: { organizerId: 1 },
      };

      mockTicketRepository.findOne.mockResolvedValue(mockTicket);
      mockTicketRepository.save.mockResolvedValue({
        ...mockTicket,
        status: TicketStatus.Used,
        checkInDate: new Date(),
      });

      const result = await service.checkInTicket({ ticketNumber: 'TKT-20241113-ABC123' }, 1);

      expect(result.status).toBe(TicketStatus.Used);
      expect(result.checkInDate).toBeDefined();
      expect(mockTicketRepository.save).toHaveBeenCalled();
    });

    it('should throw BadRequestException if ticket already checked in', async () => {
      const mockTicket = {
        ticketId: 1,
        ticketNumber: 'TKT-20241113-ABC123',
        status: TicketStatus.Used,
        checkInDate: new Date(),
        event: { organizerId: 1 },
      };

      mockTicketRepository.findOne.mockResolvedValue(mockTicket);

      await expect(service.checkInTicket({ ticketNumber: 'TKT-20241113-ABC123' }, 1)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw ForbiddenException if user is not the event organizer', async () => {
      const mockTicket = {
        ticketId: 1,
        ticketNumber: 'TKT-20241113-ABC123',
        status: TicketStatus.Valid,
        event: { organizerId: 1 },
      };

      mockTicketRepository.findOne.mockResolvedValue(mockTicket);

      await expect(service.checkInTicket({ ticketNumber: 'TKT-20241113-ABC123' }, 999)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('getUserTickets', () => {
    it('should return all tickets for a user', async () => {
      const mockTickets = [
        {
          ticketId: 1,
          ticketNumber: 'TKT-001',
          status: TicketStatus.Valid,
          event: { eventId: 1, title: 'Event 1' },
          ticketType: { ticketTypeId: 1, name: 'General' },
        },
        {
          ticketId: 2,
          ticketNumber: 'TKT-002',
          status: TicketStatus.Used,
          event: { eventId: 2, title: 'Event 2' },
          ticketType: { ticketTypeId: 2, name: 'VIP' },
        },
      ];

      mockTicketRepository.find.mockResolvedValue(mockTickets);

      const result = await service.getUserTickets(1);

      expect(result).toHaveLength(2);
      expect(result[0].ticketNumber).toBe('TKT-001');
      expect(mockTicketRepository.find).toHaveBeenCalledWith({
        where: { userId: 1 },
        relations: ['event', 'ticketType', 'order'],
        order: { purchaseDate: 'DESC' },
      });
    });
  });
});
