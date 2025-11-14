import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { Event } from '../../models/entities/event.entity';
import { Order } from '../../models/entities/order.entity';
import { Ticket } from '../../models/entities/ticket.entity';
import { User } from '../../models/entities/user.entity';
import { Venue } from '../../models/entities/venue.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Event, Order, Ticket, User, Venue]), AuthModule],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
