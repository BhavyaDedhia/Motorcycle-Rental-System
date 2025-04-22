import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import connectToDatabase from '../../../lib/mongodb';
import Question from '../../../models/Question';
import Motorcycle from '../../../models/Motorcycle';

export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Question ID is required' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    await connectToDatabase();

    const question = await Question.findById(id)
      .populate('user', 'name email')
      .populate('motorcycle', 'model make');

    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    switch (req.method) {
      case 'GET':
        return res.status(200).json({
          success: true,
          question: {
            id: question._id,
            text: question.text,
            answer: question.answer,
            isAnswered: question.isAnswered,
            createdAt: question.createdAt,
            user: {
              id: question.user._id,
              name: question.user.name,
              email: question.user.email,
            },
            motorcycle: {
              id: question.motorcycle._id,
              model: question.motorcycle.model,
              make: question.motorcycle.make,
            },
          },
        });

      case 'PATCH':
        if (!session) {
          return res.status(401).json({ error: 'You must be logged in to answer a question' });
        }

        const motorcycle = await Motorcycle.findById(question.motorcycle._id);
        
        if (motorcycle.owner.toString() !== session.user.id) {
          return res.status(403).json({ error: 'Only the motorcycle owner can answer questions' });
        }

        const { answer } = req.body;

        if (!answer) {
          return res.status(400).json({ error: 'Answer text is required' });
        }

        question.answer = answer;
        question.isAnswered = true;
        await question.save();

        return res.status(200).json({
          success: true,
          question: {
            id: question._id,
            text: question.text,
            answer: question.answer,
            isAnswered: question.isAnswered,
            createdAt: question.createdAt,
          },
        });

      case 'DELETE':
        if (!session) {
          return res.status(401).json({ error: 'You must be logged in to delete a question' });
        }

        if (question.user.toString() !== session.user.id) {
          return res.status(403).json({ error: 'You can only delete your own questions' });
        }

        await question.remove();

        // Remove question reference from motorcycle
        await Motorcycle.findByIdAndUpdate(
          question.motorcycle._id,
          { $pull: { questions: question._id } }
        );

        return res.status(200).json({
          success: true,
          message: 'Question deleted successfully',
        });

      default:
        res.setHeader('Allow', ['GET', 'PATCH', 'DELETE']);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error('Question error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 