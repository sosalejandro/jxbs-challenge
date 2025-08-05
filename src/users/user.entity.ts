import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Notification } from '../notifications/notification.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ default: 'user' })
  role: 'user' | 'admin';

  @Column({ type: 'jsonb', default: '{"email":true,"in-app":true}' })
  notificationPreferences: { email: boolean; 'in-app': boolean };

  @OneToMany(() => Notification, notification => notification.user)
  notifications: Notification[];
}
