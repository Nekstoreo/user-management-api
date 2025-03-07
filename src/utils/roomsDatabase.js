import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const roomsPath = path.join(__dirname, '../data/rooms.json');

class RoomsDatabase {
  constructor() {
    this.categories = {};
    this.loadData();
  }

  async loadData() {
    try {
      const data = await fs.readFile(roomsPath, 'utf8');
      this.categories = JSON.parse(data);
    } catch (error) {
      if (error.code === 'ENOENT') {
        this.categories = {};
        await this.saveData();
      }
    }
  }

  async saveData() {
    await fs.writeFile(roomsPath, JSON.stringify(this.categories, null, 2));
  }

  async getAllRooms() {
    try {
      // Transformar la estructura de categorías a un array plano de habitaciones
      const allRooms = Object.values(this.categories).reduce((allRooms, category) => {
        return allRooms.concat(category.rooms.map(room => ({
          ...room,
          category: category.name
        })));
      }, []);
      
      return allRooms;
    } catch (error) {
      console.error("Error en getAllRooms:", error);
      return []; // Retornar array vacío en caso de error
    }
  }

  async getRoomById(id) {
    const roomId = String(id);
  
    for (const category of Object.values(this.categories)) {
      const room = category.rooms.find(room => String(room.id) === roomId);
      if (room) return { ...room, category: category.name };
    }
    return null;
  }
  

  async addRoom(roomData) {
    const { category, ...data } = roomData;
    if (!this.categories[category]) {
      throw new Error('Categoría inválida');
    }

    const room = {
      id: `room-${uuidv4()}`,
      ...data,
      status: 'available'
    };

    this.categories[category].rooms.push(room);
    await this.saveData();
    return { ...room, category };
  }

  async updateRoom(id, roomData) {
    for (const categoryKey of Object.keys(this.categories)) {
      const roomIndex = this.categories[categoryKey].rooms.findIndex(room => room.id === id);
      if (roomIndex !== -1) {
        const { category, ...data } = roomData;
        
        if (category && category !== categoryKey) {
          // Mover a nueva categoría
          const room = this.categories[categoryKey].rooms.splice(roomIndex, 1)[0];
          const updatedRoom = { ...room, ...data };
          this.categories[category].rooms.push(updatedRoom);
        } else {
          // Actualizar en la misma categoría
          this.categories[categoryKey].rooms[roomIndex] = {
            ...this.categories[categoryKey].rooms[roomIndex],
            ...data
          };
        }
        
        await this.saveData();
        return this.getRoomById(id);
      }
    }
    return null;
  }

  async deleteRoom(id) {
    for (const category of Object.values(this.categories)) {
      const index = category.rooms.findIndex(room => room.id === id);
      if (index !== -1) {
        category.rooms.splice(index, 1);
        await this.saveData();
        return true;
      }
    }
    return false;
  }

  async filterRooms(filters) {
    let rooms = [];
    
    // Si hay un filtro de categoría, solo buscar en esa categoría
    if (filters.category && this.categories[filters.category]) {
      rooms = this.categories[filters.category].rooms.map(room => ({
        ...room,
        category: this.categories[filters.category].name
      }));
    } else {
      // Si no hay filtro de categoría, obtener todas las salas
      rooms = Object.entries(this.categories).reduce((allRooms, [categoryKey, category]) => {
        const categoryRooms = category.rooms.map(room => ({
          ...room,
          category: category.name
        }));
        return allRooms.concat(categoryRooms);
      }, []);
    }

    // Aplicar filtros adicionales
    if (filters.status) {
      rooms = rooms.filter(room => room.status === filters.status);
    }
    if (filters.maxHourlyRate) {
      rooms = rooms.filter(room => room.hourlyRate <= filters.maxHourlyRate);
    }
    if (filters.minHourlyRate) {
      rooms = rooms.filter(room => room.hourlyRate >= filters.minHourlyRate);
    }
    if (filters.capacity) {
      rooms = rooms.filter(room => room.capacity >= filters.capacity);
    }

    return rooms;
  }

  async checkAvailability(roomId, startTime, endTime) {
    // Aquí implementarías la lógica para verificar disponibilidad
    // Por ahora, simplemente verificamos que la sala exista y esté disponible
    const room = await this.getRoomById(roomId);
    return room && room.status === 'available';
  }
}

export default new RoomsDatabase();
