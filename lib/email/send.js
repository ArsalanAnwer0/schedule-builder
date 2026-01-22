import { Resend } from 'resend';

// Initialize Resend client
let resendClient = null;

function getResendClient() {
  if (resendClient) {
    return resendClient;
  }

  if (!process.env.RESEND_API_KEY) {
    console.error('❌ Email configuration error: RESEND_API_KEY must be set');
    throw new Error('RESEND_API_KEY must be set in environment variables');
  }

  console.log('📧 Initializing Resend email client...');
  resendClient = new Resend(process.env.RESEND_API_KEY);
  console.log('✅ Resend client initialized successfully');

  return resendClient;
}

// Helper function to get all email addresses for a user (primary + secondary)
function getUserEmails(user) {
  const emails = [user.email];
  if (user.secondaryEmail && user.secondaryEmail.trim()) {
    emails.push(user.secondaryEmail);
  }
  return emails;
}

// Helper function to send email via Resend with retry logic
// Supports single email (string) or multiple emails (array)
async function sendEmail({ to, subject, html, text }, retries = 3) {
  const resend = getResendClient();

  // Handle both single email and array of emails
  const recipients = Array.isArray(to) ? to : [to];

  let lastError = null;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`📤 Sending email to ${recipients.join(', ')} (attempt ${attempt}/${retries})...`);

      const { data, error } = await resend.emails.send({
        from: process.env.EMAIL_FROM || 'Schedule Builder <onboarding@resend.dev>',
        to: recipients,
        subject,
        html,
        text,
      });

      if (error) {
        throw new Error(error.message || 'Unknown Resend error');
      }

      console.log(`✅ Email sent successfully! Message ID: ${data.id}`);
      return { success: true, messageId: data.id };

    } catch (error) {
      lastError = error;
      console.error(`❌ Email send attempt ${attempt}/${retries} failed:`, error.message);

      // Wait before retry (exponential backoff)
      if (attempt < retries) {
        const waitTime = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
        console.log(`⏳ Waiting ${waitTime}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }

  // All retries failed
  console.error(`❌ All ${retries} email send attempts failed`);
  throw lastError || new Error('Failed to send email after multiple attempts');
}

export async function sendVerificationCode(email, code) {
  try {
    const { success, messageId } = await sendEmail({
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
    });

    console.log('Verification email sent:', messageId);
    return { success: true, messageId };
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw new Error('Failed to send verification email');
  }
}

export async function sendAvailabilityRequest(studentEmail, studentName) {
  try {
    const { success, messageId } = await sendEmail({
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
    });

    console.log('Availability request email sent:', messageId);
    return { success: true, messageId };
  } catch (error) {
    console.error('Error sending availability request email:', error);
    throw new Error('Failed to send availability request email');
  }
}

export async function sendSchedulePublishedNotification(studentEmail, studentName, startDate, endDate) {
  try {
    // Format dates nicely
    const formatDate = (dateString) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    };

    const dateRange = startDate && endDate
      ? `${formatDate(startDate)} - ${formatDate(endDate)}`
      : 'upcoming period';

    const { success, messageId } = await sendEmail({
      to: studentEmail,
      subject: 'Work Schedule Published - Schedule Builder',
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
                      <h2 style="margin: 0 0 20px 0; color: #1a1d29; font-size: 24px; font-weight: 600;">Schedule Published! 📅</h2>
                      <p style="margin: 0 0 20px 0; color: #4a5568; font-size: 16px; line-height: 1.6;">
                        Hello ${studentName},
                      </p>
                      <p style="margin: 0 0 20px 0; color: #4a5568; font-size: 16px; line-height: 1.6;">
                        Your work schedule for <strong>${dateRange}</strong> has been published!
                      </p>
                      <p style="margin: 0 0 20px 0; color: #4a5568; font-size: 16px; line-height: 1.6;">
                        Log in to view your schedule and shift details.
                      </p>

                      <!-- Call to Action Button -->
                      <div style="text-align: center; margin: 30px 0;">
                        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard"
                           style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                          View Schedule
                        </a>
                      </div>

                      <p style="margin: 30px 0 0 0; color: #718096; font-size: 14px; line-height: 1.6;">
                        If you need to update your availability, you can request changes through your portal.
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
      text: `Hello ${studentName},\n\nYour work schedule for ${dateRange} has been published!\n\nLog in to view your schedule: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard\n\nIf you need to update your availability, you can request changes through your portal.`,
    });

    console.log('Schedule published email sent:', messageId);
    return { success: true, messageId };
  } catch (error) {
    console.error('Error sending schedule published email:', error);
    throw new Error('Failed to send schedule published email');
  }
}

export async function sendAvailabilityEditRequestToAdmin(adminEmail, studentName, studentEmail, reason) {
  try {
    const { success, messageId } = await sendEmail({
      to: adminEmail,
      subject: 'New Availability Edit Request - Schedule Builder',
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
                      <h2 style="margin: 0 0 20px 0; color: #1a1d29; font-size: 24px; font-weight: 600;">New Availability Edit Request</h2>
                      <p style="margin: 0 0 20px 0; color: #4a5568; font-size: 16px; line-height: 1.6;">
                        <strong>${studentName}</strong> (${studentEmail}) has submitted a request to edit their availability.
                      </p>

                      <!-- Reason Box -->
                      <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 20px 0; border-radius: 4px;">
                        <p style="margin: 0 0 8px 0; color: #92400e; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Reason:</p>
                        <p style="margin: 0; color: #78350f; font-size: 15px; line-height: 1.5;">
                          ${reason}
                        </p>
                      </div>

                      <p style="margin: 20px 0; color: #4a5568; font-size: 16px; line-height: 1.6;">
                        Please review the request and approve or reject the changes.
                      </p>

                      <!-- Call to Action Button -->
                      <div style="text-align: center; margin: 30px 0;">
                        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}"
                           style="display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                          Review Request
                        </a>
                      </div>
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
      text: `New Availability Edit Request\n\n${studentName} (${studentEmail}) has submitted a request to edit their availability.\n\nReason: ${reason}\n\nPlease review the request: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}`,
    });

    console.log('Edit request notification email sent to admin:', messageId);
    return { success: true, messageId };
  } catch (error) {
    console.error('Error sending edit request notification to admin:', error);
    throw new Error('Failed to send edit request notification');
  }
}

export async function sendAvailabilityEditDecisionToStudent(studentEmail, studentName, approved) {
  try {
    const status = approved ? 'Approved' : 'Rejected';
    const statusColor = approved ? '#10b981' : '#ef4444';
    const statusGradient = approved
      ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
      : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
    const message = approved
      ? 'Your availability edit request has been approved! Your availability has been updated.'
      : 'Your availability edit request has been reviewed and not approved at this time.';

    const { success, messageId } = await sendEmail({
      to: studentEmail,
      subject: `Availability Edit Request ${status} - Schedule Builder`,
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
                      <h2 style="margin: 0 0 20px 0; color: #1a1d29; font-size: 24px; font-weight: 600;">Edit Request ${status}</h2>
                      <p style="margin: 0 0 20px 0; color: #4a5568; font-size: 16px; line-height: 1.6;">
                        Hello ${studentName},
                      </p>
                      <p style="margin: 0 0 20px 0; color: #4a5568; font-size: 16px; line-height: 1.6;">
                        ${message}
                      </p>

                      <!-- Status Box -->
                      <div style="background-color: ${approved ? '#d1fae5' : '#fee2e2'}; border-left: 4px solid ${statusColor}; padding: 20px; margin: 20px 0; border-radius: 4px; text-align: center;">
                        <p style="margin: 0; color: ${statusColor}; font-size: 18px; font-weight: 600;">
                          ${status}
                        </p>
                      </div>

                      <!-- Call to Action Button -->
                      <div style="text-align: center; margin: 30px 0;">
                        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard"
                           style="display: inline-block; background: ${statusGradient}; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                          View Dashboard
                        </a>
                      </div>

                      ${!approved ? `<p style="margin: 30px 0 0 0; color: #718096; font-size: 14px; line-height: 1.6;">
                        If you have questions about this decision, please contact your office manager.
                      </p>` : ''}
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
      text: `Hello ${studentName},\n\n${message}\n\nStatus: ${status}\n\nView your dashboard: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard${!approved ? '\n\nIf you have questions about this decision, please contact your office manager.' : ''}`,
    });

    console.log(`Edit decision (${status}) email sent to student:`, messageId);
    return { success: true, messageId };
  } catch (error) {
    console.error('Error sending edit decision email to student:', error);
    throw new Error('Failed to send edit decision email');
  }
}

export async function sendAvailabilitySubmittedToAdmin(adminEmail, studentName, studentEmail) {
  try {
    const { success, messageId } = await sendEmail({
      to: adminEmail,
      subject: 'Student Availability Submitted - Schedule Builder',
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
                      <h2 style="margin: 0 0 20px 0; color: #1a1d29; font-size: 24px; font-weight: 600;">Availability Submitted</h2>
                      <p style="margin: 0 0 20px 0; color: #4a5568; font-size: 16px; line-height: 1.6;">
                        <strong>${studentName}</strong> (${studentEmail}) has submitted their availability.
                      </p>

                      <!-- Call to Action Button -->
                      <div style="text-align: center; margin: 30px 0;">
                        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}"
                           style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                          View Availability
                        </a>
                      </div>
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
      text: `${studentName} (${studentEmail}) has submitted their availability.\n\nView availability: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}`,
    });

    console.log('Availability submitted notification sent to admin:', messageId);
    return { success: true, messageId };
  } catch (error) {
    console.error('Error sending availability submitted notification:', error);
    throw new Error('Failed to send availability submitted notification');
  }
}

export async function sendAllAvailabilitySubmitted(adminEmail, totalStudents) {
  try {
    const { success, messageId } = await sendEmail({
      to: adminEmail,
      subject: 'All Students Have Submitted Availability! - Schedule Builder',
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
                      <h2 style="margin: 0 0 20px 0; color: #1a1d29; font-size: 24px; font-weight: 600;">All Availability Submitted!</h2>
                      <p style="margin: 0 0 20px 0; color: #4a5568; font-size: 16px; line-height: 1.6;">
                        Great news! All <strong>${totalStudents} students</strong> have submitted their availability.
                      </p>
                      <p style="margin: 0 0 20px 0; color: #4a5568; font-size: 16px; line-height: 1.6;">
                        You can now generate and publish the schedule.
                      </p>

                      <!-- Call to Action Button -->
                      <div style="text-align: center; margin: 30px 0;">
                        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}"
                           style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                          Generate Schedule
                        </a>
                      </div>
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
      text: `Great news! All ${totalStudents} students have submitted their availability.\n\nYou can now generate and publish the schedule.\n\nGenerate schedule: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}`,
    });

    console.log('All availability submitted notification sent to admin:', messageId);
    return { success: true, messageId };
  } catch (error) {
    console.error('Error sending all availability submitted notification:', error);
    throw new Error('Failed to send all availability submitted notification');
  }
}

export async function sendAdminInvite(inviteeEmail, inviteeName, inviterName, organizationName) {
  try {
    const { success, messageId } = await sendEmail({
      to: inviteeEmail,
      subject: `You've been invited as Admin - ${organizationName}`,
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
                      <h2 style="margin: 0 0 20px 0; color: #1a1d29; font-size: 24px; font-weight: 600;">Admin Invitation</h2>
                      <p style="margin: 0 0 20px 0; color: #4a5568; font-size: 16px; line-height: 1.6;">
                        Hi ${inviteeName},
                      </p>
                      <p style="margin: 0 0 20px 0; color: #4a5568; font-size: 16px; line-height: 1.6;">
                        You've been invited by <strong>${inviterName}</strong> to be a secondary admin for <strong>${organizationName}</strong> on Schedule Builder.
                      </p>

                      <!-- Login Box -->
                      <div style="background-color: #f7fafc; border-left: 4px solid #3b82f6; padding: 20px; margin: 20px 0; border-radius: 4px;">
                        <p style="margin: 0 0 8px 0; color: #1e40af; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Your Login Email:</p>
                        <p style="margin: 0; color: #1a1d29; font-size: 16px; font-weight: 600;">
                          ${inviteeEmail}
                        </p>
                      </div>

                      <p style="margin: 20px 0; color: #4a5568; font-size: 16px; line-height: 1.6;">
                        You'll use email verification codes to login (no password needed). Simply enter your email on the login page and we'll send you a verification code.
                      </p>

                      <!-- Call to Action Button -->
                      <div style="text-align: center; margin: 30px 0;">
                        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login"
                           style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                          Login to Schedule Builder
                        </a>
                      </div>

                      <p style="margin: 30px 0 0 0; color: #718096; font-size: 14px; line-height: 1.6;">
                        If you didn't expect this invitation, please ignore this email.
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
      text: `Hi ${inviteeName},\n\nYou've been invited by ${inviterName} to be a secondary admin for ${organizationName} on Schedule Builder.\n\nYour Login Email: ${inviteeEmail}\n\nYou'll use email verification codes to login (no password needed). Simply enter your email on the login page and we'll send you a verification code.\n\nLogin at: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login\n\nIf you didn't expect this invitation, please ignore this email.`,
    });

    console.log('Admin invitation email sent:', messageId);
    return { success: true, messageId };
  } catch (error) {
    console.error('Error sending admin invitation email:', error);
    throw new Error('Failed to send admin invitation email');
  }
}

