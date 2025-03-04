import express from 'express';
import { body, query, validationResult } from 'express-validator';
import roomsDatabase from '../utils/roomsDatabase.js';
import { auth } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Obtener todas las salas con filtros opcionales
router.get('/', async (req, res) => {
  try {
    const filters = {
      category: req.query.category,
      status: req.query.status,
      maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice) : undefined,
      minPrice: req.query.minPrice ? parseFloat(req.query.minPrice) : undefined,
      capacity: req.query.capacity ? parseInt(req.query.capacity) : undefined
    };

    const rooms = await roomsDatabase.filterRooms(filters);
    res.json(rooms);
  } catch (error) {
    await logger.log('ERROR', 'Error getting rooms', { error: error.message });
    res.status(500).json({ error: 'Error al obtener las salas' });
  }
});

// Obtener una sala específica
router.get('/:id', async (req, res) => {
  try {
    const room = await roomsDatabase.getRoomById(req.params.id);
    if (!room) {
      return res.status(404).json({ error: 'Sala no encontrada' });
    }
    res.json(room);
  } catch (error) {
    await logger.log('ERROR', 'Error getting room', { error: error.message });
    res.status(500).json({ error: 'Error al obtener la sala' });
  }
});

// Crear una nueva sala (requiere autenticación)
router.post('/', auth, [
  body('number').notEmpty(),
  body('category').isIn(['gaming', 'thinking', 'working']),
  body('capacity').isInt({ min: 1 }),
  body('hourlyRate').isFloat({ min: 0 })
    .withMessage('La tarifa por hora debe ser un número positivo'),
  body('minHours').isInt({ min: 1 })
    .withMessage('El mínimo de horas debe ser al menos 1'),
  body('maxHours').isInt({ min: 1 })
    .custom((value, { req }) => {
      if (value < req.body.minHours) {
        throw new Error('El máximo de horas debe ser mayor que el mínimo');
      }
      return true;
    }),
  body('equipment').isArray(),
  body('images').isArray()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const room = await roomsDatabase.addRoom(req.body);
    res.status(201).json(room);
  } catch (error) {
    await logger.log('ERROR', 'Error creating room', { error: error.message });
    res.status(500).json({ error: 'Error al crear la sala' });
  }
});

// Actualizar una sala (requiere autenticación)
router.put('/:id', auth, async (req, res) => {
  try {
    const room = await roomsDatabase.updateRoom(req.params.id, req.body);
    if (!room) {
      return res.status(404).json({ error: 'Sala no encontrada' });
    }
    res.json(room);
  } catch (error) {
    await logger.log('ERROR', 'Error updating room', { error: error.message });
    res.status(500).json({ error: 'Error al actualizar la sala' });
  }
});

// Eliminar una sala (requiere autenticación)
router.delete('/:id', auth, async (req, res) => {
  try {
    const deleted = await roomsDatabase.deleteRoom(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Sala no encontrada' });
    }
    res.status(204).send();
  } catch (error) {
    await logger.log('ERROR', 'Error deleting room', { error: error.message });
    res.status(500).json({ error: 'Error al eliminar la sala' });
  }
});

// Verificar disponibilidad
router.get('/:id/availability', async (req, res) => {
  try {
    const { startTime, endTime } = req.query;
    if (!startTime || !endTime) {
      return res.status(400).json({ 
        error: 'Se requieren hora de inicio y fin',
        code: 'MISSING_TIMES'
      });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);
    const hours = (end - start) / (1000 * 60 * 60);

    const room = await roomsDatabase.getRoomById(req.params.id);
    
    if (!room) {
      return res.status(404).json({ 
        error: 'Sala no encontrada',
        code: 'ROOM_NOT_FOUND'
      });
    }

    if (hours < room.minHours || hours > room.maxHours) {
      return res.status(400).json({
        error: `La reserva debe ser entre ${room.minHours} y ${room.maxHours} horas`,
        code: 'INVALID_DURATION'
      });
    }

    const available = await roomsDatabase.checkAvailability(req.params.id, start, end);
    const totalPrice = room.hourlyRate * hours;

    res.json({
      available,
      room: {
        id: room.id,
        number: room.number,
        category: room.category
      },
      booking: {
        startTime: start,
        endTime: end,
        hours,
        hourlyRate: room.hourlyRate,
        totalPrice: parseFloat(totalPrice.toFixed(2))
      }
    });
  } catch (error) {
    await logger.log('ERROR', 'Error checking availability', { error: error.message });
    res.status(500).json({ 
      error: 'Error al verificar disponibilidad',
      code: 'SERVER_ERROR'
    });
  }
});

export default router;
