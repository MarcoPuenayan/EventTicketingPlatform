import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
} from 'typeorm';
import { UserProfile } from './user-profile.entity';
import { UserRole } from './user-role.entity';
import { UserPreferences } from './user-preferences.entity';
import { UserNotification } from './user-notification.entity';
import { Event } from '../events/entities/event.entity';
import { Ticket } from '../tickets/entities/ticket.entity';
import { Order } from '../orders/entities/order.entity';
import { EventReview } from '../events/entities/event-review.entity';
import { UserFavoriteEvent } from '../events/entities/user-favorite-event.entity';

export enum UserStatus {
  Active = 'Active',
  Inactive = 'Inactive',
  Suspended = 'Suspended',
  PendingVerification = 'PendingVerification',
}

@Entity('Users')
export class User {
  @PrimaryGeneratedColumn()
  userId: number;

  @Column({ unique: true, length: 255 })
  email: string;

  @Column({ length: 255 })
  passwordHash: string;

  @Column({ length: 100 })
  firstName: string;

  @Column({ length: 100 })
  lastName: string;

  @Column({ nullable: true, length: 20 })
  phoneNumber: string;

  @Column({ type: 'date', nullable: true })
  dateOfBirth: Date;

  @Column({ nullable: true, length: 500 })
  profileImageUrl: string;

  @Column({ default: false })
  isEmailVerified: boolean;

  @Column({ default: false })
  isPhoneVerified: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'datetime', nullable: true })
  lastLoginAt: Date;

  @Column({ default: true })
  isActive: boolean;

  @Column({
    type: 'varchar',
    length: 50,
    default: UserStatus.Active,
  })
  status: UserStatus;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToOne(() => UserProfile, (profile) => profile.user, { cascade: true })
  userProfile: UserProfile;

  @OneToOne(() => UserPreferences, (preferences) => preferences.user, { cascade: true })
  userPreferences: UserPreferences;

  @OneToMany(() => UserRole, (role) => role.user, { cascade: true })
  userRoles: UserRole[];

  @OneToMany(() => Event, (event) => event.organizer)
  organizedEvents: Event[];

  @OneToMany(() => Ticket, (ticket) => ticket.user)
  tickets: Ticket[];

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];

  @OneToMany(() => UserNotification, (notification) => notification.user)
  notifications: UserNotification[];

  @OneToMany(() => EventReview, (review) => review.user)
  reviews: EventReview[];

  @OneToMany(() => UserFavoriteEvent, (favorite) => favorite.user)
  favoriteEvents: UserFavoriteEvent[];
}
