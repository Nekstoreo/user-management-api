import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const foodPath = path.join(__dirname, '../data/food.json');

class FoodDatabase {
  constructor() {
    this.data = {};
    this.loadData();
  }

  async loadData() {
    try {
      const fileData = await fs.readFile(foodPath, 'utf8');
      this.data = JSON.parse(fileData);
    } catch {
      this.data = {};
    }
  }

  async getAll() {
    return this.data;
  }
}

export default new FoodDatabase();
