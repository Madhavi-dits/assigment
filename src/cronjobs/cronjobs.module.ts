import { Module } from '@nestjs/common';
import { CronjobsService } from './cronjobs.service';
import { EmailService } from 'src/email/email.service';

@Module({
  providers: [CronjobsService, EmailService]
})
export class CronjobsModule {}
