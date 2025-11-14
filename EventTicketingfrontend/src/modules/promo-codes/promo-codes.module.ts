import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PromoCodesService } from './promo-codes.service';
import { PromoCodesController } from './promo-codes.controller';
import { PromoCode } from '../../models/entities/promo-code.entity';
import { PromoCodeUsage } from '../../models/entities/promo-code-usage.entity';
import { Event } from '../../models/entities/event.entity';
import { User } from '../../models/entities/user.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([PromoCode, PromoCodeUsage, Event, User]), AuthModule],
  controllers: [PromoCodesController],
  providers: [PromoCodesService],
  exports: [PromoCodesService],
})
export class PromoCodesModule {}
