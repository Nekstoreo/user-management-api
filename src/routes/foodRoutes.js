import { Router } from 'express';
import foodDatabase from '../utils/foodDatabase.js';

const router = Router();

router.get('/', async (req, res) => {
  const data = await foodDatabase.getAll();
  return res.json(data);
});

// ...podríamos agregar más rutas aquí...

export default router;
