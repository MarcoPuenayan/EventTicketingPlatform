import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

export enum NotificationType {
  TicketPurchase = 'TicketPurchase',
  EventReminder = 'EventReminder',
  PaymentConfirmation = 'PaymentConfirmation',
  EventUpdate = 'EventUpdate',
  PromoCode = 'PromoCode',
}

@Entity('UserNotifications')
export class UserNotification {
  @PrimaryGeneratedColumn()
  notificationId: number;

  @Column()
  userId: number;

  @Column({ length: 200 })
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({
    type: 'varchar',
    length: 50,
  })
  type: NotificationType;

  @Column({ default: false })
  isRead: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true, length: 500 })
  actionUrl: string;

  // Relations
  @ManyToOne(() => User, (user) => user.notifications)
  @JoinColumn({ name: 'userId' })
  user: User;
}
