import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from 'typeorm';
import { Event } from '../../events/entities/event.entity';

@Entity('Venues')
export class Venue {
  @PrimaryGeneratedColumn()
  venueId: number;

  @Column({ length: 200 })
  name: string;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @Column({ length: 255 })
  address: string;

  @Column({ length: 100 })
  city: string;

  @Column({ length: 100 })
  state: string;

  @Column({ length: 20 })
  zipCode: string;

  @Column({ length: 100 })
  country: string;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitude: number;

  @Column({ type: 'int' })
  capacity: number;

  @Column({ nullable: true, length: 500 })
  imageUrl: string;

  @Column({ nullable: true, length: 255 })
  contactEmail: string;

  @Column({ nullable: true, length: 20 })
  contactPhone: string;

  @Column({ nullable: true, length: 255 })
  website: string;

  @Column({ default: true })
  isActive: boolean;

  // Relations
  @OneToMany(() => Event, (event) => event.venue)
  events: Event[];
}
