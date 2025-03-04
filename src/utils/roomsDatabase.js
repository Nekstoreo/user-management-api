import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const roomsPath = path.join(__dirname, '../data/rooms.json');

class RoomsDatabase {
  constructor() {
    this.rooms = [];
    this.loadData();
  }

  async loadData() {
    try {
      const data = await fs.readFile(roomsPath, 'utf8');
      this.rooms = JSON.parse(data);
    } catch (error) {
      if (error.code === 'ENOENT') {
        this.rooms = [];
        await this.saveData();
      }
    }
  }

  async saveData() {
    await fs.writeFile(roomsPath, JSON.stringify(this.rooms, null, 2));
  }

  async getAllRooms() {
    return this.rooms;
  }

  async getRoomById(id) {
    return this.rooms.find(room => room.id === id);
  }

  async addRoom(roomData) {
    const room = {
      id: `room-${uuidv4()}`,
      ...roomData,
      status: 'available'
    };
    this.rooms.push(room);
    await this.saveData();
    return room;
  }

  async updateRoom(id, roomData) {
    const index = this.rooms.findIndex(room => room.id === id);
    if (index === -1) return null;

    this.rooms[index] = { ...this.rooms[index], ...roomData };
    await this.saveData();
    return this.rooms[index];
  }

  async deleteRoom(id) {
    const index = this.rooms.findIndex(room => room.id === id);
    if (index === -1) return false;

    this.rooms.splice(index, 1);
    await this.saveData();
    return true;
  }

  async filterRooms(filters) {
    return this.rooms.filter(room => {
      let matches = true;
      if (filters.category) {
        matches = matches && room.category === filters.category;
      }
      if (filters.status) {
        matches = matches && room.status === filters.status;
      }
      if (filters.maxHourlyRate) {
        matches = matches && room.hourlyRate <= filters.maxHourlyRate;
      }
      if (filters.minHourlyRate) {
        matches = matches && room.hourlyRate >= filters.minHourlyRate;
      }
      if (filters.capacity) {
        matches = matches && room.capacity >= filters.capacity;
      }
      return matches;
    });
  }

  async checkAvailability(roomId, startTime, endTime) {
    // Aquí implementarías la lógica para verificar disponibilidad
    // Por ahora, simplemente verificamos que la sala exista y esté disponible
    const room = await this.getRoomById(roomId);
    return room && room.status === 'available';
  }
}

export default new RoomsDatabase();
