import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from 'typeorm';
import { Event } from '../../modules/events/entities/event.entity';

@Entity('EventCategories')
export class EventCategory {
  @PrimaryGeneratedColumn()
  categoryId: number;

  @Column({ unique: true, length: 100 })
  name: string;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @Column({ nullable: true, length: 500 })
  iconUrl: string;

  @Column({ default: true })
  isActive: boolean;

  // Relations
  @OneToMany(() => Event, (event) => event.category)
  events: Event[];
}
