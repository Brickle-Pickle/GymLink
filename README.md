# GymLink - Aplicación de Fitness Social

Una aplicación web de fitness que permite a los usuarios trackear sus entrenamientos, crear rutinas personalizadas y competir con amigos en leaderboards. Inspirada en FitNotes pero con características sociales y públicas.

## 🏋️ Características Principales

### 📊 Seguimiento de Entrenamientos
- **Ejercicios por categorías**: Reps/Peso, Reps/Tiempo, Tiempo/Distancia
- **Ejercicios personalizados**: Crea y comparte ejercicios únicos con amigos
- **Progresión detallada**: Historial completo de todos los entrenamientos
- **Gráficos de progreso**: Visualización del rendimiento a lo largo del tiempo

### 🗓️ Sistema de Rutinas
- **Rutinas semanales personalizadas**: Combina ejercicios base y personalizados
- **Creador de rutinas intuitivo**: Herramienta fácil de usar para diseñar entrenamientos
- **Compartir rutinas**: Mediante links web o códigos QR
- **Biblioteca de ejercicios**: Ejercicios base + ejercicios creados por la comunidad

### 👥 Características Sociales
- **Sistema de amigos**: Conecta con otros usuarios
- **Leaderboards por ejercicios**: Competencia en ejercicios comunes (top 3 con gráficos por colores)
- **Leaderboard de actividad**: Incentiva el uso regular de la aplicación
- **Privacidad configurable**: Control total sobre qué información compartir

### 🔧 Herramientas Adicionales
- **Calculadora 1RM**: Calcula tu máximo de una repetición
- **Timers personalizables**: 3-4 sonidos diferentes con tiempo ajustable
- **Diseño responsive**: Optimizado para móvil y desktop

## 🛠️ Stack Tecnológico

### Frontend
- **React 18** con Vite
- **CSS3** para estilos responsive
- **React Icons** para iconografía
- **Chart.js** para gráficos de progreso

### Backend
- **Node.js** con Express.js
- **MongoDB** como base de datos
- **Mongoose** para modelado de datos
- **JWT** para autenticación
- **Bcrypt** para encriptación de contraseñas

### Autenticación
- **Login tradicional**: Email y contraseña
- **OAuth Google**: Integración con Google Sign-In
- **Sesiones seguras**: Tokens JWT con refresh tokens

## 📱 Funcionalidades Detalladas

### Sistema de Ejercicios

**Tipos de ejercicios disponibles:**
- **Solo Reps**: Flexiones, Dominadas, Fondos...
- **Solo Tiempo**: Plancha, Carrera, L sit...
- **Solo distancia**: Correr, Ciclismo, Andar...
- **Reps/Peso**: Press banca, Sentadillas, Peso muerto...
- **Reps/Tiempo**: Flexiones, Burpees, Abdominales...
- **Tiempo/Distancia**: Correr, Ciclismo, Natación...

### Leaderboards
- **Por ejercicio**: Ranking de amigos en ejercicios específicos
- **Por actividad**: Quién usa más la aplicación
- **Gráficos visuales**: Top 3 usuarios con colores distintivos
- **Filtros temporales**: Semanal, mensual, anual

### Privacidad y Configuración
- **Entrenamientos privados**: Ocultar progreso específico
- **Rutinas públicas**: Compartir solo rutinas sin datos de rendimiento
- **Indicadores generales**: Mostrar solo si estás por encima/debajo del promedio

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js (v18 o superior)
- MongoDB (local o Atlas)
- npm o yarn

### Configuración del Proyecto

**1. Clonar el repositorio**
```bash
git clone <repository-url>
cd GymLink
```

**2. Instalar dependencias del cliente**
```bash
cd client
npm install
```

**3. Instalar dependencias del servidor**
```bash
cd server
npm install
```

**4. Variables de entorno**
Crear archivo `server/.env`:
```env
MONGODB_URI=mongodb://localhost:27017/fittracker
JWT_SECRET=your_jwt_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
PORT=5000
```

**5. Ejecutar en desarrollo**
```bash
# Terminal 1 - Cliente
cd client
npm run dev

# Terminal 2 - Servidor
cd server
npm run dev
```

## 📊 Estructura de la Base de Datos

### Colección Users
```javascript
{
  _id: ObjectId,
  email: String,
  password: String, // hashed
  googleId: String, // optional
  username: String,
  createdAt: Date,
  settings: {
    privacy: {
      workoutsPrivate: Boolean,
      performancePrivate: Boolean
    },
    notifications: Boolean
  },
  friends: [ObjectId] // referencias a otros usuarios
}
```

