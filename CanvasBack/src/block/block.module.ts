import { Module } from '@nestjs/common';
import { BlockService } from './block.service';
import { BlockController } from './block.controller';
import { block } from './Block.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([block])],
  providers: [BlockService],
  controllers: [BlockController],
  exports: [TypeOrmModule],
})
export class BlockModule {}
