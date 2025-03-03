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
```

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
  "password": "123456",
  "phone": "+34123456789"
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

### Perfil de Usuario

```bash
GET /api/users/profile
Authorization: Bearer <token>
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
