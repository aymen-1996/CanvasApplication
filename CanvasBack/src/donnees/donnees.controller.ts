/* eslint-disable prettier/prettier */
import { Body, Delete ,Controller, Post, Get, Param, ParseIntPipe, Patch, UsePipes, ValidationPipe } from '@nestjs/common';
import { DonneesService } from './donnees.service';
import { CreateDonneesDto } from './DTO/CreateDonnees.dto';
import { donnees } from './donnees.entity';
import { UpdateDonneesDto } from './DTO/UpdateDonnees.dto';

@Controller('donnees')
export class DonneesController {
    constructor(private readonly donneesService: DonneesService ) { }

//localhost:3000/donnees

  // creation donnees :localhost:3000/donnees/create
  @Post('/create')
  create(@Body() createDonneesDto: CreateDonneesDto): Promise<donnees> {
    return this.donneesService.createBlock(createDonneesDto);
  }

 // get all data : localhost:3000/donnees
 @Get()
 async GetAll(): Promise<donnees[]> {
   return this.donneesService.getAll();
 }
 // Get one donnee
 @Get(':id')
 async GetOne(@Param('id', ParseIntPipe) id: number): Promise<donnees> {
   return this.donneesService.getOneById(id);
 }

    //updatedonnees :localhost:3000/donnees/id
    @Patch(':id')
    async update(
      @Param('id') id: number,
      @Body() updateDonneesDto: UpdateDonneesDto,
    ): Promise<donnees> {
      const existingTicketValue: string = ''; // You need to provide the actual existing ticket value
      return await this.donneesService.updateDonnees(id, updateDonneesDto, existingTicketValue);
    }

    @Post(':idbloc')
    async createDonnees(
      @Param('idbloc', ParseIntPipe) idbloc: number,
      @Body() createDonneesDto: CreateDonneesDto
    ) {
      return this.donneesService.createDonnees(idbloc, createDonneesDto);
    }
    

    @Get('donne/:idbloc')
    async getByBloc(@Param('idbloc', ParseIntPipe) idbloc: number): Promise<donnees[]> {
      return this.donneesService.getByBloc(idbloc);
    }

    @Delete(':id')
  async deleteDonnees(@Param('id') id: number): Promise<void> {
    await this.donneesService.deleteDonnees(id);
  }
}
