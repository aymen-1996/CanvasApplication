import { Controller, Get, Param } from '@nestjs/common';
import { CanvasService } from './canvas.service';
import { canvas } from '../canvas/canvas.entity';
@Controller('canvas')
export class CanvasController {

    constructor(private readonly canvasService: CanvasService) {}

    @Get(':userId')
    async getCanvasByUser(@Param('userId') userId: number): Promise<canvas[]> {
      return this.canvasService.getCanvasByUser(userId);
    }
}
