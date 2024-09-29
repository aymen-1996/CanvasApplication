import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

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

  @Column()
  senderIdUser: number; 
  @Column()
  recipientIdUser: number;
}
