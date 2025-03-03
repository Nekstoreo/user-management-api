export const VALIDATION_POLICIES = {
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 50,
    PATTERN: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/
  },
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 30,
    PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/
  },
  PHONE: {
    LENGTH: 10,
    PATTERN: /^\d{10}$/
  },
  EMAIL: {
    MAX_LENGTH: 50,
    PATTERN: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/
  }
};

export const ERROR_MESSAGES = {
  NAME: 'El nombre debe contener entre 2 y 50 caracteres y solo letras',
  PASSWORD: 'La contraseña debe tener entre 8 y 30 caracteres, incluir mayúsculas, minúsculas, números y caracteres especiales',
  PHONE: 'El teléfono debe tener exactamente 10 dígitos numéricos',
  EMAIL: 'El correo electrónico no es válido o excede los 50 caracteres'
};
