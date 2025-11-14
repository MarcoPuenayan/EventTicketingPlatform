import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from '../../entities/event.entity';
import { EventCategory } from '../../entities/event-category.entity';
import { Venue } from '../../entities/venue.entity';
import { User } from '../../entities/user.entity';
import { CreateEventDto } from '../../models/dtos/events/create-event.dto';
import { UpdateEventDto } from '../../models/dtos/events/update-event.dto';
import { EventResponseDto } from '../../models/dtos/events/event-response.dto';
import { EventListDto } from '../../models/dtos/events/event-list.dto';
import { CreateCategoryDto } from '../../models/dtos/events/create-category.dto';
import { CategoryResponseDto } from '../../models/dtos/events/category-response.dto';
import { EventStatus } from '../../entities/enums/event-status.enum';
import { TicketStatus } from '../../entities/enums/ticket-status.enum';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    @InjectRepository(EventCategory)
    private readonly categoryRepository: Repository<EventCategory>,
    @InjectRepository(Venue)
    private readonly venueRepository: Repository<Venue>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Create a new event
   */
  async createEvent(
    createEventDto: CreateEventDto,
    organizerId: number,
  ): Promise<EventResponseDto> {
    // Validate venue exists
    const venue = await this.venueRepository.findOne({
      where: { venueId: createEventDto.venueId },
    });
    if (!venue) {
      throw new BadRequestException('Venue not found');
    }

    // Validate category exists
    const category = await this.categoryRepository.findOne({
      where: { categoryId: createEventDto.categoryId },
    });
    if (!category) {
      throw new BadRequestException('Category not found');
    }

    // Validate dates
    const startDate = new Date(createEventDto.startDateTime);
    const endDate = new Date(createEventDto.endDateTime);
    const now = new Date();

    if (startDate < now) {
      throw new BadRequestException('Event start date must be in the future');
    }

    if (endDate <= startDate) {
      throw new BadRequestException('Event end date must be after start date');
    }

    // Create event
    const event = this.eventRepository.create({
      ...createEventDto,
      organizerId,
      status: EventStatus.Draft,
      isPublished: false,
      isFeatured: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const savedEvent = await this.eventRepository.save(event);
    return this.getEventById(savedEvent.eventId);
  }

  /**
   * Get event by ID with full details
   */
  async getEventById(eventId: number): Promise<EventResponseDto> {
    const event = await this.eventRepository.findOne({
      where: { eventId },
      relations: ['organizer', 'venue', 'category', 'tickets'],
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    const ticketsSold = event.tickets
      ? event.tickets.filter(
          (t) =>
            t.status === TicketStatus.Valid || t.status === TicketStatus.Used,
        ).length
      : 0;

    return {
      eventId: event.eventId,
      title: event.title,
      description: event.description,
      shortDescription: event.shortDescription,
      organizerId: event.organizerId,
      organizerName: `${event.organizer.firstName} ${event.organizer.lastName}`,
      venueId: event.venueId,
      venueName: event.venue.name,
      venueCity: event.venue.city,
      categoryId: event.categoryId,
      categoryName: event.category.name,
      startDateTime: event.startDateTime,
      endDateTime: event.endDateTime,
      imageUrl: event.imageUrl,
      bannerImageUrl: event.bannerImageUrl,
      status: event.status,
      isPublished: event.isPublished,
      isFeatured: event.isFeatured,
      createdAt: event.createdAt,
      tags: event.tags,
      maxAttendees: event.maxAttendees,
      basePrice: event.basePrice,
      currency: event.currency,
      isOnline: event.isOnline,
      onlineUrl: event.onlineUrl,
      ticketsSold,
      availableTickets: event.maxAttendees - ticketsSold,
    };
  }

  /**
   * Get all events with filters and pagination
   */
  async getEvents(
    categoryId?: number,
    search?: string,
    isOnline?: boolean,
    startDate?: Date,
    endDate?: Date,
    page = 1,
    pageSize = 10,
  ): Promise<EventListDto[]> {
    const query = this.eventRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.organizer', 'organizer')
      .leftJoinAndSelect('event.venue', 'venue')
      .leftJoinAndSelect('event.category', 'category')
      .leftJoinAndSelect('event.tickets', 'tickets')
      .where('event.isPublished = :isPublished', { isPublished: true });

    // Apply filters
    if (categoryId) {
      query.andWhere('event.categoryId = :categoryId', { categoryId });
    }

    if (search) {
      query.andWhere(
        '(event.title LIKE :search OR event.description LIKE :search OR event.tags LIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (isOnline !== undefined) {
      query.andWhere('event.isOnline = :isOnline', { isOnline });
    }

    if (startDate) {
      query.andWhere('event.startDateTime >= :startDate', { startDate });
    }

    if (endDate) {
      query.andWhere('event.endDateTime <= :endDate', { endDate });
    }

    // Pagination
    const events = await query
      .orderBy('event.startDateTime', 'ASC')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getMany();

    return events.map((event) => this.mapToEventListDto(event));
  }

  /**
   * Get events by organizer
   */
  async getEventsByOrganizer(organizerId: number): Promise<EventListDto[]> {
    const events = await this.eventRepository.find({
      where: { organizerId },
      relations: ['organizer', 'venue', 'category', 'tickets'],
      order: { createdAt: 'DESC' },
    });

    return events.map((event) => this.mapToEventListDto(event));
  }

  /**
   * Update event
   */
  async updateEvent(
    eventId: number,
    updateEventDto: UpdateEventDto,
    organizerId: number,
  ): Promise<EventResponseDto> {
    const event = await this.eventRepository.findOne({ where: { eventId } });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (event.organizerId !== organizerId) {
      throw new ForbiddenException('You can only update your own events');
    }

    // Update only provided fields
    if (updateEventDto.title !== undefined) {
      event.title = updateEventDto.title;
    }
    if (updateEventDto.description !== undefined) {
      event.description = updateEventDto.description;
    }
    if (updateEventDto.shortDescription !== undefined) {
      event.shortDescription = updateEventDto.shortDescription;
    }
    if (updateEventDto.venueId !== undefined) {
      event.venueId = updateEventDto.venueId;
    }
    if (updateEventDto.categoryId !== undefined) {
      event.categoryId = updateEventDto.categoryId;
    }
    if (updateEventDto.startDateTime !== undefined) {
      event.startDateTime = updateEventDto.startDateTime;
    }
    if (updateEventDto.endDateTime !== undefined) {
      event.endDateTime = updateEventDto.endDateTime;
    }
    if (updateEventDto.imageUrl !== undefined) {
      event.imageUrl = updateEventDto.imageUrl;
    }
    if (updateEventDto.bannerImageUrl !== undefined) {
      event.bannerImageUrl = updateEventDto.bannerImageUrl;
    }
    if (updateEventDto.tags !== undefined) {
      event.tags = updateEventDto.tags;
    }
    if (updateEventDto.maxAttendees !== undefined) {
      event.maxAttendees = updateEventDto.maxAttendees;
    }
    if (updateEventDto.isOnline !== undefined) {
      event.isOnline = updateEventDto.isOnline;
    }
    if (updateEventDto.onlineUrl !== undefined) {
      event.onlineUrl = updateEventDto.onlineUrl;
    }

    event.updatedAt = new Date();

    await this.eventRepository.save(event);
    return this.getEventById(eventId);
  }

  /**
   * Delete event
   */
  async deleteEvent(eventId: number, organizerId: number): Promise<boolean> {
    const event = await this.eventRepository.findOne({ where: { eventId } });

    if (!event) {
      return false;
    }

    if (event.organizerId !== organizerId) {
      throw new ForbiddenException('You can only delete your own events');
    }

    await this.eventRepository.remove(event);
    return true;
  }

  /**
   * Publish event
   */
  async publishEvent(eventId: number, organizerId: number): Promise<boolean> {
    const event = await this.eventRepository.findOne({ where: { eventId } });

    if (!event) {
      return false;
    }

    if (event.organizerId !== organizerId) {
      throw new ForbiddenException('You can only publish your own events');
    }

    event.isPublished = true;
    event.status = EventStatus.Published;
    event.updatedAt = new Date();

    await this.eventRepository.save(event);
    return true;
  }

  /**
   * Unpublish event
   */
  async unpublishEvent(eventId: number, organizerId: number): Promise<boolean> {
    const event = await this.eventRepository.findOne({ where: { eventId } });

    if (!event) {
      return false;
    }

    if (event.organizerId !== organizerId) {
      throw new ForbiddenException('You can only unpublish your own events');
    }

    event.isPublished = false;
    event.status = EventStatus.Draft;
    event.updatedAt = new Date();

    await this.eventRepository.save(event);
    return true;
  }

  // ========== CATEGORIES ==========

  /**
   * Create category
   */
  async createCategory(
    createCategoryDto: CreateCategoryDto,
  ): Promise<CategoryResponseDto> {
    const category = this.categoryRepository.create({
      ...createCategoryDto,
      isActive: true,
    });

    const savedCategory = await this.categoryRepository.save(category);

    return {
      categoryId: savedCategory.categoryId,
      name: savedCategory.name,
      description: savedCategory.description,
      iconUrl: savedCategory.iconUrl,
      isActive: savedCategory.isActive,
      eventCount: 0,
    };
  }

  /**
   * Get all active categories
   */
  async getCategories(): Promise<CategoryResponseDto[]> {
    const categories = await this.categoryRepository.find({
      where: { isActive: true },
      relations: ['events'],
    });

    return categories.map((category) => ({
      categoryId: category.categoryId,
      name: category.name,
      description: category.description,
      iconUrl: category.iconUrl,
      isActive: category.isActive,
      eventCount: category.events
        ? category.events.filter((e) => e.isPublished).length
        : 0,
    }));
  }

  /**
   * Get category by ID
   */
  async getCategoryById(categoryId: number): Promise<CategoryResponseDto> {
    const category = await this.categoryRepository.findOne({
      where: { categoryId },
      relations: ['events'],
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return {
      categoryId: category.categoryId,
      name: category.name,
      description: category.description,
      iconUrl: category.iconUrl,
      isActive: category.isActive,
      eventCount: category.events
        ? category.events.filter((e) => e.isPublished).length
        : 0,
    };
  }

  // ========== HELPER METHODS ==========

  private mapToEventListDto(event: Event): EventListDto {
    const ticketsSold = event.tickets
      ? event.tickets.filter(
          (t) =>
            t.status === TicketStatus.Valid || t.status === TicketStatus.Used,
        ).length
      : 0;

    return {
      eventId: event.eventId,
      title: event.title,
      shortDescription: event.shortDescription,
      organizerName: `${event.organizer.firstName} ${event.organizer.lastName}`,
      venueId: event.venueId,
      venueName: event.venue.name,
      venueCity: event.venue.city,
      categoryName: event.category.name,
      startDateTime: event.startDateTime,
      endDateTime: event.endDateTime,
      imageUrl: event.imageUrl,
      status: event.status,
      isPublished: event.isPublished,
      isFeatured: event.isFeatured,
      basePrice: event.basePrice,
      currency: event.currency,
      isOnline: event.isOnline,
      ticketsSold,
      availableTickets: event.maxAttendees - ticketsSold,
    };
  }
}
