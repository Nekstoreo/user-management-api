import express from 'express';
import { body, validationResult } from 'express-validator';
import servicesDatabase from '../utils/servicesDatabase.js';
import { auth } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Obtener todos los servicios (devuelve el objeto con las tres categorías)
router.get('/', async (req, res) => {
  try {
    const services = await servicesDatabase.getAllServices();
    res.json(services);
  } catch (error) {
    await logger.log('ERROR', 'Error getting services', { error: error.message });
    res.status(500).json({ 
      error: 'Error al obtener servicios',
      code: 'SERVER_ERROR'
    });
  }
});

// Endpoint que devuelve solo la categoría Gaming
router.get('/gaming', async (req, res) => {
  try {
    const allServices = await servicesDatabase.getAllServices();
    res.json(allServices.gaming || []);
  } catch (error) {
    await logger.log('ERROR', 'Error getting gaming services', { error: error.message });
    res.status(500).json({
      error: 'Error al obtener servicios gaming',
      code: 'SERVER_ERROR'
    });
  }
});

// Endpoint que devuelve solo la categoría Working
router.get('/working', async (req, res) => {
  try {
    const allServices = await servicesDatabase.getAllServices();
    res.json(allServices.working || []);
  } catch (error) {
    await logger.log('ERROR', 'Error getting working services', { error: error.message });
    res.status(500).json({
      error: 'Error al obtener servicios working',
      code: 'SERVER_ERROR'
    });
  }
});

// Endpoint que devuelve solo la categoría Thinking
router.get('/thinking', async (req, res) => {
  try {
    const allServices = await servicesDatabase.getAllServices();
    res.json(allServices.thinking || []);
  } catch (error) {
    await logger.log('ERROR', 'Error getting thinking services', { error: error.message });
    res.status(500).json({
      error: 'Error al obtener servicios thinking',
      code: 'SERVER_ERROR'
    });
  }
});

// (Opcional) Endpoint que devuelve las tres categorías agrupadas
router.get('/categories', async (req, res) => {
  try {
    const services = await servicesDatabase.getAllServices();
    res.json(services);
  } catch (error) {
    await logger.log('ERROR', 'Error getting categories', { error: error.message });
    res.status(500).json({
      error: 'Error al obtener las categorías',
      code: 'SERVER_ERROR'
    });
  }
});

// Mover el endpoint de obtener un servicio específico para evitar conflictos con los nuevos endpoints
router.get('/:id', async (req, res) => {
  try {
    // Iterar por cada categoría para buscar el servicio
    const allServices = await servicesDatabase.getAllServices();
    let found = null;
    for (const key in allServices) {
      found = allServices[key].find(service => service.id === req.params.id);
      if (found) break;
    }
    if (!found) {
      return res.status(404).json({ 
        error: 'Servicio no encontrado',
        code: 'SERVICE_NOT_FOUND'
      });
    }
    res.json(found);
  } catch (error) {
    await logger.log('ERROR', 'Error getting service', { error: error.message });
    res.status(500).json({ 
      error: 'Error al obtener el servicio',
      code: 'SERVER_ERROR'
    });
  }
});

// Crear un nuevo servicio
router.post('/', auth, [
  body('name').notEmpty().withMessage('El nombre es requerido'),
  body('description').notEmpty().withMessage('La descripción es requerida'),
  body('price').isFloat({ min: 0 }).withMessage('El precio debe ser un número positivo'),
  body('stock').isInt({ min: 0 }).withMessage('El stock debe ser un número positivo')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        errors: errors.array(),
        code: 'VALIDATION_ERROR'
      });
    }

    const service = await servicesDatabase.addService(req.body);
    await logger.log('INFO', 'Service created', { serviceId: service.id });
    res.status(201).json(service);
  } catch (error) {
    await logger.log('ERROR', 'Error creating service', { error: error.message });
    res.status(500).json({ 
      error: 'Error al crear el servicio',
      code: 'SERVER_ERROR'
    });
  }
});

// Actualizar un servicio
router.put('/:id', auth, async (req, res) => {
  try {
    const service = await servicesDatabase.updateService(req.params.id, req.body);
    if (!service) {
      return res.status(404).json({ 
        error: 'Servicio no encontrado',
        code: 'SERVICE_NOT_FOUND'
      });
    }
    await logger.log('INFO', 'Service updated', { serviceId: service.id });
    res.json(service);
  } catch (error) {
    await logger.log('ERROR', 'Error updating service', { error: error.message });
    res.status(500).json({ 
      error: 'Error al actualizar el servicio',
      code: 'SERVER_ERROR'
    });
  }
});

// Eliminar un servicio
router.delete('/:id', auth, async (req, res) => {
  try {
    const deleted = await servicesDatabase.deleteService(req.params.id);
    if (!deleted) {
      return res.status(404).json({ 
        error: 'Servicio no encontrado',
        code: 'SERVICE_NOT_FOUND'
      });
    }
    await logger.log('INFO', 'Service deleted', { serviceId: req.params.id });
    res.status(204).send();
  } catch (error) {
    await logger.log('ERROR', 'Error deleting service', { error: error.message });
    res.status(500).json({ 
      error: 'Error al eliminar el servicio',
      code: 'SERVER_ERROR'
    });
  }
});

export default router;
