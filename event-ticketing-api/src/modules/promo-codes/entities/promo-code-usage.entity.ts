import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../../database/entities/user.entity';
import { PromoCode } from './promo-code.entity';
import { Order } from '../../orders/entities/order.entity';

@Entity('PromoCodeUsages')
export class PromoCodeUsage {
  @PrimaryGeneratedColumn()
  promoCodeUsageId: number;

  @Column()
  promoCodeId: number;

  @Column()
  userId: number;

  @Column()
  orderId: number;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  discountApplied: number;

  @CreateDateColumn()
  usedAt: Date;

  // Relations
  @ManyToOne(() => PromoCode, (promoCode) => promoCode.promoCodeUsages)
  @JoinColumn({ name: 'promoCodeId' })
  promoCode: PromoCode;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Order)
  @JoinColumn({ name: 'orderId' })
  order: Order;
}
