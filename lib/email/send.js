import nodemailer from 'nodemailer';

// Create reusable transporter
let transporter = null;

function getTransporter() {
  if (transporter) {
    return transporter;
  }

  // For development/testing, use ethereal email or configure your SMTP
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  return transporter;
}

export async function sendVerificationCode(email, code) {
  try {
    const transport = getTransporter();

    const mailOptions = {
      from: process.env.SMTP_FROM || '"Schedule Builder" <noreply@schedulebuilder.com>',
      to: email,
      subject: 'Your Verification Code - Schedule Builder',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #1a1d29 0%, #2d3748 100%); padding: 40px 30px; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">Schedule Builder</h1>
                    </td>
                  </tr>

                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <h2 style="margin: 0 0 20px 0; color: #1a1d29; font-size: 24px; font-weight: 600;">Your Verification Code</h2>
                      <p style="margin: 0 0 30px 0; color: #4a5568; font-size: 16px; line-height: 1.6;">
                        Use the code below to sign in to your Schedule Builder account. This code will expire in <strong>10 minutes</strong>.
                      </p>

                      <!-- Verification Code Box -->
                      <div style="background-color: #f7fafc; border: 2px solid #e2e8f0; border-radius: 8px; padding: 30px; text-align: center; margin: 30px 0;">
                        <div style="font-size: 42px; font-weight: 700; letter-spacing: 8px; color: #1a1d29; font-family: 'Courier New', monospace;">
                          ${code}
                        </div>
                      </div>

                      <p style="margin: 30px 0 0 0; color: #718096; font-size: 14px; line-height: 1.6;">
                        If you didn't request this code, you can safely ignore this email. The code will expire automatically.
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f7fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                      <p style="margin: 0; color: #a0aec0; font-size: 12px;">
                        This is an automated message from Schedule Builder. Please do not reply to this email.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
      text: `Your Schedule Builder verification code is: ${code}\n\nThis code will expire in 10 minutes.\n\nIf you didn't request this code, you can safely ignore this email.`,
    };

    const info = await transport.sendMail(mailOptions);
    console.log('Verification email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw new Error('Failed to send verification email');
  }
}

export async function sendAvailabilityRequest(studentEmail, studentName) {
  try {
    const transport = getTransporter();

    const mailOptions = {
      from: process.env.SMTP_FROM || '"Schedule Builder" <noreply@schedulebuilder.com>',
      to: studentEmail,
      subject: 'Availability Request - Schedule Builder',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #1a1d29 0%, #2d3748 100%); padding: 40px 30px; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">Schedule Builder</h1>
                    </td>
                  </tr>

                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <h2 style="margin: 0 0 20px 0; color: #1a1d29; font-size: 24px; font-weight: 600;">Availability Request</h2>
                      <p style="margin: 0 0 20px 0; color: #4a5568; font-size: 16px; line-height: 1.6;">
                        Hello ${studentName},
                      </p>
                      <p style="margin: 0 0 20px 0; color: #4a5568; font-size: 16px; line-height: 1.6;">
                        Your office manager has requested that you submit your availability for scheduling. Please log in to the Schedule Builder portal to submit your available days and times.
                      </p>

                      <!-- Call to Action Button -->
                      <div style="text-align: center; margin: 30px 0;">
                        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard"
                           style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                          Submit Availability
                        </a>
                      </div>

                      <p style="margin: 30px 0 0 0; color: #718096; font-size: 14px; line-height: 1.6;">
                        Please submit your availability as soon as possible to help with schedule planning.
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f7fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                      <p style="margin: 0; color: #a0aec0; font-size: 12px;">
                        This is an automated message from Schedule Builder. Please do not reply to this email.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
      text: `Hello ${studentName},\n\nYour office manager has requested that you submit your availability for scheduling. Please log in to the Schedule Builder portal to submit your available days and times.\n\nVisit: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard\n\nPlease submit your availability as soon as possible to help with schedule planning.`,
    };

    const info = await transport.sendMail(mailOptions);
    console.log('Availability request email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending availability request email:', error);
    throw new Error('Failed to send availability request email');
  }
}
