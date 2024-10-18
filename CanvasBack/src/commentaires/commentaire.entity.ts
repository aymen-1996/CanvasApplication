import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from "typeorm";
import { user } from "src/user/user.entity";
import { canvas } from "src/canvas/canvas.entity";

@Entity({ name: 'commentaire' })
export class commentaire {
    @PrimaryGeneratedColumn({ type: 'bigint' })
    idCommentaire: number;

    @Column({ nullable: false })
    contenu: string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    dateDeCommentaire: Date;

    @Column({ nullable: true })
    file: string;

    @ManyToOne(() => user, (user) => user.commentaires, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'idUser' })
    user: user;

    @ManyToOne(() => canvas, (canvas) => canvas.commentaires, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'idCanvas' })
    canvas: canvas;
}
