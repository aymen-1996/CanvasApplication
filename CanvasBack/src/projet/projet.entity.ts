/* eslint-disable prettier/prettier */
import { canvas } from "src/canvas/canvas.entity";
import { invite } from "src/invite/invite.entity";
import { user } from "src/user/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity({name: 'projet'})
export class projet {
    @PrimaryGeneratedColumn({ type: 'bigint'})
    idProjet: number;

    @Column({ nullable: true }) 
    nomProjet:string; 
    
    @Column({ nullable: true }) 
    imageProjet:string; 

    @ManyToOne(()=> user,(user)=> user.Projet)
    @JoinColumn({ name: 'userId'  })
    user: user

    @OneToMany(() => canvas, (canvas) => canvas.projet)
    canvas: canvas[];

    @OneToMany(() => invite, (invite) => invite.projet)
    invite: invite[];

}