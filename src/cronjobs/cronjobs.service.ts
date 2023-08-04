import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { EmailService } from 'src/email/email.service';
import { User } from 'src/users/user.model';
import { expiryDate, expiryPasswordDate } from 'src/utils/constant/constant';

@Injectable()
export class CronjobsService {
    constructor(
        private emailService: EmailService
    ) { }

    @Cron('0 0 * * *') // Cron job runs every day at midnight
    async sentAlert() {
        let email;
        let name;
        try {
            const users = await User.findAll({});
            users.map(async user => {
                email = user.email
                name = user.firstName
                const mailDetails = {
                    from: process.env.MAIL_USER,
                    to: email,
                    subject: 'Change Password Alert',
                    template: './notification',
                    context: {
                        name: name
                    },
                };
                if (user.passwordUpdateAt < expiryDate) {
                    await this.emailService.sendMail(mailDetails);
                }
                if (user.passwordUpdateAt < expiryPasswordDate) {
                    await User.update(
                        { password: null },
                        { where: { id: user.id } },
                    );
                }
            });

        } catch (error) {
            console.log('error', error);
        }

    }

}