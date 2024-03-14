import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';


@Injectable()
export class EmailService {

    private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'nesrine.ncibi23@gmail.com',
        pass: 'vdwb puwz amby svut', 
      },
    });
  }

  async sendEmail(to: string, subject: string, text: string): Promise<void> {
    const mailOptions = {
      from: 'your-email@gmail.com', 
      to, 
      subject, 
      text, 
    };

    await this.transporter.sendMail(mailOptions);
  }
}
