import { getStrengthDisplay } from '@/lib/utils/passwordStrength';

/**
 * PasswordRequirementsDisplay Component
 * Displays password strength and requirement checklist with red/green indicators
 *
 * @param {Object} props
 * @param {string} props.password - The password being validated
 * @param {Object} props.validation - Validation result from validatePasswordStrength()
 * @param {boolean} props.showStrengthBar - Whether to show the strength bar (default: true)
 */
export default function PasswordRequirementsDisplay({
  password,
  validation,
  showStrengthBar = true
}) {
  if (!validation || !password) {
    return null;
  }

  const strengthDisplay = getStrengthDisplay(validation.strength);

  // Individual requirement checks for granular red/green display
  const requirements = [
    {
      met: password.length >= 12,
      text: 'At least 12 characters long'
    },
    {
      met: /[A-Z]/.test(password),
      text: 'At least one uppercase letter'
    },
    {
      met: /[a-z]/.test(password),
      text: 'At least one lowercase letter'
    },
    {
      met: /\d/.test(password),
      text: 'At least one number'
    },
    {
      met: /[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/;'`~]/.test(password),
      text: 'At least one special character (!@#$%^&*...)'
    }
  ];

  // Check for common patterns
  const commonPatterns = [/^123456/, /password/i, /qwerty/i, /^abc123/, /admin/i, /letmein/i];
  const hasCommonPattern = commonPatterns.some(pattern => pattern.test(password));

  if (hasCommonPattern) {
    requirements.push({
      met: false,
      text: 'Password is too common - choose a more unique password'
    });
  }

  return (
    <div style={{ marginTop: '0.75rem' }} role="status" aria-live="polite" aria-atomic="true">
      {/* Strength Label and Bar */}
      {showStrengthBar && (
        <>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '0.5rem'
          }} aria-label={`Password strength: ${strengthDisplay.label}`}>
            <span style={{
              fontSize: '0.75rem',
              color: 'rgba(0, 0, 0, 0.6)',
              fontWeight: '400'
            }}>
              Password Strength:
            </span>
            <span style={{
              fontSize: '0.75rem',
              fontWeight: '600',
              color: strengthDisplay.color
            }} aria-label={strengthDisplay.label}>
              {strengthDisplay.label}
            </span>
          </div>

          {/* Strength Bar */}
          <div
            style={{
              height: '4px',
              backgroundColor: 'rgba(0, 0, 0, 0.1)',
              borderRadius: '2px',
              overflow: 'hidden',
              marginBottom: '0.75rem'
            }}
            role="progressbar"
            aria-valuenow={validation.score}
            aria-valuemin="0"
            aria-valuemax="6"
            aria-label={`Password strength score: ${validation.score} out of 6`}
          >
            <div style={{
              height: '100%',
              width: `${(validation.score / 6) * 100}%`,
              backgroundColor: strengthDisplay.color,
              transition: 'all 0.3s ease'
            }}></div>
          </div>
        </>
      )}

      {/* Requirement Checklist */}
      <div style={{
        padding: '0.75rem',
        backgroundColor: 'rgba(0, 0, 0, 0.03)',
        borderRadius: '6px',
        border: '1px solid rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          fontSize: '0.75rem',
          color: 'rgba(0, 0, 0, 0.6)',
          marginBottom: '0.5rem',
          fontWeight: '500'
        }}>
          Password Requirements:
        </div>
        <ul
          style={{
            margin: 0,
            paddingLeft: '1.25rem',
            fontSize: '0.75rem',
            lineHeight: '1.6'
          }}
          aria-label="Password requirements list"
        >
          {requirements.map((req, idx) => (
            <li
              key={idx}
              style={{
                marginBottom: idx < requirements.length - 1 ? '0.25rem' : 0,
                color: req.met ? '#10b981' : '#dc2626',
                fontWeight: req.met ? '500' : '400',
                transition: 'all 0.2s ease',
                listStyle: 'none',
                position: 'relative',
                paddingLeft: '1.25rem'
              }}
              aria-label={`${req.text}: ${req.met ? 'met' : 'not met'}`}
            >
              <span style={{
                position: 'absolute',
                left: 0,
                top: '0.1rem',
                fontSize: '0.875rem',
                fontWeight: '600',
                transition: 'all 0.2s ease'
              }}>
                {req.met ? '✓' : '✗'}
              </span>
              {req.text}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
