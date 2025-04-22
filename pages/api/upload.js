import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

// Disable the default body parser to handle form data
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check if user is authenticated
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ error: 'You must be logged in to upload images' });
    }

    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Configure formidable
    const form = formidable({
      uploadDir,
      keepExtensions: true,
      maxFileSize: 5 * 1024 * 1024, // 5MB max file size
      filter: ({ mimetype }) => {
        // Only allow images
        return mimetype && mimetype.includes('image');
      },
    });

    // Parse the form data
    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve([fields, files]);
      });
    });

    // Log the files object to understand its structure
    console.log('Files object:', JSON.stringify(files, null, 2));

    // Get the uploaded file - check if it's a single file or an array
    let file;
    
    // Check all possible file field names
    const possibleFieldNames = ['image', 'file', 'upload'];
    
    // Find the first field that has a file
    for (const fieldName of possibleFieldNames) {
      if (files[fieldName]) {
        if (Array.isArray(files[fieldName])) {
          file = files[fieldName][0];
        } else {
          file = files[fieldName];
        }
        break;
      }
    }
    
    // If no file was found in the standard fields, check if there's any file at all
    if (!file) {
      const fileKeys = Object.keys(files);
      if (fileKeys.length > 0) {
        const firstKey = fileKeys[0];
        if (Array.isArray(files[firstKey])) {
          file = files[firstKey][0];
        } else {
          file = files[firstKey];
        }
      }
    }
    
    if (!file) {
      console.error('No file found in upload request. Files object:', files);
      return res.status(400).json({ error: 'No image file uploaded' });
    }

    // Generate a unique filename
    const timestamp = Date.now();
    const originalFilename = file.originalFilename || 'image.jpg';
    const fileExtension = path.extname(originalFilename);
    const newFilename = `${timestamp}-${Math.random().toString(36).substring(2, 15)}${fileExtension}`;
    
    // Get the file path
    const filePath = file.filepath;
    
    if (!filePath) {
      console.error('File path is undefined. File object:', file);
      return res.status(500).json({ error: 'File path is undefined' });
    }
    
    // Move the file to the uploads directory with the new filename
    const newPath = path.join(uploadDir, newFilename);
    fs.renameSync(filePath, newPath);
    
    // Return the URL of the uploaded image
    const imageUrl = `/uploads/${newFilename}`;
    console.log('Returning image URL:', imageUrl);
    return res.status(200).json({ 
      success: true,
      fileUrl: imageUrl,  // This is the format expected by the frontend
      imageUrl: imageUrl  // Adding this for backward compatibility
    });
    
  } catch (error) {
    console.error('Error uploading image:', error);
    return res.status(500).json({ error: 'Failed to upload image' });
  }
} 