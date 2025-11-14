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
import { Event } from '../../events/entities/event.entity';
import { Ticket } from './ticket.entity';

@Entity('TicketTypes')
export class TicketType {
  @PrimaryGeneratedColumn()
  ticketTypeId: number;

  @Column()
  eventId: number;

  @Column({ length: 100 })
  name: string;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  price: number;

  @Column({ type: 'int' })
  quantityAvailable: number;

  @Column({ type: 'int', default: 0 })
  quantitySold: number;

  @Column({ type: 'datetime', nullable: true })
  saleStartDate: Date;

  @Column({ type: 'datetime', nullable: true })
  saleEndDate: Date;

  @Column({ type: 'int', default: 1 })
  minQuantityPerOrder: number;

  @Column({ type: 'int', default: 10 })
  maxQuantityPerOrder: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'int', default: 0 })
  sortOrder: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Event, (event) => event.ticketTypes)
  @JoinColumn({ name: 'eventId' })
  event: Event;

  @OneToMany(() => Ticket, (ticket) => ticket.ticketType)
  tickets: Ticket[];
}
