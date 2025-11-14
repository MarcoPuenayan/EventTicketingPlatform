import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('UserProfiles')
export class UserProfile {
  @PrimaryGeneratedColumn()
  userProfileId: number;

  @Column()
  userId: number;

  @Column({ nullable: true, type: 'text' })
  bio: string;

  @Column({ nullable: true, length: 255 })
  website: string;

  @Column({ nullable: true, length: 200 })
  companyName: string;

  @Column({ nullable: true, length: 255 })
  address: string;

  @Column({ nullable: true, length: 100 })
  city: string;

  @Column({ nullable: true, length: 100 })
  state: string;

  @Column({ nullable: true, length: 20 })
  zipCode: string;

  @Column({ nullable: true, length: 100 })
  country: string;

  @Column({ nullable: true, length: 100 })
  timeZone: string;

  @Column({ default: false })
  isOrganizer: boolean;

  @Column({ nullable: true, length: 255 })
  businessLicense: string;

  // Relations
  @OneToOne(() => User, (user) => user.userProfile)
  @JoinColumn({ name: 'userId' })
  user: User;
}
