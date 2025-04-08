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
            background-color: #28a745;
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
    </style>
</head>
<body>
    <div class="container">
        <h2>Verify Your Email</h2>
        <p>Hello,</p>
        <p>Thank you for signing up with ${
			process.env.COMPANY_NAME
		}! Please verify your email address to complete your registration.</p>
        <p>Click the button below to verify your email:</p>
        <a href="${
			process.env.NEXT_PUBLIC_APP_URL
		}/verifyemail?token=${encodeURIComponent(
		token
	)}" class="button">Verify Email</a>
        <p>Or copy and paste this link into your browser:</p>
        <div class="link">${
			process.env.NEXT_PUBLIC_APP_URL
		}/verifyemail?token=${encodeURIComponent(token)}</div>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't create an account with us, please ignore this email or contact support if you have concerns.</p>
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
