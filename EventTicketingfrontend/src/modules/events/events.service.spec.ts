import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventsService } from './events.service';
import { Event } from '../../models/entities/event.entity';
import { Category } from '../../models/entities/category.entity';
import { Venue } from '../../models/entities/venue.entity';
import { TicketType } from '../../models/entities/ticket-type.entity';
import { CreateEventDto } from '../../models/dtos/events/create-event.dto';
import { NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { EventStatus } from '../../models/entities/enums';

describe('EventsService', () => {
  let service: EventsService;
  let eventRepository: Repository<Event>;
  let categoryRepository: Repository<Category>;
  let venueRepository: Repository<Venue>;
  let ticketTypeRepository: Repository<TicketType>;

  const mockEventRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    count: jest.fn(),
    createQueryBuilder: jest.fn(),
    remove: jest.fn(),
  };

  const mockCategoryRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockVenueRepository = {
    findOne: jest.fn(),
  };

  const mockTicketTypeRepository = {
    count: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        {
          provide: getRepositoryToken(Event),
          useValue: mockEventRepository,
        },
        {
          provide: getRepositoryToken(Category),
          useValue: mockCategoryRepository,
        },
        {
          provide: getRepositoryToken(Venue),
          useValue: mockVenueRepository,
        },
        {
          provide: getRepositoryToken(TicketType),
          useValue: mockTicketTypeRepository,
        },
      ],
    }).compile();

    service = module.get<EventsService>(EventsService);
    eventRepository = module.get<Repository<Event>>(getRepositoryToken(Event));
    categoryRepository = module.get<Repository<Category>>(getRepositoryToken(Category));
    venueRepository = module.get<Repository<Venue>>(getRepositoryToken(Venue));
    ticketTypeRepository = module.get<Repository<TicketType>>(getRepositoryToken(TicketType));

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createEvent', () => {
    const createEventDto: CreateEventDto = {
      title: 'Test Event',
      description: 'Test Description',
      startDateTime: new Date('2025-12-01T10:00:00Z'),
      endDateTime: new Date('2025-12-01T18:00:00Z'),
      venueId: 1,
      categoryId: 1,
      maxAttendees: 100,
      isOnline: false,
    };

    const organizerId = 1;

    it('should successfully create an event', async () => {
      const mockVenue = { venueId: 1, name: 'Test Venue' };
      const mockCategory = { categoryId: 1, name: 'Test Category' };
      const mockEvent = {
        eventId: 1,
        ...createEventDto,
        organizerId,
        status: EventStatus.Draft,
        isPublished: false,
      };

      mockVenueRepository.findOne.mockResolvedValue(mockVenue);
      mockCategoryRepository.findOne.mockResolvedValue(mockCategory);
      mockEventRepository.create.mockReturnValue(mockEvent);
      mockEventRepository.save.mockResolvedValue(mockEvent);
      mockEventRepository.findOne.mockResolvedValue({
        ...mockEvent,
        venue: mockVenue,
        category: mockCategory,
        organizer: { userId: organizerId, firstName: 'John', lastName: 'Doe' },
        ticketTypes: [],
        tickets: [],
      });

      const result = await service.createEvent(createEventDto, organizerId);

      expect(mockVenueRepository.findOne).toHaveBeenCalledWith({ where: { venueId: createEventDto.venueId } });
      expect(mockCategoryRepository.findOne).toHaveBeenCalledWith({ where: { categoryId: createEventDto.categoryId } });
      expect(mockEventRepository.save).toHaveBeenCalled();
      expect(result).toHaveProperty('eventId', 1);
      expect(result.status).toBe(EventStatus.Draft);
    });

    it('should throw NotFoundException if venue not found', async () => {
      mockVenueRepository.findOne.mockResolvedValue(null);

      await expect(service.createEvent(createEventDto, organizerId)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if category not found', async () => {
      const mockVenue = { venueId: 1, name: 'Test Venue' };
      mockVenueRepository.findOne.mockResolvedValue(mockVenue);
      mockCategoryRepository.findOne.mockResolvedValue(null);

      await expect(service.createEvent(createEventDto, organizerId)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if end date is before start date', async () => {
      const invalidDto = {
        ...createEventDto,
        startDateTime: new Date('2025-12-01T18:00:00Z'),
        endDateTime: new Date('2025-12-01T10:00:00Z'),
      };

      const mockVenue = { venueId: 1, name: 'Test Venue' };
      const mockCategory = { categoryId: 1, name: 'Test Category' };
      mockVenueRepository.findOne.mockResolvedValue(mockVenue);
      mockCategoryRepository.findOne.mockResolvedValue(mockCategory);

      await expect(service.createEvent(invalidDto, organizerId)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if start date is in the past', async () => {
      const invalidDto = {
        ...createEventDto,
        startDateTime: new Date('2020-01-01T10:00:00Z'),
        endDateTime: new Date('2020-01-01T18:00:00Z'),
      };

      const mockVenue = { venueId: 1, name: 'Test Venue' };
      const mockCategory = { categoryId: 1, name: 'Test Category' };
      mockVenueRepository.findOne.mockResolvedValue(mockVenue);
      mockCategoryRepository.findOne.mockResolvedValue(mockCategory);

      await expect(service.createEvent(invalidDto, organizerId)).rejects.toThrow(BadRequestException);
    });
  });

  describe('getEventById', () => {
    it('should return event with calculated ticket metrics', async () => {
      const mockEvent = {
        eventId: 1,
        title: 'Test Event',
        organizerId: 1,
        maxAttendees: 100,
        ticketTypes: [
          { ticketTypeId: 1, quantityAvailable: 50, quantitySold: 30 },
          { ticketTypeId: 2, quantityAvailable: 50, quantitySold: 40 },
        ],
        tickets: new Array(70),
        venue: { venueId: 1, name: 'Test Venue' },
        category: { categoryId: 1, name: 'Test Category' },
        organizer: { userId: 1, firstName: 'John', lastName: 'Doe' },
      };

      mockEventRepository.findOne.mockResolvedValue(mockEvent);

      const result = await service.getEventById(1);

      expect(result).toBeDefined();
      expect(result.ticketsSold).toBe(70);
      expect(result.availableTickets).toBe(30);
      expect(mockEventRepository.findOne).toHaveBeenCalledWith({
        where: { eventId: 1 },
        relations: ['venue', 'category', 'organizer', 'ticketTypes', 'tickets'],
      });
    });

    it('should throw NotFoundException if event not found', async () => {
      mockEventRepository.findOne.mockResolvedValue(null);

      await expect(service.getEventById(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('publishEvent', () => {
    it('should successfully publish an event with ticket types', async () => {
      const mockEvent = {
        eventId: 1,
        title: 'Test Event',
        organizerId: 1,
        status: EventStatus.Draft,
        isPublished: false,
      };

      mockEventRepository.findOne.mockResolvedValue(mockEvent);
      mockTicketTypeRepository.count.mockResolvedValue(2);
      mockEventRepository.save.mockResolvedValue({
        ...mockEvent,
        status: EventStatus.Published,
        isPublished: true,
      });

      const result = await service.publishEvent(1, 1);

      expect(result.status).toBe(EventStatus.Published);
      expect(result.isPublished).toBe(true);
      expect(mockTicketTypeRepository.count).toHaveBeenCalledWith({ where: { eventId: 1 } });
    });

    it('should throw BadRequestException if no ticket types exist', async () => {
      const mockEvent = {
        eventId: 1,
        organizerId: 1,
        status: EventStatus.Draft,
      };

      mockEventRepository.findOne.mockResolvedValue(mockEvent);
      mockTicketTypeRepository.count.mockResolvedValue(0);

      await expect(service.publishEvent(1, 1)).rejects.toThrow(BadRequestException);
    });

    it('should throw ForbiddenException if user is not the organizer', async () => {
      const mockEvent = {
        eventId: 1,
        organizerId: 1,
        status: EventStatus.Draft,
      };

      mockEventRepository.findOne.mockResolvedValue(mockEvent);

      await expect(service.publishEvent(1, 999)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('unpublishEvent', () => {
    it('should successfully unpublish an event', async () => {
      const mockEvent = {
        eventId: 1,
        organizerId: 1,
        status: EventStatus.Published,
        isPublished: true,
      };

      mockEventRepository.findOne.mockResolvedValue(mockEvent);
      mockEventRepository.save.mockResolvedValue({
        ...mockEvent,
        status: EventStatus.Draft,
        isPublished: false,
      });

      const result = await service.unpublishEvent(1, 1);

      expect(result.status).toBe(EventStatus.Draft);
      expect(result.isPublished).toBe(false);
    });
  });

  describe('deleteEvent', () => {
    it('should successfully delete an event in Draft status', async () => {
      const mockEvent = {
        eventId: 1,
        organizerId: 1,
        status: EventStatus.Draft,
      };

      mockEventRepository.findOne.mockResolvedValue(mockEvent);
      mockEventRepository.remove.mockResolvedValue(mockEvent);

      const result = await service.deleteEvent(1, 1);

      expect(result).toBe(true);
      expect(mockEventRepository.remove).toHaveBeenCalledWith(mockEvent);
    });

    it('should throw BadRequestException if event has ticket sales', async () => {
      const mockEvent = {
        eventId: 1,
        organizerId: 1,
        status: EventStatus.Published,
      };

      mockEventRepository.findOne.mockResolvedValue(mockEvent);

      await expect(service.deleteEvent(1, 1)).rejects.toThrow(BadRequestException);
    });
  });

  describe('getEvents', () => {
    it('should return paginated events with filters', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([
          [
            {
              eventId: 1,
              title: 'Test Event',
              ticketTypes: [],
              tickets: [],
            },
          ],
          1,
        ]),
      };

      mockEventRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.getEvents(1, 10, { categoryId: 1 });

      expect(result).toHaveProperty('events');
      expect(result).toHaveProperty('total', 1);
      expect(result).toHaveProperty('page', 1);
      expect(result).toHaveProperty('limit', 10);
    });
  });
});
