import { useState, useEffect } from 'react';
import { validatePasswordStrength } from '@/lib/utils/passwordStrength';

/**
 * Custom hook for password validation
 * Provides real-time password strength validation
 *
 * @param {string} password - The password to validate
 * @returns {Object} - { validation, isValid }
 */
export function usePasswordValidation(password) {
  const [validation, setValidation] = useState(null);

  useEffect(() => {
    if (password) {
      const result = validatePasswordStrength(password);
      setValidation(result);
    } else {
      setValidation(null);
    }
  }, [password]);

  return {
    validation,
    isValid: validation?.isValid || false
  };
}
