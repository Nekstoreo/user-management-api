import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const bookingsPath = path.join(__dirname, '../data/bookings.json');

class BookingsDatabase {
  constructor() {
    this.bookings = [];
    this.loadData();
    this.startStatusUpdateInterval();
  }

  async loadData() {
    try {
      const data = await fs.readFile(bookingsPath, 'utf8');
      this.bookings = JSON.parse(data);
    } catch (error) {
      if (error.code === 'ENOENT') {
        this.bookings = [];
        await this.saveData();
      }
    }
  }

  async saveData() {
    await fs.writeFile(bookingsPath, JSON.stringify(this.bookings, null, 2));
  }

  startStatusUpdateInterval() {
    setInterval(() => this.updateBookingStatuses(), 60000); // Cada minuto
  }

  async updateBookingStatuses() {
    const now = new Date();
    let updated = false;

    for (const booking of this.bookings) {
      const startTime = new Date(booking.startTime);
      const endTime = new Date(booking.endTime);

      if (booking.status === 'pending' && now >= startTime) {
        booking.status = 'active';
        updated = true;
      } else if (booking.status === 'active' && now >= endTime) {
        booking.status = 'completed';
        updated = true;
      }
    }

    if (updated) {
      await this.saveData();
    }
  }

  async checkAvailability(roomId, startTime, duration) {
    const endTime = new Date(new Date(startTime).getTime() + duration * 3600000);
    const conflictingBooking = this.bookings.find(booking => 
      booking.roomId === roomId &&
      booking.status !== 'cancelled' &&
      booking.status !== 'completed' &&
      new Date(booking.startTime) < endTime &&
      new Date(booking.endTime) > new Date(startTime)
    );

    return !conflictingBooking;
  }

  async createBooking(bookingData) {
    const { userId, roomId, startTime, duration, services = [], products = [] } = bookingData;
    
    // Verificar disponibilidad
    const isAvailable = await this.checkAvailability(roomId, startTime, duration);
    if (!isAvailable) return null;

    const booking = {
      id: `book-${uuidv4()}`,
      userId,
      roomId,
      status: 'pending',
      startTime: new Date(startTime).toISOString(),
      duration,
      endTime: new Date(new Date(startTime).getTime() + duration * 3600000).toISOString(),
      services,
      products,
      basePrice: bookingData.basePrice,
      servicesTotal: services.reduce((sum, s) => sum + s.price * s.quantity, 0),
      productsTotal: products.reduce((sum, p) => sum + p.price * p.quantity, 0),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    booking.totalPrice = booking.basePrice + booking.servicesTotal + booking.productsTotal;
    
    this.bookings.push(booking);
    await this.saveData();
    return booking;
  }

  async getBookingsByUser(userId) {
    return this.bookings.filter(booking => booking.userId === userId);
  }

  async getBookingsByStatus(status) {
    return this.bookings.filter(booking => booking.status === status);
  }

  async getBookingsByDate(date) {
    const targetDate = new Date(date).toDateString();
    return this.bookings.filter(booking => 
      new Date(booking.startTime).toDateString() === targetDate
    );
  }

  async cancelBooking(bookingId) {
    const booking = this.bookings.find(b => b.id === bookingId);
    if (!booking || booking.status !== 'pending') return null;

    booking.status = 'cancelled';
    booking.updatedAt = new Date().toISOString();
    await this.saveData();
    return booking;
  }

  async extendBooking(bookingId, additionalHours) {
    const booking = this.bookings.find(b => b.id === bookingId);
    if (!booking || booking.status !== 'active') return null;

    const newEndTime = new Date(new Date(booking.endTime).getTime() + additionalHours * 3600000);
    
    // Verificar disponibilidad para la extensión
    const isAvailable = await this.checkAvailability(
      booking.roomId,
      booking.endTime,
      additionalHours
    );
    if (!isAvailable) return null;

    booking.duration += additionalHours;
    booking.endTime = newEndTime.toISOString();
    booking.basePrice += (booking.basePrice / booking.duration) * additionalHours;
    booking.totalPrice = booking.basePrice + booking.servicesTotal + booking.productsTotal;
    booking.updatedAt = new Date().toISOString();

    await this.saveData();
    return booking;
  }

  async addItemsToBooking(bookingId, items) {
    const booking = this.bookings.find(b => b.id === bookingId);
    if (!booking || booking.status !== 'active') return null;

    if (items.services) {
      booking.services = [...booking.services, ...items.services];
      booking.servicesTotal = booking.services.reduce((sum, s) => sum + s.price * s.quantity, 0);
    }

    if (items.products) {
      booking.products = [...booking.products, ...items.products];
      booking.productsTotal = booking.products.reduce((sum, p) => sum + p.price * p.quantity, 0);
    }

    booking.totalPrice = booking.basePrice + booking.servicesTotal + booking.productsTotal;
    booking.updatedAt = new Date().toISOString();

    await this.saveData();
    return booking;
  }

  async getRoomOccupancyStats(roomId, startDate, endDate) {
    const bookings = this.bookings.filter(booking => 
      booking.roomId === roomId &&
      new Date(booking.startTime) >= new Date(startDate) &&
      new Date(booking.endTime) <= new Date(endDate) &&
      ['completed', 'active'].includes(booking.status)
    );

    const totalHours = bookings.reduce((sum, booking) => sum + booking.duration, 0);
    const totalRevenue = bookings.reduce((sum, booking) => sum + booking.totalPrice, 0);

    return {
      roomId,
      totalBookings: bookings.length,
      totalHours,
      totalRevenue,
      occupancyRate: totalHours / (24 * ((new Date(endDate) - new Date(startDate)) / 86400000))
    };
  }
}

export default new BookingsDatabase();
