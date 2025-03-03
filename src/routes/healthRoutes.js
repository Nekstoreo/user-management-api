import express from 'express';
import { readFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

router.get('/', async (req, res) => {
  try {
    const packagePath = path.join(__dirname, '../../package.json');
    const packageJson = JSON.parse(await readFile(packagePath, 'utf8'));

    res.json({
      status: 'UP',
      timestamp: new Date().toISOString(),
      version: packageJson.version,
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024,
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      error: 'Error al obtener información del sistema'
    });
  }
});

export default router;
