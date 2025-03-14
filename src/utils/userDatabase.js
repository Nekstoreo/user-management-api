import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '../data/users.json');

class Database {
  constructor() {
    this.users = [];
    this.loadData();
  }

  async loadData() {
    try {
      const data = await fs.readFile(dbPath, 'utf8');
      this.users = JSON.parse(data);
    } catch (error) {
      if (error.code === 'ENOENT') {
        this.users = [];
        await this.saveData();
      }
    }
  }

  async saveData() {
    await fs.writeFile(dbPath, JSON.stringify(this.users, null, 2));
  }

  async addUser(user) {
    const id = uuidv4();
    const newUser = { ...user, id };
    this.users.push(newUser);
    await this.saveData();
    return id;
  }

  getUser(email) {
    return this.users.find(user => user.email === email);
  }

  getUserById(id) {
    return this.users.find(user => user.id === id);
  }

  getUserByToken(token) {
    return this.users.find(user => user.token === token);
  }
}

export default new Database();
