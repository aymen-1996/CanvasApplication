import { user } from '../user/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';

@Entity()
export class Token {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    token: string;

    @Column({ type: 'timestamp' })
    createdAt: Date;

    @Column({ type: 'timestamp' })
    expiresAt: Date;

    @ManyToOne(() => user, (user) => user.tokens) 
    user: user; 
}
