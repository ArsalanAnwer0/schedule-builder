# Schedule Builder

A modern multi-tenant SaaS platform for managing student worker schedules at universities. Built for office managers to efficiently collect availability, generate optimized schedules, and manage their student workforce.

## Features

### Admin Portal
- **Multi-tenant Architecture**: Secure organization-based isolation
- **Student Management**: Add students with dual email support (personal + school email)
- **Availability Collection**: Request and track availability submissions from students
- **Smart Scheduling**: Generate 3 optimized schedule options (long, medium, short shifts)
- **Admin Roles**: Primary and secondary admin support with granular permissions
- **Email Notifications**: Automated emails for all workflow events
- **Availability Editing**: Students can request changes with admin approval workflow

### Student Portal
- **Simple Availability Submission**: Easy-to-use interface for selecting available time slots
- **Email Verification Login**: Passwordless authentication with verification codes
- **Schedule Viewing**: Access published schedules
- **Edit Requests**: Request availability changes with reason tracking

### Technical Features
- **Dual Email Support**: Students and admins can have both personal and school emails
- **Email Delivery**: All notifications sent to both email addresses
- **Organization Security**: Multi-tenant data isolation
- **Modern UI**: Clean, professional interface with custom modals
- **Mobile Responsive**: Works seamlessly on all devices

## Tech Stack

- **Framework**: Next.js 16.1.0 with App Router
- **Runtime**: React 19
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Email verification codes (passwordless)
- **Email Service**: Gmail SMTP with Nodemailer
- **Styling**: Custom CSS-in-JS
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 20+
- MongoDB database (Atlas or local)
- Gmail account for SMTP email sending

### Installation

1. Clone the repository:
```bash
git clone https://github.com/ArsalanAnwer0/schedule-builder.git
cd schedule-builder
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory:
```env
# MongoDB Connection
MONGODB_URI=your_mongodb_connection_string

# Gmail SMTP (for sending emails)
GMAIL_USER=your_email@gmail.com
GMAIL_APP_PASSWORD=your_app_specific_password

# App URL (for email links)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Session Secret (generate a random string)
SESSION_SECRET=your_random_secret_key
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Gmail SMTP Setup

To enable email sending:

1. Go to your Google Account settings
2. Enable 2-Factor Authentication
3. Generate an App Password:
   - Go to Security → App passwords
   - Select "Mail" and "Other (Custom name)"
   - Copy the 16-character password
4. Add the password to your `.env.local` as `GMAIL_APP_PASSWORD`

### Building for Production

```bash
npm run build
npm start
```

## User Workflows

### For Office Managers (Admins)

1. **Initial Setup**
   - Register as primary admin for your organization
   - Add secondary admins if needed (primary admin only)

2. **Student Management**
   - Add students with name, personal email, and school email
   - Students receive welcome email automatically

3. **Collect Availability**
   - Request availability from selected students
   - Students receive email notification
   - Track submission status in dashboard

4. **Generate Schedules**
   - Once availability is collected, configure:
     - Office hours (8:00 AM - 5:00 PM)
     - Schedule period dates
     - Total weekly hours needed
     - Hours per worker per week
   - Generate 3 optimized schedule options
   - Review and select the best option

5. **Publish Schedule**
   - Publish selected schedule
   - All students receive email notification
   - Students can view schedule in their portal

### For Students

1. **First Login**
   - Receive welcome email with login instructions
   - Login using either personal or school email
   - Enter verification code sent to email

2. **Submit Availability**
   - Wait for availability request from office manager
   - Select available time slots for each day
   - Add optional notes
   - Submit and receive confirmation

3. **View Schedule**
   - Receive email when schedule is published
   - Login to view assigned shifts
   - Contact manager for any concerns

4. **Edit Availability**
   - Submit edit request with reason
   - Wait for admin approval
   - Receive notification of approval/rejection

## API Routes

