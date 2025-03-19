import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import userRoutes from './routes/userRoutes.js';
import healthRoutes from './routes/healthRoutes.js';
import roomRoutes from './routes/roomRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';
import productRoutes from './routes/productRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import foodRoutes from './routes/foodRoutes.js';
import requestRoutes from './routes/requestRoutes.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Configuración de CORS
const corsOptions = {
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Authorization'],
  credentials: true,
  maxAge: 86400 // 24 horas
};

app.use(cors(corsOptions));
app.use(express.json());
app.use('/api/users', userRoutes);
app.use('/health', healthRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/products', productRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/food', foodRoutes);
app.use('/api/requests', requestRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
