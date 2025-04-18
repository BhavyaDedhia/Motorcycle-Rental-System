import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

export async function connectTestDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to test database');
  } catch (error) {
    console.error('Error connecting to test database:', error);
    process.exit(1);
  }
}

export async function clearTestDB() {
  try {
    const collections = await mongoose.connection.db.collections();
    for (let collection of collections) {
      await collection.deleteMany({});
    }
    console.log('Cleared test database');
  } catch (error) {
    console.error('Error clearing test database:', error);
    process.exit(1);
  }
}

export async function closeTestDB() {
  try {
    await mongoose.connection.close();
    console.log('Closed test database connection');
  } catch (error) {
    console.error('Error closing test database connection:', error);
    process.exit(1);
  }
} 