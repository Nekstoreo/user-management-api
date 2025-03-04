import express from 'express';
import { body, query, validationResult } from 'express-validator';
import productsDatabase from '../utils/productsDatabase.js';
import { auth } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Obtener todos los productos con filtros opcionales
router.get('/', async (req, res) => {
  try {
    const filters = {
      category: req.query.category,
      maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice) : undefined,
      minPrice: req.query.minPrice ? parseFloat(req.query.minPrice) : undefined,
      inStock: req.query.inStock === 'true'
    };

    const products = await productsDatabase.filterProducts(filters);
    res.json(products);
  } catch (error) {
    await logger.log('ERROR', 'Error getting products', { error: error.message });
    res.status(500).json({ 
      error: 'Error al obtener productos',
      code: 'SERVER_ERROR'
    });
  }
});

// Obtener un producto específico
router.get('/:id', async (req, res) => {
  try {
    const product = await productsDatabase.getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ 
        error: 'Producto no encontrado',
        code: 'PRODUCT_NOT_FOUND'
      });
    }
    res.json(product);
  } catch (error) {
    await logger.log('ERROR', 'Error getting product', { error: error.message });
    res.status(500).json({ 
      error: 'Error al obtener el producto',
      code: 'SERVER_ERROR'
    });
  }
});

// Crear un nuevo producto (requiere autenticación)
router.post('/', auth, [
  body('name').notEmpty().withMessage('El nombre es requerido'),
  body('description').notEmpty().withMessage('La descripción es requerida'),
  body('price').isFloat({ min: 0 }).withMessage('El precio debe ser un número positivo'),
  body('category').isIn(['snack', 'beverage']).withMessage('Categoría inválida'),
  body('image').optional().isURL().withMessage('La imagen debe ser una URL válida')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        errors: errors.array(),
        code: 'VALIDATION_ERROR'
      });
    }

    const product = await productsDatabase.addProduct(req.body);
    await logger.log('INFO', 'Product created', { productId: product.id });
    res.status(201).json(product);
  } catch (error) {
    await logger.log('ERROR', 'Error creating product', { error: error.message });
    res.status(500).json({ 
      error: 'Error al crear el producto',
      code: 'SERVER_ERROR'
    });
  }
});

// Actualizar stock
router.patch('/:id/stock', auth, [
  body('quantity').isInt().withMessage('La cantidad debe ser un número entero')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        errors: errors.array(),
        code: 'VALIDATION_ERROR'
      });
    }

    const { quantity } = req.body;
    const product = await productsDatabase.updateStock(req.params.id, parseInt(quantity));

    if (!product) {
      return res.status(400).json({ 
        error: 'No se puede actualizar el stock',
        code: 'INVALID_STOCK_UPDATE'
      });
    }

    await logger.log('INFO', 'Stock updated', { 
      productId: req.params.id, 
      quantity, 
      newStock: product.stock 
    });

    res.json(product);
  } catch (error) {
    await logger.log('ERROR', 'Error updating stock', { error: error.message });
    res.status(500).json({ 
      error: 'Error al actualizar el stock',
      code: 'SERVER_ERROR'
    });
  }
});

// ...existing CRUD operations (PUT, DELETE)...

export default router;
