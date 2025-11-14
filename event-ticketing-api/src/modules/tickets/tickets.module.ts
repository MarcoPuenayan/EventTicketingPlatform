import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';
import { QrCodeService } from './qrcode.service';
import { Ticket } from '../../entities/ticket.entity';
import { TicketType } from '../../entities/ticket-type.entity';
import { Event } from '../../entities/event.entity';
import { Order } from '../../entities/order.entity';
import { User } from '../../entities/user.entity';
import { PromoCode } from '../../entities/promo-code.entity';
import { PromoCodeUsage } from '../../entities/promo-code-usage.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Ticket,
      TicketType,
      Event,
      Order,
      User,
      PromoCode,
      PromoCodeUsage,
    ]),
    AuthModule,
  ],
  controllers: [TicketsController],
  providers: [TicketsService, QrCodeService],
  exports: [TicketsService, QrCodeService],
})
export class TicketsModule {}
