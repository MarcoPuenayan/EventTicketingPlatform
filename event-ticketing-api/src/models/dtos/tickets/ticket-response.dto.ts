import { ApiProperty } from '@nestjs/swagger';

export class TicketResponseDto {
  @ApiProperty({ example: 1, description: 'Ticket ID' })
  ticketId: number;

  @ApiProperty({ example: 1, description: 'Event ID' })
  eventId: number;

  @ApiProperty({ example: 'Rock Concert 2025', description: 'Event title' })
  eventTitle: string;

  @ApiProperty({ example: 1, description: 'Ticket type ID' })
  ticketTypeId: number;

  @ApiProperty({
    example: 'General Admission',
    description: 'Ticket type name',
  })
  ticketTypeName: string;

  @ApiProperty({
    example: 'TKT-20251113-123456',
    description: 'Unique ticket number',
  })
  ticketNumber: string;

  @ApiProperty({
    example:
      '{"ticketNumber":"TKT-20251113-123456","eventId":1,"eventTitle":"Rock Concert 2025","timestamp":"2025-11-13T10:00:00Z"}',
    description: 'QR code data (JSON string)',
  })
  qrCode: string;

  @ApiProperty({ example: 99.99, description: 'Price paid for ticket' })
  pricePaid: number;

  @ApiProperty({ example: 'USD', description: 'Currency code' })
  currency: string;

  @ApiProperty({
    example: 'Valid',
    description: 'Ticket status',
    enum: ['Valid', 'Used', 'Cancelled', 'Refunded'],
  })
  status: string;

  @ApiProperty({
    example: '2025-11-01T15:30:00Z',
    description: 'Purchase date',
  })
  purchaseDate: Date;

  @ApiProperty({
    example: '2025-11-13T18:45:00Z',
    description: 'Check-in date',
    nullable: true,
  })
  checkInDate: Date | null;

  @ApiProperty({ example: 'John', description: 'Attendee first name' })
  attendeeFirstName: string;

  @ApiProperty({ example: 'Doe', description: 'Attendee last name' })
  attendeeLastName: string;

  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'Attendee email',
  })
  attendeeEmail: string;

  @ApiProperty({
    example: '2025-12-31T20:00:00Z',
    description: 'Event start date and time',
  })
  eventStartDateTime: string;

  @ApiProperty({
    example: 'Madison Square Garden',
    description: 'Venue name',
  })
  venueName: string;

  @ApiProperty({
    example: '4 Pennsylvania Plaza, New York, NY 10001',
    description: 'Venue address',
  })
  venueAddress: string;
}
