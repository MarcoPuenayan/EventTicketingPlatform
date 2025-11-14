import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../../../database/entities/user.entity';
import { Event } from '../../events/entities/event.entity';
import { PromoCodeUsage } from './promo-code-usage.entity';

export enum PromoCodeType {
  Percentage = 'Percentage',
  FixedAmount = 'FixedAmount',
}

export enum PromoCodeStatus {
  Inactive = 'Inactive',
  Active = 'Active',
  Expired = 'Expired',
  Suspended = 'Suspended',
}

export enum PromoCodeScope {
  EventSpecific = 'EventSpecific',
  OrganizerWide = 'OrganizerWide',
}

@Entity('PromoCodes')
export class PromoCode {
  @PrimaryGeneratedColumn()
  promoCodeId: number;

  @Column({ unique: true, length: 50 })
  code: string;

  @Column({ nullable: true, length: 200 })
  description: string;

  @Column({
    type: 'varchar',
    length: 50,
  })
  type: PromoCodeType;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  value: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, nullable: true })
  minimumOrderAmount: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, nullable: true })
  maximumDiscountAmount: number;

  @Column({
    type: 'varchar',
    length: 50,
  })
  scope: PromoCodeScope;

  @Column()
  organizerId: number;

  @Column({ nullable: true })
  eventId: number;

  @Column({ type: 'datetime' })
  startDate: Date;

  @Column({ type: 'datetime' })
  endDate: Date;

  @Column({ type: 'int', default: 1 })
  maxUsageCount: number;

  @Column({ type: 'int', default: 0 })
  currentUsageCount: number;

  @Column({ type: 'int', nullable: true, default: 1 })
  maxUsagePerUser: number;

  @Column({
    type: 'varchar',
    length: 50,
    default: PromoCodeStatus.Active,
  })
  status: PromoCodeStatus;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User)
  @JoinColumn({ name: 'organizerId' })
  organizer: User;

  @ManyToOne(() => Event)
  @JoinColumn({ name: 'eventId' })
  event: Event;

  @OneToMany(() => PromoCodeUsage, (usage) => usage.promoCode)
  promoCodeUsages: PromoCodeUsage[];
}
