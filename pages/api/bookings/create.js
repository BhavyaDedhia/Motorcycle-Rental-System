import connectDB from '../../../lib/db/mongodb';
import Booking from '../../../models/Booking';
import Motorcycle from '../../../models/Motorcycle';
import { protect } from '../../../lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Protect routes
  await protect(req, res, async () => {
    try {
      await connectDB();

      const { motorcycleId, startDate, endDate } = req.body;

      // Check if motorcycle exists and is available
      const motorcycle = await Motorcycle.findById(motorcycleId);
      if (!motorcycle) {
        return res.status(404).json({ message: 'Motorcycle not found' });
      }

      if (!motorcycle.available) {
        return res.status(400).json({ message: 'Motorcycle is not available for booking' });
      }

      // Check for overlapping bookings
      const overlappingBooking = await Booking.findOne({
        motorcycle: motorcycleId,
        status: { $ne: 'cancelled' },
        $or: [
          {
            startDate: { $lte: new Date(endDate) },
            endDate: { $gte: new Date(startDate) },
          },
        ],
      });

      if (overlappingBooking) {
        return res.status(400).json({ message: 'Motorcycle is already booked for these dates' });
      }

      // Calculate total price
      const start = new Date(startDate);
      const end = new Date(endDate);
      const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      const totalPrice = days * motorcycle.price;

      // Create booking
      const booking = await Booking.create({
        motorcycle: motorcycleId,
        user: req.user.id,
        startDate,
        endDate,
        totalPrice,
        status: 'pending',
        paymentStatus: 'pending',
      });

      res.status(201).json({
        status: 'success',
        data: booking,
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
} 