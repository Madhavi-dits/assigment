import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { join } from 'path';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
    imports: [
        MailerModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: async (config: ConfigService) => ({
                transport: {
                    service: process.env.EMAIL_SERVICE,
                    auth: {
                        user: process.env.MAIL_USER,
                        pass: process.env.MAIL_PASSWORD
                    },
                },
                template: {
                    dir: join(__dirname, 'templates'),
                    adapter: new HandlebarsAdapter(),
                    options: {
                        strict: true,
                    },
                },
            }),
            inject: [ConfigService],
        }),
        ConfigModule.forRoot()
    ],
    providers: [EmailService, ConfigService],
})
export class EmailModule { }
