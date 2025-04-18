import connectToDatabase from '../../../lib/mongodb';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
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
        const motorcycles = await Motorcycle.find({ owner: session.user.id })
          .sort({ createdAt: -1 });
        res.status(200).json(motorcycles);
      } catch (error) {
        console.error('Error fetching user motorcycles:', error);
        res.status(500).json({ message: 'Error fetching motorcycles' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
} 