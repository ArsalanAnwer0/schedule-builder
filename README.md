# Schedule Builder

A modern multi-tenant SaaS platform for managing student worker schedules at universities. Built for office managers to efficiently collect availability, generate optimized schedules, and manage their student workforce.

**Status**: Beta (v0.1.0)

## Features

### Admin Portal
- **Student Management**: Add, edit, and delete students with dual email support (personal + school)
- **Admin Roles**: Primary and secondary admin support with invitation workflow
- **Availability Collection**: Request and track availability submissions with bulk operations
- **Smart Scheduling**: Generate 3 optimized schedule options (long, medium, short shifts)
- **Configuration Library**: Save, reuse, and manage scheduling configurations with a step-by-step wizard
- **Schedule Publishing**: Publish schedules with automatic email notifications to all students
- **Schedule History**: Version control for schedules with rollback capability
- **Recurring Schedules**: Automate schedule generation on a recurring basis
- **Edit Request Management**: Review and approve/reject student availability change requests
- **Password Reset Management**: Handle student password reset requests
- **Audit Logging**: Track all administrative actions with export capability
- **Notifications**: Real-time notification system for events and changes
- **Semester Presets**: Built-in US university semester dates (Spring, Summer, Fall 2026–2027)

### Student Portal
- **Availability Submission**: Intuitive grid interface for selecting available time slots
- **Schedule Viewing**: Access published schedules with shift details
- **Edit Requests**: Request availability changes with reason tracking
- **Login Options**: Passwordless email verification or password-based authentication
- **Notifications**: View and manage system notifications

### Community
- **Discussion Forum**: Topics, replies, and upvoting system
- **Waitlist**: Public signup for early access with admin export

### Technical Highlights
- **Multi-tenant Architecture**: Organization-based data isolation
- **Dual Email Support**: All notifications sent to both personal and school emails
- **Google OAuth**: Sign in with Google alongside email-based auth
- **Two-Factor Authentication**: TOTP-based 2FA with QR code setup
- **Conflict Detection**: Identify scheduling conflicts and warnings
- **Mobile Responsive**: Works seamlessly on all devices

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.1.0 (App Router) |
| Runtime | React 19 |
| Database | MongoDB with Mongoose 9 |
| Authentication | Email verification codes, Google OAuth, 2FA (TOTP), passwords |
| Email | Resend (primary), Nodemailer/Gmail SMTP (fallback) |
| Animations | GSAP |
| Security | bcryptjs, otpauth, qrcode |
| Deployment | Vercel |

## Getting Started

### Prerequisites

- Node.js 20+
- MongoDB database (Atlas or local)
- Resend account for email delivery (or Gmail SMTP)

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

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Email (Resend)
RESEND_API_KEY=your_resend_api_key
EMAIL_FROM=Schedule Builder <noreply@yourdomain.com>

# Authentication
JWT_SECRET=your_random_secret_key

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

