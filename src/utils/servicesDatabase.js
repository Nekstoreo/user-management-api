import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const servicesPath = path.join(__dirname, '../data/services.json');

class ServicesDatabase {
  constructor() {
    this.services = [];
    this.loadData();
  }

  async loadData() {
    try {
      const data = await fs.readFile(servicesPath, 'utf8');
      this.services = JSON.parse(data);
    } catch (error) {
      if (error.code === 'ENOENT') {
        this.services = [];
        await this.saveData();
      }
    }
  }

  async saveData() {
    await fs.writeFile(servicesPath, JSON.stringify(this.services, null, 2));
  }

  async getAllServices() {
    return this.services;
  }

  async getServiceById(id) {
    return this.services.find(service => service.id === id);
  }

  async addService(serviceData) {
    const service = {
      id: `service-${uuidv4()}`,
      ...serviceData,
      available: true
    };
    this.services.push(service);
    await this.saveData();
    return service;
  }

  async updateService(id, serviceData) {
    const index = this.services.findIndex(service => service.id === id);
    if (index === -1) return null;

    this.services[index] = { ...this.services[index], ...serviceData };
    await this.saveData();
    return this.services[index];
  }

  async deleteService(id) {
    const index = this.services.findIndex(service => service.id === id);
    if (index === -1) return false;

    this.services.splice(index, 1);
    await this.saveData();
    return true;
  }

  async filterServices(category) {
    return this.services.filter(service => 
      !category || service.category === category
    );
  }
}

export default new ServicesDatabase();
