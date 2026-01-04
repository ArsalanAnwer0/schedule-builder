# Email Verification Authentication Guide

## Overview
The application now uses email verification codes for secure authentication. Users must verify ownership of their email address to sign in.

## Test Accounts

### Admin Account
- **Email:** arsalan.anwer9050@gmail.com
- **Role:** admin
- **Redirect:** / (Admin Dashboard)

### Student Account
- **Email:** arsalan.anwer9050@yahoo.com
- **Role:** student
- **Redirect:** /dashboard (Student Dashboard)

## Authentication Flow

### Step 1: Request Verification Code
1. User enters email address
2. System checks if email exists in database
3. System checks rate limiting (90 seconds between requests)
4. System generates 6-digit code
5. Code is saved to database with 10-minute expiration
6. Email is sent with verification code

### Step 2: Verify Code
1. User enters 6-digit code
2. System validates code against database
3. System checks if code has expired
4. If valid, user is signed in and redirected based on role
5. Used codes are deleted immediately

## Security Features

### Rate Limiting
- Users can request a new code every 90 seconds
- UI shows countdown timer before "Resend" button appears
- API returns helpful error messages with wait time

### Code Expiration
- Codes expire after 10 minutes
- Expired codes are automatically deleted from database
- MongoDB TTL index ensures cleanup

### Email Validation
- Only registered users (in database) can receive codes
- Prevents spam and unauthorized access attempts
- Clear error message: "No account found with this email. Please contact your office manager."

## UI Features

### Email Input Step
- Clean, modern interface
- Email validation
- Clear call-to-action button
- Helper text explaining the process

### Code Verification Step
- Large, monospace input for 6-digit code
- Auto-focus on code input
- Visual feedback for code entry
- Disabled submit until 6 digits entered
- "Change email" option to go back
- Resend code functionality with countdown
- Clear expiration notice (10 minutes)

### Error Handling
- User-friendly error messages
- Visual error indicators (red alert boxes)
- Success messages (green alert boxes)
- Specific errors for:
  - Email not found
  - Rate limiting (with countdown)
  - Invalid code
  - Expired code
  - Email sending failures

## Email Configuration

The system uses Gmail SMTP for sending verification codes:

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=arsalan.anwer9050@gmail.com
SMTP_PASS=[App Password]
SMTP_FROM="Schedule Builder <noreply@schedulebuilder.com>"
```

## Testing the System

### Local Development
1. Start dev server: `npm run dev`
2. Visit: http://localhost:3000/login
3. Enter test email (gmail for admin, yahoo for student)
4. Check your email inbox
5. Enter the 6-digit code
6. Verify redirect to correct dashboard

### Test Scenarios

#### Happy Path
1. Enter valid email → Code sent
2. Enter correct code → Signed in
3. Redirected to appropriate dashboard

#### Email Not Found
1. Enter unregistered email
2. Error: "No account found with this email. Please contact your office manager."

#### Rate Limiting
1. Request code
2. Immediately request another code
3. Error with countdown: "Please wait [X] seconds before requesting a new code"

#### Expired Code
1. Request code
2. Wait 10+ minutes
3. Enter code
4. Error: "Verification code has expired. Please request a new one."

#### Invalid Code
1. Request code
2. Enter wrong digits
3. Error: "Invalid verification code"

#### Resend Code
1. Request code
2. Wait 90 seconds for countdown
3. Click "Resend verification code"
4. New code sent to email

## Database Models

### User Model
```javascript
{
  email: String (unique, lowercase)
  name: String
  role: 'admin' | 'student'
  createdAt: Date
  updatedAt: Date
}
```

### VerificationCode Model
```javascript
{
  email: String (lowercase)
  code: String (6 digits)
  expiresAt: Date
  createdAt: Date (TTL index: 600 seconds)
}
```

## API Endpoints

### POST /api/auth/request-link
Request a verification code

**Request:**
```json
{
  "email": "arsalan.anwer9050@gmail.com"
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Verification code sent to your email"
}
```

**Error Responses:**
- 400: Email required
- 404: Email not found
- 429: Rate limited
- 500: Email sending failed

### POST /api/auth/verify-code
Verify the code and sign in

**Request:**
```json
{
  "email": "arsalan.anwer9050@gmail.com",
  "code": "123456"
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "redirectUrl": "/"
}
```

**Error Responses:**
- 400: Email and code required
- 401: Invalid or expired code
- 404: User not found
- 500: Server error

## Production Considerations

### Email Deliverability
- Consider using a professional email service (SendGrid, AWS SES, etc.)
- Set up SPF, DKIM, and DMARC records
- Monitor bounce rates and spam complaints

### Security Enhancements
- Consider implementing CAPTCHA for rate limiting
- Add IP-based rate limiting
- Implement account lockout after too many failed attempts
- Add audit logging for authentication events

### User Experience
- Consider adding SMS as an alternative verification method
- Implement "Remember this device" functionality
- Add email templates with organization branding
- Consider shorter codes (4 digits) with more frequent rotation
