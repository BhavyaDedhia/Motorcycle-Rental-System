import connectToDatabase from '../../../../lib/mongodb';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import Question from '../../../../models/Question';
import Motorcycle from '../../../../models/Motorcycle';

export default async function handler(req, res) {
  const { method } = req;
  const { id } = req.query;
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ message: 'You must be logged in.' });
  }

  await connectToDatabase();

  // Check if motorcycle exists
  const motorcycle = await Motorcycle.findById(id);
  if (!motorcycle) {
    return res.status(404).json({ message: 'Motorcycle not found' });
  }

  // For motorcycle questions, only the owner and the user who asked the question can access them
  if (motorcycle.owner.toString() !== session.user.id) {
    // Check if user has asked any questions for this motorcycle
    const userQuestions = await Question.countDocuments({
      motorcycle: id,
      user: session.user.id
    });
    
    if (userQuestions === 0) {
      return res.status(403).json({ message: 'Not authorized to view these questions' });
    }
  }

  switch (method) {
    case 'GET':
      try {
        const questions = await Question.find({ motorcycle: id })
          .populate('user', 'name email')
          .sort({ createdAt: -1 });
          
        res.status(200).json(questions);
      } catch (error) {
        console.error('Error fetching questions:', error);
        res.status(500).json({ message: 'Error fetching questions' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
} 