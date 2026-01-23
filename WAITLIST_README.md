# Waitlist Feature Documentation

## Overview

The waitlist feature allows visitors to sign up for updates and early access to Schedule Builder. When users join the waitlist, they receive a confirmation email and their information is stored in the database for admin review.

## Features

- Email validation and duplicate prevention
- Rate limiting (3 signups per IP per hour)
- Automated confirmation emails via Resend
- Admin dashboard for viewing and managing signups
- CSV export functionality
- Status tracking (pending, invited, converted)

## User Flow

1. **User visits landing page** → Scrolls to waitlist section
2. **Enters email** → Submits waitlist form
3. **Backend validation** → Checks email format, duplicates, rate limits
4. **Database entry** → Creates waitlist record with "pending" status
5. **Confirmation email** → Sends welcome email via Resend
6. **Success message** → Shows confirmation to user

## API Endpoints

### POST /api/waitlist/subscribe

Subscribe a new email to the waitlist.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Successfully joined the waitlist! Check your email for confirmation.",
  "emailSent": true
}
```

**Response (Error):**
```json
{
  "error": "You are already on the waitlist!"
}
```

**Rate Limiting:**
- 3 attempts per IP address per hour
- Returns 429 status code when limit exceeded

### GET /api/waitlist/list

Fetch waitlist entries (Admin only).

**Query Parameters:**
- `status` (optional): Filter by status (pending, invited, converted)
- `page` (optional): Page number for pagination (default: 1)
- `limit` (optional): Items per page (default: 50)

**Response:**
```json
{
  "success": true,
  "data": {
    "entries": [...],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 150,
      "pages": 3
    },
    "counts": {
      "pending": 120,
      "invited": 20,
      "converted": 10,
      "total": 150
    }
  }
}
```

### GET /api/waitlist/export

Export waitlist to CSV (Admin only).

**Response:**
- CSV file download with headers: Email, Status, Source, Created At, Updated At

## Database Schema

### Waitlist Model

```javascript
{
  email: String,        // Unique, lowercase, trimmed
  status: String,       // pending | invited | converted
  source: String,       // landing_page (default)
  createdAt: Date,      // Auto-generated
  updatedAt: Date       // Auto-generated
}
```

**Indexes:**
- `email` (unique)
- `status`

## Email Configuration

The waitlist uses Resend for sending confirmation emails.

**Required Environment Variables:**
```bash
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM=Schedule Builder <noreply@schedule-builder.xyz>
NEXT_PUBLIC_APP_URL=https://schedule-builder.xyz
```

**Email Template Features:**
- Professional branded design
- Responsive HTML layout
- Plain text fallback
- Call-to-action button
- "What's Next" section

## Admin Dashboard

Access the waitlist admin dashboard at `/admin/waitlist` (requires admin authentication).

**Features:**
- View all waitlist signups
- Filter by status (pending, invited, converted)
- See real-time statistics
- Export to CSV
- Pagination for large lists
- Formatted timestamps

**Statistics Displayed:**
- Total signups
- Pending count
- Invited count
- Converted count

## Frontend Integration

The waitlist form is embedded in the landing page (`app/page.jsx`).

**Key Components:**
- Email input field
- Submit button with loading state
- Success/error message display
- Form validation

**State Management:**
```javascript
const [waitlistEmail, setWaitlistEmail] = useState('');
const [waitlistSubmitting, setWaitlistSubmitting] = useState(false);
const [waitlistSuccess, setWaitlistSuccess] = useState('');
const [waitlistError, setWaitlistError] = useState('');
```

## Security Features

1. **Rate Limiting**: 3 attempts per IP per hour
2. **Email Validation**: Regex pattern matching
3. **Duplicate Prevention**: Database unique constraint
4. **Admin-Only Access**: NextAuth session verification for list/export endpoints
5. **Lowercase Normalization**: All emails stored in lowercase
6. **SQL Injection Protection**: Mongoose ORM parameterized queries

## Testing

### Manual Testing Checklist

- [ ] Valid email submission succeeds
- [ ] Invalid email format rejected
- [ ] Duplicate email shows appropriate error
- [ ] Rate limiting triggers after 3 attempts
- [ ] Confirmation email received
- [ ] Admin can view waitlist
- [ ] Admin can filter by status
- [ ] Admin can export CSV
- [ ] Non-admin users blocked from admin endpoints

### Testing Commands

```bash
# Test signup
curl -X POST http://localhost:3000/api/waitlist/subscribe \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# Test duplicate
curl -X POST http://localhost:3000/api/waitlist/subscribe \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# Test invalid email
curl -X POST http://localhost:3000/api/waitlist/subscribe \
  -H "Content-Type: application/json" \
  -d '{"email":"invalid-email"}'
```

## Monitoring

### Key Metrics to Track

1. **Signup Rate**: Number of signups per day/week/month
2. **Conversion Rate**: Invited → Converted percentage
3. **Email Delivery Rate**: Successfully sent emails
4. **Duplicate Attempts**: Users trying to sign up multiple times
5. **Rate Limit Hits**: IPs hitting rate limits

### Logs to Monitor

```javascript
console.log(`Waitlist confirmation email sent successfully to: ${email}`);
console.error('Failed to send confirmation email:', emailError);
console.error('Waitlist subscription error:', error);
```

## Common Issues & Troubleshooting

### Issue: Emails not being sent

**Possible Causes:**
- RESEND_API_KEY not set or invalid
- EMAIL_FROM address not verified in Resend
- Resend API quota exceeded

**Solution:**
1. Check `.env` file for RESEND_API_KEY
2. Verify sender address in Resend dashboard
3. Check Resend dashboard for API usage/limits
4. Review server logs for email errors

### Issue: "Already on waitlist" error when user isn't

**Possible Causes:**
- Email already exists in database
- Case sensitivity issue (should be normalized to lowercase)

**Solution:**
```javascript
// Check database directly
db.waitlist.findOne({ email: 'user@example.com' })
```

### Issue: Rate limiting blocking legitimate users

**Possible Causes:**
- Multiple users behind same IP (corporate/school network)
- User refreshing page and resubmitting

**Solution:**
- Increase rate limit window or attempts
- Consider email-based rate limiting instead of IP
- Add CAPTCHA for additional verification

## Future Enhancements

- [ ] Add CAPTCHA to prevent spam
- [ ] Implement email verification before adding to waitlist
- [ ] Add bulk invite functionality for admins
- [ ] Create automated email campaigns for waitlist members
- [ ] Add analytics dashboard with charts
- [ ] Implement status change notifications
- [ ] Add webhook support for integrations
- [ ] Create referral system for waitlist members

## Related Files

```
/app/page.jsx                          # Landing page with waitlist form
/app/api/waitlist/subscribe/route.js  # Subscription endpoint
/app/api/waitlist/list/route.js       # Admin list endpoint
/app/api/waitlist/export/route.js     # CSV export endpoint
/app/admin/waitlist/page.jsx          # Admin dashboard
/lib/db/models/Waitlist.js            # Database model
/lib/email/send.js                    # Email sending (sendWaitlistConfirmation)
/.env.example                         # Environment variables template
```

## Support

For issues or questions about the waitlist feature:
- Check server logs for error messages
- Review Resend dashboard for email delivery status
- Test endpoints using curl or Postman
- Verify environment variables are set correctly
