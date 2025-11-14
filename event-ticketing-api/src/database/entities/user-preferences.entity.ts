import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('UserPreferences')
export class UserPreferences {
  @PrimaryGeneratedColumn()
  userPreferencesId: number;

  @Column()
  userId: number;

  // Notification preferences
  @Column({ default: true })
  emailNotifications: boolean;

  @Column({ default: false })
  smsNotifications: boolean;

  @Column({ default: true })
  newBookingNotifications: boolean;

  @Column({ default: true })
  cancellationNotifications: boolean;

  @Column({ default: true })
  lowInventoryNotifications: boolean;

  @Column({ default: false })
  dailyReports: boolean;

  @Column({ default: true })
  weeklyReports: boolean;

  @Column({ default: true })
  monthlyReports: boolean;

  // Security preferences
  @Column({ default: false })
  twoFactorEnabled: boolean;

  @Column({ type: 'int', default: 30 })
  sessionTimeout: number;

  @Column({ default: true })
  loginNotifications: boolean;

  // Event defaults
  @Column({ length: 100, default: 'America/New_York' })
  defaultTimeZone: string;

  @Column({ type: 'int', default: 120 })
  defaultEventDuration: number;

  @Column({ type: 'int', default: 30 })
  defaultTicketSaleStart: number;

  @Column({ length: 50, default: 'flexible' })
  defaultRefundPolicy: string;

  @Column({ default: false })
  requireApproval: boolean;

  @Column({ default: false })
  autoPublish: boolean;

  // Appearance preferences
  @Column({ length: 20, default: 'light' })
  theme: string;

  @Column({ length: 10, default: 'en' })
  language: string;

  @Column({ length: 20, default: 'MM/dd/yyyy' })
  dateFormat: string;

  @Column({ length: 10, default: '12h' })
  timeFormat: string;

  @Column({ length: 10, default: 'USD' })
  currency: string;

  // Enhanced appearance preferences
  @Column({ length: 20, default: 'blue' })
  accentColor: string;

  @Column({ length: 20, default: 'medium' })
  fontSize: string;

  @Column({ default: false })
  compactMode: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToOne(() => User, (user) => user.userPreferences)
  @JoinColumn({ name: 'userId' })
  user: User;
}
