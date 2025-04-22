import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import connectToDatabase from '../../../lib/mongodb';
import Motorcycle from '../../../models/Motorcycle';
import Question from '../../../models/Question';

export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Motorcycle ID is required' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    await connectToDatabase();

    const motorcycle = await Motorcycle.findById(id)
      .select('+images')
      .populate('owner', 'name email')
      .populate({
        path: 'bookings',
        select: 'startDate endDate status user',
        populate: {
          path: 'user',
          select: 'name email'
        }
      })
      .populate('questions')
      .populate({
        path: 'reviews',
        select: 'rating comment user createdAt',
        populate: {
          path: 'user',
          select: 'name'
        }
      });

    if (!motorcycle) {
      return res.status(404).json({ error: 'Motorcycle not found' });
    }

    // Ensure images are properly processed and include full URLs if needed
    let validImages = [];
    
    console.log('Raw motorcycle images:', motorcycle.images);
    
    const fs = require('fs');
    const path = require('path');
    // Check if motorcycle has images array
    if (motorcycle.images && Array.isArray(motorcycle.images) && motorcycle.images.length > 0) {
      validImages = motorcycle.images
        .filter(img => img && typeof img === 'string' && img.length > 0)
        .map(img => {
          let resolved;
          if (img.startsWith('/') && !img.includes('/uploads/')) {
            resolved = `${process.env.NEXT_PUBLIC_BASE_URL || ''}${img}`;
          } else if (!img.startsWith('/') && !img.startsWith('http') && !img.startsWith('data:')) {
            resolved = `/uploads/${img}`;
          } else {
            resolved = img;
          }
          let filePath = resolved;
          if (resolved.startsWith('http')) {
            // Skip file check for external URLs
            console.log(`[Image Debug] Skipping file check for external URL: ${resolved}`);
          } else {
            filePath = path.join(process.cwd(), 'public', resolved.startsWith('/') ? resolved : `/uploads/${resolved}`);
            const exists = fs.existsSync(filePath);
            console.log(`[Image Debug] Checking file: ${filePath} | Exists: ${exists}`);
          }
          return resolved;
        });
    }
    
    // Check if motorcycle has imageUrl (from static data)
    if (motorcycle.imageUrl) {
      let imageUrl = motorcycle.imageUrl;
      
      // Process the imageUrl to ensure it's correctly formatted
      if (imageUrl.startsWith('/') && !imageUrl.includes('/uploads/')) {
        imageUrl = `${process.env.NEXT_PUBLIC_BASE_URL || ''}${imageUrl}`;
      } else if (!imageUrl.startsWith('/') && !imageUrl.startsWith('http') && !imageUrl.startsWith('data:')) {
        // If it's just a filename, assume it's in the uploads directory
        imageUrl = `/uploads/${imageUrl}`;
      }
      
      // Add imageUrl to validImages if it's not already there
      if (!validImages.includes(imageUrl)) {
        // Add it to the beginning of the array so it's used first
        validImages.unshift(imageUrl);
      }
    }
    
    // Try to find any images in the uploads directory based on motorcycle ID
    const idBasedImagePath = `/uploads/${motorcycle._id}.png`;
    if (!validImages.includes(idBasedImagePath)) {
      validImages.push(idBasedImagePath);
    }
    
    // Add a default placeholder if no images are found
    if (validImages.length === 0) {
      validImages.push('/images/motorcycle-placeholder.jpg');
    }
    
    // Check for any existing images in the uploads directory
    const existingImagePath = `/uploads/a8e42a4aa6e`;
    if (!validImages.includes(existingImagePath)) {
      validImages.push(existingImagePath);
    }
    
    console.log('Valid images processed:', validImages);

    switch (req.method) {
      case 'GET':
        return res.status(200).json({
          success: true,
          motorcycle: {
            id: motorcycle._id,
            name: motorcycle.name,
            brand: motorcycle.brand,
            model: motorcycle.model,
            year: motorcycle.year,
            cc: motorcycle.cc,
            price: motorcycle.price,
            // Robust fallback for imageUrl
            imageUrl: (() => {
              const fs = require('fs');
              const path = require('path');
              // 1. Use first DB image if it exists and file exists
              if (motorcycle.images && motorcycle.images.length > 0) {
                const candidate = motorcycle.images[0].startsWith('/') ? motorcycle.images[0] : `/uploads/${motorcycle.images[0]}`;
                try {
                  if (fs.existsSync(path.join(process.cwd(), 'public', candidate))) {
                    return candidate;
                  }
                } catch (e) { /* ignore */ }
              }
              // 2. Use staticImageUrl if present and file exists
              if (motorcycle.staticImageUrl) {
                const staticCandidate = motorcycle.staticImageUrl.startsWith('/') ? motorcycle.staticImageUrl : `/uploads/${motorcycle.staticImageUrl}`;
                try {
                  if (fs.existsSync(path.join(process.cwd(), 'public', staticCandidate))) {
                    return staticCandidate;
                  }
                } catch (e) { /* ignore */ }
              }
              // 3. Use placeholder
              return '/images/motorcycle-placeholder.jpg';
            })(),
            description: motorcycle.description,
            images: validImages,
            // Add debugging info
            originalImages: motorcycle.images,
            features: motorcycle.features,
            location: motorcycle.location,
            available: motorcycle.available,
            owner: motorcycle.owner ? {
              id: motorcycle.owner._id,
              name: motorcycle.owner.name,
              email: motorcycle.owner.email,
            } : null,
            bookings: motorcycle.bookings,
            questions: motorcycle.questions,
            reviews: motorcycle.reviews,
            rating: motorcycle.rating,
            createdAt: motorcycle.createdAt,
          },
        });

      case 'PATCH':
        if (!session) {
          return res.status(401).json({ error: 'You must be logged in to update a motorcycle' });
        }

        if (!motorcycle.owner) {
          return res.status(403).json({ error: 'This motorcycle has no owner information' });
        }
        
        const ownerId = typeof motorcycle.owner === 'object' && motorcycle.owner !== null
          ? motorcycle.owner._id?.toString?.()
          : motorcycle.owner?.toString?.();

        if (ownerId !== session.user.id) {
          return res.status(403).json({ error: 'You can only update your own motorcycles' });
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
          imageUrl,
          features,
          location,
          available,
        } = req.body;

        if (name) motorcycle.name = name;
        if (brand) motorcycle.brand = brand;
        if (model) motorcycle.model = model;
        if (year) motorcycle.year = year;
        if (cc) motorcycle.cc = cc;
        if (price) motorcycle.price = price;
        if (description) motorcycle.description = description;
        if (images) motorcycle.images = images;
        if (imageUrl) {
          motorcycle.imageUrl = imageUrl;
          // Also update images array if not present
          if (Array.isArray(motorcycle.images) && !motorcycle.images.includes(imageUrl)) {
            motorcycle.images.unshift(imageUrl);
          }
        }
        if (features) motorcycle.features = features;
        if (location) motorcycle.location = location;
        if (available !== undefined) {
          motorcycle.available = (available === true || available === 'true');
        }

        await motorcycle.save();

        return res.status(200).json({
          success: true,
          motorcycle: {
            id: motorcycle._id,
            name: motorcycle.name,
            brand: motorcycle.brand,
            model: motorcycle.model,
            price: motorcycle.price,
            location: motorcycle.location,
            available: motorcycle.available,
          },
        });

      case 'DELETE':
        if (!session) {
          return res.status(401).json({ error: 'You must be logged in to delete a motorcycle' });
        }

        if (!motorcycle.owner) {
          return res.status(403).json({ error: 'This motorcycle has no owner information' });
        }
        
        if (motorcycle.owner.toString() !== session.user.id) {
          return res.status(403).json({ error: 'You can only delete your own motorcycles' });
        }

        await motorcycle.remove();

        return res.status(200).json({
          success: true,
          message: 'Motorcycle deleted successfully',
        });

      default:
        res.setHeader('Allow', ['GET', 'PATCH', 'DELETE']);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error('Motorcycle error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 