// Przenieś hook poza komponent, żeby uniknąć problemów z renderowaniem
export interface PasswordValidationResult {
  valid: boolean;
  score: number;
  errors: string[];
  requirements: PasswordRequirement[];
}

export interface PasswordRequirement {
  id: string;
  label: string;
  met: boolean;
  regex?: RegExp;
  customCheck?: (password: string) => boolean;
}

// Funkcja walidacji bez hooka
export const validatePasswordStrength = (password: string): PasswordValidationResult => {
  const errors: string[] = [];
  
  // Ujednolicone wymagania zgodne z OWASP/NIST
  const requirements: PasswordRequirement[] = [
    {
      id: 'length',
      label: 'Co najmniej 12 znaków',
      met: password.length >= 12,
      customCheck: (pwd) => pwd.length >= 12
    },
    {
      id: 'uppercase',
      label: 'Co najmniej jedna wielka litera (A-Z)',
      met: /[A-Z]/.test(password),
      regex: /[A-Z]/
    },
    {
      id: 'lowercase',
      label: 'Co najmniej jedna mała litera (a-z)',
      met: /[a-z]/.test(password),
      regex: /[a-z]/
    },
    {
      id: 'digit',
      label: 'Co najmniej jedna cyfra (0-9)',
      met: /\d/.test(password),
      regex: /\d/
    },
    {
      id: 'special',
      label: 'Co najmniej jeden znak specjalny (!@#$%^&*)',
      met: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
      regex: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/
    },
    {
      id: 'no_common_patterns',
      label: 'Brak popularnych wzorców (123456, password, itp.)',
      met: !checkCommonPatterns(password),
      customCheck: (pwd) => !checkCommonPatterns(pwd)
    },
    {
      id: 'no_repetition',
      label: 'Maksymalnie 2 identyczne znaki pod rząd',
      met: !/(.)\1{2,}/.test(password),
      customCheck: (pwd) => !/(.)\1{2,}/.test(pwd)
    }
  ];

  // Sprawdź które wymagania nie są spełnione
  requirements.forEach(req => {
    if (!req.met) {
      errors.push(req.label);
    }
  });

  // Oblicz wynik bezpieczeństwa (0-100)
  const metRequirements = requirements.filter(req => req.met);
  const score = Math.round((metRequirements.length / requirements.length) * 100);

  // Hasło jest prawidłowe gdy wszystkie wymagania są spełnione
  const valid = errors.length === 0 && password.length >= 12;

  return {
    valid,
    score,
    errors,
    requirements
  };
};

// Pomocnicza funkcja do sprawdzania popularnych wzorców
function checkCommonPatterns(password: string): boolean {
  const commonPatterns = [
    /123456/,
    /password/i,
    /qwerty/i,
    /admin/i,
    /letmein/i,
    /welcome/i,
    /monkey/i,
    /dragon/i,
    /haslo/i,
    /test/i,
    /user/i,
    /login/i
  ];

  return commonPatterns.some(pattern => pattern.test(password));
}

// Hook dla React komponentów
export const usePasswordValidation = (password: string): PasswordValidationResult => {
  return validatePasswordStrength(password);
};

// Export dla kompatybilności z istniejącym kodem - używa nowej funkcji
export const validatePassword = (password: string): { valid: boolean; errors: string[] } => {
  const validation = validatePasswordStrength(password);
  return {
    valid: validation.valid,
    errors: validation.errors
  };
};