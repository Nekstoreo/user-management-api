import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { v4 as uuidv4 } from "uuid";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const requestsPath = path.join(__dirname, "../data/requests.json");

class RequestsDatabase {
  constructor() {
    this.requests = [];
    this.loadData();
  }

  async loadData() {
    try {
      const data = await fs.readFile(requestsPath, "utf8");
      this.requests = JSON.parse(data);
    } catch (error) {
      if (error.code === "ENOENT") {
        this.requests = [];
        await this.saveData();
      }
    }
  }

  async saveData() {
    await fs.writeFile(requestsPath, JSON.stringify(this.requests, null, 2));
  }

  async getAllRequests() {
    return this.requests;
  }

  async getRequestById(id) {
    return this.requests.find((request) => request.id === id);
  }

  async addRequest(requestData) {
    const request = {
      id: `r-${String(this.requests.length + 1).padStart(3, "0")}`, // ID secuencial
      user_id: requestData.user_id,
      date: new Date().toISOString(),
      description: requestData.description,
    };
    this.requests.push(request);
    await this.saveData();
    return request;
  }

  async updateRequest(id, requestData) {
    const index = this.requests.findIndex((request) => request.id === id);
    if (index === -1) return null;

    this.requests[index] = { ...this.requests[index], ...requestData };
    await this.saveData();
    return this.requests[index];
  }

  async deleteRequest(id) {
    const index = this.requests.findIndex((request) => request.id === id);
    if (index === -1) return false;

    this.requests.splice(index, 1);
    await this.saveData();
    return true;
  }

  async filterRequests(filters) {
    return this.requests.filter((request) => {
      let matches = true;
      if (filters.user_id) {
        matches = matches && request.user_id === filters.user_id;
      }
      if (filters.startDate) {
        matches = matches && new Date(request.date) >= new Date(filters.startDate);
      }
      if (filters.endDate) {
        matches = matches && new Date(request.date) <= new Date(filters.endDate);
      }
      return matches;
    });
  }
}

export default new RequestsDatabase();
