/* eslint-disable prettier/prettier */
import {  Injectable } from '@nestjs/common';
import { block } from './block.entity';
import { InjectRepository   } from '@nestjs/typeorm';
import { Repository  } from 'typeorm';
import { CreateBlockDto } from './DTO/CreateBlock.dto';
import { UpdateBlockDto } from './DTO/UpdateBlock.dto';
@Injectable()
export class BlockService {
    constructor(
        @InjectRepository(block) private blockRepository: Repository<block>) {}
    

      // creation block
  async createBlock(createBlockDto: CreateBlockDto): Promise<block> {
    const Blocks = this.blockRepository.create(createBlockDto,);
    return await this.blockRepository.save(Blocks);
  }

    //update block 
  async updateBlock(id: number, updateBlockDto: UpdateBlockDto): Promise<block> {
    let Block = await this.blockRepository.findOneBy({
        idBlock: id,
    })
    Block = { ...Block, ...updateBlockDto, };
    return await this.blockRepository.save(Block);
  }

      // GetALL Blocks 
  async getAll(): Promise<block[]> {
    return await this.blockRepository.find();
  }

 // Get Block by ID
 async findBlockbyid(idBlock: number): Promise<block> {
  try {
    const block = await this.blockRepository.findOne({
      where: { idBlock },
    });

    if (!block) {
      throw new Error(`block with ID ${idBlock} not found`);
    }

    return block;
  } catch (error) {
    throw new Error(`Error finding block: ${error.message}`);
  }
}

//get block by id de canvas
async getBlocksByCanvasId(idCanvas: number): Promise<block[]> {
  return this.blockRepository.find({ where: { canvas: { idCanvas } } });
}
    }

