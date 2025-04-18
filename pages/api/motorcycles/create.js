import connectDB from '../../../lib/db/mongodb';
import Motorcycle from '../../../models/Motorcycle';
import { protect, restrictTo } from '../../../lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Protect routes - only admin can create
  await protect(req, res, async () => {
    await restrictTo('admin')(req, res, async () => {
      try {
        await connectDB();

        const motorcycle = await Motorcycle.create(req.body);

        res.status(201).json({
          status: 'success',
          data: motorcycle,
        });
      } catch (error) {
        res.status(400).json({ message: error.message });
      }
    });
  });
} 