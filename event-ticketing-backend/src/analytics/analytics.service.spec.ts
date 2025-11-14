import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsService } from './analytics.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Order } from '../entities/order.entity';
import { Ticket } from '../entities/ticket.entity';
import { Event } from '../entities/event.entity';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let orderRepository: Repository<Order>;
  let ticketRepository: Repository<Ticket>;
  let eventRepository: Repository<Event>;
  let userRepository: Repository<User>;

  const mockQueryBuilder = {
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    leftJoin: jest.fn().mockReturnThis(),
    innerJoin: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getRawMany: jest.fn(),
    getRawOne: jest.fn(),
  };

  const mockOrderRepository = {
    createQueryBuilder: jest.fn(() => mockQueryBuilder),
    findOne: jest.fn(),
  };

  const mockTicketRepository = {
    createQueryBuilder: jest.fn(() => mockQueryBuilder),
    count: jest.fn(),
  };

  const mockEventRepository = {
    createQueryBuilder: jest.fn(() => mockQueryBuilder),
    findOne: jest.fn(),
    find: jest.fn(),
  };

  const mockUserRepository = {
    createQueryBuilder: jest.fn(() => mockQueryBuilder),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        {
          provide: getRepositoryToken(Order),
          useValue: mockOrderRepository,
        },
        {
          provide: getRepositoryToken(Ticket),
          useValue: mockTicketRepository,
        },
        {
          provide: getRepositoryToken(Event),
          useValue: mockEventRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<AnalyticsService>(AnalyticsService);
    orderRepository = module.get<Repository<Order>>(getRepositoryToken(Order));
    ticketRepository = module.get<Repository<Ticket>>(
      getRepositoryToken(Ticket),
    );
    eventRepository = module.get<Repository<Event>>(
      getRepositoryToken(Event),
    );
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getRevenueAnalytics', () => {
    it('should return revenue analytics for organizer events', async () => {
      const organizerId = 1;
      const mockRevenue = [
        {
          eventId: 1,
          eventTitle: 'Concert Night',
          totalRevenue: '1500.00',
          ticketsSold: '50',
          avgTicketPrice: '30.00',
        },
        {
          eventId: 2,
          eventTitle: 'Tech Conference',
          totalRevenue: '3000.00',
          ticketsSold: '100',
          avgTicketPrice: '30.00',
        },
      ];

      mockQueryBuilder.getRawMany.mockResolvedValue(mockRevenue);

      const result = await service.getRevenueAnalytics(organizerId);

      expect(result).toEqual([
        {
          eventId: 1,
          eventTitle: 'Concert Night',
          totalRevenue: 1500,
          ticketsSold: 50,
          avgTicketPrice: 30,
        },
        {
          eventId: 2,
          eventTitle: 'Tech Conference',
          totalRevenue: 3000,
          ticketsSold: 100,
          avgTicketPrice: 30,
        },
      ]);
      expect(mockOrderRepository.createQueryBuilder).toHaveBeenCalled();
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'event.organizerId = :organizerId',
        { organizerId },
      );
    });

    it('should return empty array if no revenue data', async () => {
      mockQueryBuilder.getRawMany.mockResolvedValue([]);

      const result = await service.getRevenueAnalytics(999);

      expect(result).toEqual([]);
    });
  });

  describe('getCapacityAnalytics', () => {
    it('should return capacity analytics for an event', async () => {
      const eventId = 1;
      const mockEvent = {
        eventId: 1,
        title: 'Concert Night',
        ticketTypes: [
          { capacity: 100 },
          { capacity: 50 },
        ],
      };

      mockEventRepository.findOne.mockResolvedValue(mockEvent);
      mockTicketRepository.count.mockResolvedValue(120);

      const result = await service.getCapacityAnalytics(eventId);

      expect(result).toEqual({
        eventId: 1,
        eventTitle: 'Concert Night',
        totalCapacity: 150,
        ticketsSold: 120,
        availableTickets: 30,
        utilizationPercentage: 80,
      });
      expect(mockEventRepository.findOne).toHaveBeenCalledWith({
        where: { eventId },
        relations: ['ticketTypes'],
      });
      expect(mockTicketRepository.count).toHaveBeenCalledWith({
        where: { eventId },
      });
    });

    it('should throw NotFoundException if event does not exist', async () => {
      mockEventRepository.findOne.mockResolvedValue(null);

      await expect(service.getCapacityAnalytics(999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getDemographicsAnalytics', () => {
    it('should return age group distribution for event attendees', async () => {
      const eventId = 1;
      const mockDemographics = [
        { ageGroup: '18-24', count: '30' },
        { ageGroup: '25-34', count: '50' },
        { ageGroup: '35-44', count: '20' },
      ];

      mockQueryBuilder.getRawMany.mockResolvedValue(mockDemographics);

      const result = await service.getDemographicsAnalytics(eventId);

      expect(result).toEqual([
        { ageGroup: '18-24', count: 30 },
        { ageGroup: '25-34', count: 50 },
        { ageGroup: '35-44', count: 20 },
      ]);
      expect(mockUserRepository.createQueryBuilder).toHaveBeenCalled();
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'ticket.eventId = :eventId',
        { eventId },
      );
    });

    it('should return empty array if no demographics data', async () => {
      mockQueryBuilder.getRawMany.mockResolvedValue([]);

      const result = await service.getDemographicsAnalytics(999);

      expect(result).toEqual([]);
    });
  });

  describe('getCheckInAnalytics', () => {
    it('should return check-in analytics by hour for an event', async () => {
      const eventId = 1;
      const mockCheckIns = [
        { hour: '14', count: '25' },
        { hour: '15', count: '40' },
        { hour: '16', count: '35' },
      ];

      mockQueryBuilder.getRawMany.mockResolvedValue(mockCheckIns);

      const result = await service.getCheckInAnalytics(eventId);

      expect(result).toEqual([
        { hour: 14, count: 25 },
        { hour: 15, count: 40 },
        { hour: 16, count: 35 },
      ]);
      expect(mockTicketRepository.createQueryBuilder).toHaveBeenCalled();
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'ticket.eventId = :eventId',
        { eventId },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'ticket.status = :status',
        { status: 'Used' },
      );
    });

    it('should return empty array if no check-in data', async () => {
      mockQueryBuilder.getRawMany.mockResolvedValue([]);

      const result = await service.getCheckInAnalytics(999);

      expect(result).toEqual([]);
    });
  });

  describe('getLowAttendanceEvents', () => {
    it('should return events with low attendance (below 50% utilization)', async () => {
      const organizerId = 1;
      const threshold = 50;

      const mockEvents = [
        {
          eventId: 1,
          title: 'Low Attendance Event',
          startDate: new Date('2024-12-01'),
          ticketTypes: [{ capacity: 100 }],
        },
        {
          eventId: 2,
          title: 'Another Low Event',
          startDate: new Date('2024-12-15'),
          ticketTypes: [{ capacity: 200 }],
        },
      ];

      mockEventRepository.find.mockResolvedValue(mockEvents);
      mockTicketRepository.count
        .mockResolvedValueOnce(30) // 30% for first event
        .mockResolvedValueOnce(80); // 40% for second event

      const result = await service.getLowAttendanceEvents(
        organizerId,
        threshold,
      );

      expect(result).toEqual([
        {
          eventId: 1,
          eventTitle: 'Low Attendance Event',
          startDate: mockEvents[0].startDate,
          totalCapacity: 100,
          ticketsSold: 30,
          utilizationPercentage: 30,
          recommendations: [
            'Consider targeted marketing campaigns',
            'Review ticket pricing strategy',
            'Increase social media promotion',
          ],
        },
        {
          eventId: 2,
          eventTitle: 'Another Low Event',
          startDate: mockEvents[1].startDate,
          totalCapacity: 200,
          ticketsSold: 80,
          utilizationPercentage: 40,
          recommendations: [
            'Consider targeted marketing campaigns',
            'Review ticket pricing strategy',
            'Increase social media promotion',
          ],
        },
      ]);
      expect(mockEventRepository.find).toHaveBeenCalledWith({
        where: { organizerId, status: 'Published' },
        relations: ['ticketTypes'],
      });
    });

    it('should return empty array if all events have good attendance', async () => {
      const organizerId = 1;
      const threshold = 50;

      const mockEvents = [
        {
          eventId: 1,
          title: 'High Attendance Event',
          startDate: new Date('2024-12-01'),
          ticketTypes: [{ capacity: 100 }],
        },
      ];

      mockEventRepository.find.mockResolvedValue(mockEvents);
      mockTicketRepository.count.mockResolvedValue(80); // 80% utilization

      const result = await service.getLowAttendanceEvents(
        organizerId,
        threshold,
      );

      expect(result).toEqual([]);
    });

    it('should use default threshold of 50 if not provided', async () => {
      const organizerId = 1;

      mockEventRepository.find.mockResolvedValue([]);

      await service.getLowAttendanceEvents(organizerId);

      expect(mockEventRepository.find).toHaveBeenCalledWith({
        where: { organizerId, status: 'Published' },
        relations: ['ticketTypes'],
      });
    });
  });

  describe('getTopSellingEvents', () => {
    it('should return top selling events for organizer', async () => {
      const organizerId = 1;
      const limit = 5;

      const mockTopEvents = [
        {
          eventId: 1,
          eventTitle: 'Most Popular Event',
          totalRevenue: '5000.00',
          ticketsSold: '150',
        },
        {
          eventId: 2,
          eventTitle: 'Second Best Event',
          totalRevenue: '3000.00',
          ticketsSold: '100',
        },
      ];

      mockQueryBuilder.getRawMany.mockResolvedValue(mockTopEvents);

      const result = await service.getTopSellingEvents(organizerId, limit);

      expect(result).toEqual([
        {
          eventId: 1,
          eventTitle: 'Most Popular Event',
          totalRevenue: 5000,
          ticketsSold: 150,
        },
        {
          eventId: 2,
          eventTitle: 'Second Best Event',
          totalRevenue: 3000,
          ticketsSold: 100,
        },
      ]);
      expect(mockOrderRepository.createQueryBuilder).toHaveBeenCalled();
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'event.organizerId = :organizerId',
        { organizerId },
      );
    });

    it('should use default limit of 10 if not provided', async () => {
      const organizerId = 1;

      mockQueryBuilder.getRawMany.mockResolvedValue([]);

      await service.getTopSellingEvents(organizerId);

      expect(mockOrderRepository.createQueryBuilder).toHaveBeenCalled();
    });
  });

  describe('getSalesOverTime', () => {
    it('should return sales data grouped by date', async () => {
      const eventId = 1;
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');

      const mockSalesData = [
        { date: '2024-01-01', revenue: '500.00', ticketsSold: '20' },
        { date: '2024-01-02', revenue: '750.00', ticketsSold: '30' },
        { date: '2024-01-03', revenue: '600.00', ticketsSold: '25' },
      ];

      mockQueryBuilder.getRawMany.mockResolvedValue(mockSalesData);

      const result = await service.getSalesOverTime(eventId, startDate, endDate);

      expect(result).toEqual([
        { date: '2024-01-01', revenue: 500, ticketsSold: 20 },
        { date: '2024-01-02', revenue: 750, ticketsSold: 30 },
        { date: '2024-01-03', revenue: 600, ticketsSold: 25 },
      ]);
      expect(mockOrderRepository.createQueryBuilder).toHaveBeenCalled();
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'order.eventId = :eventId',
        { eventId },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'order.orderDate BETWEEN :startDate AND :endDate',
        { startDate, endDate },
      );
    });

    it('should return empty array if no sales in date range', async () => {
      mockQueryBuilder.getRawMany.mockResolvedValue([]);

      const result = await service.getSalesOverTime(
        1,
        new Date('2024-01-01'),
        new Date('2024-01-31'),
      );

      expect(result).toEqual([]);
    });
  });
});
