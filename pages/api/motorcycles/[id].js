import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import dbConnect from '../../../lib/dbConnect';
import Motorcycle from '../../../models/Motorcycle';

export default async function handler(req, res) {
  const { method } = req;
  const { id } = req.query;
  
  // Connect to the database
  await dbConnect();
  
  // Get the motorcycle
  const motorcycle = await Motorcycle.findById(id);
  
  if (!motorcycle) {
    return res.status(404).json({ success: false, error: 'Motorcycle not found' });
  }
  
  // Get the session
  const session = await getServerSession(req, res, authOptions);
  
  // Check if the user is authenticated
  if (!session) {
    return res.status(401).json({ success: false, error: 'You must be logged in to perform this action' });
  }
  
  switch (method) {
    case 'GET':
      try {
        // Allow any authenticated user to view motorcycle details
        return res.status(200).json({ success: true, data: motorcycle });
      } catch (error) {
        console.error('Error fetching motorcycle:', error);
        return res.status(500).json({ success: false, error: 'Error fetching motorcycle' });
      }
      
    case 'PATCH':
      try {
        // Check if the user is the owner of the motorcycle or an admin
        if (motorcycle.owner.toString() !== session.user.id && session.user.role !== 'admin') {
          return res.status(403).json({ success: false, error: 'You do not have permission to edit this motorcycle' });
        }
        
        const { name, brand, model, year, cc, price, description, imageUrl, location, features, available } = req.body;
        
        // Validate required fields
        const missingFields = {};
        if (!name) missingFields.name = true;
        if (!brand) missingFields.brand = true;
        if (!model) missingFields.model = true;
        if (!year) missingFields.year = true;
        if (!cc) missingFields.cc = true;
        if (!price) missingFields.price = true;
        if (!description) missingFields.description = true;
        if (!location) missingFields.location = true;
        
        if (Object.keys(missingFields).length > 0) {
          return res.status(400).json({ 
            success: false, 
            error: 'Missing required fields', 
            missingFields 
          });
        }
        
        // Update the motorcycle
        const updatedMotorcycle = await Motorcycle.findByIdAndUpdate(
          id,
          {
            name,
            brand,
            model,
            year,
            cc,
            price,
            description,
            imageUrl,
            location,
            features,
            available
          },
          { new: true, runValidators: true }
        );
        
        return res.status(200).json({ success: true, data: updatedMotorcycle });
      } catch (error) {
        console.error('Error updating motorcycle:', error);
        return res.status(500).json({ success: false, error: 'Error updating motorcycle' });
      }
      
    case 'DELETE':
      try {
        // Check if the user is the owner of the motorcycle or an admin
        if (motorcycle.owner.toString() !== session.user.id && session.user.role !== 'admin') {
          return res.status(403).json({ success: false, error: 'You do not have permission to delete this motorcycle' });
        }
        
        // Only allow admins to delete motorcycles
        if (session.user.role !== 'admin') {
          return res.status(403).json({ success: false, error: 'Only admins can delete motorcycles' });
        }
        
        await Motorcycle.findByIdAndDelete(id);
        return res.status(200).json({ success: true, data: {} });
      } catch (error) {
        console.error('Error deleting motorcycle:', error);
        return res.status(500).json({ success: false, error: 'Error deleting motorcycle' });
      }
      
    default:
      res.setHeader('Allow', ['GET', 'PATCH', 'DELETE']);
      return res.status(405).json({ success: false, error: `Method ${method} not allowed` });
  }
} 