import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { user } from '../user/user.entity';
import { message } from '../Message/message.entity';

@Entity('reaction')
export class reaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  reaction: string;

  @ManyToOne(() => user, (user) => user.reactions, { eager: true ,  onDelete: 'SET NULL', })
  user: user;

  @ManyToOne(() => message, (message) => message.reactions, {
    eager: true,
    onDelete: 'SET NULL',
  })
  message: message;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
