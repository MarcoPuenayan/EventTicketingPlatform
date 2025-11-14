import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CheckInTicketDto {
  @ApiProperty({
    example: 'TKT-20251113-123456',
    description: 'Ticket number to check-in',
  })
  @IsNotEmpty()
  @IsString()
  ticketNumber: string;
}
