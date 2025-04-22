import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import connectToDatabase from '../../../lib/mongodb';
import Booking from '../../../models/Booking';
import Motorcycle from '../../../models/Motorcycle';
import Notification from '../../../models/Notification';

export default async function handler(req, res) {
  const { method } = req;
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Booking ID is required' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    
    if (!session) {
      return res.status(401).json({ error: 'You must be logged in to view booking details' });
    }

    await connectToDatabase();

    const booking = await Booking.findById(id)
      .populate('motorcycle', 'name brand model price images')
      .populate('user', 'name email');

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Check if user is authorized to view this booking
    if (booking.user._id.toString() !== session.user.id && booking.motorcycle.owner.toString() !== session.user.id) {
      return res.status(403).json({ error: 'You are not authorized to view this booking' });
    }

    switch (method) {
      case 'GET':
        return res.status(200).json(booking);

      case 'PATCH':
        if (booking.user._id.toString() !== session.user.id) {
          return res.status(403).json({ error: 'You are not authorized to update this booking' });
        }

        const { status, cancellationReason } = req.body;

        if (status === 'cancelled' && !cancellationReason) {
          return res.status(400).json({ error: 'Cancellation reason is required' });
        }

        if (status) {
          booking.status = status;
          if (status === 'cancelled') {
            booking.cancellationReason = cancellationReason;
            booking.cancellationDate = new Date();
            booking.paymentStatus = 'refunded';
          }
        }

        await booking.save();
        return res.status(200).json(booking);

      case 'DELETE':
        if (booking.user._id.toString() !== session.user.id) {
          return res.status(403).json({ error: 'You are not authorized to delete this booking' });
        }

        if (booking.status === 'confirmed' || booking.paymentStatus === 'paid') {
          return res.status(400).json({ error: 'Cannot delete a confirmed or paid booking' });
        }

        await booking.remove();
        return res.status(200).json({ message: 'Booking deleted successfully' });

      default:
        res.setHeader('Allow', ['GET', 'PATCH', 'DELETE']);
        return res.status(405).json({ error: `Method ${method} not allowed` });
    }
  } catch (error) {
    console.error('Booking error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 