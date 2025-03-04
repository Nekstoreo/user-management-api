import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const productsPath = path.join(__dirname, '../data/products.json');

class ProductsDatabase {
  constructor() {
    this.products = [];
    this.loadData();
  }

  async loadData() {
    try {
      const data = await fs.readFile(productsPath, 'utf8');
      this.products = JSON.parse(data);
    } catch (error) {
      if (error.code === 'ENOENT') {
        this.products = [];
        await this.saveData();
      }
    }
  }

  async saveData() {
    await fs.writeFile(productsPath, JSON.stringify(this.products, null, 2));
  }

  async getAllProducts() {
    return this.products;
  }

  async getProductById(id) {
    return this.products.find(product => product.id === id);
  }

  async addProduct(productData) {
    const product = {
      id: `prod-${uuidv4()}`,
      stock: 0,
      ...productData
    };
    this.products.push(product);
    await this.saveData();
    return product;
  }

  async updateProduct(id, productData) {
    const index = this.products.findIndex(product => product.id === id);
    if (index === -1) return null;

    this.products[index] = { ...this.products[index], ...productData };
    await this.saveData();
    return this.products[index];
  }

  async deleteProduct(id) {
    const index = this.products.findIndex(product => product.id === id);
    if (index === -1) return false;

    this.products.splice(index, 1);
    await this.saveData();
    return true;
  }

  async updateStock(id, quantity) {
    const product = await this.getProductById(id);
    if (!product) return null;

    const newStock = product.stock + quantity;
    if (newStock < 0) return null;

    product.stock = newStock;
    await this.saveData();
    return product;
  }

  async filterProducts(filters) {
    return this.products.filter(product => {
      let matches = true;
      if (filters.category) {
        matches = matches && product.category === filters.category;
      }
      if (filters.maxPrice) {
        matches = matches && product.price <= filters.maxPrice;
      }
      if (filters.minPrice) {
        matches = matches && product.price >= filters.minPrice;
      }
      if (filters.inStock) {
        matches = matches && product.stock > 0;
      }
      return matches;
    });
  }
}

export default new ProductsDatabase();
