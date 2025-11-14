import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../../database/entities/user.entity';
import { Event } from './event.entity';

@Entity('EventReviews')
export class EventReview {
  @PrimaryGeneratedColumn()
  reviewId: number;

  @Column()
  eventId: number;

  @Column()
  userId: number;

  @Column({ type: 'int' })
  rating: number;

  @Column({ nullable: true, type: 'text' })
  comment: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ default: true })
  isVisible: boolean;

  // Relations
  @ManyToOne(() => Event, (event) => event.reviews)
  @JoinColumn({ name: 'eventId' })
  event: Event;

  @ManyToOne(() => User, (user) => user.reviews)
  @JoinColumn({ name: 'userId' })
  user: User;
}
