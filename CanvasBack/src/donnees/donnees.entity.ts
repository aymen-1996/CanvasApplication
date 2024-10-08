/* eslint-disable prettier/prettier */
import { block } from "src/block/block.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity({name: 'Donnees'})
export class donnees{
    @PrimaryGeneratedColumn({ type: 'bigint'})
    idDonnees: number;

    @Column({ nullable: true }) 
    ticket:string; 

    @Column({ nullable: true }) 
    coleur:string; 

    @ManyToOne(()=> block,(block)=> block.donnees)
    @JoinColumn({ name: 'blockId'  })
    block: block

}