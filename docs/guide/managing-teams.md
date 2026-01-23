# Managing Teams

Complete guide to team administration, user management, and permissions in Schedule Builder.

## User Roles Overview

Schedule Builder has three user roles, each with specific permissions and capabilities.

### Primary Admin
The account creator with full system access:
- Manage all students and schedules
- Invite and remove secondary admins
- Approve password reset requests
- Access all reports and analytics
- Configure organization settings

**Note:** There is only one Primary Admin per organization.

### Secondary Admin
Additional administrators with scheduling permissions:
- Create and manage schedules
- Invite and manage students
- View reports and analytics
- Request availability
- Cannot manage other admins

### Student
Team members who provide availability and view schedules:
- Submit availability when requested
- View assigned schedules
- Update profile information
- Receive notifications
- Request password resets

## Managing Students

### Adding Students

To invite a new student to your organization:

1. Navigate to the Students section
2. Click "Invite Student"
3. Enter required information:
   - Email address
   - Full name
4. Click "Send Invitation"

The student will receive an email with:
- Welcome message
- Link to set password
- Instructions for first login

### Removing Students

To remove a student from your organization:

1. Navigate to the Students section
2. Find the student in the list
3. Click the remove icon
4. Confirm the action

::: warning
Removing a student will:
- Revoke their access immediately
- Remove them from future schedules
- Preserve historical schedule data
:::

### Viewing Student Information

To view detailed student information:

1. Click on a student's name
2. View their profile including:
   - Contact information
   - Availability history
   - Schedule assignments
   - Last login date

## Managing Admins (Primary Admin Only)

### Adding Secondary Admins

Only the Primary Admin can invite additional admins:

1. Navigate to the Admin Team section
2. Click "Invite Admin"
3. Enter the admin's email address
4. Send the invitation

The new admin will receive setup instructions via email.

### Removing Secondary Admins

To remove a secondary admin:

1. Navigate to the Admin Team section
2. Find the admin in the list
3. Click the remove button
4. Confirm the removal

::: tip
Removing an admin does not delete schedules they created.
:::

## User Management Best Practices

### Onboarding New Users
1. Send invitations promptly
2. Follow up if they don't complete setup
3. Provide orientation materials
4. Verify their information after first login

### Maintaining User List
1. Review user list regularly
2. Remove inactive users
3. Update contact information
4. Monitor login activity

### Security Considerations
1. Use appropriate roles for each user
2. Remove access for departed team members
3. Monitor password reset requests
4. Review admin permissions regularly

## Password Management

### Password Reset Approval (Primary Admin)

When a student requests a password reset:

1. Navigate to the Admin dashboard
2. Find the pending password reset request
3. Review the request details
4. Click "Approve" or "Deny"

If approved:
- Student's password is updated
- Student receives confirmation email
- Student can log in with new password

If denied:
- Request is cancelled
- Student is notified
- Student can submit a new request

### Password Requirements

All users must meet password requirements:
- Minimum 12 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character
- No common patterns

See [Password Requirements](./password-requirements) for complete details.

## Profile Management

### Updating Your Profile

Users can update their own profile information:

1. Click on your name in the header
2. Select "Profile"
3. Update information:
   - Display name
   - Contact information
   - Notification preferences
4. Save changes

### Notification Preferences

Configure how you receive notifications:

1. Navigate to Profile settings
2. Click "Notifications"
3. Choose preferences:
   - Email notifications
   - In-app notifications
   - Notification frequency
4. Save preferences

## Team Communication

### Sending Notifications

Admins can send notifications to team members:

1. Navigate to the Communication section
2. Compose your message
3. Select recipients:
   - All team members
   - Specific students
   - Admin team
4. Send notification

### Viewing Notification History

Track sent communications:

1. Navigate to Communication section
2. Click "History"
3. View past notifications:
   - Date sent
   - Recipients
   - Message content
   - Delivery status

## Organization Settings (Primary Admin)

### Updating Organization Information

Primary Admins can update organization details:

1. Navigate to Settings
2. Click "Organization"
3. Update information:
   - Organization name
   - Contact information
   - Time zone
   - Scheduling preferences
4. Save changes

### Managing Permissions

Configure what different roles can do:

1. Navigate to Settings
2. Click "Permissions"
3. Review and adjust:
   - Secondary admin capabilities
   - Student permissions
   - Public access settings
4. Save configuration

## Troubleshooting

### User Can't Login
- Verify account is active
- Check email is correct
- Ensure password was set
- Try password reset if needed

### Invitation Email Not Received
- Check spam/junk folder
- Verify email address is correct
- Resend invitation
- Contact support if issue persists

### Can't Remove User
- Check if user has pending schedules
- Verify your permissions
- Try refreshing the page
- Contact support if needed

## Next Steps

- [Creating Schedules](./creating-schedules) - Learn schedule management
- [Password Requirements](./password-requirements) - Security guidelines
- [Contact Support](/legal/contact) - Get help with team management
