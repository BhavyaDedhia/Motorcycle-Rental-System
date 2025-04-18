import connectToDatabase from "../../../lib/mongodb";
import Notification from "../../../models/Notification";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req, res) {
  await connectToDatabase();
  
  // GET request - fetch user's notifications
  if (req.method === 'GET') {
    try {
      const session = await getServerSession(req, res, authOptions);
      
      // Check if user is authenticated
      if (!session) {
        return res.status(401).json({ error: 'You must be logged in to view notifications' });
      }
      
      const notifications = await Notification.find({ recipient: session.user.id })
        .sort({ createdAt: -1 })
        .populate('relatedBooking')
        .populate('relatedMotorcycle');
      
      return res.status(200).json(notifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return res.status(500).json({ error: 'Failed to fetch notifications' });
    }
  }
  
  // POST request - create a new notification
  if (req.method === 'POST') {
    try {
      const session = await getServerSession(req, res, authOptions);
      
      // Check if user is authenticated
      if (!session) {
        return res.status(401).json({ error: 'You must be logged in to create notifications' });
      }
      
      const { 
        recipient, type, title, message, 
        relatedBooking, relatedMotorcycle 
      } = req.body;
      
      // Validate required fields
      if (!recipient || !type || !title || !message) {
        return res.status(400).json({ error: 'Please provide all required fields' });
      }
      
      // Create new notification
      const newNotification = new Notification({
        recipient,
        type,
        title,
        message,
        relatedBooking,
        relatedMotorcycle
      });
      
      await newNotification.save();
      return res.status(201).json({ 
        message: 'Notification created successfully',
        notification: newNotification 
      });
      
    } catch (error) {
      console.error('Error creating notification:', error);
      return res.status(500).json({ error: 'Failed to create notification' });
    }
  }
  
  // PUT request - mark notification as read
  if (req.method === 'PUT') {
    try {
      const session = await getServerSession(req, res, authOptions);
      
      // Check if user is authenticated
      if (!session) {
        return res.status(401).json({ error: 'You must be logged in to update notifications' });
      }
      
      const { notificationId } = req.body;
      
      if (!notificationId) {
        return res.status(400).json({ error: 'Please provide a notification ID' });
      }
      
      // Update notification
      const updatedNotification = await Notification.findByIdAndUpdate(
        notificationId,
        { read: true },
        { new: true }
      );
      
      if (!updatedNotification) {
        return res.status(404).json({ error: 'Notification not found' });
      }
      
      return res.status(200).json({ 
        message: 'Notification updated successfully',
        notification: updatedNotification 
      });
      
    } catch (error) {
      console.error('Error updating notification:', error);
      return res.status(500).json({ error: 'Failed to update notification' });
    }
  }
  
  // Return 405 for other methods
  return res.status(405).json({ error: 'Method not allowed' });
} 