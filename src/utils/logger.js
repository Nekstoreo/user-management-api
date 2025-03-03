import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const logsPath = path.join(__dirname, '../logs');
const logFile = path.join(logsPath, 'api.log');

export const logger = {
  async log(type, message, data = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      type,
      message,
      ...data
    };

    try {
      await fs.mkdir(logsPath, { recursive: true });
      await fs.appendFile(
        logFile,
        JSON.stringify(logEntry) + '\n'
      );

      // También log en consola en desarrollo
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[${timestamp}] ${type}: ${message}`);
      }
    } catch (error) {
      console.error('Error writing to log file:', error);
    }
  }
};
