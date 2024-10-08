import { Controller, Post, UploadedFile, UseInterceptors, Get, Param, Res, Body, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import { Response } from 'express';
import { ChatService } from '../Message/chat.service';
import { message } from 'src/Message/message.entity';

@Controller('upload')
export class UploadController {
  constructor(private readonly chatService: ChatService) {}

  //upload image 
  @Post('image')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        const uniqueSuffix = uuidv4() + path.extname(file.originalname);
        cb(null, uniqueSuffix);
      },
    }),
  }))
  async uploadImage(@Body() body: any, @UploadedFile() file: Express.Multer.File) {
    if (!file) {
      console.log('Aucun fichier reçu');
      throw new BadRequestException('Aucun fichier reçu');
    }

    console.log('Image saved with filename:', file.filename);
    const filePath = `./uploads/${file.filename}`; 

    await this.chatService.saveMessageWithImage(body, filePath);
    
    return { filename: file.filename };
  }

  //affichage image msg
  @Get('image/:filename')
  getImage(@Param('filename') filename: string, @Res() res: Response) {
    const filePath = path.join(__dirname, '..', '..', 'uploads', filename);
    return res.sendFile(filePath); 
  }


}
