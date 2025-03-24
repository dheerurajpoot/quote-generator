import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { User } from "@/models/user.model";
import { forgotMailTemplate, verifyMailTemplate } from "./mail-templates";

interface MailOptions {
	email: string;
	emailType: "VERIFY" | "RESET";
	userId: string;
}

interface ContactFormData {
	name?: string;
	email?: string;
	phone?: string;
	subject?: string;
	message?: string;
}

export const sendMail = async ({ email, emailType, userId }: MailOptions) => {
	try {
		const token = jwt.sign({ userId: userId }, process.env.TOKEN_SECRET!, {
			expiresIn: "1h",
		});

		// First find the user
		const user = await User.findById(userId);
		if (!user) {
			throw new Error("User not found");
		}

		// Update the user's token fields
		if (emailType === "VERIFY") {
			user.verifyToken = token;
			user.verifyTokenExpiry = Date.now() + 3600000; // 1 hour
		} else if (emailType === "RESET") {
			user.forgotPasswordToken = token;
			user.forgotPasswordTokenExpiry = Date.now() + 3600000; // 1 hour
		}

		// Save the updated user
		await user.save();

		const transporter = nodemailer.createTransport({
			host: "smtp.gmail.com",
			port: 465,
			secure: true,
			auth: {
				user: process.env.MAIL_USER,
				pass: process.env.MAIL_PASS,
			},
		});

		const mailOptions = {
			from: `"${process.env.COMPANY_NAME}" <${process.env.MAIL_USER}>`,
			to: email,
			subject:
				emailType === "VERIFY"
					? "Verify Your Email"
					: "Reset Password Link",
			text: "",
			html:
				emailType === "VERIFY"
					? verifyMailTemplate(token)
					: forgotMailTemplate(token),
		};

		const mailResponse = await transporter.sendMail(mailOptions);
		return mailResponse;
	} catch (error: unknown) {
		console.error("Mail sending error:", error);
		if (error instanceof Error) {
			throw new Error(`Error sending email: ${error.message}`);
		}
		throw new Error("Error sending email: Unknown error");
	}
};