export async function sendStudentWelcome(studentEmail, studentName, organizationName) {
  try {
    const { success, messageId } = await sendEmail({
      to: studentEmail,
      subject: `Welcome to ${organizationName} - Schedule Builder`,
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
                      <h2 style="margin: 0 0 20px 0; color: #1a1d29; font-size: 24px; font-weight: 600;">Welcome!</h2>
                      <p style="margin: 0 0 20px 0; color: #4a5568; font-size: 16px; line-height: 1.6;">
                        Hi ${studentName},
                      </p>
                      <p style="margin: 0 0 20px 0; color: #4a5568; font-size: 16px; line-height: 1.6;">
                        You've been added to <strong>${organizationName}</strong> on Schedule Builder. Your manager will send you an availability request when it's time to submit your work schedule preferences.
                      </p>

                      <!-- Login Box -->
                      <div style="background-color: #f7fafc; border-left: 4px solid #10b981; padding: 20px; margin: 20px 0; border-radius: 4px;">
                        <p style="margin: 0 0 8px 0; color: #065f46; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Your Login Email:</p>
                        <p style="margin: 0; color: #1a1d29; font-size: 16px; font-weight: 600;">
                          ${Array.isArray(studentEmail) ? studentEmail.join(' or ') : studentEmail}
                        </p>
                      </div>

                      <p style="margin: 20px 0; color: #4a5568; font-size: 16px; line-height: 1.6;">
                        You'll use email verification codes to login (no password needed). Simply enter your email on the login page and we'll send you a verification code.
                      </p>

                      <!-- Call to Action Button -->
                      <div style="text-align: center; margin: 30px 0;">
                        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login"
                           style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                          Login to Schedule Builder
                        </a>
                      </div>

                      <p style="margin: 30px 0 0 0; color: #718096; font-size: 14px; line-height: 1.6;">
                        If you have any questions, please contact your office manager.
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
      text: `Hi ${studentName},\n\nYou've been added to ${organizationName} on Schedule Builder. Your manager will send you an availability request when it's time to submit your work schedule preferences.\n\nYour Login Email: ${Array.isArray(studentEmail) ? studentEmail.join(' or ') : studentEmail}\n\nYou'll use email verification codes to login (no password needed). Simply enter your email on the login page and we'll send you a verification code.\n\nLogin at: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login\n\nIf you have any questions, please contact your office manager.`,
    });

    console.log('Student welcome email sent:', messageId);
    return { success: true, messageId };
  } catch (error) {
    console.error('Error sending student welcome email:', error);
    throw new Error('Failed to send student welcome email');
  }
}

