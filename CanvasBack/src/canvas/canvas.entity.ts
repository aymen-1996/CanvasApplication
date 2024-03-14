/* eslint-disable prettier/prettier */
import { block } from "src/block/Block.entity";
import { invite } from "src/invite/invite.entity";
import { projet } from "src/projet/projet.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity({name: 'canvas'})
export class canvas {
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

}