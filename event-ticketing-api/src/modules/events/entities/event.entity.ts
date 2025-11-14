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
import { User } from '../../database/entities/user.entity';
import { Venue } from '../venues/entities/venue.entity';
import { EventCategory } from './event-category.entity';
import { TicketType } from '../tickets/entities/ticket-type.entity';
import { Ticket } from '../tickets/entities/ticket.entity';
import { EventReview } from './event-review.entity';
import { UserFavoriteEvent } from './user-favorite-event.entity';

export enum EventStatus {
  Draft = 'Draft',
  Published = 'Published',
  SoldOut = 'SoldOut',
  Cancelled = 'Cancelled',
  Completed = 'Completed',
}

@Entity('Events')
export class Event {
  @PrimaryGeneratedColumn()
  eventId: number;

  @Column({ length: 200 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ nullable: true, length: 500 })
  shortDescription: string;

  @Column()
  organizerId: number;

  @Column()
  venueId: number;

  @Column()
  categoryId: number;

  @Column({ type: 'datetime' })
  startDateTime: Date;

  @Column({ type: 'datetime' })
  endDateTime: Date;

  @Column({ nullable: true, length: 500 })
  imageUrl: string;

  @Column({ nullable: true, length: 500 })
  bannerImageUrl: string;

  @Column({
    type: 'varchar',
    length: 50,
    default: EventStatus.Draft,
  })
  status: EventStatus;

  @Column({ default: false })
  isPublished: boolean;

  @Column({ default: false })
  isFeatured: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true, length: 500 })
  tags: string;

  @Column({ type: 'int' })
  maxAttendees: number;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  basePrice: number;

  @Column({ length: 10, default: 'USD' })
  currency: string;

  @Column({ default: false })
  isOnline: boolean;

  @Column({ nullable: true, length: 500 })
  onlineUrl: string;

  // Relations
  @ManyToOne(() => User, (user) => user.organizedEvents)
  @JoinColumn({ name: 'organizerId' })
  organizer: User;

  @ManyToOne(() => Venue, (venue) => venue.events)
  @JoinColumn({ name: 'venueId' })
  venue: Venue;

  @ManyToOne(() => EventCategory, (category) => category.events)
  @JoinColumn({ name: 'categoryId' })
  category: EventCategory;

  @OneToMany(() => TicketType, (ticketType) => ticketType.event, { cascade: true })
  ticketTypes: TicketType[];

  @OneToMany(() => Ticket, (ticket) => ticket.event)
  tickets: Ticket[];

  @OneToMany(() => EventReview, (review) => review.event)
  reviews: EventReview[];

  @OneToMany(() => UserFavoriteEvent, (favorite) => favorite.event)
  favoritedBy: UserFavoriteEvent[];
}
