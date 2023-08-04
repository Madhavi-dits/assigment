import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { RESPONSE_MESSAGES } from 'src/utils/message/message';

@Injectable()
export class EmailService {
  constructor(private mailerService: MailerService) { }

  async sendMail(mailDetails) {
    await this.mailerService.sendMail(mailDetails)
    console.log(RESPONSE_MESSAGES.MESSAGE.EMAIL_SENT_SUCCESSFULLY);
  }
}





