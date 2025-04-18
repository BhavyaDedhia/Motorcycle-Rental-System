import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Layout from '../../components/Layout';
import { format } from 'date-fns';

export default function Notifications() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Redirect if not authenticated
    if (status === 'unauthenticated') {
      router.push(`/login?redirect=${encodeURIComponent('/notifications')}`);
    }
  }, [status, router]);

  useEffect(() => {
    // Fetch notifications if authenticated
    if (status === 'authenticated') {
      fetchNotifications();
    }
  }, [status]);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get('/api/notifications');
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await axios.put('/api/notifications', { notificationId });
      
      // Update local state
      setNotifications(notifications.map(notification => 
        notification._id === notificationId 
          ? { ...notification, read: true } 
          : notification
      ));
      
      toast.success('Notification marked as read');
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to mark notification as read');
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'booking_request':
        return '📅';
      case 'booking_confirmed':
        return '✅';
      case 'booking_cancelled':
        return '❌';
      case 'booking_completed':
        return '🏁';
      case 'payment_received':
        return '💰';
      default:
        return '📢';
    }
  };

  if (loading) {
    return (
      <Layout title="My Notifications">
        <div className="container mx-auto px-4 py-16 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="My Notifications">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">My Notifications</h1>
        
        {notifications.length === 0 ? (
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <p className="text-gray-600">You don't have any notifications yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div 
                key={notification._id} 
                className={`bg-white p-4 rounded-lg shadow-md ${!notification.read ? 'border-l-4 border-yellow-500' : ''}`}
              >
                <div className="flex items-start">
                  <div className="text-2xl mr-4">{getNotificationIcon(notification.type)}</div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-semibold text-gray-900">{notification.title}</h3>
                      <span className="text-sm text-gray-500">
                        {format(new Date(notification.createdAt), 'MMM d, yyyy h:mm a')}
                      </span>
                    </div>
                    <p className="text-gray-700 mt-1">{notification.message}</p>
                    
                    {notification.relatedBooking && (
                      <div className="mt-3">
                        <a 
                          href={`/bookings/${notification.relatedBooking._id}`}
                          className="text-yellow-600 hover:text-yellow-800 font-medium"
                        >
                          View Booking Details
                        </a>
                      </div>
                    )}
                    
                    {notification.relatedMotorcycle && (
                      <div className="mt-1">
                        <a 
                          href={`/motorcycles/${notification.relatedMotorcycle._id}`}
                          className="text-yellow-600 hover:text-yellow-800 font-medium"
                        >
                          View Motorcycle Details
                        </a>
                      </div>
                    )}
                  </div>
                  {!notification.read && (
                    <button
                      onClick={() => markAsRead(notification._id)}
                      className="ml-4 text-sm text-yellow-600 hover:text-yellow-800"
                    >
                      Mark as read
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
} 