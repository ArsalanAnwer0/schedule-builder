/**
 * Validates password strength and returns errors if any requirements are not met
 * @param {string} password - The password to validate
 * @returns {Object} - { isValid: boolean, errors: string[], strength: 'weak'|'medium'|'strong' }
 */
export function validatePasswordStrength(password) {
  const errors = [];
  let score = 0;

  // Minimum length check
  if (!password || password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  } else {
    score++;
    if (password.length >= 12) score++;
  }

  // Uppercase letter check
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  } else {
    score++;
  }

  // Lowercase letter check
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  } else {
    score++;
  }

  // Number check
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  } else {
    score++;
  }

  // Special character check
  if (!/[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/;'`~]/.test(password)) {
    errors.push('Password must contain at least one special character (!@#$%^&*...)');
  } else {
    score++;
  }

  // Common password patterns to avoid
  const commonPatterns = [
    /^123456/,
    /password/i,
    /qwerty/i,
    /^abc123/,
    /admin/i,
    /letmein/i
  ];

  if (commonPatterns.some(pattern => pattern.test(password))) {
    errors.push('Password is too common. Please choose a more unique password');
    score = Math.max(0, score - 2);
  }

  // Determine strength
  let strength = 'weak';
  if (score >= 5 && errors.length === 0) {
    strength = 'strong';
  } else if (score >= 3) {
    strength = 'medium';
  }

  return {
    isValid: errors.length === 0,
    errors,
    strength,
    score
  };
}

/**
 * Gets a user-friendly password strength label and color
 * @param {string} strength - 'weak'|'medium'|'strong'
 * @returns {Object} - { label: string, color: string, bgColor: string }
 */
export function getStrengthDisplay(strength) {
  const displays = {
    weak: {
      label: 'Weak',
      color: '#ef4444',
      bgColor: 'rgba(239, 68, 68, 0.15)'
    },
    medium: {
      label: 'Medium',
      color: '#f59e0b',
      bgColor: 'rgba(245, 158, 11, 0.15)'
    },
    strong: {
      label: 'Strong',
      color: '#10b981',
      bgColor: 'rgba(16, 185, 129, 0.15)'
    }
  };

  return displays[strength] || displays.weak;
}
