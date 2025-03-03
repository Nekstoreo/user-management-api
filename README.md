# API de Gestión de Usuarios

API REST para gestión de usuarios con autenticación JWT y almacenamiento en archivo JSON.

## Características

- Registro de usuarios
- Autenticación mediante JWT
- Almacenamiento persistente en JSON
- Validación de datos
- Encriptación de contraseñas
- Perfil de usuario protegido

## Requisitos

- Node.js (v14 o superior)
- npm

## Instalación

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/user-management-api.git

# Instalar dependencias
cd user-management-api
npm install

# Configurar variables de entorno
cp .env.example .env
```

## Configuración

Editar el archivo `.env`:

```properties
PORT=3000
JWT_SECRET=tu_clave_secreta_jwt
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

### Configuración de CORS

El API tiene CORS habilitado con las siguientes características:
- Orígenes permitidos configurables via ALLOWED_ORIGINS
- Métodos HTTP permitidos: GET, POST, PUT, DELETE, OPTIONS
- Headers permitidos: Content-Type, Authorization
- Soporte para credenciales
- Cache de preflight: 24 horas

## Uso

```bash
# Modo desarrollo
npm run dev

# Modo producción
npm start
```

## Endpoints

### Registro de Usuario

```bash
POST /api/users/register
Content-Type: application/json

{
  "name": "Juan Pérez",
  "email": "juan@ejemplo.com",
  "password": "Abc123!@#",
  "phone": "1234567890"
}
```

#### Respuestas de Registro

```json
// Éxito (201 Created)
{
  "message": "Usuario registrado exitosamente",
  "code": "REGISTRATION_SUCCESS",
  "data": {
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Juan Pérez",
    "email": "juan@ejemplo.com"
  }
}

// Error - Campos Faltantes (400 Bad Request)
{
  "error": "Todos los campos son requeridos",
  "code": "MISSING_FIELDS"
}

// Error - Validación (400 Bad Request)
{
  "error": "Error de validación",
  "code": "VALIDATION_ERROR",
  "details": [
    {
      "msg": "La contraseña debe tener al menos 8 caracteres...",
      "param": "password",
      "location": "body"
    }
  ]
}

// Error - Email Duplicado (409 Conflict)
{
  "error": "El correo electrónico ya está registrado",
  "code": "EMAIL_EXISTS"
}

// Error del Servidor (500 Internal Server Error)
{
  "error": "Error en el servidor",
  "code": "SERVER_ERROR"
}
```

### Inicio de Sesión

```bash
POST /api/users/login
Content-Type: application/json

{
  "email": "juan@ejemplo.com",
  "password": "123456"
}
```

#### Respuestas de Login

```json
// Éxito (200 OK)
{
  "token": "eyJhbGciOiJIUzI1...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Juan Pérez",
    "email": "juan@ejemplo.com"
  }
}

// Error - Credenciales Faltantes (400 Bad Request)
{
  "error": "Email y contraseña son requeridos",
  "code": "MISSING_CREDENTIALS"
}

// Error - Usuario No Encontrado (401 Unauthorized)
{
  "error": "El usuario no está registrado",
  "code": "USER_NOT_FOUND"
}

// Error - Contraseña Incorrecta (401 Unauthorized)
{
  "error": "Contraseña incorrecta",
  "code": "INVALID_PASSWORD"
}

// Error del Servidor (500 Internal Server Error)
{
  "error": "Error en el servidor",
  "code": "SERVER_ERROR"
}
```

### Perfil de Usuario

```bash
GET /api/users/profile
Authorization: Bearer <token>
```

### Validación de Token

```bash
POST /api/users/validate-token
Content-Type: application/json

{
  "token": "eyJhbGciOiJIUzI1NiIs..."
}

# O usando el header:
POST /api/users/validate-token
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

Respuestas posibles:
```json
// Éxito
{
  "valid": true,
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "juan@ejemplo.com",
    "name": "Juan Pérez"
  }
}

// Error
{
  "valid": false,
  "error": "Token inválido o expirado"
}
```

### Health Check

```bash
GET /health

# Respuesta exitosa (200 OK)
{
  "status": "UP",
  "timestamp": "2024-02-20T15:30:45.123Z",
  "version": "1.0.0",
  "uptime": 3600,
  "memoryUsage": 45.32
}

# Error (500 Internal Server Error)
{
  "status": "ERROR",
  "timestamp": "2024-02-20T15:30:45.123Z",
  "error": "Error al obtener información del sistema"
}
```

## Estructura del Proyecto

```
user-management-api/
├── src/
│   ├── data/
│   │   └── users.json
│   ├── middleware/
│   │   └── auth.js
│   ├── routes/
│   │   └── userRoutes.js
│   ├── utils/
│   │   └── database.js
│   └── index.js
├── .env
└── package.json
```

## Seguridad

- Contraseñas hasheadas con bcrypt
- Autenticación mediante JWT
- Validación de datos de entrada
- Protección de rutas sensibles

## Políticas de Seguridad

### Validaciones de Campos
- **Nombre**
  - Longitud: 2-50 caracteres
  - Solo letras y espacios
  - Permite acentos y ñ

- **Contraseña**
  - Longitud: 8-30 caracteres
  - Debe incluir:
    - Al menos una mayúscula
    - Al menos una minúscula
    - Al menos un número
    - Al menos un carácter especial (@$!%*?&)

- **Teléfono**
  - Exactamente 10 dígitos numéricos
  - Sin espacios, guiones o caracteres especiales

- **Correo Electrónico**
  - Máximo 50 caracteres
  - Formato válido de email
  - Solo caracteres alfanuméricos, puntos, guiones y guiones bajos

## Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

MIT License - ver [LICENSE](LICENSE) para más detalles
