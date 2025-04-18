import connectToDatabase from '../../../lib/mongodb';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import Booking from '../../../models/Booking';
import Motorcycle from '../../../models/Motorcycle';
import Notification from '../../../models/Notification';

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
        const bookings = await Booking.find({ user: session.user.id })
          .populate('motorcycle')
          .sort({ createdAt: -1 });
        res.status(200).json(bookings);
      } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).json({ message: 'Error fetching bookings' });
      }
      break;

    case 'POST':
      try {
        const { motorcycleId, startDate, endDate, totalPrice } = req.body;
        
        console.log('Received booking request:', {
          motorcycleId,
          startDate,
          endDate,
          totalPrice,
          userId: session.user.id
        });

        // Validate required fields
        if (!motorcycleId || !startDate || !endDate || totalPrice === undefined || totalPrice === null) {
          console.error('Missing required fields:', { motorcycleId, startDate, endDate, totalPrice });
          return res.status(400).json({ 
            success: false, 
            message: 'Missing required fields',
            missingFields: {
              motorcycleId: !motorcycleId,
              startDate: !startDate,
              endDate: !endDate,
              totalPrice: totalPrice === undefined || totalPrice === null
            }
          });
        }
        
        // Parse dates to ensure they are valid Date objects
        const parsedStartDate = new Date(startDate);
        const parsedEndDate = new Date(endDate);
        
        // Validate dates
        if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
          console.error('Invalid date format:', { startDate, endDate });
          return res.status(400).json({ 
            success: false, 
            message: 'Invalid date format' 
          });
        }
        
        // Check if motorcycle exists and is available
        const motorcycle = await Motorcycle.findById(motorcycleId);
        if (!motorcycle) {
          console.error('Motorcycle not found:', motorcycleId);
          return res.status(404).json({ 
            success: false, 
            message: 'Motorcycle not found' 
          });
        }
        
        console.log('Found motorcycle:', {
          id: motorcycle._id,
          name: motorcycle.name,
          available: motorcycle.available
        });
        
        if (!motorcycle.available) {
          console.error('Motorcycle is not available:', motorcycleId);
          return res.status(400).json({ 
            success: false, 
            message: 'Motorcycle is not available' 
          });
        }

        // Create booking with parsed dates
        const booking = await Booking.create({
          motorcycle: motorcycleId,
          user: session.user.id,
          startDate: parsedStartDate,
          endDate: parsedEndDate,
          totalPrice,
          status: 'pending',
          paymentStatus: 'pending'
        });
        
        console.log('Booking created:', booking._id);

        // Create notification for motorcycle owner
        await Notification.create({
          recipient: motorcycle.owner,
          type: 'booking_request',
          title: 'New Booking Request',
          message: `A new booking request has been made for your ${motorcycle.brand} ${motorcycle.model}`,
          relatedBooking: booking._id,
          relatedMotorcycle: motorcycle._id
        });

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
          data: booking 
        });
      } catch (error) {
        console.error('Error creating booking:', error);
        res.status(500).json({ 
          success: false, 
          message: 'Error creating booking',
          error: error.message
        });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
} 