import { ApiProperty } from '@nestjs/swagger';

export class TicketValidationDto {
  @ApiProperty({ example: true, description: 'Is the ticket valid' })
  isValid: boolean;

  @ApiProperty({
    example: 'Ticket valid',
    description: 'Validation message',
  })
  message: string;

  @ApiProperty({
    example: 'TKT-20251113-123456',
    description: 'Ticket number',
  })
  ticketNumber: string;

  @ApiProperty({
    example: 'Rock Concert 2025',
    description: 'Event title',
    required: false,
  })
  eventTitle?: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'Attendee name',
    required: false,
  })
  attendeeName?: string;

  @ApiProperty({
    example: 'General Admission',
    description: 'Ticket type name',
    required: false,
  })
  ticketTypeName?: string;

  @ApiProperty({
    example: '2025-11-13T18:30:00Z',
    description: 'Check-in date if already used',
    required: false,
  })
  checkInDate?: Date;
}