export async function sendPasswordResetEmail(email, name, token) {
  try {
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${token}`;

    const { success, messageId } = await sendEmail({
      to: email,
      subject: 'Reset Your Password - Schedule Builder',
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
                      <h2 style="margin: 0 0 20px 0; color: #1a1d29; font-size: 24px; font-weight: 600;">Reset Your Password</h2>
                      <p style="margin: 0 0 20px 0; color: #4a5568; font-size: 16px; line-height: 1.6;">
                        Hello ${name},
                      </p>
                      <p style="margin: 0 0 20px 0; color: #4a5568; font-size: 16px; line-height: 1.6;">
                        You requested to reset your password for your Schedule Builder account. Click the button below to set a new password.
                      </p>

                      <!-- Call to Action Button -->
                      <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetUrl}"
                           style="display: inline-block; background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                          Reset Password
                        </a>
                      </div>

                      <!-- Security Notice -->
                      <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 20px 0; border-radius: 4px;">
                        <p style="margin: 0; color: #78350f; font-size: 14px; line-height: 1.6;">
                          <strong>Security Notice:</strong> This link will expire in 1 hour. If you didn't request this password reset, please ignore this email and your password will remain unchanged.
                        </p>
                      </div>

                      <!-- Alternative Link -->
                      <p style="margin: 20px 0 0 0; color: #718096; font-size: 13px; line-height: 1.6;">
                        Button not working? Copy and paste this link into your browser:
                      </p>
                      <p style="margin: 8px 0 0 0; color: #718096; font-size: 13px; word-break: break-all; font-family: 'Courier New', monospace;">
                        ${resetUrl}
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
      text: `Hello ${name},

You requested to reset your password for your Schedule Builder account.

Click the link below to reset your password:
${resetUrl}

This link will expire in 1 hour.

If you didn't request this password reset, please ignore this email and your password will remain unchanged.

---
This is an automated message from Schedule Builder. Please do not reply to this email.`,
    });

    console.log('Password reset email sent:', messageId);
    return { success: true, messageId };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
}

export async function sendWaitlistConfirmation(email) {
  try {
    const { success, messageId } = await sendEmail({
      to: email,
      subject: 'You\'re on the waitlist!',
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
                      <h2 style="margin: 0 0 20px 0; color: #1a1d29; font-size: 24px; font-weight: 600;">Welcome to the Waitlist!</h2>
                      <p style="margin: 0 0 20px 0; color: #4a5568; font-size: 16px; line-height: 1.6;">
                        Thank you for your interest in Schedule Builder!
                      </p>
                      <p style="margin: 0 0 20px 0; color: #4a5568; font-size: 16px; line-height: 1.6;">
                        You've successfully joined our waitlist. We're excited to have you as part of our community.
                      </p>

                      <!-- Info Box -->
                      <div style="background-color: #f0fdfa; border-left: 4px solid #14b8a6; padding: 20px; margin: 20px 0; border-radius: 4px;">
                        <p style="margin: 0 0 8px 0; color: #115e59; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">What's Next?</p>
                        <p style="margin: 0; color: #134e4a; font-size: 15px; line-height: 1.5;">
                          We'll notify you as soon as new features become available and when we're ready to onboard new users. Keep an eye on your inbox!
                        </p>
                      </div>

                      <p style="margin: 20px 0; color: #4a5568; font-size: 16px; line-height: 1.6;">
                        <strong>About Schedule Builder:</strong><br>
                        Schedule Builder helps teams efficiently manage work schedules by collecting availability from team members and generating optimized schedules. Perfect for offices, clinics, and organizations with rotating schedules.
                      </p>

                      <!-- Call to Action Button -->
                      <div style="text-align: center; margin: 30px 0;">
                        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}"
                           style="display: inline-block; background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                          Visit Website
                        </a>
                      </div>

                      <p style="margin: 30px 0 0 0; color: #718096; font-size: 14px; line-height: 1.6;">
                        If you have any questions or feedback, feel free to reach out. We'd love to hear from you!
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f7fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                      <p style="margin: 0 0 10px 0; color: #a0aec0; font-size: 12px;">
                        This is an automated message from Schedule Builder. Please do not reply to this email.
                      </p>
                      <p style="margin: 0; color: #a0aec0; font-size: 11px;">
                        To unsubscribe from waitlist updates, please contact us.
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
      text: `Welcome to the Waitlist!

Thank you for your interest in Schedule Builder!

You've successfully joined our waitlist. We're excited to have you as part of our community.

What's Next?
We'll notify you as soon as new features become available and when we're ready to onboard new users. Keep an eye on your inbox!

About Schedule Builder:
Schedule Builder helps teams efficiently manage work schedules by collecting availability from team members and generating optimized schedules. Perfect for offices, clinics, and organizations with rotating schedules.

Visit our website: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}

If you have any questions or feedback, feel free to reach out. We'd love to hear from you!

To unsubscribe from waitlist updates, please contact us.`,
    });

    console.log('Waitlist confirmation email sent:', messageId);
    return { success: true, messageId };
  } catch (error) {
    console.error('Error sending waitlist confirmation email:', error);
    throw new Error('Failed to send waitlist confirmation email');
  }
}
