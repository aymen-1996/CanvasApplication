import { Module } from '@nestjs/common';
import { CanvasService } from './canvas.service';
import { CanvasController } from './canvas.controller';
import { canvas } from './canvas.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([canvas])],
  providers: [CanvasService],
  controllers: [CanvasController],
  exports: [TypeOrmModule],
})
export class CanvasModule {}
