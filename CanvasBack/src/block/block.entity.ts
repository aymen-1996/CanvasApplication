/* eslint-disable prettier/prettier */
import { canvas } from "../canvas/canvas.entity";
import { donnees } from "../donnees/donnees.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity({name: 'block'})
export class block{
    @PrimaryGeneratedColumn({ type: 'bigint'})
    idBlock: number;

    @Column({ nullable: true }) 
    nomBlock:string; 

    @Column({ type: 'text', nullable: true })
    description:string; 

    @ManyToOne(()=> canvas,(canvas)=> canvas.block)
    @JoinColumn({ name: 'canvasId'  })
    canvas: canvas

    @OneToMany(() => donnees, (donnees) => donnees.block)
    donnees: donnees[];

}