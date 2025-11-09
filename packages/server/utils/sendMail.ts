require('dotenv').config();
import sgMail from '@sendgrid/mail';
//import nodemailer, {Transporter} from 'nodemailer';
import ejs from 'ejs';
import path from 'path';

// Set the API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

interface EmailOptions{
    email:string;
    subject:string;
    template:string;
    data: {[key:string]:any};
}

const sendMail = async (options: EmailOptions):Promise <void> => {
    // const transporter: Transporter = nodemailer.createTransport({
    //     host: process.env.SMTP_HOST,
    //     port: parseInt(process.env.SMTP_PORT || '587'),
    //     service: process.env.SMTP_SERVICE,
    //     auth:{
    //         user: process.env.SMTP_MAIL,
    //         pass: process.env.SMTP_PASSWORD,
    //     },
    // });

    const {email,subject,template,data} = options;

    // get the pdath to the email template file
    const templatePath = path.join(__dirname,'../../mails',template);

    // Render the email template with EJS
    const html:string = await ejs.renderFile(templatePath,data);

    const msg = {
        to: email,
        from: process.env.SENDGRID_SENDER_EMAIL!, // This must be a verified sender in SendGrid
        subject: subject,
        html: html,
    };

    try {
        await sgMail.send(msg);
        console.log(`Email sent successfully to ${email}`);
    } catch (error) {
        console.error('Error sending email via SendGrid:', error);
        // In case of an error with SendGrid, you might want to throw it
        // so your controller's catch block can handle it.
        throw new Error('Failed to send email.');
    }

    // const mailOptions = {
    //     from: process.env.SMTP_MAIL,
    //     to: email,
    //     subject,
    //     html
    // };

    // await transporter.sendMail(mailOptions);
};

export default sendMail;

