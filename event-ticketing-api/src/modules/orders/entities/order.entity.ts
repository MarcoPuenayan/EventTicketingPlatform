import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../../../database/entities/user.entity';
import { Ticket } from '../../tickets/entities/ticket.entity';

export enum OrderStatus {
  Pending = 'Pending',
  Completed = 'Completed',
  Cancelled = 'Cancelled',
  Refunded = 'Refunded',
  Failed = 'Failed',
}

@Entity('Orders')
export class Order {
  @PrimaryGeneratedColumn()
  orderId: number;

  @Column()
  userId: number;

  @Column({ unique: true, length: 100 })
  orderNumber: string;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  subTotal: number;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  taxAmount: number;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  serviceFee: number;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  totalAmount: number;

  @Column({ length: 10, default: 'USD' })
  currency: string;

  @Column({
    type: 'varchar',
    length: 50,
    default: OrderStatus.Pending,
  })
  status: OrderStatus;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'datetime', nullable: true })
  completedAt: Date;

  @Column({ length: 255 })
  billingEmail: string;

  @Column({ length: 100 })
  billingFirstName: string;

  @Column({ length: 100 })
  billingLastName: string;

  @Column({ nullable: true, length: 255 })
  billingAddress: string;

  @Column({ nullable: true, length: 100 })
  billingCity: string;

  @Column({ nullable: true, length: 100 })
  billingState: string;

  @Column({ nullable: true, length: 20 })
  billingZipCode: string;

  @Column({ nullable: true, length: 50 })
  promoCode: string;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  discountAmount: number;

  // Relations
  @ManyToOne(() => User, (user) => user.orders)
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(() => Ticket, (ticket) => ticket.order, { cascade: true })
  tickets: Ticket[];
}
