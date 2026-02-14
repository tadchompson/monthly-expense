import mongoose from 'mongoose';
import dns from 'dns';

// Use Google DNS for SRV lookups (fixes Windows router DNS not supporting SRV records)
dns.setServers(['8.8.8.8', '8.8.4.4']);

export async function connectDB(): Promise<void> {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/monthly-expense';

  try {
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}