### Authentication
- `POST /api/auth/register` - Register new organization
- `POST /api/auth/request-link` - Request login verification code
- `POST /api/auth/verify-code` - Verify code and login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout
- `POST /api/auth/invite-admin` - Invite secondary admin
- `DELETE /api/auth/remove-admin` - Remove secondary admin

### Students
- `GET /api/students` - List all students in organization
- `POST /api/students` - Add new student
- `DELETE /api/students/[id]` - Delete student
- `POST /api/students/request-availability` - Request availability from students

### Availability
- `POST /api/availability` - Submit availability (student)
- `GET /api/availability` - Get availability (student)
- `POST /api/availability/request` - Request availability (admin)
- `POST /api/availability/reset` - Reset single student availability
- `POST /api/availability/reset-all` - Reset all students availability
- `POST /api/availability/edit-requests` - Create edit request
- `GET /api/availability/edit-requests` - List edit requests
- `POST /api/availability/edit-requests/[id]` - Approve/reject edit request

### Schedules
- `POST /api/schedules` - Save generated schedules
- `POST /api/schedules/[id]/publish` - Publish schedule
- `GET /api/schedules/published` - Get published schedule

## Project Structure

```
schedule-builder/
├── app/
│   ├── api/                      # API routes
│   │   ├── auth/                # Authentication endpoints
│   │   ├── students/            # Student management
│   │   ├── availability/        # Availability collection
│   │   └── schedules/           # Schedule generation
│   ├── components/
│   │   └── TimePicker.jsx       # Time selection component
│   ├── dashboard/               # Student portal
│   ├── login/                   # Login page
│   ├── register/                # Registration page
│   ├── profile/                 # Profile page
│   ├── page.jsx                 # Admin portal (main page)
│   └── globals.css              # Global styles
├── lib/
│   ├── auth/
│   │   └── session.js           # Session management
│   ├── db/
│   │   ├── connect.js           # MongoDB connection
│   │   └── models/              # Mongoose models
│   ├── email/
│   │   └── send.js              # Email sending utilities
│   ├── scheduler.js             # Scheduling algorithm
│   └── utils/                   # Utility functions
└── PLANNING.md                  # Development planning
```

## Database Models

### User
- `email`: Primary email (unique)
- `secondaryEmail`: Optional secondary email
- `name`: User's name
- `role`: 'admin' or 'student'
- `adminType`: 'primary' or 'secondary' (for admins)
- `organizationName`: Organization identifier
- `availabilityRequested`: Boolean flag for students

### Availability
- `userId`: Reference to User
- `availability`: Object with days and time slots
- `notes`: Optional notes from student

### AvailabilityEditRequest
- `userId`: Reference to User
- `status`: 'pending', 'approved', or 'rejected'
- `reason`: Student's reason for edit
- `oldAvailability`: Previous availability
- `newAvailability`: Requested availability

### VerificationCode
- `email`: User's email
- `code`: 6-digit verification code
- `expiresAt`: Expiration timestamp

### Schedule
- `organizationName`: Organization identifier
- `name`: Schedule name
- `scheduleConfig`: Configuration options
- `shifts`: Array of shift objects
- `isPublished`: Boolean flag
- `publishedAt`: Publication timestamp

## Email Notifications

All emails are sent to both primary and secondary email addresses:

- **Welcome Email**: When admin adds a new student
- **Availability Request**: When admin requests availability
- **Availability Submitted**: When student submits availability
- **All Submitted**: When all students have submitted
- **Edit Request**: When student requests availability change
- **Edit Decision**: When admin approves/rejects edit
- **Admin Invitation**: When primary admin invites secondary admin
- **Schedule Published**: When admin publishes schedule

## Security Features

- Organization-based data isolation
- Session-based authentication
- Email verification for login
- Admin role restrictions (primary vs secondary)
- CSRF protection
- Input validation and sanitization
- Secure environment variables

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the [MIT License](LICENSE).

## Author

Built by [Arsalan Anwer](https://github.com/ArsalanAnwer0)

## Support

For issues or questions, please open an issue on GitHub.
