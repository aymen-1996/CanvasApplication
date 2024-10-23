import { Module } from '@nestjs/common';
import { CanvasService } from './canvas.service';
import { CanvasController } from './canvas.controller';
import { canvas } from './canvas.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { invite } from 'src/invite/invite.entity';

@Module({
  imports: [TypeOrmModule.forFeature([canvas , invite])],
  providers: [CanvasService],
  controllers: [CanvasController],
  exports: [TypeOrmModule],
})
export class CanvasModule {}
