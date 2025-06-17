interface ContactFormData {
	name?: string;
	email?: string;
	phone?: string;
	subject?: string;
	message?: string;
}

// forget password mail template
export const forgotMailTemplate = (token: string): string => {
	return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Reset your password</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .container {
            background-color: #f9f9f9;
            border-radius: 8px;
            padding: 20px;
            margin-top: 20px;
        }
        .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #007bff;
            color: white;
            text-decoration: none;
            border-radius: 4px;
            margin: 20px 0;
        }
        .link {
            word-break: break-all;
            background-color: #f1f1f1;
            padding: 10px;
            border-radius: 4px;
            margin: 10px 0;
        }
        .warning {
            color: #dc3545;
            font-size: 0.9em;
            margin-top: 20px;
            padding: 10px;
            background-color: #fff3f3;
            border-radius: 4px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h2>Password Reset Request</h2>
        <p>Hello,</p>
        <p>We received a request to reset your password for your ${
			process.env.COMPANY_NAME
		} account.</p>
        <p>Click the button below to reset your password:</p>
        <a href="${
			process.env.NEXT_PUBLIC_APP_URL
		}/reset-password?token=${encodeURIComponent(
		token
	)}" class="button">Reset Password</a>
        <p>Or copy and paste this link into your browser:</p>
        <div class="link">${
			process.env.NEXT_PUBLIC_APP_URL
		}/reset-password?token=${encodeURIComponent(token)}</div>
        <p>This link will expire in 1 hour.</p>
        <div class="warning">
            <strong>Important:</strong> This is your most recent password reset link. Any previous reset links are no longer valid.
        </div>
        <p>If you didn't request this password reset, please ignore this email or contact support if you have concerns.</p>
    </div>
</body>
</html>`;
};

// verify mail template
export const verifyMailTemplate = (token: string): string => {
	return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Verify your email address</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #1a1a1a;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            background-color: #ffffff;
            border-radius: 12px;
            padding: 40px 30px;
            margin: 20px auto;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .logo {
            max-width: 150px;
            margin-bottom: 20px;
        }
        .title {
            color: #1a1a1a;
            font-size: 24px;
            font-weight: 600;
            margin: 0 0 10px 0;
        }
        .subtitle {
            color: #666;
            font-size: 16px;
            margin: 0;
        }
        .content {
            background-color: #f8f9fa;
            border-radius: 8px;
            padding: 25px;
            margin: 20px 0;
        }
        .button {
            display: inline-block;
            padding: 14px 28px;
            background-color: #2563eb;
            color: #FFFFFF;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 500;
            margin: 25px 0;
            text-align: center;
            transition: background-color 0.2s;
        }
        .button:hover {
            background-color: #1d4ed8;
        }
        .link-container {
            background-color: #f1f5f9;
            border-radius: 6px;
            padding: 15px;
            margin: 20px 0;
        }
        .link {
            word-break: break-all;
            color: #2563eb;
            font-size: 14px;
            line-height: 1.5;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #666;
            font-size: 14px;
        }
        .warning {
            background-color: #fff8f1;
            border-left: 4px solid #f59e0b;
            padding: 15px;
            margin: 20px 0;
            border-radius: 0 6px 6px 0;
        }
        .warning-text {
            color: #92400e;
            font-size: 14px;
            margin: 0;
        }
        .expiry {
            color: #666;
            font-size: 14px;
            text-align: center;
            margin: 15px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 class="title">Welcome to ${process.env.COMPANY_NAME}!</h1>
            <p class="subtitle">Let's verify your email address</p>
        </div>
        
        <div class="content">
            <p>Thank you for signing up! We're excited to have you on board. To get started, please verify your email address by clicking the button below:</p>
            
            <div style="text-align: center;">
                <a href="${
					process.env.NEXT_PUBLIC_APP_URL
				}/verifyemail?token=${encodeURIComponent(
		token
	)}" class="button">
                    Verify Email Address
                </a>
            </div>

            <p class="expiry">This verification link will expire in 1 hour.</p>

            <div class="link-container">
                <p style="margin: 0 0 10px 0; color: #666; font-size: 14px;">If the button above doesn't work, copy and paste this link into your browser:</p>
                <div class="link">${
					process.env.NEXT_PUBLIC_APP_URL
				}/verifyemail?token=${encodeURIComponent(token)}</div>
            </div>

            <div class="warning">
                <p class="warning-text">
                    <strong>Note:</strong> If you didn't create an account with us, please ignore this email or contact our support team if you have any concerns.
                </p>
            </div>
        </div>

        <div class="footer">
            <p>This is an automated message, please do not reply to this email.</p>
            <p>© ${new Date().getFullYear()} ${
		process.env.COMPANY_NAME
	}. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`;
};

// new contact mail template
export const contactMail = (contact: ContactFormData): string => {
	return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>New Contact Form Submission</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .container {
            background-color: #f9f9f9;
            border-radius: 8px;
            padding: 20px;
            margin-top: 20px;
        }
        .field {
            margin: 10px 0;
            padding: 10px;
            background-color: #f1f1f1;
            border-radius: 4px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h2>New Contact Form Submission</h2>
        <p>A new contact form submission has been received on ${
			process.env.COMPANY_NAME
		}.</p>
        <div class="field">
            <strong>Name:</strong> ${contact?.name || "Not provided"}
        </div>
        <div class="field">
            <strong>Email:</strong> ${contact?.email || "Not provided"}
        </div>
        <div class="field">
            <strong>Phone:</strong> ${contact?.phone || "Not provided"}
        </div>
        <div class="field">
            <strong>Subject:</strong> ${contact?.subject || "Not provided"}
        </div>
        <div class="field">
            <strong>Message:</strong> ${contact?.message || "Not provided"}
        </div>
    </div>
</body>
</html>`;
};
