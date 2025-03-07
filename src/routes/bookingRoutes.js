import express from 'express';
import { body, query, validationResult } from 'express-validator';
import bookingsDatabase from '../utils/bookingsDatabase.js';
import roomsDatabase from '../utils/roomsDatabase.js';
import { auth } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Crear una reserva
router.post('/', [
  body('roomId').notEmpty().withMessage('Se requiere el ID de la sala'),
  body('startTime').isISO8601().withMessage('Fecha de inicio inválida'),
  body('hours').isInt({ min: 1 }).withMessage('Horas inválidas')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      await logger.log('WARN', 'Booking validations not met', { errors: errors.array() });
      return res.status(400).json({ 
        errors: errors.array(),
        code: 'VALIDATION_ERROR'
      });
    }

    const room = await roomsDatabase.getRoomById(req.body.roomId);
    if (!room) {
      await logger.log('WARN', 'Room not found while creating booking', { roomId: req.body.roomId });
      return res.status(404).json({
        error: 'Sala no encontrada',
        code: 'ROOM_NOT_FOUND'
      });
    }

    const booking = await bookingsDatabase.createBooking({
      ...req.body,
      userId: req.user?.id,
      basePrice: room.hourlyRate * req.body.hours
    });

    if (!booking) {
      await logger.log('WARN', 'Room not available for booking', { roomId: req.body.roomId });
      return res.status(409).json({
        error: 'La sala no está disponible para el horario seleccionado',
        code: 'ROOM_NOT_AVAILABLE'
      });
    }

    await logger.log('INFO', 'Booking created', { bookingId: booking.id });
    res.status(201).json(booking);
  } catch (error) {
    await logger.log('ERROR', 'Error creating booking', { error: error.message });
    res.status(500).json({
      error: 'Error al crear la reserva',
      code: 'SERVER_ERROR'
    });
  }
});

// Obtener reservas del usuario
router.get('/my-bookings', auth, async (req, res) => {
  try {
    const bookings = await bookingsDatabase.getBookingsByUser(req.user.id);
    res.json(bookings);
  } catch (error) {
    await logger.log('ERROR', 'Error getting user bookings', { error: error.message });
    res.status(500).json({
      error: 'Error al obtener las reservas',
      code: 'SERVER_ERROR'
    });
  }
});

// Cancelar reserva
router.post('/:id/cancel', auth, async (req, res) => {
  try {
    const booking = await bookingsDatabase.cancelBooking(req.params.id);
    if (!booking) {
      await logger.log('WARN', 'Booking not found or not cancellable', { bookingId: req.params.id });
      return res.status(400).json({
        error: 'No se puede cancelar la reserva',
        code: 'INVALID_CANCELLATION'
      });
    }

    await logger.log('INFO', 'Booking cancelled', { bookingId: booking.id });
    res.json(booking);
  } catch (error) {
    await logger.log('ERROR', 'Error cancelling booking', { error: error.message });
    res.status(500).json({
      error: 'Error al cancelar la reserva',
      code: 'SERVER_ERROR'
    });
  }
});

// Extender tiempo de reserva
router.post('/:id/extend', auth, [
  body('additionalHours').isInt({ min: 1 }).withMessage('Horas adicionales inválidas')
], async (req, res) => {
  try {
    const booking = await bookingsDatabase.extendBooking(
      req.params.id,
      req.body.additionalHours
    );

    if (!booking) {
      await logger.log('WARN', 'Booking not found or cannot be extended', { bookingId: req.params.id });
      return res.status(400).json({
        error: 'No se puede extender la reserva',
        code: 'INVALID_EXTENSION'
      });
    }

    await logger.log('INFO', 'Booking extended', { 
      bookingId: booking.id,
      additionalHours: req.body.additionalHours
    });
    res.json(booking);
  } catch (error) {
    await logger.log('ERROR', 'Error extending booking', { error: error.message });
    res.status(500).json({
      error: 'Error al extender la reserva',
      code: 'SERVER_ERROR'
    });
  }
});

// Añadir items a la reserva
router.post('/:id/items', auth, async (req, res) => {
  try {
    const booking = await bookingsDatabase.addItemsToBooking(
      req.params.id,
      req.body
    );

    if (!booking) {
      await logger.log('WARN', 'Booking not found or cannot add items', { bookingId: req.params.id });
      return res.status(400).json({
        error: 'No se pueden añadir items a la reserva',
        code: 'INVALID_ITEMS_ADDITION'
      });
    }

    await logger.log('INFO', 'Items added to booking', { bookingId: booking.id });
    res.json(booking);
  } catch (error) {
    await logger.log('ERROR', 'Error adding items to booking', { error: error.message });
    res.status(500).json({
      error: 'Error al añadir items a la reserva',
      code: 'SERVER_ERROR'
    });
  }
});

// Obtener estadísticas de ocupación
router.get('/stats/occupancy', auth, async (req, res) => {
  try {
    const { roomId, startDate, endDate } = req.query;
    
    if (!roomId || !startDate || !endDate) {
      await logger.log('WARN', 'Missing occupancy stats params', { roomId, startDate, endDate });
      return res.status(400).json({
        error: 'Se requieren roomId, startDate y endDate',
        code: 'MISSING_PARAMS'
      });
    }

    const stats = await bookingsDatabase.getRoomOccupancyStats(
      roomId,
      startDate,
      endDate
    );

    res.json(stats);
  } catch (error) {
    await logger.log('ERROR', 'Error getting occupancy stats', { error: error.message });
    res.status(500).json({
      error: 'Error al obtener estadísticas',
      code: 'SERVER_ERROR'
    });
  }
});

export default router;
