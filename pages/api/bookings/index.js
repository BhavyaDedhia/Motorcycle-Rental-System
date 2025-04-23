import connectToDatabase from '../../../lib/mongodb';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import Booking from '../../../models/Booking';
import Motorcycle from '../../../models/Motorcycle';
import Notification from '../../../models/Notification';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ error: 'You must be logged in to access bookings' });
  }

  if (req.method === 'GET') {
    try {
      await connectToDatabase();
      // Return bookings for the logged-in user, most recent first
      const bookings = await Booking.find({ user: session.user.id })
        .populate('motorcycle', 'name brand model price images')
        .sort({ createdAt: -1 });
      return res.status(200).json(bookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      return res.status(500).json({ error: 'Failed to fetch bookings' });
    }
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    
    if (!session) {
      return res.status(401).json({ error: 'You must be logged in to make a booking' });
    }

    await connectToDatabase();

    const { motorcycleId, startDate, endDate } = req.body;

    if (!motorcycleId || !startDate || !endDate) {
      return res.status(400).json({ error: 'Motorcycle ID, start date, and end date are required' });
    }

    // Find the motorcycle
    const motorcycle = await Motorcycle.findById(motorcycleId).select('+images');
    
    if (!motorcycle) {
      return res.status(404).json({ error: 'Motorcycle not found' });
    }

    if (!motorcycle.available) {
      return res.status(400).json({ error: 'Motorcycle is not available for the selected dates' });
    }

    // Comment out the image validation check since it's causing booking failures
    // We'll handle missing images gracefully in the UI instead
    // if (!motorcycle.images || motorcycle.images.length === 0) {
    //   return res.status(400).json({ error: 'Motorcycle must have at least one image' });
    // }

    // Check for existing bookings that overlap with the requested dates
    const existingBookings = await Booking.find({
      motorcycle: motorcycleId,
      status: { $in: ['pending', 'confirmed'] },
      $or: [
        { startDate: { $lte: endDate }, endDate: { $gte: startDate } },
        { startDate: { $gte: startDate, $lte: endDate } },
      ],
    });

    if (existingBookings.length > 0) {
      return res.status(400).json({ error: 'Motorcycle is already booked for the selected dates' });
    }

    // Calculate total price
    const start = new Date(startDate);
    const end = new Date(endDate);
    let days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    if (days < 1) days = 1;
    const totalPrice = days * motorcycle.price;

    // Create new booking
    const booking = new Booking({
      motorcycle: motorcycleId,
      user: session.user.id,
      startDate,
      endDate,
      totalPrice,
      status: 'pending',
      paymentStatus: 'pending',
    });

    await booking.save();

    // Update motorcycle's bookings array
    motorcycle.bookings.push(booking._id);
    await motorcycle.save();

    // Create notification for motorcycle owner (if owner exists)
    if (motorcycle.owner) {
      await Notification.create({
        recipient: motorcycle.owner,
        type: 'booking_request',
        title: 'New Booking Request',
        message: `A new booking request has been made for your ${motorcycle.brand} ${motorcycle.model}`,
        relatedBooking: booking._id,
        relatedMotorcycle: motorcycle._id
      });
    }

    // Create notification for renter
    await Notification.create({
      recipient: session.user.id,
      type: 'booking_request',
      title: 'Booking Request Sent',
      message: `Your booking request for ${motorcycle.brand} ${motorcycle.model} has been sent to the owner`,
      relatedBooking: booking._id,
      relatedMotorcycle: motorcycle._id
    });

    return res.status(201).json({
      success: true,
      booking: {
        id: booking._id,
        motorcycle: {
          id: motorcycle._id,
          name: motorcycle.name,
          price: motorcycle.price,
        },
        startDate: booking.startDate,
        endDate: booking.endDate,
        totalPrice: booking.totalPrice,
        status: booking.status,
        paymentStatus: booking.paymentStatus,
      },
    });
  } catch (error) {
    console.error('Booking error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 