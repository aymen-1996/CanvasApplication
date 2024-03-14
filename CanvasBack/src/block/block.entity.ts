/* eslint-disable prettier/prettier */
import { canvas } from "src/canvas/canvas.entity";
import { donnees } from "src/donnees/donnees.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity({name: 'Block'})
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