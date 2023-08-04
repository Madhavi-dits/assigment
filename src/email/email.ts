import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { RESPONSE_MESSAGES } from 'src/utils/message/message';

@Injectable()
export class EmailService {
  async sendMail(mailDetails) {
    try {
      nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE,
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASSWORD
        },
      }).sendMail(mailDetails, function (error, data) {
        if (error) {
          console.log(error);
        } else {
          console.log(RESPONSE_MESSAGES.MESSAGE.EMAIL_SENT_SUCCESSFULLY);
        }
      });
    } catch (error) {
      console.log(error);
    }
  }
}