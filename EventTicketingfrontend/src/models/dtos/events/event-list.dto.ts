import { ApiProperty } from '@nestjs/swagger';

export class EventListDto {
  @ApiProperty({ example: 1, description: 'Event ID' })
  eventId: number;

  @ApiProperty({ example: 'Rock Concert 2025', description: 'Event title' })
  title: string;

  @ApiProperty({
    example: 'An amazing rock concert',
    description: 'Short description',
  })
  shortDescription: string;

  @ApiProperty({ example: 'John Doe', description: 'Organizer full name' })
  organizerName: string;

  @ApiProperty({ example: 1, description: 'Venue ID' })
  venueId: number;

  @ApiProperty({ example: 'Madison Square Garden', description: 'Venue name' })
  venueName: string;

  @ApiProperty({ example: 'New York', description: 'Venue city' })
  venueCity: string;

  @ApiProperty({ example: 'Music', description: 'Category name' })
  categoryName: string;

  @ApiProperty({
    example: '2025-12-31T20:00:00Z',
    description: 'Event start date and time',
  })
  startDateTime: Date;

  @ApiProperty({
    example: '2025-12-31T23:59:00Z',
    description: 'Event end date and time',
  })
  endDateTime: Date;

  @ApiProperty({
    example: '/images/events/event1.jpg',
    description: 'Event image URL',
    nullable: true,
  })
  imageUrl: string | null;

  @ApiProperty({
    example: 'Published',
    description: 'Event status',
    enum: ['Draft', 'Published', 'SoldOut', 'Cancelled', 'Completed'],
  })
  status: string;

  @ApiProperty({ example: true, description: 'Is event published' })
  isPublished: boolean;

  @ApiProperty({ example: false, description: 'Is event featured' })
  isFeatured: boolean;

  @ApiProperty({ example: 99.99, description: 'Base price', type: 'number' })
  basePrice: number;

  @ApiProperty({ example: 'USD', description: 'Currency code' })
  currency: string;

  @ApiProperty({ example: false, description: 'Is online event' })
  isOnline: boolean;

  @ApiProperty({ example: 150, description: 'Number of tickets sold' })
  ticketsSold: number;

  @ApiProperty({ example: 350, description: 'Number of available tickets' })
  availableTickets: number;
}
