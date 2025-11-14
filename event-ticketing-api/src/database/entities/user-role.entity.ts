import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

export enum RoleType {
  Customer = 'Customer',
  Organizer = 'Organizer',
  Admin = 'Admin',
  VenueManager = 'VenueManager',
}

@Entity('UserRoles')
export class UserRole {
  @PrimaryGeneratedColumn()
  userRoleId: number;

  @Column()
  userId: number;

  @Column({
    type: 'varchar',
    length: 50,
  })
  role: RoleType;

  @CreateDateColumn()
  assignedAt: Date;

  @Column({ default: true })
  isActive: boolean;

  // Relations
  @ManyToOne(() => User, (user) => user.userRoles)
  @JoinColumn({ name: 'userId' })
  user: User;
}
