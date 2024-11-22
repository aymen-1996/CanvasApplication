import { reaction } from 'src/reactionMessage/reaction.entity';
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';

@Entity('message')
export class message {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  content: string;

  @Column({ nullable: true })
  filePath: string;

  @Column()
  senderId: number;

  @Column()
  recipientId: number;

  @Column()
  sentAt: Date;

  @Column({ default: false })
  etat: boolean;
  @OneToMany(() => reaction, (reaction) => reaction.message)
  reactions: reaction[];

}
