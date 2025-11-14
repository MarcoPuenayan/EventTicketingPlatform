import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
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
  ApiQuery,
} from '@nestjs/swagger';
import { EventsService } from './events.service';
import { CreateEventDto } from '../../models/dtos/events/create-event.dto';
import { UpdateEventDto } from '../../models/dtos/events/update-event.dto';
import { EventResponseDto } from '../../models/dtos/events/event-response.dto';
import { EventListDto } from '../../models/dtos/events/event-list.dto';
import { CreateCategoryDto } from '../../models/dtos/events/create-category.dto';
import { CategoryResponseDto } from '../../models/dtos/events/category-response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../../entities/user.entity';
import { RoleType } from '../../entities/enums/role-type.enum';

@ApiTags('Events')
@Controller('api/events')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  // ========== PUBLIC ENDPOINTS ==========

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all published events with filters' })
  @ApiResponse({
    status: 200,
    description: 'Events retrieved successfully',
    type: [EventListDto],
  })
  @ApiQuery({ name: 'categoryId', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'isOnline', required: false, type: Boolean })
  @ApiQuery({ name: 'startDate', required: false, type: Date })
  @ApiQuery({ name: 'endDate', required: false, type: Date })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, type: Number, example: 10 })
  async getEvents(
    @Query('categoryId') categoryId?: number,
    @Query('search') search?: string,
    @Query('isOnline') isOnline?: boolean,
    @Query('startDate') startDate?: Date,
    @Query('endDate') endDate?: Date,
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 10,
  ): Promise<EventListDto[]> {
    return this.eventsService.getEvents(
      categoryId,
      search,
      isOnline,
      startDate,
      endDate,
      page,
      pageSize,
    );
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get event by ID' })
  @ApiResponse({
    status: 200,
    description: 'Event found',
    type: EventResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async getEvent(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<EventResponseDto> {
    return this.eventsService.getEventById(id);
  }

  // ========== AUTHENTICATED ENDPOINTS ==========

  @Post()
  @ApiBearerAuth()
  @Roles(RoleType.Organizer, RoleType.Admin)
  @ApiOperation({ summary: 'Create a new event' })
  @ApiResponse({
    status: 201,
    description: 'Event created successfully',
    type: EventResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Organizer role required' })
  async createEvent(
    @Body() createEventDto: CreateEventDto,
    @CurrentUser() user: User,
  ): Promise<EventResponseDto> {
    return this.eventsService.createEvent(createEventDto, user.userId);
  }

  @Put(':id')
  @ApiBearerAuth()
  @Roles(RoleType.Organizer, RoleType.Admin)
  @ApiOperation({ summary: 'Update an event' })
  @ApiResponse({
    status: 200,
    description: 'Event updated successfully',
    type: EventResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not the event owner' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async updateEvent(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEventDto: UpdateEventDto,
    @CurrentUser() user: User,
  ): Promise<EventResponseDto> {
    return this.eventsService.updateEvent(id, updateEventDto, user.userId);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @Roles(RoleType.Organizer, RoleType.Admin)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an event' })
  @ApiResponse({ status: 204, description: 'Event deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not the event owner' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async deleteEvent(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
  ): Promise<void> {
    const result = await this.eventsService.deleteEvent(id, user.userId);
    if (!result) {
      throw new Error('Event not found');
    }
  }

  @Post(':id/publish')
  @ApiBearerAuth()
  @Roles(RoleType.Organizer, RoleType.Admin)
  @ApiOperation({ summary: 'Publish an event' })
  @ApiResponse({ status: 200, description: 'Event published successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not the event owner' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async publishEvent(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
  ): Promise<{ message: string }> {
    const result = await this.eventsService.publishEvent(id, user.userId);
    if (!result) {
      throw new Error('Event not found');
    }
    return { message: 'Event published successfully' };
  }

  @Post(':id/unpublish')
  @ApiBearerAuth()
  @Roles(RoleType.Organizer, RoleType.Admin)
  @ApiOperation({ summary: 'Unpublish an event' })
  @ApiResponse({ status: 200, description: 'Event unpublished successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not the event owner' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async unpublishEvent(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
  ): Promise<{ message: string }> {
    const result = await this.eventsService.unpublishEvent(id, user.userId);
    if (!result) {
      throw new Error('Event not found');
    }
    return { message: 'Event unpublished successfully' };
  }

  @Get('my-events')
  @ApiBearerAuth()
  @Roles(RoleType.Organizer, RoleType.Admin)
  @ApiOperation({ summary: 'Get events created by current user' })
  @ApiResponse({
    status: 200,
    description: 'Events retrieved successfully',
    type: [EventListDto],
  })
  async getMyEvents(@CurrentUser() user: User): Promise<EventListDto[]> {
    return this.eventsService.getEventsByOrganizer(user.userId);
  }

  // ========== CATEGORIES ENDPOINTS ==========

  @Get('categories')
  @Public()
  @ApiOperation({ summary: 'Get all active categories' })
  @ApiResponse({
    status: 200,
    description: 'Categories retrieved successfully',
    type: [CategoryResponseDto],
  })
  async getCategories(): Promise<CategoryResponseDto[]> {
    return this.eventsService.getCategories();
  }

  @Get('categories/:id')
  @Public()
  @ApiOperation({ summary: 'Get category by ID' })
  @ApiResponse({
    status: 200,
    description: 'Category found',
    type: CategoryResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async getCategoryById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<CategoryResponseDto> {
    return this.eventsService.getCategoryById(id);
  }

  @Post('categories')
  @ApiBearerAuth()
  @Roles(RoleType.Admin)
  @ApiOperation({ summary: 'Create a new category' })
  @ApiResponse({
    status: 201,
    description: 'Category created successfully',
    type: CategoryResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  async createCategory(
    @Body() createCategoryDto: CreateCategoryDto,
  ): Promise<CategoryResponseDto> {
    return this.eventsService.createCategory(createCategoryDto);
  }
}
