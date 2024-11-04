/* eslint-disable prettier/prettier */
import { canvas } from "src/canvas/canvas.entity";
import { projet } from "src/projet/projet.entity";
import { user } from "src/user/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity({name: 'invite'})
export class invite {
    @PrimaryGeneratedColumn({ type: 'bigint'})
    idInvite: number;

    @Column({ nullable: true }) 
    nomInvite:string; 
    
    @Column({ nullable: true }) 
    emailInvite:string; 

    @Column({ nullable: true }) 
    roleInvite:string; 
    
    @Column({ nullable: true }) 
    etat:string; 

    @ManyToOne(()=> projet,(projet)=> projet.invite)
    @JoinColumn({ name: 'projetId'  })
    projet: projet

    
    @ManyToOne(()=> user,(user)=> user.invite)
    @JoinColumn({ name: 'userId'  })
    user: user

    @ManyToOne(() => user, (user) => user.invite)
    @JoinColumn({ name: 'userSendInviteId' }) 
    userSendInvite: user;
    
    @ManyToOne(()=> canvas,(canvas)=> canvas.invite)
    @JoinColumn({ name: 'canvasId'  })
    canvas: canvas
}