import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import dbConnect from '../../../lib/dbConnect';
import Booking from '../../../models/Booking';
import Motorcycle from '../../../models/Motorcycle';
import { sendBookingCancellationNotification } from '../../../lib/notifications';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  try {
    await dbConnect();
    const { id } = req.query;

    // Find the booking
    const booking = await Booking.findById(id).populate('motorcycle');
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user is authorized to cancel this booking
    if (booking.user.toString() !== session.user.id && session.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to cancel this booking' });
    }

    // Check if booking can be cancelled
    if (booking.status === 'cancelled') {
      return res.status(400).json({ message: 'Booking is already cancelled' });
    }

    if (booking.status === 'completed') {
      return res.status(400).json({ message: 'Cannot cancel a completed booking' });
    }

    // Update booking status
    booking.status = 'cancelled';
    await booking.save();

    // Update motorcycle availability
    await Motorcycle.findByIdAndUpdate(booking.motorcycle._id, { available: true });

    // Send notifications
    await sendBookingCancellationNotification(booking);

    return res.status(200).json({ 
      success: true,
      message: 'Booking cancelled successfully',
      data: booking 
    });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Error cancelling booking',
      error: error.message 
    });
  }
} 