See `.env.example` for all available configuration options.

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
npm run build
npm start
```

## Project Structure

```
schedule-builder/
├── app/
│   ├── admin/                      # Admin portal
│   │   ├── page.jsx                # Main admin dashboard
│   │   └── components/             # Admin UI components
│   │       ├── ConfigurationWizard.jsx
│   │       ├── ConfigurationLibrary.jsx
│   │       └── ...
│   ├── dashboard/                  # Student portal
│   ├── login/                      # Login page
│   ├── register/                   # Registration page
│   ├── verify-email/               # Email verification
│   ├── verify-2fa/                 # 2FA verification
│   ├── forgot-password/            # Password recovery
│   ├── reset-password/             # Password reset
│   ├── set-password/               # Set password (from invite)
│   ├── profile/                    # User profile
│   ├── settings/                   # User settings (security, etc.)
│   ├── notifications/              # Notifications page
│   ├── docs/                       # Documentation pages
│   ├── contact/                    # Contact page
│   ├── privacy/                    # Privacy policy
│   ├── terms/                      # Terms of service
│   ├── api/                        # API routes
│   │   ├── auth/                   # Authentication (17 endpoints)
│   │   ├── students/               # Student management
│   │   ├── availability/           # Availability collection
│   │   ├── schedules/              # Schedules, configurations, history
│   │   ├── recurring-schedules/    # Recurring schedule rules
│   │   ├── forum/                  # Discussion forum
│   │   ├── waitlist/               # Waitlist management
│   │   ├── audit-logs/             # Audit trail
│   │   ├── notifications/          # Notification management
│   │   ├── password-reset-requests/# Password reset workflow
│   │   ├── organizations/          # Organization settings
│   │   └── cron/                   # Scheduled jobs
│   ├── components/                 # Shared UI components
│   ├── page.jsx                    # Landing page
│   ├── layout.jsx                  # Root layout
│   └── globals.css                 # Global styles
├── lib/
│   ├── auth/
│   │   └── session.js              # Session management
│   ├── db/
│   │   ├── connect.js              # MongoDB connection
│   │   └── models/                 # 22 Mongoose models
│   ├── email/
│   │   └── send.js                 # Email utilities (Resend + Nodemailer)
│   ├── scheduler.js                # Scheduling algorithm
│   └── utils/                      # Utility functions
└── .env.example                    # Environment variable template
```

## API Routes

### Authentication (`/api/auth/`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | Register new organization |
| POST | `/login` | Login with email |
| POST | `/verify-code` | Verify login code |
| GET | `/me` | Get current user |
| POST | `/logout` | Logout |
| POST | `/invite-admin` | Invite secondary admin |
| DELETE | `/remove-admin` | Remove secondary admin |
| GET | `/admins` | List organization admins |
| POST | `/forgot-password` | Request password reset |
| POST | `/reset-password` | Reset password |
| POST | `/set-password` | Set password (from invite) |
| POST | `/send-verification` | Resend verification email |
| POST | `/verify-email` | Verify email address |
| POST | `/google` | Initiate Google OAuth |
| POST | `/google/callback` | Google OAuth callback |
| POST | `/google/register` | Register via Google |
| POST | `/delete-account` | Delete user account |

### Two-Factor Authentication (`/api/auth/2fa/`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/enable` | Enable 2FA |
| POST | `/disable` | Disable 2FA |
| POST | `/verify-setup` | Verify 2FA setup |
| POST | `/verify-login` | Verify 2FA during login |

### Students (`/api/students/`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List all students |
| POST | `/` | Add new student |
| DELETE | `/[id]` | Delete student |
| POST | `/bulk-delete` | Bulk delete students |
| POST | `/request-availability` | Request availability from students |
| GET | `/availability` | Get student availability |

### Availability (`/api/availability/`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Submit availability |
| GET | `/` | Get user's availability |
| POST | `/request` | Request availability (admin) |
| POST | `/reset` | Reset single student availability |
| POST | `/reset-all` | Reset all students availability |
| POST | `/edit-requests` | Create edit request |
| GET | `/edit-requests` | List edit requests |
| POST | `/edit-requests/[id]` | Approve/reject edit request |

### Schedules (`/api/schedules/`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Save generated schedule |
| GET | `/published` | Get published schedule |
| POST | `/[id]/publish` | Publish a schedule |
| GET | `/[id]/conflicts` | Get schedule conflicts |

### Schedule Configurations (`/api/schedules/configurations/`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Save configuration |
| GET | `/` | List configurations |
| GET | `/[id]` | Get single configuration |
| POST | `/[id]/use` | Use a configuration |
| POST | `/[id]/set-default` | Set as default configuration |

### Schedule History (`/api/schedules/history/`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get schedule history |
| GET | `/[version]` | Get specific version |
| POST | `/revert/[version]` | Revert to a version |

### Recurring Schedules (`/api/recurring-schedules/`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List recurring rules |
| POST | `/` | Create recurring rule |
| PUT | `/[id]` | Update recurring rule |
| POST | `/[id]/toggle` | Enable/disable rule |
| POST | `/[id]/run-now` | Manually trigger generation |
| GET | `/[id]/logs` | Get execution logs |

### Forum (`/api/forum/`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/categories` | List forum categories |
| GET | `/topics` | List topics |
| POST | `/topics` | Create topic |
| GET | `/topics/[id]` | Get topic details |
| POST | `/topics/[id]/replies` | Reply to topic |
| POST | `/topics/[id]/upvote` | Upvote topic |
| POST | `/replies/[id]/upvote` | Upvote reply |

