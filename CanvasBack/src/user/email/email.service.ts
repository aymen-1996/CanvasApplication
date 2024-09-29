import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';


@Injectable()
export class EmailService {

    private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'chouaibiaymen03@gmail.com',
        pass: 'ommi blzd iljt vthd', 
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


  async sendConfirmationEmail(to: string, username: string, confirmationUrl: string): Promise<void> {
    const mailOptions = {
      from: 'chouaibiaymen03@gmail.com', // Remplacez par votre adresse e-mail
      to,
      subject: 'Confirm Your Account',
      html: `
      <!DOCTYPE html>
      <html>
      <head>
          <title></title>
          <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <meta http-equiv="X-UA-Compatible" content="IE=edge" />
          <style type="text/css">
              /* Style ici (vous pouvez copier le style que vous avez partagé) */
          </style>
      </head>
      <body style="background-color: #f4f4f4; margin: 0 !important; padding: 0 !important;">
          <div style="display: none; font-size: 1px; color: #fefefe; line-height: 1px; font-family: 'Lato', Helvetica, Arial, sans-serif; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;"> We're thrilled to have you here! Get ready to dive into your new account. </div>
          <table border="0" cellpadding="0" cellspacing="0" width="100%">
              <tr>
                  <td bgcolor="f03050" align="center">
                      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
                          <tr>
                              <td align="center" valign="top" style="padding: 40px 10px 40px 10px;"> </td>
                          </tr>
                      </table>
                  </td>
              </tr>
              <tr>
                  <td bgcolor="f03050" align="center" style="padding: 0px 10px 0px 10px;">
                      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
                          <tr>
                              <td bgcolor="#ffffff" align="center" valign="top" style="padding: 40px 20px 20px 20px; border-radius: 4px 4px 0px 0px; color: #111111; font-family: 'Lato', Helvetica, Arial, sans-serif; font-size: 48px; font-weight: 400; letter-spacing: 4px; line-height: 48px;">
                                  <h1 style="font-size: 48px; font-weight: 400; margin: 2;">Welcome&nbsp;<em>${username}</em>!</h1>
                                  <img src="https://img.icons8.com/clouds/100/000000/handshake.png" width="125" height="120" style="display: block; border: 0px;" />
                              </td>
                          </tr>
                      </table>
                  </td>
              </tr>
              <tr>
                  <td bgcolor="#f4f4f4" align="center" style="padding: 0px 10px 0px 10px;">
                      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
                          <tr>
                              <td bgcolor="#ffffff" align="left" style="padding: 20px 30px 40px 30px; color: #666666; font-family: 'Lato', Helvetica, Arial, sans-serif; font-size: 18px; font-weight: 400; line-height: 25px;">
                                  <p style="margin: 0;">We're excited to have you get started. First, you need to confirm your account. Just press the button below.</p>
                              </td>
                          </tr>
                          <tr>
                              <td bgcolor="#ffffff" align="left">
                                  <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                      <tr>
                                          <td bgcolor="#ffffff" align="center" style="padding: 20px 30px 60px 30px;">
                                              <table border="0" cellspacing="0" cellpadding="0">
                                                  <tr>
                                                      <td align="center" style="border-radius: 3px;" bgcolor="f03050">
                                                          <a href="${confirmationUrl}" target="_blank"
                                                             style="font-size: 20px; font-family: Helvetica, Arial, sans-serif; color: #ffffff; text-decoration: none; padding: 15px 25px; border-radius: 2px; border: 1px solid #FFA73B; display: inline-block;">
                                                              Confirm Account
                                                          </a>
                                                      </td>
                                                  </tr>
                                              </table>
                                          </td>
                                      </tr>
                                  </table>
                              </td>
                          </tr>
                          <tr>
                              <td bgcolor="#ffffff" align="left" style="padding: 0px 30px 0px 30px; color: #666666; font-family: 'Lato', Helvetica, Arial, sans-serif; font-size: 18px; font-weight: 400; line-height: 25px;">
                                  <p style="margin: 0;">If that doesn't work, copy and paste the following link in your browser:</p>
                              </td>
                          </tr>
                          <tr>
                              <td bgcolor="#ffffff" align="left" style="padding: 20px 30px 20px 30px; color: #666666; font-family: 'Lato', Helvetica, Arial, sans-serif; font-size: 18px; font-weight: 400; line-height: 25px;">
                                  <p style="margin: 0;">
                                      <a href="${confirmationUrl}" target="_blank" style="color: #f03050;">
                                          ${confirmationUrl}
                                      </a>
                                  </p>
                              </td>
                          </tr>
                          <tr>
                              <td bgcolor="#ffffff" align="left" style="padding: 0px 30px 40px 30px; border-radius: 0px 0px 4px 4px; color: #666666; font-family: 'Lato', Helvetica, Arial, sans-serif; font-size: 18px; font-weight: 400; line-height: 25px;">
                                  <p style="margin: 0;color: red;font-size: 20px"><strong>Note:</strong> If the account has not been active for 7 days, it will be deleted.</p>
                              </td>
                          </tr>
                          <tr>
                              <td bgcolor="#ffffff" align="left" style="padding: 0px 30px 20px 30px; color: #666666; font-family: 'Lato', Helvetica, Arial, sans-serif; font-size: 18px; font-weight: 400; line-height: 25px;">
                                  <p style="margin: 0;">If you have any questions, just reply to this email—we're always happy to help out.</p>
                              </td>
                          </tr>
                          <tr>
                              <td bgcolor="#ffffff" align="left" style="padding: 0px 30px 40px 30px; border-radius: 0px 0px 4px 4px; color: #666666; font-family: 'Lato', Helvetica, Arial, sans-serif; font-size: 18px; font-weight: 400; line-height: 25px;">
                                  <p style="margin: 0;">ADMIN</p>
                              </td>
                          </tr>
                      </table>
                  </td>
              </tr>
          </table>
      </body>
      </html>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }
}
