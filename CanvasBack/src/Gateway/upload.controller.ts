import { Controller, Post, UploadedFile, UseInterceptors, Get, Param, Res, Body, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import { Response } from 'express';
import { ChatService } from '../Message/chat.service';
import { message } from 'src/Message/message.entity';
import { ChatGateway } from './chatGateway';

@Controller('upload')
export class UploadController {
  constructor(private readonly chatService: ChatService ,
     private readonly chatGateway: ChatGateway, 
  ) {}

  //upload image 
  @Post('image')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        const timestamp = Date.now(); 
        const originalName = file.originalname;
        const extname = path.extname(originalName); 
        const uniqueFilename = `${timestamp}-${originalName}`; 
        cb(null, uniqueFilename);
      },
    }),
  }))
  async uploadImage(@Body() body: any, @UploadedFile() file: Express.Multer.File) {
    if (!file) {
      console.log('Aucun fichier reçu');
      throw new BadRequestException('Aucun fichier reçu');
    }
  
    console.log('Image saved with filename:', file.filename);
    const filePath = `${file.filename}`;
  
    const savedMessage = await this.chatService.saveMessageWithImage(body, filePath);
    this.chatGateway.server.emit('message', savedMessage);
  
    return { filename: file.filename };
  }
  
  //affichage image msg
  @Get('image/:filename')
  getImage(@Param('filename') filename: string, @Res() res: Response) {
    const filePath = path.join(__dirname, '..', '..', 'uploads', filename);
    return res.sendFile(filePath); 
  }


}
