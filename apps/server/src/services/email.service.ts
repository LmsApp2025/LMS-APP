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

    // FIXED: The path is now relative to the compiled 'build' directory.
    // When the code runs from /app/apps/server/build/services/email.service.js,
    // this path correctly resolves to /app/apps/server/mails/activation-mail.ejs
    const templatePath = path.join(__dirname, '../../mails', template);

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
        throw new Error('Failed to send email.');
    }
};