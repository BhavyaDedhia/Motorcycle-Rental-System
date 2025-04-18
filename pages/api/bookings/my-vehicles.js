import connectToDatabase from '../../../lib/mongodb';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import Booking from '../../../models/Booking';
import Motorcycle from '../../../models/Motorcycle';

export default async function handler(req, res) {
  const { method } = req;
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ message: 'You must be logged in.' });
  }

  await connectToDatabase();

  switch (method) {
    case 'GET':
      try {
        // First, get all motorcycles owned by the user
        const userMotorcycles = await Motorcycle.find({ owner: session.user.id });
        const motorcycleIds = userMotorcycles.map(motorcycle => motorcycle._id);
        
        // Then, find all bookings for these motorcycles
        const bookings = await Booking.find({ motorcycle: { $in: motorcycleIds } })
          .populate('motorcycle')
          .populate('user', 'name email')
          .sort({ createdAt: -1 });
        
        res.status(200).json(bookings);
      } catch (error) {
        console.error('Error fetching bookings for user vehicles:', error);
        res.status(500).json({ message: 'Error fetching bookings' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
} 