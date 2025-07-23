import { createTransport } from "nodemailer";
import { MailsToReceiveErrors } from "../constants/mail-constants";
import { Request } from "express";
import { Attachment } from "nodemailer/lib/mailer";

export const mailerConfig = {
    service: "gmail",
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
    },
    tls: {
        rejectUnauthorized: false,
    },
};

export const sendMail = async (to: string[], subject: string, message: string, attachments?: Attachment[]): Promise<void> => {
    const transporter = createTransport(mailerConfig);

    await transporter.sendMail({
        from: `iraklistheofanidis@gmail.com`,
        to,
        subject,
        html: message,
        attachments,
    });
}

export const sendErrorMailToAdmins = async (req: Request, error: any): Promise<void> => {
    const url = req.baseUrl + req.url;
    await sendMail(MailsToReceiveErrors, `Error - ${url}`, error.message);
}