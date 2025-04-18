import connectToDatabase from "../../../lib/mongodb";
import Motorcycle from "../../../models/Motorcycle";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req, res) {
  await connectToDatabase();
  
  // GET request - fetch all motorcycles
  if (req.method === 'GET') {
    try {
      const motorcycles = await Motorcycle.find({}).sort({ createdAt: -1 });
      return res.status(200).json(motorcycles);
    } catch (error) {
      console.error('Error fetching motorcycles:', error);
      return res.status(500).json({ error: 'Failed to fetch motorcycles' });
    }
  }
  
  // POST request - create a new motorcycle
  if (req.method === 'POST') {
    try {
      const session = await getServerSession(req, res, authOptions);
      
      // Check if user is authenticated
      if (!session) {
        return res.status(401).json({ error: 'You must be logged in to add a motorcycle' });
      }
      
      const { 
        name, brand, model, year, cc, price, 
        description, imageUrl, features, location 
      } = req.body;
      
      // Log the received data for debugging
      console.log('Received motorcycle data:', req.body);
      
      // Log each field individually to check for issues
      console.log('Name:', name);
      console.log('Brand:', brand);
      console.log('Model:', model);
      console.log('Year:', year, typeof year);
      console.log('CC:', cc, typeof cc);
      console.log('Price:', price, typeof price);
      console.log('Description:', description);
      console.log('Image URL:', imageUrl);
      console.log('Location:', location);
      console.log('Features:', features);
      
      // Validate required fields
      const missingFields = {
        name: !name,
        brand: !brand,
        model: !model,
        year: !year,
        cc: !cc,
        price: !price,
        description: !description,
        location: !location
      };
      
      const hasMissingFields = Object.values(missingFields).some(missing => missing);
      
      if (hasMissingFields) {
        return res.status(400).json({ 
          error: 'Please provide all required fields',
          missingFields
        });
      }
      
      // Validate numeric fields
      if (isNaN(Number(year)) || isNaN(Number(cc)) || isNaN(Number(price))) {
        return res.status(400).json({ 
          error: 'Year, CC, and Price must be valid numbers',
          invalidFields: {
            year: isNaN(Number(year)),
            cc: isNaN(Number(cc)),
            price: isNaN(Number(price))
          }
        });
      }
      
      // Create new motorcycle with user ID as owner
      const newMotorcycle = new Motorcycle({
        name,
        brand,
        model,
        year: Number(year),
        cc: Number(cc),
        price: Number(price),
        description,
        imageUrl: imageUrl || '/images/motorcycle-placeholder.jpg',
        features: features || [],
        location,
        owner: session.user.id
      });
      
      await newMotorcycle.save();
      return res.status(201).json({ 
        message: 'Motorcycle added successfully',
        motorcycle: newMotorcycle 
      });
      
    } catch (error) {
      console.error('Error adding motorcycle:', error);
      return res.status(500).json({ error: 'Failed to add motorcycle' });
    }
  }
  
  // Return 405 for other methods
  return res.status(405).json({ error: 'Method not allowed' });
} 