import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import Layout from '../../components/Layout';
import BookingCard from '../../components/BookingCard';

export default function Bookings() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [userBookings, setUserBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // all, active, past, cancelled

  useEffect(() => {
    // Redirect if not authenticated
    if (status === 'unauthenticated') {
      router.push(`/login?redirect=${encodeURIComponent('/bookings')}`);
    }
  }, [status, router]);

  useEffect(() => {
    // Fetch bookings if authenticated
    if (status === 'authenticated') {
      fetchBookings();
    }
  }, [status]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/bookings');
      setUserBookings(response.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to fetch your bookings');
    } finally {
      setLoading(false);
    }
  };

  // Filter bookings based on active tab
  const filteredBookings = userBookings.filter(booking => {
    const today = new Date();
    const endDate = new Date(booking.endDate);
    
    switch (activeTab) {
      case 'active':
        return (booking.status === 'confirmed' || booking.status === 'pending') && endDate >= today;
      case 'past':
        return booking.status === 'completed' || (booking.status === 'confirmed' && endDate < today);
      case 'cancelled':
        return booking.status === 'cancelled';
      default:
        return true; // 'all' tab
    }
  });

  if (loading) {
    return (
      <Layout title="My Bookings">
        <div className="container mx-auto px-4 py-16 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="My Bookings">
      <div className="bg-gray-100 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">My Bookings</h1>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 mb-8">
            <button
              onClick={() => setActiveTab('all')}
              className={`py-2 px-4 font-medium text-sm focus:outline-none ${
                activeTab === 'all'
                  ? 'border-b-2 border-yellow-600 text-yellow-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              All Bookings
            </button>
            <button
              onClick={() => setActiveTab('active')}
              className={`py-2 px-4 font-medium text-sm focus:outline-none ${
                activeTab === 'active'
                  ? 'border-b-2 border-yellow-600 text-yellow-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setActiveTab('past')}
              className={`py-2 px-4 font-medium text-sm focus:outline-none ${
                activeTab === 'past'
                  ? 'border-b-2 border-yellow-600 text-yellow-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Past
            </button>
            <button
              onClick={() => setActiveTab('cancelled')}
              className={`py-2 px-4 font-medium text-sm focus:outline-none ${
                activeTab === 'cancelled'
                  ? 'border-b-2 border-yellow-600 text-yellow-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Cancelled
            </button>
          </div>

          {/* Bookings List */}
          {filteredBookings.length > 0 ? (
            <div className="space-y-6">
              {filteredBookings.map(booking => (
                <BookingCard key={booking._id} booking={booking} />
              ))}
            </div>
          ) : (
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <h3 className="text-xl font-medium text-gray-900 mb-2">No bookings found</h3>
              <p className="text-gray-600 mb-6">
                {activeTab === 'all'
                  ? "You haven't made any bookings yet."
                  : `You don't have any ${activeTab} bookings.`}
              </p>
              <button
                onClick={() => router.push('/motorcycles')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
              >
                Browse Motorcycles
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
} 