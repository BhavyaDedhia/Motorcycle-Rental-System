import connectToDatabase from "../../../lib/mongodb";
import Motorcycle from "../../../models/Motorcycle";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req, res) {
  try {
    const session = await getServerSession(req, res, authOptions);
    await connectToDatabase();

    switch (req.method) {
      case 'GET':
        const { search, minPrice, maxPrice, location: searchLocation, page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        let query = { available: true };

        if (search) {
          query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { brand: { $regex: search, $options: 'i' } },
            { model: { $regex: search, $options: 'i' } },
          ];
        }

        if (minPrice) {
          query.price = { ...query.price, $gte: Number(minPrice) };
        }

        if (maxPrice) {
          query.price = { ...query.price, $lte: Number(maxPrice) };
        }

        if (searchLocation) {
          query.location = { $regex: searchLocation, $options: 'i' };
        }

        const total = await Motorcycle.countDocuments(query);
        const motorcycles = await Motorcycle.find(query)
          .populate('owner', 'name email')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(Number(limit));

        return res.status(200).json({
          success: true,
          data: motorcycles,
          pagination: {
            total,
            page: Number(page),
            limit: Number(limit),
            pages: Math.ceil(total / limit),
          },
        });

      case 'POST':
        if (!session) {
          return res.status(401).json({ error: 'You must be logged in to add a motorcycle' });
        }

        const {
          name,
          brand,
          model,
          year,
          cc,
          price,
          description,
          images,
          features,
          location: motorcycleLocation,
        } = req.body;

        if (!name || !brand || !model || !year || !cc || !price || !description || !images || !motorcycleLocation) {
          return res.status(400).json({ error: 'All required fields must be provided' });
        }

        const motorcycle = new Motorcycle({
          name,
          brand,
          model,
          year,
          cc,
          price,
          description,
          images,
          features: features || [],
          location: motorcycleLocation,
          owner: session.user.id,
        });

        await motorcycle.save();

        return res.status(201).json({
          success: true,
          motorcycle: {
            id: motorcycle._id,
            name: motorcycle.name,
            brand: motorcycle.brand,
            model: motorcycle.model,
            price: motorcycle.price,
            location: motorcycle.location,
          },
        });

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error('Motorcycle error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 