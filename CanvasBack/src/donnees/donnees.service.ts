/* eslint-disable prettier/prettier */
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { donnees } from './donnees.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateDonneesDto } from './DTO/CreateDonnees.dto';
import { UpdateDonneesDto } from './DTO/UpdateDonnees.dto';
import { BlockService } from '../block/block.service';

@Injectable()
export class DonneesService {

    constructor(
        @InjectRepository(donnees) private donneesRepository: Repository<donnees> , private readonly blockService: BlockService) {}
    
    // creation donnees dans block
    async createBlock(createDonneesDto: CreateDonneesDto): Promise<donnees> {
        const Donnees = this.donneesRepository.create(createDonneesDto,);
        return await this.donneesRepository.save(Donnees);
      }

   //update block 
   async updateDonnees(id: number, updateDonneesDto: UpdateDonneesDto, existingTicketValue: string): Promise<donnees> {
    let donnees = await this.donneesRepository.findOneBy({
      idDonnees: id,
    });
  
    // Update the 'ticket' property only if it exists in updateDonneesDto
    if (updateDonneesDto.ticket) {
      donnees.ticket = updateDonneesDto.ticket;
    } else {
      // If 'ticket' is not provided in the updateDonneesDto, use the existing value
      donnees.ticket = existingTicketValue;
    }
  
    donnees = { ...donnees, ...updateDonneesDto };
  
    return await this.donneesRepository.save(donnees);
  }
  

       // GetALL data 
       async getAll(): Promise<donnees[]> {
        return await this.donneesRepository.find();
      }

       // Get donnes by ID
 async getOneById(id: number): Promise<donnees> {
    try {
      return await this.donneesRepository.findOneOrFail({
        where: { idDonnees: id },
      });
    } catch (err) {
      console.log('Error ', err.message ?? err);
      throw new HttpException(
        'data with id ${id} not found',
        HttpStatus.NOT_FOUND,
      );
    }
  }

  async createDonnees(idbloc: number, createDonneesDto: CreateDonneesDto): Promise<donnees> {
    try {
      const block = await this.blockService.findBlockbyid(idbloc);
  
      const donnees = this.donneesRepository.create({
        ...createDonneesDto,
        block: block,
      });
  
      return await this.donneesRepository.save(donnees);
    } catch (error) {
      console.error('Error creating donnees:', error.message ?? error);
      throw new HttpException('Error creating donnees', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getByBloc(idbloc: number): Promise<donnees[]> {
    return this.donneesRepository.find({where: { block: { idBlock: idbloc } },
    });
  }

  async deleteDonnees(idDonnees: number): Promise<void> {
    try {
      const donnees = await this.donneesRepository.findOneOrFail({where:{ idDonnees }});
      await this.donneesRepository.remove(donnees);
    } catch (error) {
      console.error('Error deleting donnees:', error.message ?? error);
      throw new HttpException('Error deleting donnees', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  
  }
  
