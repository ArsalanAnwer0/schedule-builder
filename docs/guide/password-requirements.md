# Password Requirements

Schedule Builder enforces strong password requirements to protect user accounts and maintain security best practices.

## Password Criteria

All passwords must meet the following requirements:

- **Minimum Length**: 12 characters
- **Uppercase Letter**: At least one uppercase letter (A-Z)
- **Lowercase Letter**: At least one lowercase letter (a-z)
- **Number**: At least one digit (0-9)
- **Special Character**: At least one special character (!@#$%^&*(),.?":{}|<>_-+=[]\/;'`~)
- **No Common Patterns**: Password cannot contain common patterns like "password", "qwerty", "123456", "admin", etc.

## Why 12 Characters?

While NIST guidelines recommend a minimum of 8 characters, Schedule Builder requires 12 characters for enhanced security:

- **Stronger Protection**: 12-character passwords are exponentially harder to crack than 8-character passwords
- **Industry Best Practice**: Many security frameworks now recommend 12+ characters
- **Future-Proofing**: As computing power increases, longer passwords provide better long-term security

## Real-Time Validation

When creating or resetting your password, you'll see:

- **Password Strength Indicator**: Visual bar showing weak/medium/strong
- **Requirement Checklist**: Each requirement marked with:
  - ✓ Green checkmark when met
  - ✗ Red X when not met
- **Real-Time Updates**: Validation updates as you type
- **Disabled Submit**: Form submission disabled until all requirements are met

## Where Password Validation Applies

Password validation is enforced on:

1. **Registration** (`/register`) - When creating a new admin account
2. **Set Password** (`/set-password`) - When setting password for the first time (students/secondary admins)
3. **Reset Password** (`/reset-password`) - When resetting a forgotten password

## Security Features

### Frontend Validation
- Real-time requirement checking
- Visual feedback with color-coded indicators
- Submit button disabled until valid

### Backend Validation
- All password requirements validated server-side
- Rate limiting to prevent brute force attacks:
  - Register: 3 attempts per IP per hour
  - Reset Password: 5 attempts per token per 15 minutes
  - Set Password: 10 attempts per email per 5 minutes
- Passwords hashed using bcrypt (10 rounds)

### Password Storage
- Never stored in plain text
- Hashed with bcrypt before database storage
- Salt automatically generated per password
- Original password never logged or transmitted after hashing

## Tips for Creating Strong Passwords

1. **Use a Passphrase**: Combine multiple unrelated words (e.g., "BlueSky-Coffee92!")
2. **Avoid Personal Information**: Don't use names, birthdates, or common words
3. **Use a Password Manager**: Consider using a password manager to generate and store complex passwords
4. **Unique per Account**: Never reuse passwords across different services
5. **Mix Character Types**: Combine uppercase, lowercase, numbers, and symbols

## Common Password Mistakes to Avoid

- Sequential characters: "abc123", "qwerty"
- Repeated characters: "aaaaaa", "111111"
- Dictionary words: "password", "welcome"
- Personal info: names, birthdates, addresses
- Common patterns: "Password1!", "Admin@123"

## Accessibility

The password validation interface is fully accessible:

- **Screen Reader Support**: Validation status announced via ARIA live regions
- **Keyboard Navigation**: All interactions support keyboard-only navigation
- **Color Contrast**: Meets WCAG AA standards for color contrast
- **Clear Labels**: All form fields properly labeled for assistive technology

## Technical Implementation

For developers working with the codebase:

### Components
- `PasswordRequirementsDisplay`: Reusable validation UI component
- `usePasswordValidation`: Custom React hook for validation logic

### Validation Utility
- `lib/utils/passwordStrength.js`: Core validation function
- Returns: `{ isValid, errors, strength, score }`

### Example Usage

```jsx
import { usePasswordValidation } from '@/lib/hooks/usePasswordValidation';
import PasswordRequirementsDisplay from '@/components/auth/PasswordRequirementsDisplay';

function MyPasswordForm() {
  const [password, setPassword] = useState('');
  const { validation, isValid } = usePasswordValidation(password);

  return (
    <div>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <PasswordRequirementsDisplay
        password={password}
        validation={validation}
        showStrengthBar={true}
      />
      <button disabled={!isValid}>Submit</button>
    </div>
  );
}
```

## FAQ

### Q: Why can't I use my old 8-character password?
**A:** Schedule Builder has updated its security requirements to 12 characters minimum for better protection. This follows current security best practices.

### Q: Do I need to change my existing password?
**A:** Existing passwords are not immediately invalidated, but you'll be required to meet the new requirements when changing or resetting your password.

### Q: Can I use spaces in my password?
**A:** Yes, spaces are allowed and can be part of a strong passphrase (e.g., "Blue Sky Coffee 92!").

### Q: What if I forget my password?
**A:** Use the "Forgot Password" link on the login page. You'll receive an email with a reset link. The new password must meet all requirements.

### Q: Are password requirements the same for all user types?
**A:** Yes, all users (administrators, students, secondary admins) must meet the same password requirements for consistency and security.

## Support

If you have questions or issues with password requirements:

- Check the troubleshooting guide
- Contact your system administrator
- Review the security documentation
