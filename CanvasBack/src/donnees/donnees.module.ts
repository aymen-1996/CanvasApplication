import { Module } from '@nestjs/common';
import { DonneesService } from './donnees.service';
import { DonneesController } from './donnees.controller';
import { donnees } from './donnees.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { block } from '../block/block.entity';
import { BlockService } from '../block/block.service';

@Module({
  imports: [TypeOrmModule.forFeature([donnees , block])],
  providers: [DonneesService , BlockService],
  controllers: [DonneesController],
  exports: [TypeOrmModule],
})
export class DonneesModule {}
