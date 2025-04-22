import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import connectToDatabase from '../../../lib/mongodb';
import Booking from '../../../models/Booking';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    
    if (!session) {
      return res.status(401).json({ error: 'You must be logged in to make a payment' });
    }

    await connectToDatabase();

    const { bookingId, paymentDetails } = req.body;

    if (!bookingId || !paymentDetails) {
      return res.status(400).json({ error: 'Booking ID and payment details are required' });
    }

    // Find the booking
    const booking = await Booking.findById(bookingId);
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (booking.user.toString() !== session.user.id) {
      return res.status(403).json({ error: 'You are not authorized to make this payment' });
    }

    if (booking.paymentStatus === 'paid') {
      return res.status(400).json({ error: 'Payment already completed' });
    }

    // Validate dummy payment details
    const { cardNumber, cardExpiry, cardCVV } = paymentDetails;
    
    if (!cardNumber || !cardExpiry || !cardCVV) {
      return res.status(400).json({ error: 'Invalid payment details' });
    }

    // Simulate payment processing
    const isPaymentSuccessful = true; // In a real implementation, this would be replaced with actual payment gateway integration

    if (isPaymentSuccessful) {
      // Update booking with payment details
      booking.paymentStatus = 'paid';
      booking.paymentDetails = {
        ...paymentDetails,
        paymentDate: new Date(),
        transactionId: `DUM-${Date.now()}`,
        amount: booking.totalPrice,
        currency: 'INR',
      };
      booking.status = 'confirmed';

      await booking.save();

      return res.status(200).json({
        success: true,
        message: 'Payment processed successfully',
        booking: {
          id: booking._id,
          status: booking.status,
          paymentStatus: booking.paymentStatus,
        },
      });
    } else {
      booking.paymentStatus = 'failed';
      await booking.save();

      return res.status(400).json({
        success: false,
        error: 'Payment failed',
      });
    }
  } catch (error) {
    console.error('Payment processing error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 