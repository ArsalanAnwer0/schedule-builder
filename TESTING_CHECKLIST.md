# Testing Checklist for improve-ui-algo Branch

## Prerequisites
- [ ] Add 6 screenshot images to `/public/screenshots/` folder:
  - admin-1.png, admin-2.png, admin-3.png
  - student-1.png, student-2.png, student-3.png

## 1. Email Verification Disabled
- [ ] Register a new user (primary admin)
- [ ] Verify redirect to login page (not verify-email)
- [ ] Login successfully without email verification
- [ ] Check that no email verification banner appears in dashboard
- [ ] Visit `/verify-email` directly - should see disabled message

## 2. Primary Admin Display
- [ ] Register first user for a new organization
- [ ] Login and go to profile page
- [ ] Verify role shows "Primary Admin" (not "Secondary Admin")
- [ ] Check admin dashboard shows correct adminType

## 3. Email-Role Conflict Validation
- [ ] As primary admin, try to add a student with an email that's already registered as admin
- [ ] Verify error: "This email is already registered as an admin. One email can only have one role."
- [ ] Try to invite an admin with an email that's already a student
- [ ] Verify error: "This email is already registered as a student. One email can only have one role."

## 4. Admin Management
- [ ] As primary admin, verify "Admin Team" section is visible
- [ ] Click "+ Invite Admin" button
- [ ] Add a secondary admin successfully
- [ ] Verify secondary admin appears in the list with "Secondary Admin" badge
- [ ] Verify "Remove" button appears next to secondary admin
- [ ] Login as secondary admin
- [ ] Verify "Admin Team" section is NOT visible to secondary admin
- [ ] Verify secondary admin cannot invite or remove other admins

## 5. Forgot Password Flow (Admin-Assisted)
### Student Side:
- [ ] Go to forgot password page
- [ ] Enter email and new password (and confirm password)
- [ ] Submit request
- [ ] Verify success message: "An admin will review and approve your request"
- [ ] Check that student cannot login with new password yet

### Admin Side:
- [ ] Login as admin
- [ ] Verify notification appears about password reset request
- [ ] Navigate to admin dashboard (check if password reset requests section exists)
- [ ] Approve the password reset request
- [ ] Verify student receives notification about approval

### Student Verification:
- [ ] Student logs in with new password successfully
- [ ] Old password no longer works

## 6. Notification System
### Test 1: Admin Requests Availability
- [ ] As admin, select students and click "Request Availability"
- [ ] Login as each student
- [ ] Verify notification appears: "Admin has requested your availability"
- [ ] Click notification - should redirect to dashboard

### Test 2: Student Submits Availability
- [ ] As student, submit availability form
- [ ] Login as admin
- [ ] Verify notification: "Student X has submitted their availability"
- [ ] Click notification - should redirect to admin page

### Test 3: All Students Submitted
- [ ] Have remaining students submit their availability
- [ ] When last student submits, admin should receive notification
- [ ] Verify notification: "All X students have submitted their availability!"
- [ ] Check bell icon shows unread count

## 7. Homepage Screenshot Carousel
- [ ] Visit homepage
- [ ] Scroll to "See it in action" section
- [ ] Verify "Admin Portal" carousel is visible
- [ ] Click right arrow - should advance to next screenshot
- [ ] Click left arrow - should go to previous screenshot
- [ ] Click dot indicators - should jump to specific screenshot
- [ ] Verify captions appear below each screenshot
- [ ] Repeat for "Student Portal" carousel
- [ ] Verify old screenshot placeholder is removed from hero section

## 8. End-to-End Workflow
### Complete Organization Setup:
1. [ ] Register primary admin for new organization
2. [ ] Verify role shows as "Primary Admin"
3. [ ] Add 2 secondary admins
4. [ ] Add 5 students
5. [ ] Request availability from all students
6. [ ] Verify all students receive notifications
7. [ ] Have students submit availability (one by one)
8. [ ] Verify admin receives notification for each submission
9. [ ] Verify admin receives "all submitted" notification after last student
10. [ ] Generate schedule from availability
11. [ ] Publish schedule
12. [ ] Verify students can see published schedule

### Test Password Reset:
1. [ ] Student requests password reset
2. [ ] Admin receives notification
3. [ ] Admin approves request
4. [ ] Student receives approval notification
5. [ ] Student logs in with new password

## 9. Browser Compatibility
- [ ] Test in Chrome
- [ ] Test in Firefox
- [ ] Test in Safari
- [ ] Test on mobile (responsive design)

## 10. Security & Error Handling
- [ ] Try to access admin routes as student (should be blocked)
- [ ] Try to access student routes as admin (should work)
- [ ] Test rate limiting on password reset (3 attempts per 15 min)
- [ ] Test invalid email formats
- [ ] Test weak passwords (less than 6 characters)
- [ ] Test mismatched passwords on forgot password form

## Known Limitations
- Password reset requests require admin UI integration in admin dashboard
- Screenshots need to be added to `/public/screenshots/` folder
- Email notifications are sent but may fail if email service is not configured