### Colección Exercises
```javascript
{
  _id: ObjectId,
  name: String,
  type: String, // 'reps-weight', 'reps-time', 'time-distance'
  category: String,
  createdBy: ObjectId, // referencia al usuario
  isPublic: Boolean,
  description: String,
  instructions: [String]
}
```

### Colección Workouts
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  date: Date,
  exercises: [{
    exerciseId: ObjectId,
    sets: [{
      reps: Number,
      weight: Number,
      time: Number,
      distance: Number,
      restTime: Number
    }]
  }],
  duration: Number, // en minutos
  notes: String
}
```

### Colección Routines
```javascript
{
  _id: ObjectId,
  name: String,
  createdBy: ObjectId,
  exercises: [{
    exerciseId: ObjectId,
    targetSets: Number,
    targetReps: Number,
    targetWeight: Number,
    restTime: Number
  }],
  isPublic: Boolean,
  shareCode: String, // para compartir via QR
  tags: [String]
}
```

## 🎨 Diseño y UX

### Paleta de Colores
- **Primario**: #2563eb (Azul)
- **Secundario**: #10b981 (Verde)
- **Acento**: #f59e0b (Amarillo)
- **Fondo**: #f8fafc (Gris claro)
- **Texto**: #1e293b (Gris oscuro)

### Componentes Principales
- **Dashboard**: Resumen de entrenamientos y progreso
- **Workout Tracker**: Interfaz para registrar entrenamientos
- **Routine Builder**: Creador de rutinas drag-and-drop
- **Social Feed**: Leaderboards y actividad de amigos
- **Profile**: Configuración y estadísticas personales

## 📈 Roadmap de Desarrollo

### Fase 1 - MVP (4-6 semanas)
- Autenticación básica (email/password)
- CRUD de ejercicios básicos
- Registro de entrenamientos simples
- Dashboard básico

### Fase 2 - Características Sociales (3-4 semanas)
- Sistema de amigos
- Compartir rutinas
- Leaderboards básicos
- Configuración de privacidad

### Fase 3 - Características Avanzadas (3-4 semanas)
- Autenticación con Google
- Gráficos de progreso
- Calculadora 1RM
- Timers personalizables
- Códigos QR para rutinas

### Fase 4 - Optimización (2-3 semanas)
- Optimización de rendimiento
- PWA (Progressive Web App)
- Notificaciones push
- Tests automatizados

## 🔧 APIs y Endpoints Principales

### Autenticación
- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Inicio de sesión
- `POST /api/auth/google` - Login con Google
- `POST /api/auth/refresh` - Renovar token

### Ejercicios
- `GET /api/exercises` - Obtener ejercicios
- `POST /api/exercises` - Crear ejercicio
- `PUT /api/exercises/:id` - Actualizar ejercicio
- `DELETE /api/exercises/:id` - Eliminar ejercicio

### Entrenamientos
- `GET /api/workouts` - Obtener entrenamientos del usuario
- `POST /api/workouts` - Crear nuevo entrenamiento
- `PUT /api/workouts/:id` - Actualizar entrenamiento
- `DELETE /api/workouts/:id` - Eliminar entrenamiento

### Rutinas
- `GET /api/routines` - Obtener rutinas del usuario
- `POST /api/routines` - Crear nueva rutina
- `GET /api/routines/share/:code` - Obtener rutina por código QR
- `POST /api/routines/:id/share` - Generar código para compartir

### Social
- `POST /api/friends/add` - Agregar amigo
- `GET /api/friends` - Obtener lista de amigos
- `GET /api/leaderboard/:exerciseId` - Leaderboard por ejercicio
- `GET /api/leaderboard/activity` - Leaderboard de actividad

## 🧪 Testing

### Frontend Testing
```bash
cd client
npm run test
```

### Backend Testing
```bash
cd server
npm run test
```

### E2E Testing
```bash
npm run test:e2e
```

## 🚀 Deployment

### Variables de Producción
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
JWT_SECRET=production_secret
FRONTEND_URL=https://your-domain.com
```

### Build para Producción
```bash
cd client
npm run build

cd ../server
npm run build
```

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature: `git checkout -b feature/AmazingFeature`
3. Commit tus cambios: `git commit -m 'Add some AmazingFeature'`
4. Push a la rama: `git push origin feature/AmazingFeature`
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo LICENSE.md para detalles.

## 📞 Contacto

- **Desarrollador**: [BricklePickle]
- **Email**: [bricklepicklegs@gmail.com]
- **GitHub**: [https://github.com/Brickle-Pickle]

---

**GymLink** - Transforma tu fitness en una experiencia social y motivadora 💪
