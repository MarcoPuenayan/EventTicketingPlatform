import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Event } from '../../events/entities/event.entity';
import { TicketType } from './ticket-type.entity';
import { Order } from '../../orders/entities/order.entity';
import { User } from '../../../database/entities/user.entity';

export enum TicketStatus {
  Valid = 'Valid',
  Used = 'Used',
  Cancelled = 'Cancelled',
  Refunded = 'Refunded',
}

@Entity('Tickets')
export class Ticket {
  @PrimaryGeneratedColumn()
  ticketId: number;

  @Column()
  eventId: number;

  @Column()
  ticketTypeId: number;

  @Column()
  orderId: number;

  @Column()
  userId: number;

  @Column({ unique: true, length: 100 })
  ticketNumber: string;

  @Column({ nullable: true, type: 'text' })
  qrCode: string;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  pricePaid: number;

  @Column({
    type: 'varchar',
    length: 50,
    default: TicketStatus.Valid,
  })
  status: TicketStatus;

  @CreateDateColumn()
  purchaseDate: Date;

  @Column({ type: 'datetime', nullable: true })
  checkInDate: Date;

  @Column({ nullable: true, length: 100 })
  attendeeFirstName: string;

  @Column({ nullable: true, length: 100 })
  attendeeLastName: string;

  @Column({ nullable: true, length: 255 })
  attendeeEmail: string;

  // Relations
  @ManyToOne(() => Event, (event) => event.tickets)
  @JoinColumn({ name: 'eventId' })
  event: Event;

  @ManyToOne(() => TicketType, (ticketType) => ticketType.tickets)
  @JoinColumn({ name: 'ticketTypeId' })
  ticketType: TicketType;

  @ManyToOne(() => Order, (order) => order.tickets)
  @JoinColumn({ name: 'orderId' })
  order: Order;

  @ManyToOne(() => User, (user) => user.tickets)
  @JoinColumn({ name: 'userId' })
  user: User;
}
