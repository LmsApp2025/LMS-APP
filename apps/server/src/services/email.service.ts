// In: apps/server/src/services/email.service.ts (NEW FILE)

require('dotenv').config();
import { Resend } from 'resend';
import ejs from 'ejs';
import path from 'path';

interface IEmailOptions {
    email: string;
    subject: string;
    template: string;
    data: { [key: string]: any };
}

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendMail = async (options: IEmailOptions): Promise<void> => {
    const { email, subject, template, data } = options;

    // Get the path to the email template file
    const templatePath = path.join(__dirname, '../../src/mails', template); // Adjusted path for build/src structure

    try {
        // Render the email template with EJS
        const html: string = await ejs.renderFile(templatePath, data);

        // Send the email using Resend
        await resend.emails.send({
            from: `Marstech LMS <${process.env.RESEND_SENDER_EMAIL!}>`,
            to: email,
            subject: subject,
            html: html,
        });
        console.log(`Email sent successfully to ${email} via Resend`);
    } catch (error) {
        console.error('Error sending email via Resend:', error);
        // Throwing an error ensures the calling function knows something went wrong
        throw new Error('Failed to send email.');
    }
};