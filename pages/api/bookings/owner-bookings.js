import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import connectToDatabase from '../../../lib/mongodb';
import Booking from '../../../models/Booking';
import Motorcycle from '../../../models/Motorcycle';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    
    if (!session) {
      return res.status(401).json({ error: 'You must be logged in to view your bookings' });
    }

    await connectToDatabase();

    const { status, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    // Get all motorcycles owned by the user
    const motorcycles = await Motorcycle.find({ owner: session.user.id });
    const motorcycleIds = motorcycles.map(m => m._id);

    // Build query
    const query = { motorcycle: { $in: motorcycleIds } };
    if (status) {
      query.status = status;
    }

    // Get total count for pagination
    const total = await Booking.countDocuments(query);

    // Get bookings with pagination and sorting
    const bookings = await Booking.find(query)
      .populate('motorcycle', 'name brand model price images')
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    return res.status(200).json({
      success: true,
      data: bookings,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching owner bookings:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 