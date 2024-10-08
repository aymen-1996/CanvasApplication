/* eslint-disable prettier/prettier */
import { Body, Controller, Post, Get, Param, ParseIntPipe, Patch, UsePipes, ValidationPipe } from '@nestjs/common';
import { BlockService } from './block.service';
import { CreateBlockDto } from './DTO/CreateBlock.dto';
import { block } from './block.entity';
import { UpdateBlockDto } from './DTO/UpdateBlock.dto';

@Controller('block')
export class BlockController {
    constructor(private readonly blockService: BlockService ) { }

//localhost:3000/block

  // creation block :localhost:3000/block/create
  @Post('/create')
  create(@Body() createBlockDto: CreateBlockDto): Promise<block> {
    return this.blockService.createBlock(createBlockDto);
  }

   // get all blocks : localhost:3000/block
   @Get()
   async GetAll(): Promise<block[]> {
     return this.blockService.getAll();
   }
 
   // Get one block byid
   @Get(':id')
    async GetBlockbyId(@Param('id', ParseIntPipe) id: number): Promise<block> {
        return this.blockService.findBlockbyid(id);
    }

    //updateblock : localhost:3000/block/1
  @Patch(':id')
  @UsePipes(ValidationPipe)
  async Update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBlockDto: UpdateBlockDto): Promise<block> {
    return this.blockService.updateBlock(id, updateBlockDto)
  }
//api getBlocksByCanvasId // localhost:3000/block/canvasid/1
@Get('/canvasid/:idCanvas')
async getBlocksByCanvasId(@Param('idCanvas') idCanvas: number): Promise<block[]> {
  return this.blockService.getBlocksByCanvasId(idCanvas);
}
}
