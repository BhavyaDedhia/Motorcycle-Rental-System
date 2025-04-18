import connectToDatabase from '../../../lib/mongodb';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import Booking from '../../../models/Booking';
import Motorcycle from '../../../models/Motorcycle';
import Notification from '../../../models/Notification';

export default async function handler(req, res) {
  const { method } = req;
  const { id } = req.query;
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ message: 'You must be logged in.' });
  }

  await connectToDatabase();

  // Get booking
  const booking = await Booking.findById(id).populate('motorcycle');
  if (!booking) {
    return res.status(404).json({ message: 'Booking not found' });
  }

  // Check if user is authorized (either the renter or the motorcycle owner)
  const motorcycle = await Motorcycle.findById(booking.motorcycle._id);
  if (booking.user.toString() !== session.user.id && motorcycle.owner.toString() !== session.user.id) {
    return res.status(403).json({ message: 'Not authorized' });
  }

  switch (method) {
    case 'GET':
      try {
        res.status(200).json(booking);
      } catch (error) {
        console.error('Error fetching booking:', error);
        res.status(500).json({ message: 'Error fetching booking' });
      }
      break;

    case 'PUT':
      try {
        const { status, paymentStatus } = req.body;

        // Only motorcycle owner can update booking status
        if (motorcycle.owner.toString() !== session.user.id) {
          return res.status(403).json({ message: 'Only the motorcycle owner can update booking status' });
        }

        // Update booking
        const updatedBooking = await Booking.findByIdAndUpdate(
          id,
          { status, paymentStatus },
          { new: true }
        ).populate('motorcycle');

        // Create notification for renter
        let notificationType, notificationTitle, notificationMessage;

        if (status === 'confirmed') {
          notificationType = 'booking_confirmed';
          notificationTitle = 'Booking Confirmed';
          notificationMessage = `Your booking for ${motorcycle.brand} ${motorcycle.model} has been confirmed`;
        } else if (status === 'cancelled') {
          notificationType = 'booking_cancelled';
          notificationTitle = 'Booking Cancelled';
          notificationMessage = `Your booking for ${motorcycle.brand} ${motorcycle.model} has been cancelled`;
        } else if (status === 'completed') {
          notificationType = 'booking_completed';
          notificationTitle = 'Booking Completed';
          notificationMessage = `Your booking for ${motorcycle.brand} ${motorcycle.model} has been marked as completed`;
        }

        if (notificationType) {
          await Notification.create({
            recipient: booking.user,
            type: notificationType,
            title: notificationTitle,
            message: notificationMessage,
            relatedBooking: booking._id,
            relatedMotorcycle: motorcycle._id
          });
        }

        // If payment status is updated to 'paid', create a notification for the owner
        if (paymentStatus === 'paid') {
          await Notification.create({
            recipient: motorcycle.owner,
            type: 'payment_received',
            title: 'Payment Received',
            message: `Payment has been received for the booking of your ${motorcycle.brand} ${motorcycle.model}`,
            relatedBooking: booking._id,
            relatedMotorcycle: motorcycle._id
          });
        }

        res.status(200).json(updatedBooking);
      } catch (error) {
        console.error('Error updating booking:', error);
        res.status(500).json({ message: 'Error updating booking' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'PUT']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
} 