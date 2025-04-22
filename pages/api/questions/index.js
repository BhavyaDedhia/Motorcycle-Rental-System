import connectToDatabase from '../../../lib/mongodb';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import Question from '../../../models/Question';
import Notification from '../../../models/Notification';
import Motorcycle from '../../../models/Motorcycle';

export default async function handler(req, res) {
  try {
    const session = await getServerSession(req, res, authOptions);
    await connectToDatabase();

    switch (req.method) {
      case 'GET':
        const { motorcycleId } = req.query;
        
        if (!motorcycleId) {
          return res.status(400).json({ error: 'Motorcycle ID is required' });
        }

        const questions = await Question.find({ motorcycle: motorcycleId })
          .populate('user', 'name email')
          .sort({ createdAt: -1 });

        return res.status(200).json({
          success: true,
          questions: questions.map(q => ({
            id: q._id,
            text: q.text,
            answer: q.answer,
            isAnswered: q.isAnswered,
            createdAt: q.createdAt,
            user: {
              id: q.user._id,
              name: q.user.name,
              email: q.user.email,
            },
          })),
        });

      case 'POST':
        if (!session) {
          return res.status(401).json({ error: 'You must be logged in to post a question' });
        }

        const { motorcycleId: postMotorcycleId, text } = req.body;

        if (!postMotorcycleId || !text) {
          return res.status(400).json({ error: 'Motorcycle ID and question text are required' });
        }

        const motorcycle = await Motorcycle.findById(postMotorcycleId);
        
        if (!motorcycle) {
          return res.status(404).json({ error: 'Motorcycle not found' });
        }

        const question = new Question({
          motorcycle: postMotorcycleId,
          user: session.user.id,
          text,
        });

        await question.save();

        motorcycle.questions.push(question._id);
        await motorcycle.save();

        await Notification.create({
          recipient: motorcycle.owner,
          type: 'new_question',
          title: 'New Question',
          message: `Someone asked a question about your ${motorcycle.brand} ${motorcycle.model}`,
          relatedMotorcycle: motorcycle._id
        });

        return res.status(201).json({
          success: true,
          question: {
            id: question._id,
            text: question.text,
            isAnswered: question.isAnswered,
            createdAt: question.createdAt,
          },
        });

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error('Question error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 