/* eslint-disable prettier/prettier */
import { block } from "../block/block.entity";
import { commentaire } from "../commentaires/commentaire.entity";
import { invite } from "../invite/invite.entity";
import { projet } from "../projet/projet.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity({name: 'canvas'})
export class canvas {
    forEach(arg0: (canvas: any) => void) {
      throw new Error('Method not implemented.');
    }
    @PrimaryGeneratedColumn({ type: 'bigint'})
    idCanvas: number;

    @Column({ nullable: true }) 
    nomCanvas:string; 


    @ManyToOne(()=> projet,(projet)=> projet.canvas)
    @JoinColumn({ name: 'projetId'  })
    projet: projet;

    @OneToMany(() => block, (block) => block.canvas)
    block: block[];

    @OneToMany(() => invite, (invite) => invite.canvas)
    invite: invite[];
    @OneToMany(() => commentaire, (commentaire) => commentaire.canvas)
    commentaires: commentaire[];


}