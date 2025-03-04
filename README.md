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

### Salas (Rooms)

```bash
# Obtener todas las salas
GET /api/rooms
# Filtros opcionales: ?category=gaming&maxPrice=30&capacity=4&status=available

# Obtener una sala específica
GET /api/rooms/:id

# Crear sala (requiere autenticación)
POST /api/rooms
Content-Type: application/json
{
  "number": "101",
  "category": "gaming",
  "capacity": 4,
  "hourlyRate": 25.00,
  "minHours": 1,
  "maxHours": 8,
  "equipment": [
    {
      "type": "console",
      "name": "PS5",
      "quantity": 1
    }
  ],
  "images": ["room-101-main.jpg"]
}

# Actualizar sala (requiere autenticación)
PUT /api/rooms/:id

# Eliminar sala (requiere autenticación)
DELETE /api/rooms/:id

# Verificar disponibilidad
GET /api/rooms/:id/availability?startTime=2024-02-20T14:00:00Z&endTime=2024-02-20T16:00:00Z
```

### Servicios Adicionales

```bash
# Obtener todos los servicios
GET /api/services
# Filtros opcionales: ?category=equipment

# Obtener un servicio específico
GET /api/services/:id

# Crear servicio (requiere autenticación)
POST /api/services
Content-Type: application/json
{
  "name": "Auriculares Gaming Pro",
  "description": "Auriculares gaming con cancelación de ruido",
  "price": 5.00,
  "category": "equipment",
  "stock": 10,
  "specifications": {
    "brand": "HyperX",
    "features": ["7.1 Surround"]
  }
}

# Actualizar servicio (requiere autenticación)
PUT /api/services/:id

# Eliminar servicio (requiere autenticación)
DELETE /api/services/:id
```

### Productos (Snacks y Bebidas)

```bash
# Obtener todos los productos
GET /api/products
# Filtros opcionales: ?category=beverage&maxPrice=5&inStock=true

# Obtener un producto específico
GET /api/products/:id

# Crear producto (requiere autenticación)
POST /api/products
Content-Type: application/json
{
  "name": "Red Bull",
  "description": "Bebida energética 250ml",
  "price": 3.50,
  "category": "beverage",
  "image": "redbull-250ml.jpg",
  "stock": 50
}

# Actualizar producto (requiere autenticación)
PUT /api/products/:id

# Actualizar stock (requiere autenticación)
PATCH /api/products/:id/stock
{
  "quantity": 10  # Puede ser negativo para reducir stock
}

# Eliminar producto (requiere autenticación)
DELETE /api/products/:id
```

### Reservas (Bookings)

```bash
# Crear reserva
POST /api/bookings
Content-Type: application/json
{
  "roomId": "room-001",
  "startTime": "2024-02-20T14:00:00Z",
  "duration": 2,
  "services": [
    {
      "serviceId": "service-001",
      "quantity": 1
    }
  ],
  "products": [
    {
      "productId": "prod-001",
      "quantity": 2
    }
  ]
}

# Obtener mis reservas
GET /api/bookings/my-bookings

# Cancelar reserva
POST /api/bookings/:id/cancel

# Extender tiempo de reserva
POST /api/bookings/:id/extend
{
  "additionalHours": 2
}

# Añadir items a reserva activa
POST /api/bookings/:id/items
{
  "services": [
    {
      "serviceId": "service-002",
      "quantity": 1
    }
  ],
  "products": [
    {
      "productId": "prod-002",
      "quantity": 1
    }
  ]
}

# Obtener estadísticas de ocupación
GET /api/bookings/stats/occupancy?roomId=room-001&startDate=2024-02-01&endDate=2024-02-28
```

#### Respuestas de Reservas

```json
// Éxito al crear reserva (201 Created)
{
  "id": "book-001",
  "status": "pending",
  "startTime": "2024-02-20T14:00:00Z",
  "duration": 2,
  "endTime": "2024-02-20T16:00:00Z",
  "basePrice": 50.00,
  "servicesTotal": 5.00,
  "productsTotal": 7.00,
  "totalPrice": 62.00
}

// Error - Sala no disponible (409 Conflict)
{
  "error": "La sala no está disponible para el horario seleccionado",
  "code": "ROOM_NOT_AVAILABLE"
}

// Estadísticas de ocupación (200 OK)
{
  "roomId": "room-001",
  "totalBookings": 24,
  "totalHours": 96,
  "totalRevenue": 2400.00,
  "occupancyRate": 0.75
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