### Other Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/audit-logs` | Get audit logs |
| GET | `/audit-logs/export` | Export audit logs |
| GET | `/notifications` | Get notifications |
| POST | `/notifications/mark-read` | Mark notifications as read |
| GET | `/password-reset-requests` | List reset requests |
| POST | `/password-reset-requests/[id]/approve` | Approve reset |
| POST | `/password-reset-requests/[id]/deny` | Deny reset |
| POST | `/waitlist/subscribe` | Subscribe to waitlist |
| GET | `/waitlist/list` | List waitlist entries |
| GET | `/waitlist/export` | Export waitlist |
| GET | `/organizations/settings` | Get org settings |
| PUT | `/organizations/settings` | Update org settings |

## Database Models

### Core
| Model | Description |
|-------|-------------|
| User | Admin and student accounts with roles, emails, and organization |
| Availability | Student availability submissions with time slots and notes |
| AvailabilityEditRequest | Change requests with approval workflow |
| Schedule | Generated schedules with configuration, shifts, and publication status |
| ScheduleConfiguration | Saved scheduling configurations and templates |
| ScheduleTemplate | Legacy templates (migrating to configurations) |
| ScheduleHistory | Version history and audit trail for schedules |
| SchedulePeriod | Scheduling period definitions |

### Authentication & Security
| Model | Description |
|-------|-------------|
| Session | User session management |
| VerificationCode | Email verification codes for login |
| EmailVerification | Email verification tracking |
| MagicLink | Passwordless login links |
| PasswordReset | Password reset requests |

### Organization & Administration
| Model | Description |
|-------|-------------|
| OrganizationSettings | Organization-level configuration |
| AuditLog | Comprehensive audit trail of system actions |

### Scheduling Automation
| Model | Description |
|-------|-------------|
| RecurringScheduleRule | Configuration for recurring schedules |
| RecurringScheduleLog | Execution logs for recurring schedules |
| Notification | Notification records |

### Community
| Model | Description |
|-------|-------------|
| Waitlist | Community waitlist signups |
| Topic | Forum discussion topics |
| Category | Forum categories |
| Reply | Forum replies and comments |

## Email Notifications

All emails are sent to both primary and secondary email addresses:

- **Welcome Email**: When admin adds a new student
- **Availability Request**: When admin requests availability
- **Availability Submitted**: When student submits availability
- **All Submitted**: When all students have submitted
- **Edit Request Created**: When student requests availability change
- **Edit Request Decision**: When admin approves/rejects edit
- **Admin Invitation**: When primary admin invites secondary admin
- **Schedule Published**: When admin publishes schedule
- **Password Reset**: When user requests password reset
- **Verification Code**: Login verification codes

## Security

- Multi-tenant organization-based data isolation
- Session-based authentication with JWT
- Passwordless email verification login
- Google OAuth 2.0 integration
- Two-Factor Authentication (TOTP with QR code setup)
- Password hashing with bcrypt
- Admin role restrictions (primary vs secondary)
- Comprehensive audit logging
- Input validation and sanitization
- Secure environment variables

## User Workflows

### For Office Managers (Admins)

1. **Register** your organization and invite co-admins
2. **Add students** with name, personal email, and school email
3. **Request availability** from selected students (bulk or individual)
4. **Configure scheduling** using the configuration wizard:
   - Business hours and open days
   - Schedule period dates (with semester presets)
   - Worker count and shift length preferences
   - Save configurations to the library for reuse
5. **Generate** 3 optimized schedule options
6. **Review** options and select the best one
7. **Publish** the schedule — students are notified automatically
8. **Manage** ongoing requests: availability edits, password resets
9. **Set up recurring schedules** for automated generation
10. **Review audit logs** for compliance tracking

### For Students

1. **Receive** welcome email with login instructions
2. **Login** using email verification code, password, or Google
3. **Submit availability** when requested by office manager
4. **View** published schedules with assigned shifts
5. **Request changes** to availability with reason tracking
6. **Participate** in the community forum

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the [MIT License](LICENSE).

## Author

Built by [Arsalan Anwer](https://github.com/ArsalanAnwer0)

## Support

For issues or questions, please open an issue on GitHub.
