import { ApiProperty } from '@nestjs/swagger';

export class EventResponseDto {
  @ApiProperty({ example: 1 })
  eventId: number;

  @ApiProperty({ example: 'Summer Music Festival 2025' })
  title: string;

  @ApiProperty({ example: 'Join us for an amazing summer music festival...' })
  description: string;

  @ApiProperty({ example: 'The biggest summer music festival' })
  shortDescription?: string;

  @ApiProperty({ example: 1 })
  organizerId: number;

  @ApiProperty({ example: 'John Doe Events' })
  organizerName: string;

  @ApiProperty({ example: 1 })
  venueId: number;

  @ApiProperty({ example: 'Madison Square Garden' })
  venueName: string;

  @ApiProperty({ example: 'New York' })
  venueCity: string;

  @ApiProperty({ example: 1 })
  categoryId: number;

  @ApiProperty({ example: 'Music' })
  categoryName: string;

  @ApiProperty({ example: '2025-07-15T19:00:00Z' })
  startDateTime: Date;

  @ApiProperty({ example: '2025-07-15T23:00:00Z' })
  endDateTime: Date;

  @ApiProperty({ example: 'https://example.com/images/event.jpg' })
  imageUrl?: string;

  @ApiProperty({ example: 'https://example.com/images/banner.jpg' })
  bannerImageUrl?: string;

  @ApiProperty({ example: 'Published' })
  status: string;

  @ApiProperty({ example: true })
  isPublished: boolean;

  @ApiProperty({ example: false })
  isFeatured: boolean;

  @ApiProperty({ example: '2025-01-13T10:00:00Z' })
  createdAt: Date;

  @ApiProperty({ example: 'music,festival,summer' })
  tags?: string;

  @ApiProperty({ example: 5000 })
  maxAttendees: number;

  @ApiProperty({ example: 49.99 })
  basePrice: number;

  @ApiProperty({ example: 'USD' })
  currency: string;

  @ApiProperty({ example: false })
  isOnline: boolean;

  @ApiProperty({ example: 'https://zoom.us/j/123456789' })
  onlineUrl?: string;

  @ApiProperty({ example: 1250 })
  ticketsSold: number;

  @ApiProperty({ example: 3750 })
  availableTickets: number;
}
