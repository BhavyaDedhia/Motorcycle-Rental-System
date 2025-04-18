import axios from 'axios';
import { connectTestDB, clearTestDB, closeTestDB } from './db-setup';

const API_URL = 'http://localhost:3000/api';

// Test data
const testUser = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'password123',
};

const testMotorcycle = {
  brand: 'Honda',
  model: 'CBR600RR',
  year: 2023,
  price: 150,
  description: 'A powerful sport bike',
  images: ['https://example.com/image.jpg'],
  category: 'sport',
  specifications: {
    engine: '600cc',
    power: '120hp',
    transmission: '6-speed',
    fuelCapacity: '18L',
    seatHeight: '820mm',
  },
};

let authToken;
let userId;
let motorcycleId;
let bookingId;

describe('API Tests', () => {
  beforeAll(async () => {
    await connectTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();
  });

  afterAll(async () => {
    await closeTestDB();
  });

  // Authentication Tests
  describe('Authentication', () => {
    test('Register new user', async () => {
      const response = await axios.post(`${API_URL}/auth/register`, testUser);
      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty('token');
      expect(response.data.user).toHaveProperty('id');
      authToken = response.data.token;
      userId = response.data.user.id;
    });

    test('Login user', async () => {
      // First register the user
      await axios.post(`${API_URL}/auth/register`, testUser);
      
      // Then try to login
      const response = await axios.post(`${API_URL}/auth/login`, {
        email: testUser.email,
        password: testUser.password,
      });
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('token');
    });
  });

  // Motorcycle Tests
  describe('Motorcycles', () => {
    beforeEach(async () => {
      // Register and login a user before each test
      const registerResponse = await axios.post(`${API_URL}/auth/register`, testUser);
      authToken = registerResponse.data.token;
      userId = registerResponse.data.user.id;
    });

    test('Create motorcycle (admin only)', async () => {
      const response = await axios.post(`${API_URL}/motorcycles/create`, testMotorcycle, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      expect(response.status).toBe(201);
      expect(response.data.data).toHaveProperty('_id');
      motorcycleId = response.data.data._id;
    });

    test('Get all motorcycles', async () => {
      // First create a motorcycle
      const createResponse = await axios.post(`${API_URL}/motorcycles/create`, testMotorcycle, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      motorcycleId = createResponse.data.data._id;

      // Then get all motorcycles
      const response = await axios.get(`${API_URL}/motorcycles`);
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('data');
      expect(response.data).toHaveProperty('pagination');
    });

    test('Get single motorcycle', async () => {
      // First create a motorcycle
      const createResponse = await axios.post(`${API_URL}/motorcycles/create`, testMotorcycle, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      motorcycleId = createResponse.data.data._id;

      // Then get the motorcycle
      const response = await axios.get(`${API_URL}/motorcycles/${motorcycleId}`);
      expect(response.status).toBe(200);
      expect(response.data.data._id).toBe(motorcycleId);
    });

    test('Update motorcycle (admin only)', async () => {
      // First create a motorcycle
      const createResponse = await axios.post(`${API_URL}/motorcycles/create`, testMotorcycle, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      motorcycleId = createResponse.data.data._id;

      // Then update the motorcycle
      const updateData = { price: 160 };
      const response = await axios.patch(
        `${API_URL}/motorcycles/${motorcycleId}`,
        updateData,
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );
      expect(response.status).toBe(200);
      expect(response.data.data.price).toBe(updateData.price);
    });
  });

  // Booking Tests
  describe('Bookings', () => {
    beforeEach(async () => {
      // Register and login a user before each test
      const registerResponse = await axios.post(`${API_URL}/auth/register`, testUser);
      authToken = registerResponse.data.token;
      userId = registerResponse.data.user.id;

      // Create a motorcycle for booking
      const createResponse = await axios.post(`${API_URL}/motorcycles/create`, testMotorcycle, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      motorcycleId = createResponse.data.data._id;
    });

    test('Create booking', async () => {
      const bookingData = {
        motorcycleId,
        startDate: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
        endDate: new Date(Date.now() + 172800000).toISOString(), // Day after tomorrow
      };

      const response = await axios.post(`${API_URL}/bookings/create`, bookingData, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      expect(response.status).toBe(201);
      expect(response.data.data).toHaveProperty('_id');
      bookingId = response.data.data._id;
    });

    test('Get all bookings', async () => {
      // First create a booking
      const bookingData = {
        motorcycleId,
        startDate: new Date(Date.now() + 86400000).toISOString(),
        endDate: new Date(Date.now() + 172800000).toISOString(),
      };
      const createResponse = await axios.post(`${API_URL}/bookings/create`, bookingData, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      bookingId = createResponse.data.data._id;

      // Then get all bookings
      const response = await axios.get(`${API_URL}/bookings`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('data');
      expect(response.data).toHaveProperty('pagination');
    });

    test('Get single booking', async () => {
      // First create a booking
      const bookingData = {
        motorcycleId,
        startDate: new Date(Date.now() + 86400000).toISOString(),
        endDate: new Date(Date.now() + 172800000).toISOString(),
      };
      const createResponse = await axios.post(`${API_URL}/bookings/create`, bookingData, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      bookingId = createResponse.data.data._id;

      // Then get the booking
      const response = await axios.get(`${API_URL}/bookings/${bookingId}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      expect(response.status).toBe(200);
      expect(response.data.data._id).toBe(bookingId);
    });

    test('Update booking status (admin only)', async () => {
      // First create a booking
      const bookingData = {
        motorcycleId,
        startDate: new Date(Date.now() + 86400000).toISOString(),
        endDate: new Date(Date.now() + 172800000).toISOString(),
      };
      const createResponse = await axios.post(`${API_URL}/bookings/create`, bookingData, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      bookingId = createResponse.data.data._id;

      // Then update the booking
      const updateData = { status: 'confirmed' };
      const response = await axios.patch(
        `${API_URL}/bookings/${bookingId}`,
        updateData,
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );
      expect(response.status).toBe(200);
      expect(response.data.data.status).toBe(updateData.status);
    });
  });
}); 