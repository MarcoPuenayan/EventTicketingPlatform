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

@Entity('UserFavoriteEvents')
export class UserFavoriteEvent {
  @PrimaryGeneratedColumn()
  favoriteId: number;

  @Column()
  userId: number;

  @Column()
  eventId: number;

  @CreateDateColumn()
  addedAt: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.favoriteEvents)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Event, (event) => event.favoritedBy)
  @JoinColumn({ name: 'eventId' })
  event: Event;
}
